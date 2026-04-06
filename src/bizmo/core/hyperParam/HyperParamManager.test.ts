import Decimal from 'decimal.js';
import {
    HyperParam,
    HyperParamManager,
    HyperParamSelectMode,
} from './HyperParamManager';
import { ProbHyperParam } from './prob/ProbHyperParam';

describe('HyperParam のテスト', () => {
    let paramDecimal: HyperParam;
    let includedProb: ProbHyperParam;
    let paramProb: HyperParam;
    let paramProb2: HyperParam;

    beforeEach(() => {
        paramDecimal = new HyperParam({ element: new Decimal(123) });
        includedProb = new ProbHyperParam();
        paramProb = new HyperParam({ element: includedProb });
        paramProb2 = new HyperParam({
            element: includedProb,
            mode: HyperParamSelectMode.PER_TERM,
        });
    });
    test('init & get id & get elem', () => {
        expect(paramDecimal.id).not.toBeUndefined();
        expect(paramDecimal.name).not.toBeUndefined();
        expect(paramDecimal.element).toEqual(new Decimal(123));
        expect(paramDecimal.mode).toEqual(HyperParamSelectMode.PER_SIMULATION);

        expect(paramProb.id).not.toBeUndefined();
        expect(paramProb.name).not.toBeUndefined();
        expect(paramProb.element).toEqual(includedProb);
        expect(paramProb.mode).toEqual(HyperParamSelectMode.PER_SIMULATION);

        expect(paramProb2.id).not.toBeUndefined();
        expect(paramProb2.name).not.toBeUndefined();
        expect(paramProb2.element).toEqual(includedProb);
        expect(paramProb2.mode).toEqual(HyperParamSelectMode.PER_TERM);

        // init with name
        const param = new HyperParam({
            element: new Decimal(123),
            name: 'name1',
        });
        expect(param.name).toEqual('name1');
    });

    describe('name', () => {
        test('update name', () => {
            // init
            expect(paramDecimal.name).not.toBeUndefined();
            expect(paramProb.name).not.toBeUndefined();
            expect(paramProb2.name).not.toBeUndefined();

            // update
            paramDecimal.name = 'paramDecimal';
            expect(paramDecimal.name).toEqual('paramDecimal');
            paramProb.name = 'paramProb';
            expect(paramProb.name).toEqual('paramProb');
            paramProb2.name = 'paramProb2';
            expect(paramProb2.name).toEqual('paramProb2');
        });
    });

    describe('elem内容の更新が HyperParam に反映される', () => {
        test('同一elemで内容を変更する場合', () => {
            expect(paramProb.element).toEqual(includedProb);
            const target: ProbHyperParam = paramProb.element as ProbHyperParam;
            expect(target.unit).toEqual(new Decimal(1));
            expect(target.lowerLimit).toEqual(new Decimal(0));
            expect(target.upperLimit).toEqual(new Decimal(1));
            // update
            target.upperLimit = new Decimal(1000);
            target.lowerLimit = new Decimal(-1000);
            target.unit = new Decimal(200);
            // affect on original hyper param
            expect((paramProb.element as ProbHyperParam).unit).toEqual(
                new Decimal(200)
            );
            expect((paramProb.element as ProbHyperParam).upperLimit).toEqual(
                new Decimal(1000)
            );
            expect((paramProb.element as ProbHyperParam).lowerLimit).toEqual(
                new Decimal(-1000)
            );
        });

        test('別elemで置き換える場合', () => {
            expect(paramProb.element).toEqual(includedProb);
            // update
            paramProb.element = new Decimal(234);
            // affect on original hyper param
            expect(paramProb.element).toEqual(new Decimal(234));
        });
    });

    describe('serialize & deserialize', () => {
        test('decimal', () => {
            const paramDecimal1 = new HyperParam({
                element: new Decimal('123.45'),
                name: 'paramDecimal1',
                mode: HyperParamSelectMode.PER_SIMULATION,
                id: 'HyperParamID',
            });
            const json = paramDecimal1.serialize();
            const param = HyperParam.fromSerialized(json);
            expect(param.id).toEqual('HyperParamID');
            expect(param.name).toEqual('paramDecimal1');
            expect(param.mode).toEqual(HyperParamSelectMode.PER_SIMULATION);
            expect(param.element).toEqual(new Decimal('123.45'));
        });

        test('prob', () => {
            const paramDecimal1 = new HyperParam({
                element: new ProbHyperParam({
                    unit: new Decimal(10),
                    lowerLimit: new Decimal('0.1'),
                    upperLimit: new Decimal('1.1'),
                }),
                name: 'paramDecimal1',
                mode: HyperParamSelectMode.PER_SIMULATION,
                id: 'HyperParamID',
            });
            const json = paramDecimal1.serialize();
            const param = HyperParam.fromSerialized(json);
            expect(param.id).toEqual('HyperParamID');
            expect(param.name).toEqual('paramDecimal1');
            expect(param.mode).toEqual(HyperParamSelectMode.PER_SIMULATION);
            expect(param.element).toEqual(
                new ProbHyperParam({
                    unit: new Decimal(10),
                    lowerLimit: new Decimal('0.1'),
                    upperLimit: new Decimal('1.1'),
                })
            );
        });
    });
});
describe('HyperParamManager のテスト', () => {
    let includedProb: ProbHyperParam;

    let mg0: HyperParamManager;
    let mg1: HyperParamManager;

    beforeEach(() => {
        includedProb = new ProbHyperParam();

        mg0 = new HyperParamManager();
        mg1 = new HyperParamManager();
        mg1.set({ label: 'decimal', value: new Decimal(123) });
        mg1.set({ label: 'prob', value: includedProb });
    });

    test('init', () => {
        expect(mg0.values().length).toBe(0);
        expect(mg1.values().length).toBe(2);
    });

    test('set & get', () => {
        mg0 = new HyperParamManager();
        // set
        mg0.set({ label: 'decimal', value: new Decimal(123) });
        mg0.set({ label: 'prob', value: includedProb });
        // get
        expect(mg0.get('NO_DATA')).toBeUndefined();
        expect(mg0.get('decimal')!.element).toEqual(new Decimal(123));
        expect(mg0.get('prob')!.element).toEqual(includedProb);

        // prob is not selected
        expect(
            (mg0.get('prob')!.element as ProbHyperParam).selectedValue
        ).toBeUndefined();
    });

    test('getByID', () => {
        expect(mg1.getByID('NO_DATA')).toBeUndefined();
        expect(mg1.getByID(mg1.get('decimal')!.id)!.element).toEqual(
            new Decimal(123)
        );
        expect(mg1.getByID(mg1.get('prob')!.id)!.element).toEqual(includedProb);
    });

    test('value', () => {
        expect(mg1.get('decimal')?.value).toEqual(new Decimal(123));
        expect(mg1.get('prob')?.value).toEqual(includedProb.meanValue);
    });

    test('remove', () => {
        // no target
        expect(mg1.values().length).toBe(2);
        mg1.remove('NO_DATA');
        expect(mg1.values().length).toBe(2);

        // has target decimal
        mg1.remove('decimal');
        expect(mg1.get('decimal')).toBeUndefined();

        expect(mg1.get('prob')!.element).toEqual(includedProb);
        expect(mg1.values().length).toBe(1);

        // already removed & no change
        mg1.remove('decimal');
        expect(mg1.get('decimal')).toBeUndefined();
        expect(mg1.get('prob')!.element).toEqual(includedProb);
        expect(mg1.values().length).toBe(1);

        // has target prob
        mg1.remove('prob');
        expect(mg1.get('decimal')).toBeUndefined();
        expect(mg1.get('prob')).toBeUndefined();
        expect(mg1.values().length).toBe(0);
    });

    test('prepareSimulation', () => {
        // prob is not selected
        expect(
            (mg1.get('prob')!.element as ProbHyperParam).selectedValue
        ).toBeUndefined();

        mg1.prepareSimulation();
        expect(
            (mg1.get('prob')!.element as ProbHyperParam).selectedValue
        ).toEqual(new Decimal(0)); // 初期値で select した場合はこれでいいかな？？
    });

    test('makeBizFuncFor', () => {
        expect(mg1.makeBizFuncFor('NO_DATA')).toBeUndefined();
        const testee1 = mg1.makeBizFuncFor('decimal');
        expect(testee1!.code).toEqual('hyper0');
        expect(testee1!.orderedHyperParamIDs.length).toEqual(1);
        const testee2 = mg1.makeBizFuncFor('prob');
        expect(testee2!.code).toEqual('hyper0');
        expect(testee2!.orderedHyperParamIDs.length).toEqual(1);
    });
});
