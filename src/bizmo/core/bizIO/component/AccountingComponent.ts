import {
    AccountHElem,
    AccountHierarchy,
    AccountNames,
} from 'bizmo/core/accounting/AccountNames';
import { LabeledDict } from 'bizmo/core/util/LabeledDict';
import i18n from 'i18n/configs';
import account from '../../../../i18n/account/ja.json';
import {
    AccountedCollectionBizIO,
    AccountedCollectionBizIOParam,
} from '../collection/AccountedCollectionBizIO';
import { CollectionSummarizeMode } from '../collection/CollectionBizIO';
import { AccountedMonetaryBizIO } from '../single/AccountedMonetaryBizIO';

export type AccountingComponentParam<
    T = any,
    S extends string = string,
> = AccountedCollectionBizIOParam<T, S> & {
    addMiddleGeneral?: boolean;
    initAccountHierarchy?: boolean;
};

/**
 * 会計 Component
 *
 * お金が絡む事業情報を「会計情報」として管理するための構造。
 * 会計でいう B/S、P/L 相当のデータが集まる。
 *
 * 各会計項目に General のBizIOが含まれるのがデフォルトなので、迷ったらGeneralを更新すればいい
 * システム提供の勘定科目は削除できずにそのまま使うことにする。
 *
 * ＝方針＝
 * ・支払いサイトなど、Termをまたぐ 処理は、どう処理するのが適切か？
 *  ⇒ 同一インスタンスの Action が Term をまたがり処理されるため、インスタンス変数として入れることが可能であるべき。
 *      Action に支払いサイトの情報を入れる
 *
 * ・money が 会計経由でしか変更できないようにするなら、BizFuncから、どう利用するか？
 *     BizFunction の Input先としての会計情報： OK
 *     BizFunction の Output先として会計情報： NG
 *      ⇒ Output は BizFuncの専用関数 からしか行えない。
 *       ⇐ 別BizActionにすると「BizCompのどこかにOutputしておく」必要があり、本末転倒なので。
 *
 * ・他の会計を利用する BizAction で利用する「勘定科目」との整合性
 *  ⇒ テンプレでは「pre_processの中」で、存在しない場合に自動的に追加するようにする
 */
export class AccountingComponent<
    T = any,
    S extends string = string,
