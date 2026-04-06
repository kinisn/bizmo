import { AmountBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { TypicalFunctionFactory } from './TypicalFunctionFactory';
import { BizIOConf } from './input/BizIOConf';

describe('BizProcessor のテスト', () => {
    let db: BizDatabase;
    let timetable: Timetable;
    let amount1: AmountBizIO;
    let amount2: AmountBizIO;
    let amount3: AmountBizIO;

    beforeEach(() => {
        db = new BizDatabase();
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 3,
        });

        amount1 = new AmountBizIO({
            db: db,
            timetable: timetable,
            bizIOId: 'amount_1',
        });
        amount1.setValue(new Date(2021, 1, 1), new Decimal(1));
        amount1.setValue(new Date(2021, 2, 1), new Decimal(2));
        amount1.setValue(new Date(2021, 3, 1), new Decimal(3));
        db.insert(amount1);
        amount2 = new AmountBizIO({
            db: db,
            timetable: timetable,
            bizIOId: 'amount_2',
        });
        amount2.setValue(new Date(2021, 1, 1), new Decimal(10));
        amount2.setValue(new Date(2021, 2, 1), new Decimal(20));
        amount2.setValue(new Date(2021, 3, 1), new Decimal(30));
        db.insert(amount2);
        amount3 = new AmountBizIO({
            db: db,
            timetable: timetable,
            bizIOId: 'amount_3',
        });
        amount3.setValue(new Date(2021, 1, 1), new Decimal(100));
        amount3.setValue(new Date(2021, 2, 1), new Decimal(200));
        amount3.setValue(new Date(2021, 3, 1), new Decimal(300));
        db.insert(amount3);
    });

    describe('createCollectionSumFunc', () => {
        test('with data', () => {
            const func = TypicalFunctionFactory.createCollectionSumFunc({
                collection: [amount1, amount2, amount3],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('bizio0 + bizio1 + bizio2');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([
                new BizIOConf('amount_1', 1),
                new BizIOConf('amount_2', 1),
                new BizIOConf('amount_3', 1),
            ]);
            expect(func.orderedInitValues).toEqual([]);
        });

        test('without data', () => {
            const func = TypicalFunctionFactory.createCollectionSumFunc({
                collection: [],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('0');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([]);
            expect(func.orderedInitValues).toEqual([]);
        });
    });

    describe('createCollectionDivideFunc', () => {
        test('with data', () => {
            const func = TypicalFunctionFactory.createCollectionDivideFunc({
                collection: [amount1, amount2, amount3],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('bizio0 / bizio1 / bizio2');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([
                new BizIOConf('amount_1', 1),
                new BizIOConf('amount_2', 1),
                new BizIOConf('amount_3', 1),
            ]);
            expect(func.orderedInitValues).toEqual([]);
        });

        test('without data', () => {
            const func = TypicalFunctionFactory.createCollectionDivideFunc({
                collection: [],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([]);
            expect(func.orderedInitValues).toEqual([]);
        });
    });

    describe('createCollectionMultipleFunc', () => {
        test('with data', () => {
            const func = TypicalFunctionFactory.createCollectionMultipleFunc({
                collection: [amount1, amount2, amount3],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('bizio0 * bizio1 * bizio2');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([
                new BizIOConf('amount_1', 1),
                new BizIOConf('amount_2', 1),
                new BizIOConf('amount_3', 1),
            ]);
            expect(func.orderedInitValues).toEqual([]);
        });

        test('without data', () => {
            const func = TypicalFunctionFactory.createCollectionMultipleFunc({
                collection: [],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('0');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([]);
            expect(func.orderedInitValues).toEqual([]);
        });
    });

    describe('createCollectionLinearFunc', () => {
        test('with data', () => {
            const func = TypicalFunctionFactory.createCollectionLinearFunc({
                collection: [amount1, amount2, amount3],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('bizio0 * bizio1 + bizio2');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([
                new BizIOConf('amount_1', 1),
                new BizIOConf('amount_2', 1),
                new BizIOConf('amount_3', 1),
            ]);
            expect(func.orderedInitValues).toEqual([]);
        });

        test('without data', () => {
            const func = TypicalFunctionFactory.createCollectionLinearFunc({
                collection: [],
                funcId: 'func_1',
            });

            expect(func.code).toEqual('');
            expect(func.funcId).toEqual('func_1');
            expect(func.orderedBizIOConf).toEqual([]);
            expect(func.orderedInitValues).toEqual([]);
        });
    });
});
