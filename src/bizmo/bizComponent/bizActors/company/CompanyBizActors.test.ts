import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { CompanyBizActors } from './CompanyBizActors';

describe('CompanyBizActors のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let company1: CompanyBizActors;
    let company2: CompanyBizActors;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        company1 = new CompanyBizActors({ timetable, db, hyperMG });
        company2 = new CompanyBizActors({
            timetable,
            db,
            hyperMG,
            name: 'COMPANY_BIZ_ACTOR_NAME',
            bizIOId: 'COMPANY_BIZ_ACTOR_ID',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(company1.timetable).toBe(timetable);
            expect(company1.db).toBe(db);
            expect(company1.id).not.toBeUndefined();
            expect(company1.name).toBe('CompanyBizActors');
            expect(company1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 3, 1), new Decimal('NaN')),
            ]);
        });

        test('with param', () => {
            expect(company2.timetable).toBe(timetable);
            expect(company2.db).toBe(db);
            expect(company2.id).toBe('COMPANY_BIZ_ACTOR_ID');
            expect(company2.name).toBe('COMPANY_BIZ_ACTOR_NAME');
            expect(company2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 3, 1), new Decimal('NaN')),
            ]);
        });
    });
});
