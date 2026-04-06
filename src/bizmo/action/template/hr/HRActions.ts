import { BizActionId, BizActionParams } from 'bizmo/action/core/BizActionBase';
import {
    StaffBizActors,
    StaffRole,
} from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { DateMap } from 'bizmo/core/util/DateMap';
import Decimal from 'decimal.js';
import { BizActionTemplateBase } from '../BizActionTemplateBase';
import { CreateInitStaffAction } from './CreateInitStaffAction';
import { HireStaffAction } from './HireStaffAction';
import { MoveStaffAction } from './MoveStaffAction';
import { RetireStaffAction } from './RetireStaffAction';
import { RewordPaymentAction } from './RewordPaymentAction';

/**
 * 人事系 事業活動テンプレート
 *
 * 主機能
 * ・StaffList および StaffBizActors の実操作
 */
export class HRActions<T = any> extends BizActionTemplateBase<T> {
    /**
     * 指定した名称の Staff を取得する。
     * 存在しない場合には biz_component に、自動的に追加される
     *
     * @param {StaffRole} staffRole
     * @param {string} staffName
     * @return {StaffBizActors | undefined}
     */
    __prepare_staff(
        staffRole: StaffRole,
        staffName: string
    ): StaffBizActors | undefined {
        let staff: StaffBizActors | undefined = undefined;
        if (staffRole == StaffRole.EMPLOYEES) {
            staff = this.bizComponent.company.staffs.selectEmployee(staffName);
            if (staff == undefined) {
                staff =
                    this.bizComponent.company.staffs.addSeedEmployee(staffName);
            }
        } else {
            staff = this.bizComponent.company.staffs.selectEmployer(staffName);
            if (staff == undefined) {
                staff =
                    this.bizComponent.company.staffs.addSeedEmployer(staffName);
            }
        }
        return staff;
    }

    /** Public テンプレート */

