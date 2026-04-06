import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizFunction, BizFunctionProcessParam } from './BizFunction';
import { BizIOConf } from './input/BizIOConf';

describe('BizFunction のテスト', () => {
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let func0: BizFunction;
    let func1: BizFunction;
    let func2: BizFunction;
    let func3: BizFunction;
    let bizIOInputs: Array<Decimal>;
    let bizIdInputs: Array<BizIOId>;
    let resInputs: Array<Decimal>;
    let sysInputs: Array<Decimal>;
    let timetable: Timetable;
    let processParam0: BizFunctionProcessParam;
    let processParam1: BizFunctionProcessParam;

    beforeEach(() => {
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable.currentIndex = 1;

        func0 = new BizFunction();
        func1 = new BizFunction({ code: 'TEST_CODE' });
        func2 = new BizFunction({
            code: 'TEST_CODE',
            funcId: 'FUNC_ID',
            orderedBizIOConf: [
                new BizIOConf('TARGET_BIZ_ID_1'),
                new BizIOConf('TARGET_BIZ_ID_2', 0),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ],
            orderedInitValues: [new Decimal(123), new Decimal(234)],
            orderedHyperParamIDs: ['TARGET_HYPER_ID_1', 'TARGET_HYPER_ID_2'],
        });
        func3 = new BizFunction({
            code:
                'bizio0 * 1000000000000 + bizio1 * 10000000000 + ' +
                'res0 * 100000000 + res1 * 1000000 + ' +
                'sys0 * 10000 + sys1 * 100',
        });

        bizIOInputs = [new Decimal(98), new Decimal(76)];
        bizIdInputs = ['ID_1', 'ID_2'];
        resInputs = [new Decimal(54), new Decimal(32)];
        sysInputs = [new Decimal(19), new Decimal(18)];

        processParam0 = {
            bizIOInputs: [],
            resInputs: [],
            sysInputs: [],
            bizIdInputs: [],
            initValues: [],
            hyperParams: [],
            db: db,
            timetable: timetable,
        };
        processParam1 = {
            bizIOInputs: bizIOInputs,
            resInputs: resInputs,
            sysInputs: sysInputs,
            bizIdInputs: bizIdInputs,
            initValues: [],
            hyperParams: [],
            db: db,
            timetable: timetable,
        };
    });

    describe('初期化', () => {
        test('default zero', () => {
            expect(func0.funcId).not.toBeUndefined();
            expect(func0.code).toEqual('');
            expect(func0.orderedBizIOConf).toEqual([]);
        });

        test('default', () => {
            expect(func1.funcId).not.toBeUndefined();
            expect(func1.code).toEqual('TEST_CODE');
            expect(func1.orderedBizIOConf).toEqual([]);
        });

        test('with param', () => {
            expect(func2.funcId).toEqual('FUNC_ID');
            expect(func2.code).toEqual('TEST_CODE');
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_1', 1),
                new BizIOConf('TARGET_BIZ_ID_2', 0),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
            expect(func2.orderedInitValues).toEqual([
                new Decimal(123),
                new Decimal(234),
            ]);
        });
    });

    test('set code', () => {
        func1.code = 'TEST_CODE_UPDATE';
        expect(func1.code).toEqual('TEST_CODE_UPDATE');
    });

    describe('process', () => {
        test('with init', () => {
            const result = func1.process(processParam1);
            expect(result).toEqual(new Decimal('NaN'));
        });

        test('必要パラメータが存在', () => {
            const result = func3.process(processParam1);
            expect(result).toEqual(new Decimal('98765432191800'));
        });

        test('必要パラメータ不足: bizIOInputs', () => {
            processParam1.bizIOInputs.pop();
            const result = func3.process(processParam1);
            expect(result).toEqual(new Decimal('NaN'));
        });

        test('必要パラメータ不足: resInputs', () => {
            processParam1.resInputs.pop();
            const result = func3.process(processParam1);
            expect(result).toEqual(new Decimal('NaN'));
        });

        test('必要パラメータ不足: sysInputs', () => {
            processParam1.sysInputs.pop();
            const result = func3.process(processParam1);
            expect(result).toEqual(new Decimal('NaN'));
        });
    });

    describe('BizIOInput', () => {
        test('新規追加', () => {
            func1.addBizIOInput('TEST_1', 2);
            func1.addBizIOInput('TEST_2');
            expect(func1.orderedBizIOConf).toEqual([
                new BizIOConf('TEST_1', 2),
                new BizIOConf('TEST_2', 1),
            ]);
        });

        test('既存データに追加', () => {
            func2.addBizIOInput('TEST_1', 2);
            func2.addBizIOInput('TEST_2');
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_1', 1),
                new BizIOConf('TARGET_BIZ_ID_2', 0),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
                new BizIOConf('TEST_1', 2),
                new BizIOConf('TEST_2', 1),
            ]);
        });

        test('更新', () => {
            func2.updateBizIOInputAt(0, 'UPDATE_1', 10);
            func2.updateBizIOInputAt(1, 'UPDATE_2', 20);
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('UPDATE_1', 10),
                new BizIOConf('UPDATE_2', 20),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
        });

        test('削除（Index）', () => {
            func2.removeBizIOInputAt(1);
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_1', 1),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
            func2.removeBizIOInputAt(0);
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
        });

        test('削除（ID）', () => {
            func2.removeBizIOInputById('NON_ID');
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_1', 1),
                new BizIOConf('TARGET_BIZ_ID_2', 0),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
            func2.removeBizIOInputById('TARGET_BIZ_ID_2');
            expect(func2.orderedBizIOConf).toEqual([
                new BizIOConf('TARGET_BIZ_ID_1', 1),
                new BizIOConf('TARGET_BIZ_ID_3', 2),
            ]);
        });
    });

    describe('InitValue', () => {
        test('新規追加', () => {
            func1.addInitValue(new Decimal(1234));
            func1.addInitValue(new Decimal(2345));
            expect(func1.orderedInitValues).toEqual([
                new Decimal(1234),
                new Decimal(2345),
            ]);
        });

        test('既存に追加', () => {
            func2.addInitValue(new Decimal(12345));
            func2.addInitValue(new Decimal(23456));
            expect(func2.orderedInitValues).toEqual([
                new Decimal(123),
                new Decimal(234),
                new Decimal(12345),
                new Decimal(23456),
            ]);
        });

        test('更新', () => {
            func2.updateInitValueAt(0, new Decimal(1));
            func2.updateInitValueAt(1, new Decimal(2));
            expect(func2.orderedInitValues).toEqual([
                new Decimal(1),
                new Decimal(2),
            ]);
        });

        test('削除（Index）', () => {
            func2.removeInitValueAt(1);
            expect(func2.orderedInitValues).toEqual([new Decimal(123)]);
            func2.removeInitValueAt(0);
            expect(func2.orderedInitValues).toEqual([]);
        });
    });

    describe('Util系', () => {
        test('makeInputDecimal', () => {
            const test = BizFunction.makeInputDecimal(new Decimal(1234567));
            expect(test.code).toEqual('init0');
            processParam0.initValues = test.orderedInitValues;
            const result = test.process(processParam0);
            expect(result).toEqual(new Decimal('1234567'));
        });

        test('makeInputBizIO', () => {
            const test = BizFunction.makeInputBizIO('target_id', 10);
            expect(test.code).toEqual('bizio0');
            expect(test.orderedBizIOConf).toEqual([
                new BizIOConf('target_id', 10),
            ]);
        });
    });
});
