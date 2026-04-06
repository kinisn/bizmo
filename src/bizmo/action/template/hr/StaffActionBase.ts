import { BizActionType } from 'bizmo/action/BizActionType';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizActionParams } from 'bizmo/action/core/BizActionBase';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import {
    StaffBizActors,
    StaffRole,
} from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { S } from 'vitest/dist/reporters-yx5ZTtEV';

/**
 * [抽象クラス]
 * Staff設定に関するBizAction
 */
export class StaffActionBase<T = any> extends BizAction<T, RelationExtData> {
    protected static STAFF_ROLE: string = 'STAFF_ROLE';
    protected static STAFF_NAME: string = 'STAFF_NAME';

    /**
     * スタッフの役割と名称を更新する
     * @param {BizActionParams} actionParam 更新対象となるBizActionParams
     * @param {StaffRole} role
     * @param {string} name
     * @return {BizActionParams}
     */
    public static setStaffRole(
        actionParam: BizActionParams,
        role: StaffRole,
        name: string
    ): BizActionParams {
        actionParam.setForAllTerm(StaffActionBase.STAFF_ROLE, role);
        actionParam.setForAllTerm(StaffActionBase.STAFF_NAME, name);
        return actionParam;
    }

    /**
     * スタッフの役割
     */
    get staffRole(): StaffRole | undefined {
        return this.actionParam.getForAllTerm<StaffRole | undefined>(
            StaffActionBase.STAFF_ROLE
        );
    }

    /**
     * スタッフの名称
     */
    get staffName(): string | undefined {
        return this.actionParam.getForAllTerm<string | undefined>(
            StaffActionBase.STAFF_NAME
        );
    }

    /**
     *
     * @param {StaffRole} staffRole
     * @param {string} staffName
     * @return {StaffBizActors | undefined}
     */
    protected _selectStaffByStaffName(
        staffRole?: StaffRole,
        staffName?: string
    ): StaffBizActors | undefined {
        let staff: StaffBizActors | undefined;
        // 指定したStaff名が設定されていない場合には追加する
        if (staffRole && staffName) {
            if (staffRole == StaffRole.EMPLOYEES) {
                staff =
                    this.bizComponent?.company.staffs.selectEmployee(staffName);
            } else {
                staff =
                    this.bizComponent?.company.staffs.selectEmployer(staffName);
            }
            // 自動で追加
            if (staff == undefined && staffName) {
                if (staffRole == StaffRole.EMPLOYEES) {
                    staff =
                        this.bizComponent?.company.staffs.addSeedEmployee(
                            staffName
                        );
                } else {
                    staff =
                        this.bizComponent?.company.staffs.addSeedEmployer(
                            staffName
                        );
                }
            }
        }
        return staff;
    }

    // overwrite

    /**
     *
     */
    protected override _initAction(): void {
        this.actionType =
            this.staffRole == StaffRole.EMPLOYEES
                ? BizActionType.EMPLOYEE_EXISTED
                : BizActionType.EMPLOYER_EXISTED;
        const staff = this._selectStaffByStaffName(
            this.staffRole,
            this.staffName
        );

        // relation が設定されていない場合には追加する
        if (
            this.bizComponent?.company.id &&
            staff?.id &&
            // load済みのrelation が存在しない
            Array.from(this._relations.values()).every(
                (relation) =>
                    relation.fromBizIOId != this.bizComponent?.company.id &&
                    relation.toBizIOId != staff?.id
            )
        ) {
            this.setRelation(
                new BizRelation({
                    fromBizIOId: this.bizComponent?.company.id,
                    toBizIOId: staff?.id,
                })
            );
        }
    }

    // Utility

    get relation(): BizRelation<S> | undefined {
        return this._relations.values().next().value;
    }
}
