import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizActionTimeline } from '../BizActionTimeline';
import { PriorityGenerator } from '../PriorityGenerator';
import { CohortBizAction } from './CohortBizAction';

describe('CohortBizAction のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let cohort: CohortComponent;
    let pg: PriorityGenerator;
    let priorityDict: DateMap<Decimal>;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 5,
        });
        db = new BizDatabase<any, BizComponentGroupType>();
        hyperMG = new HyperParamManager();
        cohort = new CohortComponent({ timetable, db, hyperMG });
        pg = new PriorityGenerator();
        priorityDict = new DateMap<Decimal>();
        priorityDict.set(timetable.startDate, pg.generate());
    });

    test('init_cohort', () => {
        expect(cohort.exportAsTable()).toEqual([
            [
                'CohortComponent:ACTION_1ST_AGENT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:EXISTED_ACTION_1ST',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_0',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_3',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_4',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:EXISTED_ACTION_2ND',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_1ST_ACCUM',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:EXISTED_ACTION_2ND',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:ACTION_2ND',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:RATE_1ST_2ND',
                new Decimal('NaN'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });

    test('process', () => {
        const actionTimeline = new BizActionTimeline({
            timetable,
            db,
            hyperMG,
        });
        const cohortAction1 = new CohortBizAction({ timetable, db, hyperMG });
        cohortAction1.setCohort(cohort, 0);
        cohortAction1.setCohortSettingAt({
            term: timetable.terms[0],
            action1st: BizFunction.makeInputDecimal(new Decimal(1000)),
            existedAction1st: BizFunction.makeInputDecimal(new Decimal(10000)),
            cohortRateOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal('0.9')
            ),
            monetaryUnitValueOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal(10)
            ),
            reactionRates: [
                BizFunction.makeInputDecimal(new Decimal('0.9')),
                BizFunction.makeInputDecimal(new Decimal('0.8')),
                BizFunction.makeInputDecimal(new Decimal('0.7')),
                BizFunction.makeInputDecimal(new Decimal('0.6')),
                BizFunction.makeInputDecimal(new Decimal('0.5')),
            ],
            monetaryUnitValues: [
                BizFunction.makeInputDecimal(new Decimal('10')),
                BizFunction.makeInputDecimal(new Decimal('20')),
                BizFunction.makeInputDecimal(new Decimal('30')),
                BizFunction.makeInputDecimal(new Decimal('40')),
                BizFunction.makeInputDecimal(new Decimal('50')),
            ],
        });
        cohortAction1.setCohortSettingAt({
            term: timetable.terms[1],
            action1st: BizFunction.makeInputDecimal(new Decimal(2000)),
            cohortRateOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal('0.8')
            ),
            monetaryUnitValueOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal(20)
            ),
        });
        cohortAction1.setCohortSettingAt({
            term: timetable.terms[2],
            action1st: BizFunction.makeInputDecimal(new Decimal(3000)),
            cohortRateOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal('0.7')
            ),
            monetaryUnitValueOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal(30)
            ),
        });
        cohortAction1.setCohortSettingAt({
            term: timetable.terms[3],
            action1st: BizFunction.makeInputDecimal(new Decimal(4000)),
            cohortRateOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal('0.6')
            ),
            monetaryUnitValueOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal(40)
            ),
        });
        cohortAction1.setCohortSettingAt({
            term: timetable.terms[4],
            action1st: BizFunction.makeInputDecimal(new Decimal(5000)),
            cohortRateOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal('0.5')
            ),
            monetaryUnitValueOfExistedAction1st: BizFunction.makeInputDecimal(
                new Decimal(50)
            ),
        });
        const priorityEntity = new DateMap<Decimal>();
        timetable.terms.forEach((term) =>
            priorityEntity.set(term, new Decimal(1))
        );
        actionTimeline.setAction(cohortAction1, priorityEntity);

        actionTimeline.prepareProcess();
        actionTimeline.process();

        expect(cohort.exportAsTable()).toEqual([
            [
                'CohortComponent:ACTION_1ST_AGENT',
                new Decimal('1000'),
                new Decimal('2000'),
                new Decimal('3000'),
                new Decimal('4000'),
                new Decimal('5000'),
            ],
            [
                'CohortComponent:EXISTED_ACTION_1ST',
                new Decimal('10000'),
                new Decimal('10000'),
                new Decimal('10000'),
                new Decimal('10000'),
                new Decimal('10000'),
            ],
            [
                'CohortComponent:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
                new Decimal('0.6'),
                new Decimal('0.5'),
            ],
            [
                'CohortComponent:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('40'),
                new Decimal('50'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
                new Decimal('0.6'),
                new Decimal('0.5'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
                new Decimal('0.6'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                new Decimal('10'),
                new Decimal('10'),
                new Decimal('10'),
                new Decimal('10'),
                new Decimal('10'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('40'),
                new Decimal('50'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                new Decimal('20'),
                new Decimal('20'),
                new Decimal('20'),
                new Decimal('20'),
                new Decimal('20'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('30'),
                new Decimal('40'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                new Decimal('30'),
                new Decimal('30'),
                new Decimal('30'),
                new Decimal('30'),
                new Decimal('30'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('30'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_3',
                new Decimal('40'),
                new Decimal('40'),
                new Decimal('40'),
                new Decimal('40'),
                new Decimal('40'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:INPUT_INDEX_4',
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10'),
            ],
            [
                'CohortComponent:EXISTED_ACTION_2ND',
                new Decimal('9000.0'),
                new Decimal('8000.0'),
                new Decimal('7000.0'),
                new Decimal('6000.0'),
                new Decimal('5000.0'),
            ],
            [
                'CohortComponent:ACTION_1ST_ACCUM',
                new Decimal('11000'),
                new Decimal('13000'),
                new Decimal('16000'),
                new Decimal('20000'),
                new Decimal('25000'),
            ],
            [
                'CohortComponent:ACTION_2ND:EXISTED_ACTION_2ND',
                new Decimal('9000.0'),
                new Decimal('8000.0'),
                new Decimal('7000.0'),
                new Decimal('6000.0'),
                new Decimal('5000.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                new Decimal('900.0'),
                new Decimal('800.0'),
                new Decimal('700.0'),
                new Decimal('600.0'),
                new Decimal('500.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1800.0'),
                new Decimal('1600.0'),
                new Decimal('1400.0'),
                new Decimal('1200.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2700.0'),
                new Decimal('2400.0'),
                new Decimal('2100.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('3600.0'),
                new Decimal('3200.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('4500.0'),
            ],
            [
                'CohortComponent:ACTION_2ND',
                new Decimal('9900.0'),
                new Decimal('10600.0'),
                new Decimal('12000.0'),
                new Decimal('14000.0'),
                new Decimal('16500.0'),
            ],
            [
                'CohortComponent:RATE_1ST_2ND',
                new Decimal('0.9'),
                new Decimal('0.81538461538461538462'),
                new Decimal('0.75'),
                new Decimal('0.7'),
                new Decimal('0.66'),
            ],
            [
                'CohortComponent:MONETARY_VALUE',
                new Decimal('99000.0'),
                new Decimal('194000.0'),
                new Decimal('290000.0'),
                new Decimal('390000.0'),
                new Decimal('495000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                new Decimal('90000.0'),
                new Decimal('160000.0'),
                new Decimal('210000.0'),
                new Decimal('240000.0'),
                new Decimal('250000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                new Decimal('9000.0'),
                new Decimal('16000.0'),
                new Decimal('21000.0'),
                new Decimal('24000.0'),
                new Decimal('25000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('18000.0'),
                new Decimal('32000.0'),
                new Decimal('42000.0'),
                new Decimal('48000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('27000.0'),
                new Decimal('48000.0'),
                new Decimal('63000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('36000.0'),
                new Decimal('64000.0'),
            ],
            [
                'CohortComponent:MONETARY_VALUE_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('45000.0'),
            ],
        ]);
    });
});
