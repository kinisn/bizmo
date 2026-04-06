import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { AccountedMonetaryBizIO } from 'bizmo/core/bizIO/single/AccountedMonetaryBizIO';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { AmountBizIO } from '../bizIO/single/BizIOs';
import { HyperParamManager } from '../hyperParam/HyperParamManager';
import { BizProcessor } from './BizProcessor';
import { BizFunction } from './func/BizFunction';
import { BizIOConf } from './func/input/BizIOConf';
import { SystemInput } from './func/input/SystemInput';
import { DecimalBizFuncParserCombinator } from './func/parser/DecimalBizFuncParserCombinator';
import { BizFuncParserCombinatorParam } from './func/parser/core/BizFuncParserCombinator';
import { BizFuncTokenizer } from './func/parser/core/BizFuncTokenizer';
import { BizProcOutput, BizProcOutputMode } from './output/BizProcOutput';

describe('BizProcessor のテスト', () => {
    let tokenizer: BizFuncTokenizer;
    let parser: DecimalBizFuncParserCombinator;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let timetable: Timetable;
    let param1: BizFuncParserCombinatorParam<Decimal>;
    let func1: BizFunction;
    let func2: BizFunction;
    let func3: BizFunction;
    let processor1: BizProcessor;
    let processor2: BizProcessor;
    let sysInputs: Array<Decimal>;

    beforeEach(() => {
        tokenizer = new BizFuncTokenizer();
        parser = new DecimalBizFuncParserCombinator();
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 3,
        });

        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_1',
                accountName: AccountNames.BS_CASH_AND_DEPOSITS,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_2',
                accountName: AccountNames.BS_ACCOUNTS_RECEIVABLE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_3',
                accountName: AccountNames.PL_REVENUE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_4',
                accountName: AccountNames.PL_NON_OPERATING_INCOME,
            })
        );
        db.insert(
            new AmountBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'ID_5',
                accountName: AccountNames.PL_NON_OPERATING_INCOME,
            })
        );

        param1 = {
            bizIOInputs: [
                new Decimal(100),
                new Decimal(200),
                new Decimal(300),
                new Decimal(400),
            ],
            bizIdInputs: ['ID_1', 'ID_2', 'ID_3', 'ID_4'],
            resInputs: [new Decimal(1000), new Decimal(2000)],
            sysInputs: [
                new Decimal(1),
                new Decimal(20210101),
                new Decimal(2021),
                new Decimal(1),
                new Decimal(1),
            ],
            initValues: [new Decimal(10000), new Decimal(20000)],
            hyperParams: [new Decimal(100000), new Decimal(200000)],
            db: db,
            timetable: timetable,
        };

        // BizProcessor
        processor1 = new BizProcessor({ timetable, db, hyperMG });
        func1 = new BizFunction({
            code: 'if(gt(10,1),54,0)',
            funcId: 'func_1',
        }); // 54
        func2 = new BizFunction({
            code: 'if(lt(10,1),0,32)',
            funcId: 'func_2',
        }); // 32
        func3 = new BizFunction({
            code: 'bizio0 * 1000000000000 + bizio1 * 10000000000 + res0 * 100000000 + res1 * 1000000 + sys3 * 10000 + sys4 * 100',
            orderedBizIOConf: [
                new BizIOConf(db.selectById('ID_1')!.id, 0),
                new BizIOConf(db.selectById('ID_1')!.id, 1),
            ],
            funcId: 'func_3',
        });

        processor2 = new BizProcessor({
            timetable,
            db,
            hyperMG,
            orderedFunctions: [func1, func2, func3],
        });

        sysInputs = new SystemInput(
            timetable.currentIndex,
            timetable.currentDate
        ).inputs;

        /*
        const bizIOInputs = [new Decimal(98), new Decimal(76)];
        const resinputs = [new Decimal(54), new Decimal(32)];
        */
    });

    describe('validateBizFunction', () => {
        test('common', () => {
            // code simple
            expect(
                processor1.validateBizFunction(new BizFunction({ code: '10' }))
            ).toBe(true);

            // code complex
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        code: 'if(eq(10,1),100,0) + 123 + bizio0 + res0',
                    })
                )
            ).toBe(true);

            // code & correct id #1
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        code: '10',
                        orderedBizIOConf: [
                            new BizIOConf(db.selectById('ID_1')!.id),
                        ],
                    })
                )
            ).toBe(true);

            // code & correct id #2
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        code: '10',
                        orderedBizIOConf: [
                            new BizIOConf(db.selectById('ID_1')!.id),
                            new BizIOConf(db.selectById('ID_2')!.id),
                        ],
                    })
                )
            ).toBe(true);
        });

        test('継承先クラスで上書きしないかぎり BizFunction が生成されていば True', () => {
            // code & correct id #1
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        code: '10',
                        orderedBizIOConf: [new BizIOConf('NOT_EXISTED_ID')],
                    })
                )
            ).toBe(true);

            // code & correct id #2
            expect(
                processor1.validateBizFunction(
                    new BizFunction({
                        code: '10',
                        orderedBizIOConf: [
                            new BizIOConf('NOT_EXISTED_ID'),
                            new BizIOConf('NOT_EXISTED_ID_2'),
                        ],
                    })
                )
            ).toBe(true);
        });
    });

    describe('addBizFunction & removeBizFunctionAt', () => {
        test('common', () => {
            // 新規追加
            expect(
                processor1.validateBizFunction(new BizFunction({ code: '10' }))
            ).toBe(true);

            processor1.addBizFunction(func1);
            processor1.addBizFunction(func2);
            processor1.addBizFunction(func3);

            expect(processor1.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);

            // remove not existed
            let result = processor1.removeBizFunctionAt(-1);
            expect(result).toBeUndefined();
            result = processor1.removeBizFunctionAt(3);
            expect(result).toBeUndefined();
            expect(processor1.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);

            // remove existed
            result = processor1.removeBizFunctionAt(1);
            expect(result).toEqual(func2);
            expect(processor1.orderedBizFunctions).toEqual([func1, func3]);
        });
    });

    describe('swapBizFunctionsOrderAt', () => {
        test('common', () => {
            // out of order
            processor2.swapBizFunctionsOrderAt(-1, 2);
            expect(processor2.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);
            processor2.swapBizFunctionsOrderAt(0, 3);
            expect(processor2.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);

            // in order
            processor2.swapBizFunctionsOrderAt(0, 2);
            expect(processor2.orderedBizFunctions).toEqual([
                func3,
                func2,
                func1,
            ]);
        });
    });

    describe('replaceBizFunctionAt', () => {
        test('common', () => {
            const func4 = new BizFunction({ code: '1234' });
            // out of order
            processor2.replaceBizFunctionAt(-1, func4);
            expect(processor2.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);
            processor2.replaceBizFunctionAt(3, func4);
            expect(processor2.orderedBizFunctions).toEqual([
                func1,
                func2,
                func3,
            ]);

            // in order
            processor2.replaceBizFunctionAt(0, func4);
            expect(processor2.orderedBizFunctions).toEqual([
                func4,
                func2,
                func3,
            ]);
        });
    });

    describe('validateProcOutput', () => {
        test('継承先クラスで上書きしないかぎり、どんなケースでも True', () => {
            expect(
                processor2.validateProcOutputFuncTemplate(
                    'NOT_EXISTED_ID',
                    'NOT_EXISTED_ID_2'
                )
            ).toEqual(true);
        });
    });

    describe('addProcOutput & getProcOutput & removeProcOutputAt', () => {
        test('common', () => {
            // getProcOutput: not exist
            expect(processor2.getProcOutput('NOT_EXISTED')).toBeUndefined();

            // addProcOutput
            const output = new BizProcOutput({
                outputId: 'OUTPUT_ID_1',
                outputFuncId: func3.funcId,
                parentId: db.selectById('ID_1')?.id,
                outputBizId: db.selectById('ID_2')?.id,
                outputMode: BizProcOutputMode.REPLACE,
            });
            expect(processor2.addProcOutput(output)).toBeTruthy();

            // getProcOutput: existed
            expect(processor2.getProcOutput('OUTPUT_ID_1')).toEqual(output);

            // remove: not existed
            expect(processor2.removeProcOutputAt(-1)).toBeUndefined();

            // remove:  existed
            expect(processor2.removeProcOutputAt(0)).toEqual(output);
        });
    });

    describe('addProcOutput: モード別', () => {
        test('outputMode: Replace && journal_entry', () => {
            // 初期状態
            expect(db.selectById('ID_1')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(db.selectById('ID_2')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(db.selectById('ID_3')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(db.selectById('ID_4')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);

            // journal_entry
            timetable.currentIndex = 0;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 100, bizid1: 400}, {bizid2: 200, bizid3: 300})'
                ),
                param1
            );

            timetable.currentIndex = 1;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 10, bizid1: 40}, {bizid2: 20, bizid3: 30})'
                ),
                param1
            );
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 1, 1), new Decimal(1));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 2, 1), new Decimal(2));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 3, 1), new Decimal(3));

            // journal_entry 判定
            expect(db.selectById('ID_1')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('100'),
                    new Decimal('110'),
                    new Decimal('110'),
                ],
            ]);
            expect(db.selectById('ID_2')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('400'),
                    new Decimal('440'),
                    new Decimal('440'),
                ],
            ]);
            expect(db.selectById('ID_3')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('200'),
                    new Decimal('220'),
                    new Decimal('220'),
                ],
            ]);
            expect(db.selectById('ID_4')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('300'),
                    new Decimal('330'),
                    new Decimal('330'),
                ],
            ]);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('3'),
                ],
            ]);

            // 処理
            timetable.currentIndex = 1;
            processor2.addProcOutput(
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1',
                    outputFuncId: func3.funcId,
                    parentId: db.selectById('ID_5')?.id,
                    outputBizId: db.selectById('ID_5')?.id,
                    outputMode: BizProcOutputMode.REPLACE,
                })
            );
            processor2.process(sysInputs);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('111005432020100'), // 110 * 1000000000000 + 100 * 10000000000 + 54 * 100000000 + 32 * 1000000 + 2 * 10000 + 1 * 100
                    new Decimal('3'),
                ],
            ]);
        });

        test('outputMode: Add', () => {
            // 初期設定
            timetable.currentIndex = 0;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 100, bizid1: 400}, {bizid2: 200, bizid3: 300})'
                ),
                param1
            );
            timetable.currentIndex = 1;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 10, bizid1: 40}, {bizid2: 20, bizid3: 30})'
                ),
                param1
            );
            expect(db.selectById('ID_1')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('100'),
                    new Decimal('110'),
                    new Decimal('110'),
                ],
            ]);

            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 1, 1), new Decimal(1));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 2, 1), new Decimal(2));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 3, 1), new Decimal(3));

            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('3'),
                ],
            ]);

            // 処理
            timetable.currentIndex = 1;
            processor2.addProcOutput(
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1',
                    outputFuncId: func3.funcId,
                    parentId: db.selectById('ID_5')?.id,
                    outputBizId: db.selectById('ID_5')?.id,
                    outputMode: BizProcOutputMode.ADD,
                })
            );
            processor2.process(sysInputs);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('111005432020102'),
                    new Decimal('3'),
                ],
            ]);
        });

        test('outputMode: Sub', () => {
            // 初期設定
            timetable.currentIndex = 0;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 100, bizid1: 400}, {bizid2: 200, bizid3: 300})'
                ),
                param1
            );
            timetable.currentIndex = 1;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 10, bizid1: 40}, {bizid2: 20, bizid3: 30})'
                ),
                param1
            );
            expect(db.selectById('ID_1')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('100'),
                    new Decimal('110'),
                    new Decimal('110'),
                ],
            ]);

            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 1, 1), new Decimal(1));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 2, 1), new Decimal(2));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 3, 1), new Decimal(3));

            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('3'),
                ],
            ]);

            // 処理
            timetable.currentIndex = 1;
            processor2.addProcOutput(
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1',
                    outputFuncId: func3.funcId,
                    parentId: db.selectById('ID_5')?.id,
                    outputBizId: db.selectById('ID_5')?.id,
                    outputMode: BizProcOutputMode.SUB,
                })
            );
            processor2.process(sysInputs);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('-111005432020098'),
                    new Decimal('3'),
                ],
            ]);
        });
    });

    describe('swapBizFunctionsOrderAt ', () => {
        test('common', () => {
            processor2.swapBizFunctionsOrderAt(0, 1);
            // 初期設定
            timetable.currentIndex = 0;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 100, bizid1: 400}, {bizid2: 200, bizid3: 300})'
                ),
                param1
            );
            timetable.currentIndex = 1;
            parser.calculate(
                tokenizer.parse(
                    'journal_entry({bizid0: 10, bizid1: 40}, {bizid2: 20, bizid3: 30})'
                ),
                param1
            );
            expect(db.selectById('ID_1')?.exportAsTable()).toEqual([
                [
                    'AccountedMonetaryBizIO',
                    new Decimal('100'),
                    new Decimal('110'),
                    new Decimal('110'),
                ],
            ]);

            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 1, 1), new Decimal(1));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 2, 1), new Decimal(2));
            db
                .selectById('ID_5')
                ?.setValue(new Date(2021, 3, 1), new Decimal(3));

            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('3'),
                ],
            ]);

            // 処理
            timetable.currentIndex = 1;
            processor2.addProcOutput(
                new BizProcOutput({
                    outputId: 'OUTPUT_ID_1',
                    outputFuncId: func3.funcId,
                    parentId: db.selectById('ID_5')?.id,
                    outputBizId: db.selectById('ID_5')?.id,
                    outputMode: BizProcOutputMode.REPLACE,
                })
            );
            processor2.process(sysInputs);
            expect(db.selectById('ID_5')?.exportAsTable()).toEqual([
                [
                    'AmountBizIO',
                    new Decimal('1'),
                    new Decimal('111003254020100'), // 110 * 1000000000000 + 100 * 10000000000 + 32 * 100000000 + 54 * 1000000 + 2 * 10000 + 1 * 100
                    new Decimal('3'),
                ],
            ]);
        });
    });
});
