import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { UserLifeCycleList } from './UserLifeCycleList';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';

describe('UserLifeCycleList のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;

    let hyperMG: HyperParamManager;
    let targetUsers1: UserLifeCycleList;
    let targetUsers2: UserLifeCycleList;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase<any, BizComponentGroupType>();
        hyperMG = new HyperParamManager();
        targetUsers1 = new UserLifeCycleList({ timetable, db, hyperMG });
        targetUsers2 = new UserLifeCycleList({
            timetable,
            db,
            hyperMG,
            bizIOId: 'TARGET_USERS_LIST_ID',
            name: 'TARGET_USERS_LIST_NAME',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(targetUsers1.timetable).toBe(timetable);
            expect(targetUsers1.db).toBe(db);
            expect(targetUsers1.id).not.toBeUndefined();
            expect(targetUsers1.name).toBe('UserLifeCycleList');
            expect(targetUsers1.exportAsTable()).toEqual([
                [
                    'UserLifeCycleList:MAIN_TARGET:MARKET:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleList:MAIN_TARGET:MARKET:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'UserLifeCycleList:MAIN_TARGET:MARKET',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });

        test('with param', () => {
            expect(targetUsers2.timetable).toBe(timetable);
            expect(targetUsers2.db).toBe(db);
            expect(targetUsers2.id).toBe('TARGET_USERS_LIST_ID');
            expect(targetUsers2.name).toBe('TARGET_USERS_LIST_NAME');
            expect(targetUsers2.exportAsTable()).toEqual([
                [
                    'TARGET_USERS_LIST_NAME:MAIN_TARGET:MARKET:BASE_AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'TARGET_USERS_LIST_NAME:MAIN_TARGET:MARKET:GROWTH_RATE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'TARGET_USERS_LIST_NAME:MAIN_TARGET:MARKET',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });
    });

    test('add_seed_target_users_select_target_users', () => {
        targetUsers1.addSeedUsersLifeCycle('USER_1');
        expect(targetUsers1.exportAsTable()).toEqual([
            [
                'UserLifeCycleList:MAIN_TARGET:MARKET:BASE_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:MAIN_TARGET:MARKET:GROWTH_RATE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:MAIN_TARGET:MARKET',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET:BASE_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET:GROWTH_RATE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);

        // 同一名はNG
        expect(targetUsers1.addSeedUsersLifeCycle('USER_1')).toBeUndefined();

        // 選択 & 編集
        let result = targetUsers1.selectUsersLifeCycle();
        expect(result?.name).toBe('MAIN_TARGET');

        result?.setName('MAIN_2');
        result = targetUsers1.selectUsersLifeCycle('MAIN_TARGET');
        expect(result).toBeUndefined();

        expect(targetUsers1.exportAsTable()).toEqual([
            [
                'UserLifeCycleList:MAIN_2:MARKET:BASE_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:MAIN_2:MARKET:GROWTH_RATE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:MAIN_2:MARKET',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET:BASE_AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET:GROWTH_RATE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'UserLifeCycleList:USER_1:MARKET',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });
});
