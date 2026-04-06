import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { StaffActionBase } from './StaffActionBase';

/**
 * 初期スタッフの設定
 */
export class CreateInitStaffAction extends StaffActionBase {
    static NUMBER_OF_WORKING: string = 'NUMBER_OF_WORKING';
    static WORKING_UNIT_COST: string = 'WORKING_UNIT_COST';

    /**
     *
     * @param {BizActionParams} actionParam
     * @param {Date} term
     * @param {BizFunction} numberOfWorking
     * @param {BizFunction} workingUnitCost
     * @return {BizActionParams}
     */
    public static setStaffAt(
        actionParam: BizActionParams,
        term: Date,
        numberOfWorking: BizFunction,
        workingUnitCost: BizFunction
    ): BizActionParams {
        actionParam.set(
            term,
            CreateInitStaffAction.NUMBER_OF_WORKING,
            numberOfWorking
        );
        actionParam.set(
            term,
            CreateInitStaffAction.WORKING_UNIT_COST,
            workingUnitCost
        );
        return actionParam;
    }

    /**
     * 対象term における就労人数
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    numberOfWorkingAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(
            term,
            CreateInitStaffAction.NUMBER_OF_WORKING
        );
    }

    /**
     * 対象term における就労者のterm単価
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    workingUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(
            term,
            CreateInitStaffAction.WORKING_UNIT_COST
        );
    }

    // Overwrite

    /**
     *
     */
    protected override _prepareEachTermProcess(): void {
        const term = this.timetable.currentDate;
        const staff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        const workingUnitCost = this.workingUnitCostAt(term);
        const numberOfWorking = this.numberOfWorkingAt(term);
        if (this.bizComponent && staff && workingUnitCost && numberOfWorking) {
            // 同時に設定されているはず
            this.processor1st.clearProcessor();
            // function
            this.processor1st.addBizFunction(workingUnitCost);
            this.processor1st.addBizFunction(numberOfWorking);
            // output
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.working.amount.id,
                    outputFuncId: numberOfWorking.funcId,
                    outputMode: BizProcOutputMode.ADD,
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.working.value.id,
                    outputFuncId: workingUnitCost.funcId,
                    outputMode: BizProcOutputMode.ADD,
                })
            );
        }
    }
}
