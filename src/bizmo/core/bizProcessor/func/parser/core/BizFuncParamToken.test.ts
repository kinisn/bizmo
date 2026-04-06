import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { DecimalBizFuncParserCombinator } from '../DecimalBizFuncParserCombinator';
import { BizFuncParserCombinatorParam } from './BizFuncParserCombinator';
import { BizFuncTokenizer } from './BizFuncTokenizer';

describe('BizFuncParamTokens のテスト', () => {
    let tokenizer: BizFuncTokenizer;
    let parser: DecimalBizFuncParserCombinator;
    let db: BizDatabase;
    let timetable: Timetable;
    let param1: BizFuncParserCombinatorParam<Decimal>;

    beforeEach(() => {
        tokenizer = new BizFuncTokenizer();
        parser = new DecimalBizFuncParserCombinator();
        db = new BizDatabase();
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 5,
        });

        param1 = {
            bizIOInputs: [
                new Decimal(100),
                new Decimal(200),
                new Decimal(300),
                new Decimal(400),
            ],
            bizIdInputs: ['bizid0', 'ID_2', 'ID_3', 'ID_4'],
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
    });

    describe('bizio', () => {
        test('common', () => {
            expect(
                parser.calculate(
                    tokenizer.parse('bizio0 + bizio1 + bizio2 + bizio3'),
                    param1
                )
            ).toEqual(new Decimal('1000'));
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('bizio4'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(
                parser.calculate(tokenizer.parse('bizio-1'), param1)
            ).toEqual(new Decimal('NaN'));
        });

        test('correct with err', () => {
            expect(
                parser.calculate(tokenizer.parse('bizio4 + bizio0'), param1)
            ).toEqual(new Decimal('NaN'));
        });
    });

    describe('res', () => {
        test('common', () => {
            expect(
                parser.calculate(tokenizer.parse('res0 + res1'), param1)
            ).toEqual(new Decimal('3000'));
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('res4'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(parser.calculate(tokenizer.parse('res-1'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('correct with err', () => {
            expect(
                parser.calculate(tokenizer.parse('res4 + res0'), param1)
            ).toEqual(new Decimal('NaN'));
        });
    });

    describe('sys', () => {
        test('common', () => {
            expect(parser.calculate(tokenizer.parse('sys0'), param1)).toEqual(
                new Decimal('1')
            );
            expect(parser.calculate(tokenizer.parse('sys1'), param1)).toEqual(
                new Decimal('20210101')
            );
            expect(parser.calculate(tokenizer.parse('sys2'), param1)).toEqual(
                new Decimal('2021')
            );
            expect(parser.calculate(tokenizer.parse('sys3'), param1)).toEqual(
                new Decimal('1')
            );
            expect(parser.calculate(tokenizer.parse('sys4'), param1)).toEqual(
                new Decimal('1')
            );
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('sys5'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(parser.calculate(tokenizer.parse('sys-1'), param1)).toEqual(
                new Decimal('NaN')
            );
        });
    });

    describe('init', () => {
        test('common', () => {
            expect(parser.calculate(tokenizer.parse('init0'), param1)).toEqual(
                new Decimal('10000')
            );
            expect(parser.calculate(tokenizer.parse('init1'), param1)).toEqual(
                new Decimal('20000')
            );
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('init2'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(parser.calculate(tokenizer.parse('init-1'), param1)).toEqual(
                new Decimal('NaN')
            );
        });
    });

    describe('prob // Already deleted. Use hyper instead', () => {
        test('common', () => {
            expect(parser.calculate(tokenizer.parse('prob0'), param1)).toEqual(
                new Decimal('NaN')
            );
            expect(parser.calculate(tokenizer.parse('prob1'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('prob2'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(parser.calculate(tokenizer.parse('prob-1'), param1)).toEqual(
                new Decimal('NaN')
            );
        });
    });

    describe('hyper', () => {
        test('common', () => {
            expect(parser.calculate(tokenizer.parse('hyper0'), param1)).toEqual(
                new Decimal('100000')
            );
            expect(parser.calculate(tokenizer.parse('hyper1'), param1)).toEqual(
                new Decimal('200000')
            );
        });

        test('err out of index', () => {
            expect(parser.calculate(tokenizer.parse('hyper2'), param1)).toEqual(
                new Decimal('NaN')
            );
        });

        test('err type', () => {
            expect(
                parser.calculate(tokenizer.parse('hyper-1'), param1)
            ).toEqual(new Decimal('NaN'));
        });
    });

    describe('complex', () => {
        test('case1', () => {
            expect(
                parser.calculate(
                    tokenizer.parse(
                        'bizio0 * abs(power( (bizio2 + bizio3) * -1, 2)) + bizio1 + -1'
                    ),
                    param1
                )
            ).toEqual(new Decimal('49000199'));
        });

        test('case2', () => {
            expect(
                parser.calculate(
                    tokenizer.parse('bizio0 + if(eq(sys0,0),1, 2) + res1'),
                    param1
                )
            ).toEqual(new Decimal('2102'));
        });

        test('case3', () => {
            expect(
                parser.calculate(
                    tokenizer.parse(
                        'bizio0 * 1000000000000 + bizio1 * 10000000000 + res0 * 100000000 + res1 * 1000000 + sys0 * 10000 + sys1 * 100'
                    ),
                    param1
                )
            ).toEqual(new Decimal('102104021020100'));
        });
    });
});
