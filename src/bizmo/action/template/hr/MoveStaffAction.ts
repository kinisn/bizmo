import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import { StaffRole } from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { StaffActionBase } from './StaffActionBase';

/**
 * スタッフの異動
 */
export class MoveStaffAction extends StaffActionBase {
    // from は set_staff_role で扱う
    static TO_STAFF_ROLE: string = 'TO_STAFF_ROLE';
    static TO_STAFF_NAME: string = 'TO_STAFF_NAME';

    static NUMBER_OF_MOVED: string = 'NUMBER_OF_MOVED';
    static TO_STAFF_MOVED_UNIT_COST: string = 'TO_STAFF_MOVED_UNIT_COST';
    static TO_STAFF_WORKING_UNIT_COST: string = 'TO_STAFF_WORKING_UNIT_COST';

    /**
     *
     */
    get toStaffRole(): StaffRole | undefined {
        return this.actionParam.getForAllTerm(MoveStaffAction.TO_STAFF_ROLE);
    }

    /**
     *
     */
    get toStaffName(): string | undefined {
        return this.actionParam.getForAllTerm(MoveStaffAction.TO_STAFF_NAME);
    }

    /**
     *
     * @param {Object} params
     * @param {BizActionParams} params.actionParam
     * @param {StaffRole} params.toStaffRole
     * @param {string} params.toStaffName
     * @return {BizActionParams}
     */
    static setToStaffRole({
        actionParam,
        toStaffRole,
        toStaffName,
    }: {
        actionParam: BizActionParams;
        toStaffRole: StaffRole;
        toStaffName: string;
    }): BizActionParams {
        actionParam.setForAllTerm(MoveStaffAction.TO_STAFF_ROLE, toStaffRole);
        actionParam.setForAllTerm(MoveStaffAction.TO_STAFF_NAME, toStaffName);
        return actionParam;
    }

    /**
     *
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    numberOfMovedAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, MoveStaffAction.NUMBER_OF_MOVED);
    }

    /**
     *
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    toStaffMovedUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(
            term,
            MoveStaffAction.TO_STAFF_MOVED_UNIT_COST
        );
    }

    /**
     *
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    toStaffWorkingUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(
            term,
            MoveStaffAction.TO_STAFF_WORKING_UNIT_COST
        );
    }

    /**
     *
     * @param {Object} param
     * @param {BizActionParams} param.actionParam
     * @param {Date} param.term
     * @param {BizFunction} param.numberOfMoved
     * @param {BizFunction} param.toStaffMovedUnitCost
     * @param {BizFunction} param.toStaffWorkingUnitCost
     * @return {BizActionParams}
     */
    static setMoveStaffAt({
        actionParam,
        term,
        numberOfMoved,
        toStaffMovedUnitCost,
        toStaffWorkingUnitCost,
    }: {
        actionParam: BizActionParams;
        term: Date;
        numberOfMoved: BizFunction;
        toStaffMovedUnitCost?: BizFunction;
        toStaffWorkingUnitCost?: BizFunction;
    }): BizActionParams {
        actionParam.set(term, MoveStaffAction.NUMBER_OF_MOVED, numberOfMoved);
        actionParam.set(
            term,
            MoveStaffAction.TO_STAFF_MOVED_UNIT_COST,
            toStaffMovedUnitCost
        );
        actionParam.set(
            term,
            MoveStaffAction.TO_STAFF_WORKING_UNIT_COST,
            toStaffWorkingUnitCost
        );
        return actionParam;
    }

    // Overwrite

    /**
     *
     */
    protected override _initAction(): void {
        const fromStaff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        const toStaff = this._selectStaffByStaffName(
            this.toStaffRole,
            this.toStaffName
        );
        if (fromStaff && toStaff) {
            this.setRelation(
                new BizRelation({
                    fromBizIOId: fromStaff.id,
                    toBizIOId: toStaff.id,
                })
            );
        }
    }

    /**
     *
     */
    protected override _prepareEachTermProcess(): void {
        const fromStaff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        const toStaff = this._selectStaffByStaffName(
            this.toStaffRole,
            this.toStaffName
        );
        const numberOfMoved = this.numberOfMovedAt(this.timetable.currentDate);
        const toStaffMovedUnitCost = this.toStaffMovedUnitCostAt(
            this.timetable.currentDate
        );
        const toStaffWorkingUnitCost = this.toStaffWorkingUnitCostAt(
            this.timetable.currentDate
        );

        if (this.bizComponent && fromStaff && toStaff && numberOfMoved) {
            this.processor1st.clearProcessor();
            // function
            this.processor1st.addBizFunction(numberOfMoved);
            // output: from
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: fromStaff.subByMoved.amount.id,
                    outputFuncId: numberOfMoved.funcId,
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: fromStaff.working.amount.id,
                    outputFuncId: numberOfMoved.funcId,
                    outputMode: BizProcOutputMode.SUB,
                })
            );
            // output: to
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: toStaff.addByMoved.amount.id,
                    outputFuncId: numberOfMoved.funcId,
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: toStaff.working.amount.id,
                    outputFuncId: numberOfMoved.funcId,
                    outputMode: BizProcOutputMode.ADD,
                })
            );

            if (toStaffMovedUnitCost) {
                this.processor1st.addBizFunction(toStaffMovedUnitCost);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        parentId: this.bizComponent.company.id,
                        outputBizId: toStaff.addByMoved.value.id,
                        outputFuncId: toStaffMovedUnitCost.funcId,
                        outputMode: BizProcOutputMode.ADD,
                    })
                );
            }

            if (toStaffWorkingUnitCost) {
                this.processor1st.addBizFunction(toStaffWorkingUnitCost);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        parentId: this.bizComponent.company.id,
                        outputBizId: toStaff.working.value.id,
                        outputFuncId: toStaffWorkingUnitCost.funcId,
                    })
                );
            }
        }
    }
}
