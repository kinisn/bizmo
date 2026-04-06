import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputMode,
    RelatedDirection,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { createRelationExtData } from 'bizmoView/common/external/relationExtData';
import { createRelationOnOutputExtData } from 'bizmoView/common/external/relationOnOutputExtData';
import { IconType } from 'bizmoView/common/materialIcon';
import { StaffActionBase } from './StaffActionBase';

/**
 * スタッフの新規雇用
 */
export class HireStaffAction<T = any> extends StaffActionBase<T> {
    static NUMBER_OF_HIRING: string = 'NUMBER_OF_HIRING';
    static HIRING_UNIT_COST: string = 'HIRING_UNIT_COST';
    static WORKING_UNIT_COST: string = 'WORKING_UNIT_COST';

    /**
     * 特定termにおける新規雇用を actionParam に設定する
     *
     * @param {BizActionParams} actionParam
     * @param {Date} term
     * @param {BizFunction} numberOfHiring
     * @param {BizFunction} hiringUnitCost
     * @param {BizFunction} workingUnitCost
     * @return {BizActionParams}
     */
    public static setStaffAt(
        actionParam: BizActionParams,
        term: Date,
        numberOfHiring: BizFunction,
        hiringUnitCost: BizFunction,
        workingUnitCost?: BizFunction
    ): BizActionParams {
        actionParam.set(term, HireStaffAction.NUMBER_OF_HIRING, numberOfHiring);
        actionParam.set(term, HireStaffAction.HIRING_UNIT_COST, hiringUnitCost);
        if (workingUnitCost) {
            actionParam.set(
                term,
                HireStaffAction.WORKING_UNIT_COST,
                workingUnitCost
            );
        }
        return actionParam;
    }

    /**
     * 対象term における雇用された人数
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    numberOfHiringAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, HireStaffAction.NUMBER_OF_HIRING);
    }

    /**
     * 対象term における雇用のための単価
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    hiringUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, HireStaffAction.HIRING_UNIT_COST);
    }

    /**
     * 対象term における雇用者のterm就労単価
     * @param {Date} term
     * @return {BizFunction | undefined}
     */
    workingUnitCostAt(term: Date): BizFunction | undefined {
        return this.actionParam.get(term, HireStaffAction.WORKING_UNIT_COST);
    }

    // Overwrite

    protected override _initAction(): void {
        super._initAction();
        // super で定義するので、必ず存在する
        this.relation!.name = this.name ?? 'Hire Staff';
    }

    /**
     *
     */
    protected override _prepareEachTermProcess(): void {
        const term = this.timetable.currentDate;
        const staff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );
        const numberOfHiring = this.numberOfHiringAt(term);
        const hiringUnitCost = this.hiringUnitCostAt(term);
        const workingUnitCost = this.workingUnitCostAt(term);
        if (this.bizComponent && staff && numberOfHiring && hiringUnitCost) {
            // FIXME：　毎term毎に function を設定しなおしているので無駄が多い。
            this.processor1st.clearProcessor();
            // function
            this.processor1st.addBizFunction(numberOfHiring);
            this.processor1st.addBizFunction(hiringUnitCost);
            // relation & output
            this.relation!.externalData = createRelationExtData();
            const output1 = new BizProcOutput({
                parentId: this.bizComponent.company.id,
                outputBizId: staff.addByHired.amount.id,
                outputFuncId: numberOfHiring.funcId,
                relations: [
                    {
                        relationId: this.relation!.relationId,
                        direction: RelatedDirection.FROM,
                    },
                ],
            });
            this.processor1st.addProcOutput(output1);
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.addByHired.value.id,
                    outputFuncId: hiringUnitCost.funcId,
                    relations: [
                        {
                            relationId: this.relation!.relationId,
                            direction: RelatedDirection.TO,
                            externalData: createRelationOnOutputExtData({
                                ex_name: this.staffName,
                                ex_view_avatar_icon_icon: IconType.Person,
                                ex_view_avatar_icon_bgColor: 'transparent',
                                ex_view_avatar_conf_hasShadow: 0,
                            }),
                        },
                    ],
                })
            );
            this.processor1st.addProcOutput(
                new BizProcOutput({
                    parentId: this.bizComponent.company.id,
                    outputBizId: staff.working.amount.id,
                    outputFuncId: numberOfHiring.funcId,
                    outputMode: BizProcOutputMode.ADD,
                })
            );
            // 就労単価が追加された場合
            if (workingUnitCost) {
                this.processor1st.addBizFunction(workingUnitCost);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        parentId: this.bizComponent.company.id,
                        outputBizId: staff.working.value.id,
                        outputFuncId: workingUnitCost.funcId,
                    })
                );
            }
        }
    }
}
