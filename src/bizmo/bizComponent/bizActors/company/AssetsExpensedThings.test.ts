import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { AssetsExpensedThings } from './AssetsExpensedThings';

describe('AssetsExpensedThings のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let bound1: AssetsExpensedThings;
    let bound2: AssetsExpensedThings;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        bound1 = new AssetsExpensedThings({ timetable, db, hyperMG });
        bound2 = new AssetsExpensedThings({
            timetable,
            db,
            hyperMG,
            name: 'UNIT_NAME',
            bizIOId: 'UNIT_ID',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(bound1.timetable).toBe(timetable);
            expect(bound1.db).toBe(db);
            expect(bound1.id).not.toBeUndefined();
            expect(bound1.name).toBe('AssetsExpensedThings');
            expect(bound1.children.length).toBe(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                bound1.initialized.amount,
                bound1.initialized.value,
                bound1.initialized.adjuster,
                bound1.initialized.totalValue,
                bound1.running.amount,
                bound1.running.value,
                bound1.running.adjuster,
                bound1.running.totalValue,
                bound1.finalized.amount,
                bound1.finalized.value,
                bound1.finalized.adjuster,
                bound1.finalized.totalValue,
                bound1.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });

        test('with param', () => {
            expect(bound2.timetable).toBe(timetable);
            expect(bound2.db).toBe(db);
            expect(bound2.id).toBe('UNIT_ID');
            expect(bound2.name).toBe('UNIT_NAME');
            expect(bound2.children.length).toBe(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                bound2.initialized.amount,
                bound2.initialized.value,
                bound2.initialized.adjuster,
                bound2.initialized.totalValue,
                bound2.running.amount,
                bound2.running.value,
                bound2.running.adjuster,
                bound2.running.totalValue,
                bound2.finalized.amount,
                bound2.finalized.value,
                bound2.finalized.adjuster,
                bound2.finalized.totalValue,
                bound2.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });
    });

    test('manual update', () => {
        // 更新: running
        bound2.running.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
        ]);
        expect(bound2.running.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        bound2.running.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
        ]);
        expect(bound2.running.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
            new BizValue(new Date(2020, 3, 1), new Decimal(200)),
        ]);
        bound2.running.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(bound2.running.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // 更新: initialized
        bound2.initialized.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(11)),
            new BizValue(new Date(2020, 2, 1), new Decimal(21)),
        ]);
        expect(bound2.initialized.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(11)),
            new BizValue(new Date(2020, 2, 1), new Decimal(21)),
            new BizValue(new Date(2020, 3, 1), new Decimal(21)),
        ]);
        bound2.initialized.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(110)),
            new BizValue(new Date(2020, 2, 1), new Decimal(210)),
        ]);
        expect(bound2.initialized.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(110)),
            new BizValue(new Date(2020, 2, 1), new Decimal(210)),
            new BizValue(new Date(2020, 3, 1), new Decimal(210)),
        ]);
        bound2.initialized.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(bound2.initialized.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // 更新: finalized
        bound2.finalized.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(12)),
            new BizValue(new Date(2020, 2, 1), new Decimal(22)),
        ]);
        expect(bound2.finalized.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(12)),
            new BizValue(new Date(2020, 2, 1), new Decimal(22)),
            new BizValue(new Date(2020, 3, 1), new Decimal(22)),
        ]);
        bound2.finalized.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(120)),
            new BizValue(new Date(2020, 2, 1), new Decimal(220)),
        ]);
        expect(bound2.finalized.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(120)),
            new BizValue(new Date(2020, 2, 1), new Decimal(220)),
            new BizValue(new Date(2020, 3, 1), new Decimal(220)),
        ]);
        bound2.finalized.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(bound2.finalized.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // check auto update
        bound2.prepareAndUpdateFullCollectionsForAllTerms();

        expect(bound2.running.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1001)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4002)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4002)),
        ]);
        expect(bound2.initialized.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1211)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4412)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4412)),
        ]);
        expect(bound2.finalized.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1441)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4842)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4842)),
        ]);

        /*
        expect(bound2.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(3653)),
            new BizValue(new Date(2020, 2, 1), new Decimal(13256)),
            new BizValue(new Date(2020, 3, 1), new Decimal(13256)),
        ]);

        expect(bound2.exportAsTable()).toEqual([
            [
                'UNIT_NAME:INITIALIZED:AMOUNT',
                new Decimal('11'),
                new Decimal('21'),
                new Decimal('21'),
            ],
            [
                'UNIT_NAME:INITIALIZED:VALUE',
                new Decimal('110'),
                new Decimal('210'),
                new Decimal('210'),
            ],
            [
                'UNIT_NAME:INITIALIZED:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'UNIT_NAME:INITIALIZED:TOTAL_VALUE',
                new Decimal('1211'),
                new Decimal('4412'),
                new Decimal('4412'),
            ],
            [
                'UNIT_NAME:RUNNING:AMOUNT',
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('20'),
            ],
            [
                'UNIT_NAME:RUNNING:VALUE',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('200'),
            ],
            [
                'UNIT_NAME:RUNNING:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'UNIT_NAME:RUNNING:TOTAL_VALUE',
                new Decimal('1001'),
                new Decimal('4002'),
                new Decimal('4002'),
            ],
            [
                'UNIT_NAME:FINALIZED:AMOUNT',
                new Decimal('12'),
                new Decimal('22'),
                new Decimal('22'),
            ],
            [
                'UNIT_NAME:FINALIZED:VALUE',
                new Decimal('120'),
                new Decimal('220'),
                new Decimal('220'),
            ],
            [
                'UNIT_NAME:FINALIZED:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'UNIT_NAME:FINALIZED:TOTAL_VALUE',
                new Decimal('1441'),
                new Decimal('4842'),
                new Decimal('4842'),
            ],
            [
                'UNIT_NAME:TOTAL_VALUE',
                new Decimal('3653'),
                new Decimal('13256'),
                new Decimal('13256'),
            ],
        ]);
        */
    });
});
