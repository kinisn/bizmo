import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { UserBizActors } from './UserBizActors';
import { UserState } from './UserState';

describe('UserBizActors のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let user1: UserBizActors;
    let user2: UserBizActors;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        user1 = new UserBizActors({
            timetable,
            db,
            hyperMG,
            name: 'CohortUser1',
            userState: UserState.REACHABLE_TARGET,
            isRetention: true,
            bizIOId: 'CohortUser1',
        });
        user2 = new UserBizActors({
            timetable,
            db,
            hyperMG,
            name: 'CategoryUser2',
            userState: UserState.PURCHASER,
            isRetention: false,
            bizIOId: 'CategoryUser2',
        });
    });

    describe('init', () => {
        test('cohort', () => {
            expect(user1.children.length).toBe(1);
            expect(user1.userState).toBe(UserState.REACHABLE_TARGET);
            expect(user1.isRetention).toBeTruthy();

            user1.prepareAndUpdateFullCollectionsForAllTerms();

            expect(user1.container.exportAsTable()).toEqual([
                [
                    'CohortUser1:MAIN_USERS:ACTION_1ST_AGENT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_1ST_ACCUM',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:RATE_1ST_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);
        });

        test('category', () => {
            expect(user2.children.length).toBe(1);
            expect(user2.userState).toBe(UserState.PURCHASER);
            expect(user2.isRetention).toBeFalsy();

            user2.prepareAndUpdateFullCollectionsForAllTerms();

            expect(user2.container.exportAsTable()).toEqual([
                [
                    'CategoryUser2:MAIN_USERS',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CategoryUser2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);
        });
    });

    describe('addSeedContent & getContent', () => {
        test('cohort', () => {
            user1.addSeedContent('Content2');

            user1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(user1.container.exportAsTable()).toEqual([
                [
                    'CohortUser1:MAIN_USERS:ACTION_1ST_AGENT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_1ST_ACCUM',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:RATE_1ST_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_1ST_AGENT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_1ST_ACCUM',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:RATE_1ST_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CohortUser1:Content2:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);

            // getContent
            expect(user1.getContent('NOT_EXISTED')).toBeUndefined();
            expect(user1.getContent()?.name).toBe('MAIN_USERS');
            expect(user1.getContent('Content2')?.name).toBe('Content2');
        });

        test('category & category sum', () => {
            user2.addSeedContent('Content2');

            user2.prepareAndUpdateFullCollectionsForAllTerms();
            expect(user2.container.exportAsTable()).toEqual([
                [
                    'CategoryUser2:MAIN_USERS',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CategoryUser2:Content2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'CategoryUser2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);

            // getContent
            expect(user2.getContent('NOT_EXISTED')).toBeUndefined();
            expect(user2.getContent()?.name).toBe('MAIN_USERS');
            expect(user2.getContent('Content2')?.name).toBe('Content2');

            // category sum
            user2
                .getContent()
                ?.setValue(new Date(2020, 1, 1), new Decimal(123));
            user2
                .getContent('Content2')
                ?.setValue(new Date(2020, 2, 1), new Decimal(123000));

            user2.prepareAndUpdateFullCollectionsForAllTerms();
            expect(user2.container.exportAsTable()).toEqual([
                [
                    'CategoryUser2:MAIN_USERS',
                    new Decimal(123),
                    new Decimal(123),
                    new Decimal(123),
                ],
                [
                    'CategoryUser2:Content2',
                    new Decimal(0),
                    new Decimal(123000),
                    new Decimal(123000),
                ],
                [
                    'CategoryUser2',
                    new Decimal(123),
                    new Decimal(123123),
                    new Decimal(123123),
                ],
            ]);
        });
    });
});
