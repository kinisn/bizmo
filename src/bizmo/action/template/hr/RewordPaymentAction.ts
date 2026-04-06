import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { StaffRole } from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import Decimal from 'decimal.js';
import { StaffActionBase } from './StaffActionBase';

/**
 * スタッフへの報酬支払
 */
export class RewordPaymentAction extends StaffActionBase {
    static PAYMENT_TERM: string = 'PAYMENT_TERM';
    static DELAYED_PAYMENT: string = 'DELAYED_PAYMENT';

    /**
     * 全term共通の 支払猶予 を取得する
     * 当term分の対価の支払が、当termからどれだけ先になるか。 デフォルト：０＝当term
     * @return {number}
     */
    paymentTerm(): number {
        return (
            this.actionParam.getForAllTerm<number>(
                RewordPaymentAction.PAYMENT_TERM
            ) ?? 0
        );
    }

    /**
     * 全term共通の 支払猶予 を設定する
     * @param {BizActionParams} actionParam
     * @param {number} paymentTerm
     * @return {BizActionParams}
     */
    static setPaymentTerm(
        actionParam: BizActionParams,
        paymentTerm: number
    ): BizActionParams {
        actionParam.setForAllTerm(
            RewordPaymentAction.PAYMENT_TERM,
            paymentTerm
        );
        return actionParam;
    }

    /**
     * 特定termにおける 遅延された支払額 を取得する
     * @param  {Date} term
     * @return {Decimal | undefined}
     */
    delayedPaymentAt(term: Date): Decimal | undefined {
        return this.actionParam.get(term, RewordPaymentAction.DELAYED_PAYMENT);
    }

    /**
     * 特定termにおける 遅延された支払額 を設定する
     * @param {Date} term
     * @param {Decimal} delayedPayment
     */
    setDelayedPaymentAt(term: Date, delayedPayment: Decimal): void {
        this.actionParam.set(
            term,
            RewordPaymentAction.DELAYED_PAYMENT,
            delayedPayment
        );
    }

    /**
     *
     */
    protected override _prepareEachTermProcess(): void {
        const staff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        if (this.bizComponent && staff) {
            // 支払猶予がある場合には、当termは 給与の未払給与をあげておき、当Termに支払いするものを現金から支払い。

            const currentConsideration = staff.working.totalValue.atCurrent(); // 当月に発生した対価
            if (currentConsideration && currentConsideration.value) {
                // 給与は 当term に発生
                const paymentTargetTermIndex =
                    this.timetable.currentIndex + this.paymentTerm();
                if (
                    this.paymentTerm() > 0 &&
                    0 <= paymentTargetTermIndex &&
                    paymentTargetTermIndex < this.timetable.length
                ) {
                    // 未払処理するので繰延
                    this.setDelayedPaymentAt(
                        this.timetable.terms[paymentTargetTermIndex],
                        currentConsideration.value
                    );
                }

                // journal に記録
                // 借方：給与
                // TODO 事業シミュレーターで会計をどこまで細かくすべきか？理想は、name レベルまで自動的に分割されるべき
                const debitsGeneral =
                    this.bizComponent.company.accounting.selectAccountCategory(
                        this.staffRole == StaffRole.EMPLOYEES
                            ? AccountNames.PL_SALARIES
                            : AccountNames.PL_REMUNERATION_FOR_DIRECTORS
                    ).general;

                // 貸方:
                const creditsGeneral =
                    this.bizComponent.company.accounting.selectAccountCategory(
                        this.paymentTerm() == 0
                            ? AccountNames.BS_CASH_AND_DEPOSITS
                            : AccountNames.BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE
                    ).general;
                if (debitsGeneral && creditsGeneral) {
                    // 借方：給与
                    this.processor1st.debits.setInitValue(
                        debitsGeneral.id,
                        currentConsideration.value
                    );
                    // 貸方:
                    this.processor1st.credits.setInitValue(
                        creditsGeneral.id,
                        currentConsideration.value
                    );
                }

                // 当月支払い分の未払い
                const delayedPaymentForThisTerm = this.delayedPaymentAt(
                    this.timetable.currentDate
                );
                if (delayedPaymentForThisTerm) {
                    // 貸方：未払金
                    const accountPayableGeneral =
                        this.bizComponent.company.accounting.selectAccountCategory(
                            AccountNames.BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE
                        ).general;
                    // 貸方：現金
                    const cashGeneral =
                        this.bizComponent.company.accounting.selectAccountCategory(
                            AccountNames.BS_CASH_AND_DEPOSITS
                        ).general;
                    if (accountPayableGeneral && cashGeneral) {
                        // 貸方：未払金
                        this.processor1st.debits.setInitValue(
                            accountPayableGeneral.id,
                            delayedPaymentForThisTerm
                        );
                        // 貸方：現金
                        this.processor1st.credits.setInitValue(
                            cashGeneral.id,
                            delayedPaymentForThisTerm
                        );
                    }
                }
            }
        }
    }
}

/*



*/
