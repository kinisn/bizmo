import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import { BizDatabase } from '../../db/BizDatabase';
import { AccountedMonetaryBizIO } from '../single/AccountedMonetaryBizIO';
import { AmountBizIO, MonetaryBizIO } from '../single/BizIOs';
import { AccountedCollectionBizIO } from './AccountedCollectionBizIO';
import { CollectionBizIO } from './CollectionBizIO';

describe('AccountedCollectionBizIO のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let accounted01: AccountedCollectionBizIO;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        accounted01 = new AccountedCollectionBizIO({ timetable, db, hyperMG });
    });

    describe('appendChild', () => {
        test('add AccountedMonetaryBizIO', () => {
            expect(
                accounted01.appendChild(
                    new AccountedMonetaryBizIO({ timetable, db })
                )
            ).not.toBeUndefined();
        });

        test('add AccountedMonetaryBizIO ', () => {
            expect(
                accounted01.appendChild(
                    new AccountedCollectionBizIO({ timetable, db, hyperMG })
                )
            ).not.toBeUndefined();
        });

        test('add MonetaryBizIO', () => {
            expect(
                accounted01.appendChild(new MonetaryBizIO({ timetable, db }))
            ).toBeUndefined();
        });

        test('add AmountBizIO', () => {
            expect(
                accounted01.appendChild(new AmountBizIO({ timetable, db }))
            ).toBeUndefined();
        });

        test('add CollectionBizIO', () => {
            expect(
                accounted01.appendChild(
                    new CollectionBizIO({ timetable, db, hyperMG })
                )
            ).toBeUndefined();
        });
    });

    describe('addSeedAccountedCategoryBizIO', () => {
        test('with all setting', () => {
            expect(
                accounted01.addSeedAccountedCategoryBizIO(
                    'TestedCategory',
                    AccountNames.BS_ASSETS,
                    'SYSTEM_TEST1'
                )
            ).not.toBeUndefined();

            // 生成内容の確認
            // selectChildBySystemNameでの取得
            const target = accounted01.selectChildBySystemName('SYSTEM_TEST1');
            expect(target?.name).toEqual('TestedCategory');
            expect(target?.accountName).toBe(AccountNames.BS_ASSETS);

            // selectChildByNameでの取得
            const target2 = accounted01.selectChildByName('TestedCategory');
            expect(target2?.name).toEqual('TestedCategory');
            expect(target2?.accountName).toBe(AccountNames.BS_ASSETS);

            // 同一性の比較
            expect(target).toBe(target2);
        });

        test('with minimum setting', () => {
            expect(
                accounted01.addSeedAccountedCategoryBizIO('TestedCategory')
            ).not.toBeUndefined();

            // 生成内容の確認
            // selectChildByNameでの取得
            const target2 = accounted01.selectChildByName('TestedCategory');
            expect(target2?.name).toEqual('TestedCategory');
            expect(target2?.accountName).toBe(AccountNames.INHERITANCE);
        });
    });

    describe('addSeedAccountedMonetaryBizIO', () => {
        test('with all setting', () => {
            expect(
                accounted01.addSeedAccountedMonetaryBizIO(
                    'TestedCategory',
                    AccountNames.BS_ASSETS,
                    'SYSTEM_TEST1'
                )
            ).not.toBeUndefined();

            // 生成内容の確認
            // selectChildBySystemNameでの取得
            const target = accounted01.selectChildBySystemName('SYSTEM_TEST1');
            expect(target?.name).toEqual('TestedCategory');
            expect(target?.accountName).toBe(AccountNames.BS_ASSETS);

            // selectChildByNameでの取得
            const target2 = accounted01.selectChildByName('TestedCategory');
            expect(target2?.name).toEqual('TestedCategory');
            expect(target2?.accountName).toBe(AccountNames.BS_ASSETS);

            // 同一性の比較
            expect(target).toBe(target2);
        });

        test('with minimum setting', () => {
            expect(
                accounted01.addSeedAccountedMonetaryBizIO('TestedCategory')
            ).not.toBeUndefined();

            // 生成内容の確認
            // selectChildByNameでの取得
            const target2 = accounted01.selectChildByName('TestedCategory');
            expect(target2?.name).toEqual('TestedCategory');
            expect(target2?.accountName).toBe(AccountNames.INHERITANCE);
        });
    });
});
