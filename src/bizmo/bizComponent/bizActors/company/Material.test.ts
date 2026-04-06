import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { Material } from './Material';

describe('Material & MaterialList のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let material1: Material;
    let material2: Material;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        material1 = new Material({ timetable, db, hyperMG });
        material2 = new Material({
            timetable,
            db,
            hyperMG,
            name: 'MATERIAL_NAME',
            bizIOId: 'MATERIAL_ID',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(material1.timetable).toBe(timetable);
            expect(material1.db).toBe(db);
            expect(material1.id).not.toBeUndefined();
            expect(material1.name).toBe('Material');
            expect(material1.children.length).toBe(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                material1.initialized.amount,
                material1.initialized.value,
                material1.initialized.adjuster,
                material1.initialized.totalValue,
                material1.running.amount,
                material1.running.value,
                material1.running.adjuster,
                material1.running.totalValue,
                material1.finalized.amount,
                material1.finalized.value,
                material1.finalized.adjuster,
                material1.finalized.totalValue,
                material1.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });

        test('with param', () => {
            expect(material2.timetable).toBe(timetable);
            expect(material2.db).toBe(db);
            expect(material2.id).toBe('MATERIAL_ID');
            expect(material2.name).toBe('MATERIAL_NAME');
            expect(material2.children.length).toBe(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                material2.initialized.amount,
                material2.initialized.value,
                material2.initialized.adjuster,
                material2.initialized.totalValue,
                material2.running.amount,
                material2.running.value,
                material2.running.adjuster,
                material2.running.totalValue,
                material2.finalized.amount,
                material2.finalized.value,
                material2.finalized.adjuster,
                material2.finalized.totalValue,
                material2.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });
    });

    test('manual update', () => {
        // 更新: running
        material2.running.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
        ]);
        expect(material2.running.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(10)),
            new BizValue(new Date(2020, 2, 1), new Decimal(20)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        material2.running.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
        ]);
        expect(material2.running.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(100)),
            new BizValue(new Date(2020, 2, 1), new Decimal(200)),
            new BizValue(new Date(2020, 3, 1), new Decimal(200)),
        ]);
        material2.running.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(material2.running.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // 更新: initialized
        material2.initialized.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(11)),
            new BizValue(new Date(2020, 2, 1), new Decimal(21)),
        ]);
        expect(material2.initialized.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(11)),
            new BizValue(new Date(2020, 2, 1), new Decimal(21)),
            new BizValue(new Date(2020, 3, 1), new Decimal(21)),
        ]);
        material2.initialized.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(110)),
            new BizValue(new Date(2020, 2, 1), new Decimal(210)),
        ]);
        expect(material2.initialized.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(110)),
            new BizValue(new Date(2020, 2, 1), new Decimal(210)),
            new BizValue(new Date(2020, 3, 1), new Decimal(210)),
        ]);
        material2.initialized.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(material2.initialized.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // 更新: finalized
        material2.finalized.amount.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(12)),
            new BizValue(new Date(2020, 2, 1), new Decimal(22)),
        ]);
        expect(material2.finalized.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(12)),
            new BizValue(new Date(2020, 2, 1), new Decimal(22)),
            new BizValue(new Date(2020, 3, 1), new Decimal(22)),
        ]);
        material2.finalized.value.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(120)),
            new BizValue(new Date(2020, 2, 1), new Decimal(220)),
        ]);
        expect(material2.finalized.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(120)),
            new BizValue(new Date(2020, 2, 1), new Decimal(220)),
            new BizValue(new Date(2020, 3, 1), new Decimal(220)),
        ]);
        material2.finalized.adjuster.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
        ]);
        expect(material2.finalized.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2)),
        ]);

        // check auto update
        material2.prepareAndUpdateFullCollectionsForAllTerms();

        expect(material2.running.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1001)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4002)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4002)),
        ]);
        expect(material2.initialized.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1211)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4412)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4412)),
        ]);
        expect(material2.finalized.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(1441)),
            new BizValue(new Date(2020, 2, 1), new Decimal(4842)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4842)),
        ]);
        expect(material2.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(3653)),
            new BizValue(new Date(2020, 2, 1), new Decimal(13256)),
            new BizValue(new Date(2020, 3, 1), new Decimal(13256)),
        ]);

        expect(material2.exportAsTable()).toEqual([
            [
                'MATERIAL_NAME:INITIALIZED:AMOUNT',
                new Decimal('11'),
                new Decimal('21'),
                new Decimal('21'),
            ],
            [
                'MATERIAL_NAME:INITIALIZED:VALUE',
                new Decimal('110'),
                new Decimal('210'),
                new Decimal('210'),
            ],
            [
                'MATERIAL_NAME:INITIALIZED:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'MATERIAL_NAME:INITIALIZED:TOTAL_VALUE',
                new Decimal('1211'),
                new Decimal('4412'),
                new Decimal('4412'),
            ],
            [
                'MATERIAL_NAME:RUNNING:AMOUNT',
                new Decimal('10'),
                new Decimal('20'),
                new Decimal('20'),
            ],
            [
                'MATERIAL_NAME:RUNNING:VALUE',
                new Decimal('100'),
                new Decimal('200'),
                new Decimal('200'),
            ],
            [
                'MATERIAL_NAME:RUNNING:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'MATERIAL_NAME:RUNNING:TOTAL_VALUE',
                new Decimal('1001'),
                new Decimal('4002'),
                new Decimal('4002'),
            ],
            [
                'MATERIAL_NAME:FINALIZED:AMOUNT',
                new Decimal('12'),
                new Decimal('22'),
                new Decimal('22'),
            ],
            [
                'MATERIAL_NAME:FINALIZED:VALUE',
                new Decimal('120'),
                new Decimal('220'),
                new Decimal('220'),
            ],
            [
                'MATERIAL_NAME:FINALIZED:ADJUSTER',
                new Decimal('1'),
                new Decimal('2'),
                new Decimal('2'),
            ],
            [
                'MATERIAL_NAME:FINALIZED:TOTAL_VALUE',
                new Decimal('1441'),
                new Decimal('4842'),
                new Decimal('4842'),
            ],
            [
                'MATERIAL_NAME:TOTAL_VALUE',
                new Decimal('3653'),
                new Decimal('13256'),
                new Decimal('13256'),
            ],
        ]);
    });
});
