import { BizActionTimeline } from 'bizmo/action/BizActionTimeline';
import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import i18n from 'i18n/configs';
import { HRActions } from './HRActions';
import { HireStaffAction } from './HireStaffAction';
import { StaffRole } from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import Decimal from 'decimal.js';

describe('HireStaffAction', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bizComponent: BizComponent;
    let actionTL: BizActionTimeline;
    let hrTemplate1: HRActions;
    let action1: HireStaffAction;
    let action2: HireStaffAction;

    beforeEach(() => {
        i18n.changeLanguage('test');

        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        timetable.currentIndex = 1;
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        bizComponent = new BizComponent({ timetable, db, hyperMG });
        actionTL = new BizActionTimeline({ timetable, db, hyperMG });

        hrTemplate1 = new HRActions({
            timetable,
            db,
            hyperMG,
            bizComponent,
            priorityGenerator: actionTL.priorityGenerator,
        });

        // created action
        // HR action の特性として Action 生成時に bizComponent に登録される
        action1 = hrTemplate1.createHireStaff({
            staffRole: StaffRole.EMPLOYEES,
            staffName: 'エンジニア_1',
            numberOfHiring: BizFunction.makeInputDecimal(new Decimal(5)),
            hiringUnitCost: BizFunction.makeInputDecimal(
                new Decimal(500_000 * 6)
            ),
            workingUnitCost: BizFunction.makeInputDecimal(new Decimal(500_000)),
        });
        action2 = hrTemplate1.createHireStaff({
            staffRole: StaffRole.EMPLOYERS,
            staffName: 'CTO',
            numberOfHiring: BizFunction.makeInputDecimal(new Decimal(1)),
            hiringUnitCost: BizFunction.makeInputDecimal(
                new Decimal(800_000 * 6)
            ),
            workingUnitCost: BizFunction.makeInputDecimal(new Decimal(800_000)),
        });
    });

    test('setup setting', () => {
        expect(action1.name).toBe('HireStaffAction');

        expect(action1.actionId).not.toBeUndefined();
        expect(action1.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal(100),
            new Decimal('NaN'),
        ]);
        expect(action2.name).toBe('HireStaffAction');
        expect(action2.actionId).not.toBeUndefined();
        expect(action2.priorities).toEqual([
            new Decimal('NaN'),
            new Decimal(200),
            new Decimal('NaN'),
        ]);
        expect(bizComponent.company.staffs.exportAsTable()).toEqual([
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);

        i18n.changeLanguage('test');
        expect(bizComponent.company.accounting.exportAsTable()).toEqual([
            [
                'ACCOUNTING:資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:現金及び預金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:現金及び預金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:売掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:売掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:商品及び製品',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:原料及び材料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産:仕掛品及び半成工事',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産:たな卸資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:流動資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産:建物及び附属設備',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:有形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産:ソフトウエア仮勘定',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産:無形固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:固定資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:投資その他の資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産:投資その他の資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:買掛金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:買掛金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:未払金及び未払費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債:未払金及び未払費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:流動負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:社債:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:社債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:長期借入金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債:長期借入金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債:固定負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:負債',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:資本剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:利益剰余金:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本:利益剰余金',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産:株主資本',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:純資産',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:売上高:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:売上高',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:営業外収益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:営業外収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:特別利益:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益:特別利益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:収益',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:売上原価:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:販売手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:広告宣伝費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:役員報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:給料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:租税公課',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:減価償却費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:研究開発費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:法定福利費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払報酬',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:支払手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:業務委託費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:地代家賃',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:代理店手数料',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費:運送費及び保管費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価:販売費及び一般管理費',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業活動による費用・売上原価',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業外費用:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:営業外費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:特別損失:GENERAL',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用:特別損失',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'ACCOUNTING:費用',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });

    test('createInitStaff', () => {
        timetable.currentIndex = 0;
        const action3 = hrTemplate1.createInitStaff({
            staffRole: StaffRole.EMPLOYEES,
            staffName: 'エンジニア_1',
            numberOfWorking: BizFunction.makeInputDecimal(new Decimal(10)),
            workingUnitCost: BizFunction.makeInputDecimal(new Decimal(500_000)),
        });
        expect(action3.priorities).toEqual([
            new Decimal(300),
            new Decimal('NaN'),
            new Decimal('NaN'),
        ]);
        actionTL.setAction(action3);

        // bizcomp 更新：
        action3.process([new Decimal(timetable.currentIndex)]);
        bizComponent.prepareAndUpdateFullCollectionsForAllTerms();
        // actionTL.process(); // FIXME 本来はこれで動くはずだが、Collection の自動計算が上手く動作していない

        expect(bizComponent.company.staffs.exportAsTable()).toEqual([
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                new Decimal('10'),
                new Decimal('10'),
                new Decimal('10'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                new Decimal('500000'),
                new Decimal('500000'),
                new Decimal('500000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                new Decimal('5000000'),
                new Decimal('5000000'),
                new Decimal('5000000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                new Decimal('5000000'),
                new Decimal('5000000'),
                new Decimal('5000000'),
            ],
        ]);
    });

    test('createHireStaff', () => {
        // BizAction 実施
        actionTL.setAction(action1);
        actionTL.setAction(action2);

        // actionTL.process(); // FIXME 本来はこれで動くはずだが、Collection の自動計算が上手く動作していない
        action1.process([new Decimal(timetable.currentIndex)]);
        action2.process([new Decimal(timetable.currentIndex)]);
        bizComponent.prepareAndUpdateFullCollectionsForAllTerms();

        expect(bizComponent.company.staffs.exportAsTable()).toEqual([
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('4800000'),
                new Decimal('4800000'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('4800000'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('800000'),
                new Decimal('800000'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('800000'),
                new Decimal('800000'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('5600000'),
                new Decimal('800000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('5'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('3000000'),
                new Decimal('3000000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('15000000'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('5'),
                new Decimal('5'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('500000'),
                new Decimal('500000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('2500000'),
                new Decimal('2500000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('17500000'),
                new Decimal('2500000'),
            ],
        ]);
    });

    describe('createRetireStaff', () => {
        test('retire staff existed', () => {
            const action3 = hrTemplate1.createRetireStaff({
                staffRole: StaffRole.EMPLOYEES,
                staffName: 'エンジニア_1',
                numberOfRetired: BizFunction.makeInputDecimal(new Decimal(10)),
                retiredUnitCost: BizFunction.makeInputDecimal(
                    new Decimal(500_000 * 12)
                ),
            });

            // bizcomp 更新 (term_index = 1)
            actionTL.setAction(action3);
            // actionTL.process(); // FIXME 本来はこれで動くはずだが、Collection の自動計算が上手く動作していない
            action3.process([new Decimal(timetable.currentIndex)]);
            bizComponent.prepareAndUpdateFullCollectionsForAllTerms();

            expect(bizComponent.company.staffs.exportAsTable()).toEqual([
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('10'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('6000000'),
                    new Decimal('6000000'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('60000000'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('-10'),
                    new Decimal('-10'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('60000000'),
                    new Decimal('0'),
                ],
            ]);
        });

        test('retire staff not existed', () => {
            const action3 = hrTemplate1.createRetireStaff({
                staffRole: StaffRole.EMPLOYEES,
                staffName: 'エンジニア_2',
                numberOfRetired: BizFunction.makeInputDecimal(new Decimal(10)),
                retiredUnitCost: BizFunction.makeInputDecimal(
                    new Decimal(500_000 * 12)
                ),
                actionName: '退社',
            });
            expect(action3.name).toBe('退社');

            // bizcomp 更新 (term_index = 1)
            actionTL.setAction(action3);
            // actionTL.process(); // FIXME 本来はこれで動くはずだが、Collection の自動計算が上手く動作していない
            action3.process([new Decimal(timetable.currentIndex)]);
            bizComponent.prepareAndUpdateFullCollectionsForAllTerms();

            expect(bizComponent.company.staffs.exportAsTable()).toEqual([
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('10'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('6000000'),
                    new Decimal('6000000'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('60000000'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('-10'),
                    new Decimal('-10'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_2:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('60000000'),
                    new Decimal('0'),
                ],
            ]);
        });
    });

    describe('createMoveStaff', () => {
        test('with one existed and one not existed', () => {
            const action3 = hrTemplate1.createMoveStaff({
                fromStaffRole: StaffRole.EMPLOYEES,
                fromStaffName: 'エンジニア_1',
                toStaffRole: StaffRole.EMPLOYERS,
                toStaffName: 'CEO',
                numberOfMoved: BizFunction.makeInputDecimal(new Decimal(1)),
                toStaffMovedUnitCost: BizFunction.makeInputDecimal(
                    new Decimal(1_000_000)
                ),
                toStaffWorkingUnitCost: BizFunction.makeInputDecimal(
                    new Decimal(1_000_000)
                ),
                actionName: '異動',
            });
            expect(action3.name).toBe('異動');

            // bizcomp 更新 (term_index = 1)
            action3.process([new Decimal(timetable.currentIndex)]);
            bizComponent.prepareAndUpdateFullCollectionsForAllTerms();

            expect(bizComponent.company.staffs.exportAsTable()).toEqual([
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('1000000'),
                    new Decimal('1000000'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('1000000'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('1'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('1000000'),
                    new Decimal('1000000'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('1000000'),
                    new Decimal('1000000'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYERS:CEO:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('2000000'),
                    new Decimal('1000000'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                    new Decimal('0'),
                    new Decimal('1'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                    new Decimal('0'),
                    new Decimal('-1'),
                    new Decimal('-1'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
                [
                    'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                ],
            ]);
        });
    });

    test('createRewordPayment', () => {
        timetable.setIndexToStart();

        const action11 = hrTemplate1.createInitStaff({
            staffRole: StaffRole.EMPLOYERS,
            staffName: 'CTO',
            numberOfWorking: BizFunction.makeInputDecimal(new Decimal(10)),
            workingUnitCost: BizFunction.makeInputDecimal(new Decimal(500)),
        });
        const action12 = hrTemplate1.createInitStaff({
            staffRole: StaffRole.EMPLOYEES,
            staffName: 'エンジニア_1',
            numberOfWorking: BizFunction.makeInputDecimal(new Decimal(100)),
            workingUnitCost: BizFunction.makeInputDecimal(new Decimal(300)),
        });
        const action13 = hrTemplate1.createRewordPayment({
            staffRole: StaffRole.EMPLOYERS,
            staffName: 'CTO',
            paymentTerms: 1,
        });
        const action14 = hrTemplate1.createRewordPayment({
            staffRole: StaffRole.EMPLOYEES,
            staffName: 'エンジニア_1',
            paymentTerms: 0,
        });

        actionTL.setAction(action11);
        actionTL.setAction(action12);
        actionTL.setAction(action13);
        actionTL.setAction(action14);

        // 更新
        actionTL.prepareProcess();
        actionTL.process();

        // Staff
        expect(bizComponent.company.staffs.exportAsTable()).toEqual([
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:AMOUNT',
                new Decimal('10'),
                new Decimal('10'),
                new Decimal('10'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:VALUE',
                new Decimal('500'),
                new Decimal('500'),
                new Decimal('500'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING:TOTAL_VALUE',
                new Decimal('5000'),
                new Decimal('5000'),
                new Decimal('5000'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYERS:CTO:TOTAL_VALUE',
                new Decimal('5000'),
                new Decimal('5000'),
                new Decimal('5000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:AMOUNT',
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:VALUE',
                new Decimal('300'),
                new Decimal('300'),
                new Decimal('300'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING:TOTAL_VALUE',
                new Decimal('30000'),
                new Decimal('30000'),
                new Decimal('30000'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'STAFFS:EMPLOYEES:エンジニア_1:TOTAL_VALUE',
                new Decimal('30000'),
                new Decimal('30000'),
                new Decimal('30000'),
            ],
        ]);

        // Accounting
        expect(
            bizComponent.company.accounting
                .selectAccountCategory(AccountNames.BS_CASH_AND_DEPOSITS)
                .exportAsTable()
        ).toEqual([
            [
                '現金及び預金:GENERAL',
                new Decimal('-30000'),
                new Decimal('-65000'),
                new Decimal('-100000'),
            ],
            [
                '現金及び預金',
                new Decimal('-30000'),
                new Decimal('-65000'),
                new Decimal('-100000'),
            ],
        ]);

        expect(
            bizComponent.company.accounting
                .selectAccountCategory(
                    AccountNames.BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE
                )
                .exportAsTable()
        ).toEqual([
            [
                '未払金及び未払費用:GENERAL',
                new Decimal('5000'),
                new Decimal('5000'),
                new Decimal('5000'),
            ],
            [
                '未払金及び未払費用',
                new Decimal('5000'),
                new Decimal('5000'),
                new Decimal('5000'),
            ],
        ]);

        expect(
            bizComponent.company.accounting
                .selectAccountCategory(AccountNames.PL_SALARIES)
                .exportAsTable()
        ).toEqual([
            [
                '給料:GENERAL',
                new Decimal('30000'),
                new Decimal('60000'),
                new Decimal('90000'),
            ],
            [
                '給料',
                new Decimal('30000'),
                new Decimal('60000'),
                new Decimal('90000'),
            ],
        ]);

        expect(
            bizComponent.company.accounting
                .selectAccountCategory(
                    AccountNames.PL_REMUNERATION_FOR_DIRECTORS
                )
                .exportAsTable()
        ).toEqual([
            [
                '役員報酬:GENERAL',
                new Decimal('5000'),
                new Decimal('10000'),
                new Decimal('15000'),
            ],
            [
                '役員報酬',
                new Decimal('5000'),
                new Decimal('10000'),
                new Decimal('15000'),
            ],
        ]);
    });
});
