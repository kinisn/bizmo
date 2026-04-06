import {
    AccountNames,
    AccountNamesUtil,
} from 'bizmo/core/accounting/AccountNames';
import Decimal from 'decimal.js';
import { BizAction } from '../core/BizAction';
import { BizActionParams } from '../core/BizActionBase';
import { BizActionTemplateBase } from './BizActionTemplateBase';

// == BizAction ==

/**
 * BSの初期値を設定する典型BizAction
 */
export class BalanceSheetSetupBizAction extends BizAction {
    private static BS_DICT: string = 'BS_DICT';

    /**
     * 【全Term対象】
     * BSの初期値を設定する辞書を設定する
     * @param {BizActionParams} actionParam
     * @param {Map<AccountNames, Decimal>} bsDict BSの初期値となる会計科目と値の辞書
     * @return {BizActionParams}
     */
    public static setBSDict(
        actionParam: BizActionParams,
        bsDict: Map<AccountNames, Decimal>
    ): BizActionParams {
        actionParam.setForAllTerm(BalanceSheetSetupBizAction.BS_DICT, bsDict);
        return actionParam;
    }

    /**
     *
     * @return {Map<AccountNames, Decimal> | undefined} BSの初期値となる会計科目と値の辞書
     */
    getBSDict(): Map<AccountNames, Decimal> | undefined {
        return this.actionParam.getForAllTerm(
            BalanceSheetSetupBizAction.BS_DICT
        );
    }

    /**
     * Overwrite
     */
    protected override _prepareEachTermProcess(): void {
        if (this.timetable.currentIndex == 0 && this.getBSDict()) {
            this.getBSDict()?.forEach((value, accountName) => {
                if (AccountNamesUtil.isBSAccount(accountName)) {
                    const targetAccountBizID =
                        this.bizComponent?.company.accounting.selectAccountCategory(
                            accountName
                        ).general?.id;
                    if (targetAccountBizID) {
                        if (AccountNamesUtil.isDebitAccount(accountName)) {
                            this.processor1st.debits.setInitValue(
                                targetAccountBizID,
                                value
                            );
                        } else {
                            this.processor1st.credits.setInitValue(
                                targetAccountBizID,
                                value
                            );
                        }
                    }
                }
            });
        }
    }
}

// == Template ==

/**
 * 会計操作を行う典型的なBizAction
 */
export class FinancingActions extends BizActionTemplateBase {
    /**
     * AccountNamesで 初期B/S を設定する
     * 対象： 初期term のみ
     *
     * 前提
     * ・Account でサブカテゴリを管理しない
     *   ⇒ TODO： 将来必要になったら Journal から生成する方向で考えよう。。
     * @param {Map<AccountNames, Decimal>} bsDict
     * @param {string} actionId
     * @param {string} actionName
     * @return {BalanceSheetSetupBizAction}
     */
    createBalanceSheetSetup(
        bsDict: Map<AccountNames, Decimal>,
        actionId?: string,
        actionName?: string
    ): BalanceSheetSetupBizAction {
        const action = new BalanceSheetSetupBizAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionId,
            name: actionName,
            actionParam: BalanceSheetSetupBizAction.setBSDict(
                new BizActionParams(this.timetable),
                bsDict
            ),
        });
        action.setPriorities(this._makePriorityDictOnlyForThisTerm());
        return action;
    }
}
