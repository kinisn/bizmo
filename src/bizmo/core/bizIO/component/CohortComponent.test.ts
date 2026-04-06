import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
// import { CategoryBizIO } from '../collection/CategoryBizIO';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { vi } from 'vitest';
import { MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { CohortComponent, CohortSettingParts } from './CohortComponent';

describe('CohortComponent のテスト', () => {
    let timetable5: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let retention5: CohortComponent;

    beforeEach(() => {
        timetable5 = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 5,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        retention5 = new CohortComponent({
            timetable: timetable5,
            db,
            hyperMG,
        });
    });

    describe('init', () => {
        test('without param', () => {
            retention5.prepareAndUpdateFullCollectionsForAllTerms();
            const result = retention5.exportAsTable({
                idCol: false,
                nameCol: true,
                termRow: true,
            });
            expect(result).toEqual([
                [
                    'name',
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 4, 1),
                    new Date(2020, 5, 1),
                ],
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
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
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

        test('with param', () => {
            retention5.prepareAndUpdateFullCollectionsForAllTerms();
            const result = retention5.exportAsTable({
                idCol: false,
                nameCol: true,
                termRow: true,
            });
            expect(result).toEqual([
                [
                    'name',
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 4, 1),
                    new Date(2020, 5, 1),
                ],
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
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
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
    });

    describe('set cohort input', () => {
        test('common', () => {
            retention5.existedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal(10000)
            );
            retention5.existedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal(10000)
            );
            retention5.existedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal(10000)
            );
            retention5.existedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal(10000)
            );
            retention5.existedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal(10000)
            );

            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal('0.9')
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal('0.8')
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal('0.7')
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal('0.6')
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal('0.5')
            );

            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal(10)
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal(20)
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal(30)
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal(40)
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal(50)
            );

            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.6'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.5'));

            retention5
                .monetaryUnitValueIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('10'));
            retention5
                .monetaryUnitValueIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('20'));
            retention5
                .monetaryUnitValueIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('30'));
            retention5
                .monetaryUnitValueIndex(3)
                ?.setValue(new Date(2020, 1, 1), new Decimal('40'));
            retention5
                .monetaryUnitValueIndex(4)
                ?.setValue(new Date(2020, 1, 1), new Decimal('50'));

            // 実施
            const listData = [
                new BizValue(new Date(2020, 1, 1), new Decimal('1000')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2000')),
                new BizValue(new Date(2020, 3, 1), new Decimal('3000')),
                new BizValue(new Date(2020, 4, 1), new Decimal('4000')),
                new BizValue(new Date(2020, 5, 1), new Decimal('5000')),
            ];

            timetable5.setIndexToStart();
            retention5.prepareUpdateFullCOllections();

            for (let index = 0; index < timetable5.terms.length; index++) {
                retention5.updateFullCollections(); // 他の情報が生成されている状況
                retention5.action1st.set(listData[index]);
                retention5.updateCohort(); // cohort計算実施
                timetable5.next();
            }

            const result = retention5.exportAsTable({
                idCol: false,
                nameCol: true,
                termRow: true,
            });

            // 確認
            expect(result).toEqual([
                [
                    'name',
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 4, 1),
                    new Date(2020, 5, 1),
                ],
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

        test('common each term', () => {
            timetable5.setIndexToStart();

            // term1
            retention5.existedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal(10000)
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal('0.9')
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 1, 1),
                new Decimal(10)
            );

            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.6'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.5'));

            retention5
                .monetaryUnitValueIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('10'));
            retention5
                .monetaryUnitValueIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('20'));
            retention5
                .monetaryUnitValueIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('30'));
            retention5
                .monetaryUnitValueIndex(3)
                ?.setValue(new Date(2020, 1, 1), new Decimal('40'));
            retention5
                .monetaryUnitValueIndex(4)
                ?.setValue(new Date(2020, 1, 1), new Decimal('50'));

            retention5.action1st.set(
                new BizValue(new Date(2020, 1, 1), new Decimal('1000'))
            );
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();

            // term2
            retention5.existedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal(10000)
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal('0.8')
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 2, 1),
                new Decimal(20)
            );

            retention5.action1st.set(
                new BizValue(new Date(2020, 2, 1), new Decimal('2000'))
            );
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();

            // term3
            retention5.existedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal(10000)
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal('0.7')
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 3, 1),
                new Decimal(30)
            );

            retention5.action1st.set(
                new BizValue(new Date(2020, 3, 1), new Decimal('3000'))
            );
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();

            // term4
            retention5.existedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal(10000)
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal('0.6')
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 4, 1),
                new Decimal(40)
            );

            retention5.action1st.set(
                new BizValue(new Date(2020, 4, 1), new Decimal('4000'))
            );
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();

            // term5
            retention5.existedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal(10000)
            );
            retention5.cohortRateOfExistedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal('0.5')
            );
            retention5.monetaryUnitValueOfExistedAction1st.setValue(
                new Date(2020, 5, 1),
                new Decimal(50)
            );

            retention5.action1st.set(
                new BizValue(new Date(2020, 5, 1), new Decimal('5000'))
            );
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();

            // 確認
            const result = retention5.exportAsTable({
                idCol: false,
                nameCol: true,
                termRow: true,
            });

            expect(result).toEqual([
                [
                    'name',
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 4, 1),
                    new Date(2020, 5, 1),
                ],
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

        test('caped case', () => {
            retention5.isCapped = true;
            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
            retention5
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));
            retention5
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
            retention5
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.6'));
            retention5
                .reactionRateIndex(3)
                ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.5'));
            retention5
                .reactionRateIndex(4)
                ?.setValue(new Date(2020, 2, 1), new Decimal('1'));

            // 実施
            const listData = [
                new BizValue(new Date(2020, 1, 1), new Decimal('1000')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2000')),
                new BizValue(new Date(2020, 3, 1), new Decimal('3000')),
                new BizValue(new Date(2020, 4, 1), new Decimal('4000')),
                new BizValue(new Date(2020, 5, 1), new Decimal('5000')),
            ];

            timetable5.setIndexToStart();
            retention5.prepareUpdateFullCOllections();

            for (let index = 0; index < timetable5.terms.length; index++) {
                retention5.updateFullCollections();
                retention5.action1st.set(listData[index]);
                retention5.updateCohort(); // cohort計算実施
                timetable5.next();
            }

            const result = retention5.exportAsTable({
                idCol: false,
                nameCol: true,
                termRow: true,
            });
            // 確認
            expect(result).toEqual([
                [
                    'name',
                    new Date(2020, 1, 1),
                    new Date(2020, 2, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 4, 1),
                    new Date(2020, 5, 1),
                ],
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
                    new Decimal('0.9'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                    new Decimal('0.9'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal('0.8'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal('0.7'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                    new Decimal('0.6'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                    new Decimal('0.5'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('1'),
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
                    new Decimal('1000'),
                    new Decimal('3000'),
                    new Decimal('6000'),
                    new Decimal('10000'),
                    new Decimal('15000'),
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
                    new Decimal('900.0'),
                    new Decimal('900.0'),
                    new Decimal('900.0'),
                    new Decimal('900.0'),
                    new Decimal('900.0'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal('0'),
                    new Decimal('2000'),
                    new Decimal('2000'),
                    new Decimal('2000'),
                    new Decimal('2000'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('3000'),
                    new Decimal('3000'),
                    new Decimal('3000'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('4000'),
                    new Decimal('4000'),
                ],
                [
                    'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('5000'),
                ],
                [
                    'CohortComponent:ACTION_2ND',
                    new Decimal('900.0'),
                    new Decimal('2900.0'),
                    new Decimal('5900.0'),
                    new Decimal('9900.0'),
                    new Decimal('14900.0'),
                ],
                [
                    'CohortComponent:RATE_1ST_2ND',
                    new Decimal('0.9'),
                    new Decimal('0.96666666666666666667'),
                    new Decimal('0.98333333333333333333'),
                    new Decimal('0.99'),
                    new Decimal('0.99333333333333333333'),
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
    });

    test('direct set is not allowed', () => {
        // action_2nd_of_1st を直接設定することはできない
        const logSpy = vi.spyOn(console, 'log');
        retention5
            .action2ndOf1stAt(new Date(2020, 1, 1))
            ?.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal(900)),
                new BizValue(new Date(2020, 2, 1), new Decimal(800)),
                new BizValue(new Date(2020, 3, 1), new Decimal(700)),
                new BizValue(new Date(2020, 4, 1), new Decimal(600)),
                new BizValue(new Date(2020, 5, 1), new Decimal(500)),
            ]);
        expect(logSpy).toHaveBeenCalledWith(
            'Not supported set_history function in [name:ACTION_2ND_OF_1ST_AT_2020-02-01, editable:false]'
        );
    });

    test('action1Agent', () => {
        const act1Agent = new CollectionBizIO({
            timetable: timetable5,
            db,
            hyperMG,
            name: 'Action1_Agent',
            bizIOId: 'Action1_Agent',
            exportWithChildren: true,
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
        });
        const act1AgentElem1 = new MonetaryBizIO({
            timetable: timetable5,
            db,
            name: 'act1_agent_elem_1',
        });
        act1Agent.appendChild(act1AgentElem1);

        retention5 = new CohortComponent({
            timetable: timetable5,
            db,
            hyperMG,
            action1stAgent: act1Agent,
        });
        retention5
            .reactionRateIndex(0)
            ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
        retention5
            .reactionRateIndex(1)
            ?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));
        retention5
            .reactionRateIndex(2)
            ?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
        retention5
            .reactionRateIndex(3)
            ?.setValue(new Date(2020, 1, 1), new Decimal('0.6'));
        retention5
            .reactionRateIndex(4)
            ?.setValue(new Date(2020, 1, 1), new Decimal('0.5'));

        // 実施
        const listData = [
            new BizValue(new Date(2020, 1, 1), new Decimal('100')),
            new BizValue(new Date(2020, 2, 1), new Decimal('200')),
            new BizValue(new Date(2020, 3, 1), new Decimal('300')),
            new BizValue(new Date(2020, 4, 1), new Decimal('400')),
            new BizValue(new Date(2020, 5, 1), new Decimal('500')),
        ];

        timetable5.setIndexToStart();
        // retention5.prepareUpdateFullCOllections();

        for (let index = 0; index < timetable5.terms.length; index++) {
            // retention5.updateFullCollections();
            act1AgentElem1.set(listData[index]);
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();
        }

        let result = retention5.exportAsTable({
            idCol: false,
            nameCol: true,
            termRow: false,
        });
        // 確認
        expect(result).toEqual([
            [
                'CohortComponent:Action1_Agent:act1_agent_elem_1',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('500'),
            ],
            [
                'CohortComponent:Action1_Agent',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('500'),
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
                new Decimal('100'),
                new Decimal('300'),
                new Decimal('600'),
                new Decimal('1000'),
                new Decimal('1500'),
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
                new Decimal('90.0'),
                new Decimal('80.0'),
                new Decimal('70.0'),
                new Decimal('60.0'),
                new Decimal('50.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('180.0'),
                new Decimal('160.0'),
                new Decimal('140.0'),
                new Decimal('120.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('270.0'),
                new Decimal('240.0'),
                new Decimal('210.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('360.0'),
                new Decimal('320.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('450.0'),
            ],
            [
                'CohortComponent:ACTION_2ND',
                new Decimal('90.0'),
                new Decimal('260.0'),
                new Decimal('500.0'),
                new Decimal('800.0'),
                new Decimal('1150.0'),
            ],
            [
                'CohortComponent:RATE_1ST_2ND',
                new Decimal('0.9'),
                new Decimal('0.86666666666666666667'),
                new Decimal('0.83333333333333333333'),
                new Decimal('0.8'),
                new Decimal('0.76666666666666666667'),
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

        // Agent本体を更新
        // 分母だけが変化し、分子は変化しないので、Rate が変化する
        act1AgentElem1.setValue(new Date(2020, 5, 1), new Decimal('10000'));

        result = retention5.exportAsTable({
            idCol: false,
            nameCol: true,
            termRow: false,
        });
        // 確認
        expect(result).toEqual([
            [
                'CohortComponent:Action1_Agent:act1_agent_elem_1',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('10000'),
            ],
            [
                'CohortComponent:Action1_Agent',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('10000'),
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
                new Decimal('100'),
                new Decimal('300'),
                new Decimal('600'),
                new Decimal('1000'),
                new Decimal('11000'),
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
                new Decimal('90.0'),
                new Decimal('80.0'),
                new Decimal('70.0'),
                new Decimal('60.0'),
                new Decimal('50.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('180.0'),
                new Decimal('160.0'),
                new Decimal('140.0'),
                new Decimal('120.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('270.0'),
                new Decimal('240.0'),
                new Decimal('210.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('360.0'),
                new Decimal('320.0'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('9000.0'),
            ],
            [
                'CohortComponent:ACTION_2ND',
                new Decimal('90.0'),
                new Decimal('260.0'),
                new Decimal('500.0'),
                new Decimal('800.0'),
                new Decimal('9700.0'),
            ],
            [
                'CohortComponent:RATE_1ST_2ND',
                new Decimal('0.9'),
                new Decimal('0.86666666666666666667'),
                new Decimal('0.83333333333333333333'),
                new Decimal('0.8'),
                new Decimal('0.88181818181818181818'),
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

        // Cohort 再構築
        retention5
            .reactionRateIndex(0)
            ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
        retention5
            .reactionRateIndex(1)
            ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
        retention5
            .reactionRateIndex(2)
            ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
        retention5
            .reactionRateIndex(3)
            ?.setValue(new Date(2020, 2, 1), new Decimal('1'));
        retention5
            .reactionRateIndex(4)
            ?.setValue(new Date(2020, 2, 1), new Decimal('1'));

        timetable5.setIndexToStart();
        for (let index = 0; index < timetable5.terms.length; index++) {
            retention5.updateCohort(); // cohort計算実施
            timetable5.next();
        }

        result = retention5.exportAsTable({
            idCol: false,
            nameCol: true,
            termRow: false,
        });
        // 確認
        expect(result).toEqual([
            [
                'CohortComponent:Action1_Agent:act1_agent_elem_1',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('10000'),
            ],
            [
                'CohortComponent:Action1_Agent',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('300'),
                new Decimal('400'),
                new Decimal('10000'),
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
                new Decimal('0.9'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'CohortComponent:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1'),
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
                new Decimal('100'),
                new Decimal('300'),
                new Decimal('600'),
                new Decimal('1000'),
                new Decimal('11000'),
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
                new Decimal('90.0'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('300'),
                new Decimal('300'),
                new Decimal('300'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('400'),
                new Decimal('400'),
            ],
            [
                'CohortComponent:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10000'),
            ],
            [
                'CohortComponent:ACTION_2ND',
                new Decimal('90.0'),
                new Decimal('300'),
                new Decimal('600'),
                new Decimal('1000'),
                new Decimal('11000'),
            ],
            [
                'CohortComponent:RATE_1ST_2ND',
                new Decimal('0.9'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
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

    test('setting Part', () => {
        timetable5.setIndexToStart();
        const part1 = new CohortSettingParts({
            timetable: timetable5,
            db,
            hyperMG,
        });
        part1.inputIndex(0)?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
        part1.inputIndex(1)?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));
        part1.inputIndex(2)?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
        part1.inputIndex(3)?.setValue(new Date(2020, 1, 1), new Decimal('0.6'));
        part1.inputIndex(4)?.setValue(new Date(2020, 1, 1), new Decimal('0.5'));
        part1.updateOutput(false);

        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);

        // 4回更新
        for (let index = 0; index < timetable5.length - 1; index++) {
            timetable5.next();
            part1.updateOutput(false);
        }
        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
                new Decimal('0.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
                new Decimal('0.6'),
                new Decimal('0.5'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
                new Decimal('0.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
                new Decimal('0.6'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
                new Decimal('0.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
                new Decimal('0.7'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
                new Decimal('0.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
                new Decimal('0.8'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
                new Decimal('0.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.9'),
            ],
        ]);

        // update 2
        timetable5.setIndexToStart();
        part1.inputIndex(0)?.setValue(new Date(2020, 2, 1), new Decimal('1.9'));
        part1.inputIndex(1)?.setValue(new Date(2020, 2, 1), new Decimal('1.8'));
        part1.inputIndex(2)?.setValue(new Date(2020, 2, 1), new Decimal('1.7'));
        part1.inputIndex(3)?.setValue(new Date(2020, 2, 1), new Decimal('1.6'));
        part1.inputIndex(4)?.setValue(new Date(2020, 2, 1), new Decimal('1.5'));

        for (let index = 0; index < timetable5.length; index++) {
            part1.updateOutput(false);
            timetable5.next();
        }
        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('1.9'),
                new Decimal('1.9'),
                new Decimal('1.9'),
                new Decimal('1.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('1.8'),
                new Decimal('1.7'),
                new Decimal('1.6'),
                new Decimal('1.5'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('1.8'),
                new Decimal('1.8'),
                new Decimal('1.8'),
                new Decimal('1.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('1.8'),
                new Decimal('1.7'),
                new Decimal('1.6'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('1.7'),
                new Decimal('1.7'),
                new Decimal('1.7'),
                new Decimal('1.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('1.8'),
                new Decimal('1.7'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('1.6'),
                new Decimal('1.6'),
                new Decimal('1.6'),
                new Decimal('1.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('1.8'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('1.5'),
                new Decimal('1.5'),
                new Decimal('1.5'),
                new Decimal('1.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('1.9'),
            ],
        ]);

        // update 3
        part1.inputIndex(0)?.setValue(new Date(2020, 3, 1), new Decimal('2.9'));
        part1.inputIndex(1)?.setValue(new Date(2020, 3, 1), new Decimal('2.8'));
        part1.inputIndex(2)?.setValue(new Date(2020, 3, 1), new Decimal('2.7'));
        part1.inputIndex(3)?.setValue(new Date(2020, 3, 1), new Decimal('2.6'));
        part1.inputIndex(4)?.setValue(new Date(2020, 3, 1), new Decimal('2.5'));

        timetable5.setIndexToStart();
        for (let index = 0; index < timetable5.length; index++) {
            part1.updateOutput(false);
            timetable5.next();
        }
        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('1.9'),
                new Decimal('2.9'),
                new Decimal('2.9'),
                new Decimal('2.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('1.8'),
                new Decimal('2.7'),
                new Decimal('2.6'),
                new Decimal('2.5'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('1.8'),
                new Decimal('2.8'),
                new Decimal('2.8'),
                new Decimal('2.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('2.8'),
                new Decimal('2.7'),
                new Decimal('2.6'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('1.7'),
                new Decimal('2.7'),
                new Decimal('2.7'),
                new Decimal('2.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2.9'),
                new Decimal('2.8'),
                new Decimal('2.7'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('1.6'),
                new Decimal('2.6'),
                new Decimal('2.6'),
                new Decimal('2.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2.9'),
                new Decimal('2.8'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('1.5'),
                new Decimal('2.5'),
                new Decimal('2.5'),
                new Decimal('2.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2.9'),
            ],
        ]);

        // update 4
        part1.inputIndex(0)?.setValue(new Date(2020, 4, 1), new Decimal('3.9'));
        part1.inputIndex(1)?.setValue(new Date(2020, 4, 1), new Decimal('3.8'));
        part1.inputIndex(2)?.setValue(new Date(2020, 4, 1), new Decimal('3.7'));
        part1.inputIndex(3)?.setValue(new Date(2020, 4, 1), new Decimal('3.6'));
        part1.inputIndex(4)?.setValue(new Date(2020, 4, 1), new Decimal('3.5'));

        timetable5.setIndexToStart();
        for (let index = 0; index < timetable5.length; index++) {
            part1.updateOutput(false);
            timetable5.next();
        }
        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('1.9'),
                new Decimal('2.9'),
                new Decimal('3.9'),
                new Decimal('3.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('1.8'),
                new Decimal('2.7'),
                new Decimal('3.6'),
                new Decimal('3.5'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('1.8'),
                new Decimal('2.8'),
                new Decimal('3.8'),
                new Decimal('3.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('2.8'),
                new Decimal('3.7'),
                new Decimal('3.6'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('1.7'),
                new Decimal('2.7'),
                new Decimal('3.7'),
                new Decimal('3.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2.9'),
                new Decimal('3.8'),
                new Decimal('3.7'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('1.6'),
                new Decimal('2.6'),
                new Decimal('3.6'),
                new Decimal('3.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('3.9'),
                new Decimal('3.8'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('1.5'),
                new Decimal('2.5'),
                new Decimal('3.5'),
                new Decimal('3.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('3.9'),
            ],
        ]);

        // update 5
        part1.inputIndex(0)?.setValue(new Date(2020, 5, 1), new Decimal('4.9'));
        part1.inputIndex(1)?.setValue(new Date(2020, 5, 1), new Decimal('4.8'));
        part1.inputIndex(2)?.setValue(new Date(2020, 5, 1), new Decimal('4.7'));
        part1.inputIndex(3)?.setValue(new Date(2020, 5, 1), new Decimal('4.6'));
        part1.inputIndex(4)?.setValue(new Date(2020, 5, 1), new Decimal('4.5'));

        timetable5.setIndexToStart();
        for (let index = 0; index < timetable5.length; index++) {
            part1.updateOutput(false);
            timetable5.next();
        }
        expect(part1.exportAsTable()).toEqual([
            [
                'CohortSettingParts:INPUT_INDEX_0',
                new Decimal('0.9'),
                new Decimal('1.9'),
                new Decimal('2.9'),
                new Decimal('3.9'),
                new Decimal('4.9'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-02-01',
                new Decimal('0.9'),
                new Decimal('1.8'),
                new Decimal('2.7'),
                new Decimal('3.6'),
                new Decimal('4.5'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_1',
                new Decimal('0.8'),
                new Decimal('1.8'),
                new Decimal('2.8'),
                new Decimal('3.8'),
                new Decimal('4.8'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-03-01',
                new Decimal('0'),
                new Decimal('1.9'),
                new Decimal('2.8'),
                new Decimal('3.7'),
                new Decimal('4.6'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_2',
                new Decimal('0.7'),
                new Decimal('1.7'),
                new Decimal('2.7'),
                new Decimal('3.7'),
                new Decimal('4.7'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-04-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2.9'),
                new Decimal('3.8'),
                new Decimal('4.7'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_3',
                new Decimal('0.6'),
                new Decimal('1.6'),
                new Decimal('2.6'),
                new Decimal('3.6'),
                new Decimal('4.6'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-05-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('3.9'),
                new Decimal('4.8'),
            ],
            [
                'CohortSettingParts:INPUT_INDEX_4',
                new Decimal('0.5'),
                new Decimal('1.5'),
                new Decimal('2.5'),
                new Decimal('3.5'),
                new Decimal('4.5'),
            ],
            [
                'CohortSettingParts:OUTPUT_FOR_1ST_AT_2020-06-01',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('4.9'),
            ],
        ]);
    });
});
