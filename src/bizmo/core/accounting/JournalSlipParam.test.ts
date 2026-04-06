import Decimal from 'decimal.js';
import { BizFunction } from '../bizProcessor/func/BizFunction';
import { BizIOConf } from '../bizProcessor/func/input/BizIOConf';
import { JournalSlipParam } from './JournalSlipParam';

describe('JournalSlipParam のテスト', () => {
    let stripParam01: JournalSlipParam;
    let stripParam02: JournalSlipParam;

    beforeEach(() => {
        stripParam01 = new JournalSlipParam();
        stripParam02 = new JournalSlipParam();
        stripParam02.setInitValue('ID_1', new Decimal('123'));
        stripParam02.setBizFuncResult('ID_2', 1);
        stripParam02.setBizIOConf('ID_3', new BizIOConf('TARGET_1', 2));
    });

    test('init default', () => {
        expect(stripParam01.hasElement()).toBeFalsy();
    });

    test('getting for no data is undefined', () => {
        expect(stripParam01.get('NO_DATA')).toBeUndefined();
    });

    test('get & setInitValue', () => {
        expect(stripParam02.get('ID_1')).toEqual(new Decimal('123'));
    });

    test('get & setBizFuncResult', () => {
        expect(stripParam02.get('ID_2')).toEqual(1);
    });

    test('get & setBizIOConf', () => {
        expect(stripParam02.get('ID_3')).toEqual(new BizIOConf('TARGET_1', 2));
    });

    test('clear', () => {
        stripParam02.clear();
        expect(stripParam02.hasElement()).toBeFalsy();
    });

    describe('makePartialCodeAndSetupFunc', () => {
        test('正常系', () => {
            const seedFunc = new BizFunction();
            seedFunc.addBizIOInput('BIZ_INIT_0', 123);
            seedFunc.addInitValue(new Decimal('321'));
            const [updateTargetFunc, code] =
                stripParam02.makePartialCodeAndSetupFunc(seedFunc);
            expect(code).toBe('bizid1: init1,bizid2: res1,bizid3: bizio4');
            expect(updateTargetFunc.orderedBizIOConf).toEqual([
                new BizIOConf('BIZ_INIT_0', 123),
                new BizIOConf('ID_1', 0),
                new BizIOConf('ID_2', 0),
                new BizIOConf('ID_3', 0),
                new BizIOConf('TARGET_1', 2),
            ]);
            expect(updateTargetFunc.orderedInitValues).toEqual([
                new Decimal('321'),
                new Decimal('123'),
            ]);
        });
    });
});