    /**
     * Staff として働いている人を初期登録する
     * デフォルト対象term： current term のみ
     *
     * @param {Object} options
     * @param {StaffRole} options.staffRole
     * @param {string} options.staffName
     * @param {BizFunction} options.numberOfWorking
     * @param {BizFunction} options.workingUnitCost
     * @param {BizActionId} options.actionID
     * @param {string} options.actionName
     * @return {CreateInitStaffAction}
     */
    createInitStaff({
        staffRole,
        staffName,
        numberOfWorking,
        workingUnitCost,
        actionID,
        actionName,
    }: {
        staffRole: StaffRole;
        staffName: string;
        numberOfWorking: BizFunction;
        workingUnitCost: BizFunction;
        actionID?: BizActionId;
        actionName?: string;
    }): CreateInitStaffAction {
        let actionParam = CreateInitStaffAction.setStaffRole(
            new BizActionParams(this.timetable),
            staffRole,
            staffName
        );
        actionParam = CreateInitStaffAction.setStaffAt(
            actionParam,
            this.timetable.currentDate,
            numberOfWorking,
            workingUnitCost
        );
        const action = new CreateInitStaffAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionID,
            name: actionName,
            actionParam: actionParam,
        });
        action.setPriorities(this._makePriorityDictOnlyForThisTerm());
        return action;
    }

    /**
     * Staff として雇用する
     * 対象term： current term のみ
     *
     * @param {Object} options
     * @param {StaffRole} options.staffRole
     * @param {string} options.staffName
     * @param {BizFunction} options.numberOfHiring
     * @param {BizFunction} options.hiringUnitCost
     * @param {BizFunction} [options.workingUnitCost]
     * @param {BizActionId} [options.actionID]
     * @param {string} [options.actionName]
     * @return {HireStaffAction}
     */
    createHireStaff({
        staffRole,
        staffName,
        numberOfHiring,
        hiringUnitCost,
        workingUnitCost,
        actionID,
        actionName,
    }: {
        staffRole: StaffRole;
        staffName: string;
        numberOfHiring: BizFunction;
        hiringUnitCost: BizFunction;
        workingUnitCost?: BizFunction;
        actionID?: BizActionId;
        actionName?: string;
    }): HireStaffAction {
        let actionParam = HireStaffAction.setStaffRole(
            new BizActionParams(this.timetable),
            staffRole,
            staffName
        );
        actionParam = HireStaffAction.setStaffAt(
            actionParam,
            this.timetable.currentDate,
            numberOfHiring,
            hiringUnitCost,
            workingUnitCost
        );
        const action = new HireStaffAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionID,
            name: actionName,
            actionParam: actionParam,
        });
        action.setPriorities(this._makePriorityDictOnlyForThisTerm());
        return action;
    }

    /**
     * Staff の一部が退職する
     * 対象term： current term のみ
     *
     * @param {Object} options
     * @param {StaffRole} options.staffRole
     * @param {string} options.staffName
     * @param {BizFunction} options.numberOfRetired
     * @param {BizFunction} options.retiredUnitCost
     * @param {BizActionId} [options.actionId]
     * @param {string} [options.actionName]
     * @return {RetireStaffAction}
     */
    createRetireStaff({
        staffRole,
        staffName,
        numberOfRetired,
        retiredUnitCost,
        actionId,
        actionName,
    }: {
        staffRole: StaffRole;
        staffName: string;
        numberOfRetired: BizFunction;
        retiredUnitCost: BizFunction;
        actionId?: BizActionId;
        actionName?: string;
    }): RetireStaffAction {
        let actionParam = RetireStaffAction.setStaffRole(
            new BizActionParams(this.timetable),
            staffRole,
            staffName
        );
        actionParam = RetireStaffAction.setStaffAt({
            actionParam: actionParam,
            term: this.timetable.currentDate,
            numberOfRetired: numberOfRetired,
            retiredUnitCost: retiredUnitCost,
        });
        const action = new RetireStaffAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionId,
            name: actionName,
            actionParam: actionParam,
        });
        action.setPriorities(this._makePriorityDictOnlyForThisTerm());
        return action;
    }

    /**
     * Staff の一部が異動する
     * 対象term： current term のみ
     * @param {Object} params
     * @param {StaffRole} params.fromStaffRole
     * @param {string} params.fromStaffName
     * @param {StaffRole} params.toStaffRole
     * @param {string} params.toStaffName
     * @param {BizFunction} params.numberOfMoved
     * @param {BizFunction} params.toStaffMovedUnitCost
     * @param {BizFunction} [params.toStaffWorkingUnitCost]
     * @param {BizActionId} [params.actionId]
     * @param {string} [params.actionName]
     * @return {MoveStaffAction}
     */
    createMoveStaff({
        fromStaffRole,
        fromStaffName,
        toStaffRole,
        toStaffName,
        numberOfMoved,
        toStaffMovedUnitCost,
        toStaffWorkingUnitCost,
        actionId,
        actionName,
    }: {
        fromStaffRole: StaffRole;
        fromStaffName: string;
        toStaffRole: StaffRole;
        toStaffName: string;
        numberOfMoved: BizFunction;
        toStaffMovedUnitCost: BizFunction;
        toStaffWorkingUnitCost?: BizFunction;
        actionId?: BizActionId;
        actionName?: string;
    }): MoveStaffAction {
        let actionParam = MoveStaffAction.setStaffRole(
            new BizActionParams(this.timetable),
            fromStaffRole,
            fromStaffName
        );
        actionParam = MoveStaffAction.setToStaffRole({
            actionParam: actionParam,
            toStaffRole: toStaffRole,
            toStaffName: toStaffName,
        });
        actionParam = MoveStaffAction.setMoveStaffAt({
            actionParam: actionParam,
            term: this.timetable.currentDate,
            numberOfMoved: numberOfMoved,
            toStaffMovedUnitCost: toStaffMovedUnitCost,
            toStaffWorkingUnitCost: toStaffWorkingUnitCost,
        });

        const action = new MoveStaffAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionId,
            name: actionName,
            actionParam: actionParam,
        });
        action.setPriorities(this._makePriorityDictOnlyForThisTerm());
        return action;
    }

    /**
     * 指定Staff の報酬を支払う
     * 対象term： current term 以降
     *
     * @param {object} params
     * @param {StaffRole} params.staffRole
     * @param {string} params.staffName
     * @param {number} [params.paymentTerms] 当term分の対価の支払が、当termからどれだけ先になるか。 デフォルト：０＝当term
     * @param {BizActionId} [params.actionId]
     * @param {string} [params.actionName]
     * @return {RewordPaymentAction}
     */
    createRewordPayment({
        staffRole,
        staffName,
        paymentTerms = 0,
        actionId,
        actionName,
    }: {
        staffRole: StaffRole;
        staffName: string;
        paymentTerms?: number;
        actionId?: BizActionId;
        actionName?: string;
    }): RewordPaymentAction {
        let actionParam = new BizActionParams(this.timetable);
        actionParam = RewordPaymentAction.setStaffRole(
            actionParam,
            staffRole,
            staffName
        );
        actionParam = RewordPaymentAction.setPaymentTerm(
            actionParam,
            paymentTerms
        );
        const action = new RewordPaymentAction({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            actionId: actionId,
            name: actionName,
            actionParam: actionParam,
        });
        action.setPriorities(
            new DateMap<Decimal>([
                [this.timetable.currentDate, this.priorityGenerator.generate()],
            ])
        );
        return action;
    }
}