> extends AccountedCollectionBizIO<T, S> {
    private __systemAccounts: LabeledDict<AccountedCollectionBizIO<T, S>>;
    /**
     *
     * @param {AccountingComponentParam<T,S>} param0
     */
    constructor(props: AccountingComponentParam<T, S>) {
        const {
            addMiddleGeneral = true,
            initUpdate,
            initAccountHierarchy = true,
            ...rest
        } = props;

        // Hack. AccountedCollectionBizIO は total_amount 前提だが、AccountingComponent のみ no_summarize にするため、あえてこの実装とする。
        super({
            ...rest,
            summarizeMode: CollectionSummarizeMode.NO_SUMMARIZE,
            initUpdate: false,
        });

        this.__systemAccounts = new LabeledDict<
            AccountedCollectionBizIO<T, S>
        >();

        if (initAccountHierarchy) {
            this.__initAccountHierarchyResolver(
                this,
                AccountHierarchy,
                this,
                addMiddleGeneral
            );
            // i18n
            this._updateTranslation();
        }
    }

    private __initAccountHierarchyResolver(
        target: AccountingComponent<T, S>,
        targetHierarchy: Array<AccountHElem>,
        parent: AccountedCollectionBizIO<T, S>,
        addMiddleGeneral: boolean
    ) {
        targetHierarchy.forEach((accountElem) => {
            // 階層ごとにシステムラベル付きの子要素として追加
            const newCategory = parent.addSeedAccountedCategoryBizIO(
                accountElem.key.toString(),
                accountElem.key,
                accountElem.key.toString()
            );
            if (newCategory) {
                target.__systemAccounts.setContentWithLabel(
                    newCategory,
                    accountElem.key.toString()
                );
                if (!accountElem.children) {
                    // # 最終要素
                    newCategory.addSeedAccountedMonetaryBizIO(
                        AccountedCollectionBizIO.GENERAL_NAME,
                        accountElem.key,
                        AccountedCollectionBizIO.GENERAL_NAME
                    );
                } else {
                    // 勘定科目の子要素がある場合
                    if (addMiddleGeneral) {
                        // 途中にもGENERALを追加する
                        newCategory.addSeedAccountedMonetaryBizIO(
                            AccountedCollectionBizIO.GENERAL_NAME,
                            accountElem.key,
                            AccountedCollectionBizIO.GENERAL_NAME
                        );
                    }
                    this.__initAccountHierarchyResolver(
                        target,
                        accountElem.children,
                        newCategory,
                        addMiddleGeneral
                    );
                }
            }
        });
    }

    // =================== Translate ===================

    private __traverseAccountHierarchy(targetHierarchy: Array<AccountHElem>) {
        targetHierarchy.forEach((accountElem: AccountHElem) => {
            const translated: string = i18n.t(
                `account:${accountElem.key.toString() as keyof typeof account}`
            );
            const target = this.selectAccountCategory(accountElem.key);

            target?.setName(translated, false);
            target?.general?.setName(i18n.t('account:General'));

            if (accountElem.children) {
                this.__traverseAccountHierarchy(accountElem.children);
            }
        });
    }

    protected override _updateTranslation(): void {
        this.__traverseAccountHierarchy(AccountHierarchy);
    }

    // =================== Props ===================

    /**
     * B/S 資産（借方科目）
     */
    get BSDebit_Assets(): AccountedCollectionBizIO<T, S> {
        return this.selectAccountCategory(AccountNames.BS_ASSETS);
    }

    /**
     * B/S 負債（貸方科目）
     */
    get BSCredit_Liabilities(): AccountedCollectionBizIO<T, S> {
        return this.selectAccountCategory(AccountNames.BS_LIABILITIES);
    }

    /**
     * B/S 純資産（貸方科目）
     */
    get BSCredit_NetAssets(): AccountedCollectionBizIO<T, S> {
        return this.selectAccountCategory(AccountNames.BS_NET_ASSETS);
    }

    /**
     * P/L 費用（借方科目）
     */
    get PLDebit_Expenses(): AccountedCollectionBizIO<T, S> {
        return this.selectAccountCategory(AccountNames.PL_EXPENSES);
    }

    /**
     * P/L 収益（貸方科目）
     */
    get PLCredit_Revenue(): AccountedCollectionBizIO<T, S> {
        return this.selectAccountCategory(AccountNames.PL_REVENUE);
    }

    // === util ===

    /**
     * システムで設定されている Account Category から取得する
     * @param {AccountNames} accountName
     * @return {AccountedCollectionBizIO<T,S>}
     */
    selectAccountCategory(
        accountName: AccountNames
    ): AccountedCollectionBizIO<T, S> {
        const result = this.__systemAccounts.getContentByLabel(
            accountName.toString()
        );
        return result!; // Hack: 必ず存在する
    }

    /**
     * 現金・預金 を取得する
     * name を指定しない場合、 general を利用する
     * @param {string} name
     * @return {AccountedMonetaryBizIO<T,S>  | undefined}
     */
    cashAndDeposits(name?: string): AccountedMonetaryBizIO<T, S> {
        const accountCategory = this.selectAccountCategory(
            AccountNames.BS_CASH_AND_DEPOSITS
        )!;
        let result;
        if (name) {
            result = accountCategory.selectChildByName(
                name
            ) as AccountedMonetaryBizIO<T, S>;
        }
        return (
            result ?? (accountCategory.general as AccountedMonetaryBizIO<T, S>)
        ); // BS_CASH_AND_DEPOSITS には generalが定義済み
    }
}
