import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { StaffBizActors, StaffList } from './StaffBizActors';

describe('Product のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let staff1: StaffBizActors;
    let staff2: StaffBizActors;
    let staffList1: StaffList;
    let staffList2: StaffList;

    beforeEach(() => {
        i18n.changeLanguage('test');

        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 5,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        staff1 = new StaffBizActors({
            timetable,
            db,
            hyperMG,
            bizIOId: 'STAFF_ID',
            name: 'STAFF_NAME',
        });
        staff2 = new StaffBizActors({
            timetable,
            db,
            hyperMG,
            bizIOId: 'STAFF_ID_2',
            name: 'STAFF_NAME_2',
        });

        staffList1 = new StaffList({ timetable, db, hyperMG });
        staffList2 = new StaffList({ timetable, db, hyperMG });

        staffList2.employers.setName('EMPLOYERS');
        staffList2.employees.setName('EMPLOYEES');

        staffList2.employers.appendChild(staff1);
        staffList2.employees.appendChild(staff2);
    });

    test('init with param', () => {
        // StaffBizActors
        expect(staff1.timetable).toBe(timetable);
        expect(staff1.db).toBe(db);
        expect(staff1.name).toBe('STAFF_NAME');
        expect(staff1.id).toBe('STAFF_ID');
        expect(staff1.children.length).toBe(8);

        // StaffBizActors
        expect(staffList1.children.length).toBe(2);
        expect(staffList1.employers.name).toBe('EMPLOYERS');
        expect(staffList1.employers.children.length).toBe(0);
        expect(staffList1.employees.name).toBe('EMPLOYEES');
        expect(staffList1.employees.children.length).toBe(0);
    });

    test('add_seed_employer and select_employer', () => {
        expect(staffList2.children.length).toBe(2);
        expect(staffList2.employers.name).toBe('EMPLOYERS');
        expect(staffList2.employers.children.length).toBe(1);
        expect(staffList2.employees.name).toBe('EMPLOYEES');
        expect(staffList2.employees.children.length).toBe(1);

        // 名前取得
        expect(staffList2.selectEmployer('NOT_EXISTED')).toBeUndefined();
        expect(staffList2.selectEmployer('STAFF_NAME')).toBe(staff1);

        // 新規追加
        const staff = staffList2.addSeedEmployer('NAME_1');
        expect(staff?.name).toBe('NAME_1');
        expect(staff?.id).not.toBeUndefined();
        expect(staffList2.children.length).toBe(2);

        // 名前取得 #2
        expect(staffList2.selectEmployer('NAME_1')).toBe(staff);
        expect(staffList2.exportAsTable()).toEqual([
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:STAFF_NAME:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYERS:NAME_1:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_HIRED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_RETIRE:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:WORKING:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:WORKING:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:WORKING:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:WORKING_TIMES',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'StaffList:EMPLOYEES:STAFF_NAME_2:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);
    });

    test('add_seed_employee and select_employee', () => {
        expect(staffList2.children.length).toBe(2);
        expect(staffList2.employers.name).toBe('EMPLOYERS');
        expect(staffList2.employers.children.length).toBe(1);
        expect(staffList2.employees.name).toBe('EMPLOYEES');
        expect(staffList2.employees.children.length).toBe(1);

        // 名前取得
        expect(staffList2.selectEmployee('NOT_EXISTED')).toBeUndefined();
        expect(staffList2.selectEmployee('STAFF_NAME_2')).toBe(staff2);

        // 新規追加
        const staff = staffList2.addSeedEmployee('NAME_1');
        expect(staff?.name).toBe('NAME_1');
        expect(staff?.id).not.toBeUndefined();
        expect(staffList2.children.length).toBe(2);

        // 名前取得 #2
        expect(staffList2.selectEmployee('NAME_1')).toBe(staff);
    });

    test('add_seed_employee and select_employee ', () => {
        const staff = staffList2.addSeedEmployer('CXO');

        // 雇用
        staff?.addByHired.value.setValue(
            new Date(2020, 1, 1),
            new Decimal(100)
        );
        staff?.addByHired.amount.setValue(new Date(2020, 2, 1), new Decimal(1));
        staff?.addByHired.amount.setValue(new Date(2020, 3, 1), new Decimal(5));

        // 異動：加入
        staff?.addByMoved.amount.setValue(new Date(2020, 3, 1), new Decimal(5));

        // 異動：脱退
        staff?.subByMoved.amount.setValue(new Date(2020, 3, 1), new Decimal(5));

        // 退社
        staff?.subByRetire.value.setValue(
            new Date(2020, 1, 1),
            new Decimal(200)
        );
        staff?.subByRetire.amount.setValue(
            new Date(2020, 3, 1),
            new Decimal(2)
        );

        // 勤続
        staff?.working.value.setValue(new Date(2020, 1, 1), new Decimal(50));
        staff?.working.amount.setValue(new Date(2020, 1, 1), new Decimal(100));
        staff?.working.amount.setValue(new Date(2020, 2, 1), new Decimal(101));
        staff?.working.amount.setValue(new Date(2020, 3, 1), new Decimal(104));

        // 勤務時間
        staff?.workingTimes.setValue(new Date(2020, 1, 1), new Decimal(16000));
        staff?.workingTimes.setValue(new Date(2020, 2, 1), new Decimal(16160));
        staff?.workingTimes.setValue(new Date(2020, 3, 1), new Decimal(16640));

        staff?.prepareAndUpdateFullCollectionsForAllTerms();

        expect(staff?.exportAsTable()).toEqual([
            [
                'CXO:ADD_BY_HIRED:AMOUNT',
                new Decimal('0'),
                new Decimal('1'),
                new Decimal('5'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_HIRED:VALUE',
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
            ],
            [
                'CXO:ADD_BY_HIRED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_HIRED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('100'),
                new Decimal('500'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('5'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:ADD_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_MOVED:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('5'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_MOVED:VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_MOVED:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_MOVED:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_RETIRE:AMOUNT',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('2'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_RETIRE:VALUE',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
            ],
            [
                'CXO:SUB_BY_RETIRE:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:SUB_BY_RETIRE:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('400'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:WORKING:AMOUNT',
                new Decimal('100'),
                new Decimal('101'),
                new Decimal('104'),
                new Decimal('104'),
                new Decimal('104'),
            ],
            [
                'CXO:WORKING:VALUE',
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
                new Decimal('50'),
            ],
            [
                'CXO:WORKING:ADJUSTER',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
            [
                'CXO:WORKING:TOTAL_VALUE',
                new Decimal('5000'),
                new Decimal('5050'),
                new Decimal('5200'),
                new Decimal('5200'),
                new Decimal('5200'),
            ],
            [
                'CXO:WORKING_TIMES',
                new Decimal('16000'),
                new Decimal('16160'),
                new Decimal('16640'),
                new Decimal('16640'),
                new Decimal('16640'),
            ],
            [
                'CXO:TOTAL_VALUE',
                new Decimal('5000'),
                new Decimal('5150'),
                new Decimal('6100'),
                new Decimal('5200'),
                new Decimal('5200'),
            ],
        ]);
    });
});
