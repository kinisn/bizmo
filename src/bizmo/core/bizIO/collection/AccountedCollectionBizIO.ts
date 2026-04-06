import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { AccountedMonetaryBizIO } from '../single/AccountedMonetaryBizIO';
import { BizIO } from '../single/BizIOs';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionSummarizeMode,
} from './CollectionBizIO';

export type AccountedCollectionBizIOParam<
    T = any,
    S extends string = string
> = Omit<CollectionBizIOParam<T, S>, 'uniqueByName' | 'isMonetary'>;

/**
 * 会計管理下の CollectionBizIO
 *
 * ・ユーザーも、シミュレーション前までに Collection を追加することができる。
 *  ⇒ AccountedCategory か AccountedMonetaryBizIO のみを子要素にとれる
 *  ⇒ 要素は名称で一意になること
 */
export class AccountedCollectionBizIO<
    T = any,
    S extends string = string
> extends CollectionBizIO<T, S> {
    static GENERAL_NAME: string = 'GENERAL';

    constructor(props: AccountedCollectionBizIOParam<T, S>) {
        const { exportWithChildren = true, ...rest } = props;
        super({
            isMonetary: true,
            exportWithChildren,
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            // Hack. この実装だと、rest部分で上書きされてしまうが、AccountingComponent との兼ね合いでこの実装とする
            ...rest,
        });
    }

    /**
     * 本項目の「一般」BizIOがあれば取得する
     */
    get general(): AccountedMonetaryBizIO<T, S> | undefined {
        return this.selectChildBySystemName(
            AccountedCollectionBizIO.GENERAL_NAME
        );
    }

    /**
     * AccountedCategory か AccountedMonetaryBizIO のみを子要素として追加できる
     * @param {AccountedCollectionBizIO<T,S> | AccountedMonetaryBizIO<T,S>} child
     * @param {string} systemNamedLabel
     * @return {BizIO | undefined}
     */
    override appendChild<FT extends BizIO<T, S> = BizIO<T, S>>(
        child: FT,
        systemNamedLabel?: string | undefined
    ): FT | undefined {
        if (
            child instanceof AccountedCollectionBizIO ||
            child instanceof AccountedMonetaryBizIO
        ) {
            return super.appendChild(child, systemNamedLabel);
        } else {
            console.log(
                `This child is an instance that is neither AccountedCollectionBizIO nor AccountedMonetaryBizIO.`
            );
        }
    }

    // === Util ===

    /**
     * 設定用 AccountedCollectionBizIO を追加する
     * @param {string} name
     * @param {AccountNames} accountName デフォルト：現在の会計科目
     * @param {string} systemNamedLabel
     * @return {AccountedCollectionBizIO | undefined}
     */
    addSeedAccountedCategoryBizIO(
        name: string,
        accountName?: AccountNames,
        systemNamedLabel?: string
    ): AccountedCollectionBizIO<T, S> | undefined {
        return this.appendChild(
            new AccountedCollectionBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
                isUserNamed: systemNamedLabel === undefined,
                accountName: accountName ?? this.accountName,
            }),
            systemNamedLabel
        );
    }

    /**
     * 設定用 AccountedMonetaryBizIO を追加する
     * @param {string} name
     * @param {AccountNames} accountName デフォルト：現在の会計科目
     * @param {string} systemNamedLabel
     * @return {AccountedMonetaryBizIO | undefined}
     */
    addSeedAccountedMonetaryBizIO(
        name: string,
        accountName?: AccountNames,
        systemNamedLabel?: string
    ): AccountedMonetaryBizIO<T, S> | undefined {
        return this.appendChild(
            new AccountedMonetaryBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                name: name,
                isUserNamed: systemNamedLabel === undefined,
                accountName: accountName ?? this.accountName,
            }),
            systemNamedLabel
        );
    }
}
