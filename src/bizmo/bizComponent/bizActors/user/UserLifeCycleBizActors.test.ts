import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { UserLifeCycleBizActors } from './UserLifeCycleBizActors';
import { UserState } from './UserState';

describe('UserBizActors のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let lifeCycle1: UserLifeCycleBizActors;
    let lifeCycle2: UserLifeCycleBizActors;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        lifeCycle1 = new UserLifeCycleBizActors({ timetable, db, hyperMG });
        lifeCycle2 = new UserLifeCycleBizActors({
            timetable,
            db,
            hyperMG,
            bizIOId: 'TARGET_USERS_ID',
            name: 'TARGET_USERS_NAME',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(lifeCycle1.timetable).toBe(timetable);
            expect(lifeCycle1.db).toBe(db);
            expect(lifeCycle1.id).not.toBeUndefined();
            expect(lifeCycle1.name).toBe('UserLifeCycleBizActors');
            expect(lifeCycle1.exportAsTable()).toEqual([
                [
                    'UserLifeCycleBizActors:MARKET:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:MARKET:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:MARKET',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(lifeCycle1.market.name).toBe('MARKET');
            expect(lifeCycle1.marketingTargets).toEqual([]);
            expect(lifeCycle1.purchasers).toEqual([]);
            expect(lifeCycle1.marketingFunnel.children).toEqual([]);
        });

        test('with param', () => {
            expect(lifeCycle2.timetable).toBe(timetable);
            expect(lifeCycle2.db).toBe(db);
            expect(lifeCycle2.id).toBe('TARGET_USERS_ID');
            expect(lifeCycle2.name).toBe('TARGET_USERS_NAME');
            expect(lifeCycle2.exportAsTable()).toEqual([
                [
                    'TARGET_USERS_NAME:MARKET:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'TARGET_USERS_NAME:MARKET:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'TARGET_USERS_NAME:MARKET',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            expect(lifeCycle2.market.name).toBe('MARKET');
            expect(lifeCycle2.marketingTargets).toEqual([]);
            expect(lifeCycle2.purchasers).toEqual([]);
            expect(lifeCycle2.marketingFunnel.children).toEqual([]);
        });
    });

    describe('add_seed_users', () => {
        test('with default', () => {
            lifeCycle1.addSeedUsers('USER_1');
            expect(lifeCycle1.exportAsTable()).toEqual([
                [
                    'UserLifeCycleBizActors:MARKET:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:MARKET:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:MARKET',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:USER_1:USER_1:MAIN_USERS',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleBizActors:USER_1:USER_1',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
            // 2グループ目
            lifeCycle1.addSeedUsers('Member', UserState.REACHABLE_TARGET, true);
            // 3グループ目
            lifeCycle1.addSeedUsers('Purchaser', UserState.PURCHASER, true);

            lifeCycle1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(lifeCycle1.exportAsTable()).toEqual([
                [
                    'UserLifeCycleBizActors:MARKET:BASE_AMOUNT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:MARKET:GROWTH_RATE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:MARKET',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:FUNNEL:USER_1 → ACTION_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],

                [
                    'UserLifeCycleBizActors:FUNNEL:ACTION_2ND → ACTION_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],

                [
                    'UserLifeCycleBizActors:USER_1:USER_1:MAIN_USERS',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:USER_1:USER_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_1ST_AGENT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_1ST_ACCUM',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:RATE_1ST_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Member:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_1ST_AGENT',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_1ST_ACCUM',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:ACTION_2ND',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:RATE_1ST_2ND',
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                    new Decimal('NaN'),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
                [
                    'UserLifeCycleBizActors:Purchaser:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                    new Decimal(0),
                    new Decimal(0),
                    new Decimal(0),
                ],
            ]);
        });

        test('with update_and_select_users', () => {
            lifeCycle1.setName('user');

            // User Funnelに設定
            lifeCycle1.addSeedUsers('Target');
            lifeCycle1.addSeedUsers('Member', UserState.REACHABLE_TARGET, true);
            lifeCycle1.addSeedUsers('Purchaser', UserState.PURCHASER, true);

            // select no data
            expect(lifeCycle1.selectUsers('NO_DATA')).toBeUndefined();

            // market
            const dateMap = new DateMap<Decimal>();
            dateMap.set(new Date(2020, 1, 1), new Decimal(1));
            lifeCycle1.market.setupForSimpleGrowthMode(
                new Decimal(200000),
                dateMap,
                timetable.length
            );

            // marketing target lv1
            const user1 = lifeCycle1.selectUsers('Target');
            const sub = user1?.addSeedContent('サブターゲット');
            sub?.setValue(new Date(2020, 1, 1), new Decimal(3000));
            sub?.setValue(new Date(2020, 2, 1), new Decimal(4000));

            const user1Main = user1?.getContent();
            user1Main?.setName('メインターゲット');
            user1Main?.setValue(new Date(2020, 1, 1), new Decimal(10000));
            user1Main?.setValue(new Date(2020, 2, 1), new Decimal(20000));

            // marketing target lv2
            const member = lifeCycle1.selectUsers('Member');
            member?.setName('会員');
            const memberMain = member?.getContent() as CohortComponent;
            memberMain?.action1st.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal(1000)),
                new BizValue(new Date(2020, 2, 1), new Decimal(2000)),
                new BizValue(new Date(2020, 3, 1), new Decimal(3000)),
            ]);
            memberMain
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
            memberMain
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.7'));
            memberMain
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.4'));

            // purchaser
            const purchaser = lifeCycle1.selectUsers('Purchaser');
            purchaser?.setName('購入者');
            const purchaserMain = purchaser?.getContent() as CohortComponent;
            purchaserMain.action1st.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal(100)),
                new BizValue(new Date(2020, 2, 1), new Decimal(200)),
                new BizValue(new Date(2020, 3, 1), new Decimal(300)),
            ]);
            purchaserMain
                .reactionRateIndex(0)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.95'));
            purchaserMain
                .reactionRateIndex(1)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.9'));
            purchaserMain
                .reactionRateIndex(2)
                ?.setValue(new Date(2020, 1, 1), new Decimal('0.8'));

            // rename funnel
            lifeCycle1.marketingFunnel.orderedFunnelRates[0].setName(
                '会員登録率'
            );
            lifeCycle1.marketingFunnel.orderedFunnelRates[1].setName(
                '有料転換率'
            );

            // 下記の部分はBizActionで行う想定
            timetable.setIndexToStart();
            lifeCycle1.prepareUpdateFullCOllections();
            timetable.terms.forEach(() => {
                lifeCycle1.updateFullCollections();
                memberMain.updateCohort();
                purchaserMain.updateCohort();
                timetable.next();
            });

            expect(String(lifeCycle1.exportAsTable())).toEqual(
                String([
                    [
                        'user:MARKET:BASE_AMOUNT',
                        new Decimal('251984'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:MARKET:GROWTH_RATE',
                        new Decimal('1.2599210498948731648'),
                        new Decimal('1.2599210498948731648'),
                        new Decimal('1.2599210498948731648'),
                    ],
                    [
                        'user:MARKET',
                        new Decimal('251984'),
                        new Decimal('317480'),
                        new Decimal('400000'),
                    ],
                    [
                        'user:FUNNEL:会員登録率',
                        new Decimal('0.069230769230769230769'),
                        new Decimal('0.10416666666666666667'),
                        new Decimal('0.1875'),
                    ],
                    [
                        'user:FUNNEL:有料転換率',
                        new Decimal('0.10555555555555555556'),
                        new Decimal('0.112'),
                        new Decimal('0.12111111111111111111'),
                    ],
                    [
                        'user:Target:Target:メインターゲット',
                        new Decimal('10000'),
                        new Decimal('20000'),
                        new Decimal('20000'),
                    ],
                    [
                        'user:Target:Target:サブターゲット',
                        new Decimal('3000'),
                        new Decimal('4000'),
                        new Decimal('4000'),
                    ],
                    [
                        'user:Target:Target',
                        new Decimal('13000'),
                        new Decimal('24000'),
                        new Decimal('24000'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_1ST_AGENT',
                        new Decimal('1000'),
                        new Decimal('2000'),
                        new Decimal('3000'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                        new Decimal('0.9'),
                        new Decimal('0.9'),
                        new Decimal('0.9'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                        new Decimal('0.9'),
                        new Decimal('0.7'),
                        new Decimal('0.4'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                        new Decimal('0.7'),
                        new Decimal('0.7'),
                        new Decimal('0.7'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0.9'),
                        new Decimal('0.7'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                        new Decimal('0.4'),
                        new Decimal('0.4'),
                        new Decimal('0.4'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0.9'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:EXISTED_ACTION_2ND',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_1ST_ACCUM',
                        new Decimal('1000'),
                        new Decimal('3000'),
                        new Decimal('6000'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                        new Decimal('900'),
                        new Decimal('700'),
                        new Decimal('400'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('1800'),
                        new Decimal('1400'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('2700'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:ACTION_2ND',
                        new Decimal('900'),
                        new Decimal('2500'),
                        new Decimal('4500'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:RATE_1ST_2ND',
                        new Decimal('0.9'),
                        new Decimal('0.83333333333333333333'),
                        new Decimal('0.75'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:会員:Member:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_1ST_AGENT',
                        new Decimal('100'),
                        new Decimal('200'),
                        new Decimal('300'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:COHORT_RATE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_0',
                        new Decimal('0.95'),
                        new Decimal('0.95'),
                        new Decimal('0.95'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                        new Decimal('0.95'),
                        new Decimal('0.9'),
                        new Decimal('0.8'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_1',
                        new Decimal('0.9'),
                        new Decimal('0.9'),
                        new Decimal('0.9'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0.95'),
                        new Decimal('0.9'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:INPUT_INDEX_2',
                        new Decimal('0.8'),
                        new Decimal('0.8'),
                        new Decimal('0.8'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:REACTION_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0.95'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_0',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-02-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_1',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:INPUT_INDEX_2',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_COHORT:OUTPUT_FOR_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:EXISTED_ACTION_2ND',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_1ST_ACCUM',
                        new Decimal('100'),
                        new Decimal('300'),
                        new Decimal('600'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_2ND:EXISTED_ACTION_2ND',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-02-01',
                        new Decimal('95'),
                        new Decimal('90'),
                        new Decimal('80'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('190'),
                        new Decimal('180'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_2ND:ACTION_2ND_OF_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('285'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:ACTION_2ND',
                        new Decimal('95'),
                        new Decimal('280'),
                        new Decimal('545'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:RATE_1ST_2ND',
                        new Decimal('0.95'),
                        new Decimal('0.93333333333333333333'),
                        new Decimal('0.90833333333333333333'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_EXISTED_ACTION_1ST',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-02-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-03-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                    [
                        'user:購入者:Purchaser:MAIN_USERS:MONETARY_VALUE_OF_1ST_AT_2020-04-01',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                ])
            );
        });
    });
});
