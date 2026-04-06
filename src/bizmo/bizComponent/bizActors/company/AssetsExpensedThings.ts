import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    AccountNames,
    AccountNamesUtil,
} from 'bizmo/core/accounting/AccountNames';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import {
    UnitComponent,
    UnitComponentToObject,
} from 'bizmo/core/bizIO/component/UnitComponent';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';

/**
 * 【汎用】特定の会社資産や「モノ・権利など」に結びつくコスト・費用
 *
 *  ＝ term毎の構成要素 ＝
 * ・初期： term中に 当該グループに追加された資産・費用
 *     ・数量
 *     ・単価
 *     ・調整項目
 *     ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・終了： term中に 当該グループから抜けた資産/費用
 *     ・数量
 *     ・単価
 *     ・調整項目
 *     ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・運用： term【末】に 当該グループで利用している資産・費用
 *       ⇒ 通常は t(n)[運用：数量] = t(n-1)[運用：数量] + t(n)[初期：数量] - t(n)[終了：数量]  になる
 *     ・数量
 *     ・単価
 *     ・調整項目
 *     ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・[Auto] 総合計： t(n)[総合計] = t(n)[初期：合計] + t(n)[終了：合計] + t(n)[運用：合計]
 */
export class AssetsExpensedThings<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    public static INITIALIZED: string = 'INITIALIZED';
    public static RUNNING: string = 'RUNNING';
    public static FINALIZED: string = 'FINALIZED';
    public static TOTAL_VALUE: string = 'TOTAL_VALUE';

    /**
     *
     * @param props
     */
    constructor(props: CollectionBizIOParam<T, BizComponentGroupType>) {
        const { accountName = AccountNames.PL_EXPENSES, ...rest } = props;
        super({ ...rest, accountName });
    }

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChildren(
            [
                AssetsExpensedThings.pickFromInitWthDefault(
                    AssetsExpensedThings.INITIALIZED,
                    () =>
                        new UnitComponent({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: AssetsExpensedThings.INITIALIZED,
                        }),
                    initData
                ),
                AssetsExpensedThings.pickFromInitWthDefault(
                    AssetsExpensedThings.RUNNING,
                    () =>
                        new UnitComponent({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: AssetsExpensedThings.RUNNING,
                        }),
                    initData
                ),
                AssetsExpensedThings.pickFromInitWthDefault(
                    AssetsExpensedThings.FINALIZED,
                    () =>
                        new UnitComponent({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: AssetsExpensedThings.FINALIZED,
                        }),
                    initData
                ),
                AssetsExpensedThings.pickFromInitWthDefault(
                    AssetsExpensedThings.TOTAL_VALUE,
                    () =>
                        new CollectionBizIO({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: AssetsExpensedThings.TOTAL_VALUE,
                            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                            exportWithChildren: false,
                        }),
                    initData
                ),
            ],
            [
                AssetsExpensedThings.INITIALIZED,
                AssetsExpensedThings.RUNNING,
                AssetsExpensedThings.FINALIZED,
                AssetsExpensedThings.TOTAL_VALUE,
            ]
        );
        this.totalValue.appendChildren(
            [
                this.initialized.totalValue,
                this.running.totalValue,
                this.finalized.totalValue,
            ],
            [
                AssetsExpensedThings.INITIALIZED,
                AssetsExpensedThings.RUNNING,
                AssetsExpensedThings.FINALIZED,
            ]
        );
    }

    /**
     * [override]
     * 当該 BizIO を削除する
     *
     * = 注意 =
     * オブジェクトはDBから削除されるだけ。そのままメモリー上から消えるとは限らない。
     * @param {boolean} triggerEvent
     */
    override delete(triggerEvent: boolean): void {
        // 専用子要素を削除
        this.running.delete(false);
        this.initialized.delete(false);
        this.finalized.delete(false);
        this.totalValue.delete(false);

        // 自身を削除
        super.delete(triggerEvent);
    }

    /**
     * [override]
     * 勘定科目を設定する。
     * 設定する科目が「資産」「費用」のどちらかの項目でなければ、設定されない。
     * @param {AccountNames} accountName
     */
    override setAccountName(accountName: AccountNames): void {
        if (
            AccountNamesUtil.isAssets(accountName) ||
            AccountNamesUtil.isExpenses(accountName)
        ) {
            super.setAccountName(accountName);
        }
    }

    /*
     * 単位量 [UPPER/W]
     */

    /**
     * ・初期： term中に 当該グループに追加された資産・費用
     *     ・数量
     *     ・単価
     *     ・調整項目
     *     ・[Auto] 合計： 数量 x 単価 + 調整項目
     */
    get initialized(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(AssetsExpensedThings.INITIALIZED)!; // FIXME
    }

    /**
     * ・運用： term【末】に 当該グループで利用している資産・費用
     *       ⇒ 通常は t(n)[運用：数量] = t(n-1)[運用：数量] + t(n)[初期：数量] - t(n)[終了：数量]  になる
     *     ・数量
     *     ・単価
     *     ・調整項目
     *     ・[Auto] 合計： 数量 x 単価 + 調整項目
     */
    get running(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(AssetsExpensedThings.RUNNING)!; // FIXME
    }

    /**
     * ・終了： term中に 当該グループから抜けた資産/費用
     *     ・数量
     *     ・単価
     *     ・調整項目
     *     ・[Auto] 合計： 数量 x 単価 + 調整項目
     */
    get finalized(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(AssetsExpensedThings.FINALIZED)!; // FIXME
    }

    /**
     * 総合計：初期対象：合計 + 終了対象：合計 + 運用対象：合計
     */
    get totalValue(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(AssetsExpensedThings.TOTAL_VALUE)!; // FIXME
    }

    toObject(): AssetsExpensedThingsToObject<T> {
        return {
            ...super.toObject(),
            initialized: this.initialized.toObject(),
            running: this.running.toObject(),
            finalized: this.finalized.toObject(),
            totalValue: this.totalValue.toObject(),
        };
    }
}

export type AssetsExpensedThingsToObject<T = any> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    initialized: UnitComponentToObject<T, BizComponentGroupType>;
    running: UnitComponentToObject<T, BizComponentGroupType>;
    finalized: UnitComponentToObject<T, BizComponentGroupType>;
    totalValue: CollectionBizIOToObject<T, BizComponentGroupType>;
};

/**
 * 会社資産や「モノ・権利など」に結びつくコスト・費用の一覧
 * B/S および P/LOWER を問わない
 */
export class AssetsExpensedThingsList<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    /**
     * 初期設定用の AssetsExpensedThings を追加する
     *
     * @param {string} name
     * @return {AssetsExpensedThings | undefined}
     */
    addSeedAssetAndExpense(name: string): AssetsExpensedThings<T> | undefined {
        return this.appendChild(
            new AssetsExpensedThings<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
            })
        );
    }

    /**
     * 指定した名前をもつ AssetsExpensedThings を取得する
     *
     * @param {string} name
     * @return {AssetsExpensedThings<T> | undefined}
     */
    selectAssetAndExpense(name: string): AssetsExpensedThings<T> | undefined {
        return this.selectChildByName(name);
    }
}
