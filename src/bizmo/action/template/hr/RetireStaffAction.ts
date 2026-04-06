import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { StaffActionBase } from './StaffActionBase';

/**
 * スタッフの退職
 */
export class RetireStaffAction extends StaffActionBase {
    static NUMBER_OF_RETIRED: string = 'NUMBER_OF_RETIRED';
    static RETIRED_UNIT_COST: string = 'RETIRED_UNIT_COST';

    /**
     *
     * @param {Object} options
     * @param {BizActionParams} options.actionParam
     * @param {Date} options.term
     * @param {BizFunction} options.numberOfRetired
     * @param {BizFunction} options.retiredUnitCost
     * @return {BizActionParams}
     */
    static setStaffAt({
        actionParam,
        term,
        numberOfRetired,
        retiredUnitCost,
    }: {
        actionParam: BizActionParams;
        term: Date;
        numberOfRetired: BizFunction;
        retiredUnitCost: BizFunction;
    }): BizActionParams {
        actionParam.set(
            term,
            RetireStaffAction.NUMBER_OF_RETIRED,
            numberOfRetired
        );
        actionParam.set(
            term,
            RetireStaffAction.RETIRED_UNIT_COST,
            retiredUnitCost
        );
        return actionParam;
    }

    /**
     *
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    numberOfRetiredAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, RetireStaffAction.NUMBER_OF_RETIRED);
    }

    /**
     *
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    retiredUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, RetireStaffAction.RETIRED_UNIT_COST);
    }

    /**
     *
     */
    protected override _prepareEachTermProcess(): void {
        const staff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        const numberOfRetired = this.numberOfRetiredAt(
            this.timetable.currentDate
        );
        const retiredUnitCost = this.retiredUnitCostAt(
            this.timetable.currentDate
        );
        if (this.bizComponent && staff && numberOfRetired && retiredUnitCost) {
            this.processor1st.clearProcessor();
            // BizFunction
            this.processor1st.addBizFunction(numberOfRetired);
            this.processor1st.addBizFunction(retiredUnitCost);
            // output
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.subByRetire.amount.id,
                    outputFuncId: numberOfRetired.funcId,
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.subByRetire.value.id,
                    outputFuncId: retiredUnitCost.funcId,
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.working.amount.id,
                    outputFuncId: numberOfRetired.funcId,
                    outputMode: BizProcOutputMode.SUB,
                })
            );
        }
    }
}
