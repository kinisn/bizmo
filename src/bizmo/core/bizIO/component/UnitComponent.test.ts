import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import { BizValue } from '../value/BizValue';
import { UnitComponent } from './UnitComponent';

describe('UnitComponent のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let bound1: UnitComponent;
    let bound2: UnitComponent;
    let bound3: UnitComponent;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        bound1 = new UnitComponent({ timetable, db, hyperMG });
        bound2 = new UnitComponent({
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
            expect(bound1.name).toEqual('UnitComponent');
            expect(bound1.children.length).toEqual(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ];
            [
                bound1.amount,
                bound1.value,
                bound1.adjuster,
                bound1.totalValue,
            ].forEach((bizIO) => {
                expect(bizIO.timetable).toBe(timetable);
                expect(bizIO.db).toBe(db);
                expect(bizIO.timetableHistory).toEqual(expected);
            });
        });

        test('with param', () => {
            expect(bound2.timetable).toBe(timetable);
            expect(bound2.db).toBe(db);
            expect(bound2.id).toEqual('UNIT_ID');
            expect(bound2.name).toEqual('UNIT_NAME');
            expect(bound2.children.length).toEqual(4);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ];
            [
                bound2.amount,
                bound2.value,
                bound2.adjuster,
                bound2.totalValue,
            ].forEach((bizIO) => {
                expect(bizIO.timetable).toBe(timetable);
                expect(bizIO.db).toBe(db);
                expect(bizIO.timetableHistory).toEqual(expected);
            });
        });
    });

    describe('manual update', () => {
        test('default', () => {
            // amount
            bound2.amount.setName('数量');
            bound2.amount.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20')),
            ]);
            expect(bound2.amount.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20')),
            ]);

            // value
            bound2.value.setName('価格');
            bound2.value.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('100')),
                new BizValue(new Date(2020, 2, 1), new Decimal('200')),
            ]);
            expect(bound2.value.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('100')),
                new BizValue(new Date(2020, 2, 1), new Decimal('200')),
                new BizValue(new Date(2020, 3, 1), new Decimal('200')),
            ]);

            // adjuster
            bound2.adjuster.setName('調整');
            bound2.adjuster.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2')),
            ]);
            expect(bound2.adjuster.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2')),
                new BizValue(new Date(2020, 3, 1), new Decimal('2')),
            ]);

            // check auto update
            bound2.prepareAndUpdateFullCollectionsForAllTerms();
            bound2.totalValue.setName('合計');
            expect(bound2.totalValue.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('1001')),
                new BizValue(new Date(2020, 2, 1), new Decimal('4002')),
                new BizValue(new Date(2020, 3, 1), new Decimal('4002')),
            ]);

            expect(bound2.exportAsTable()).toEqual([
                [
                    'UNIT_NAME:数量',
                    new Decimal('10'),
                    new Decimal('20'),
                    new Decimal('20'),
                ],
                [
                    'UNIT_NAME:価格',
                    new Decimal('100'),
                    new Decimal('200'),
                    new Decimal('200'),
                ],
                [
                    'UNIT_NAME:調整',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('2'),
                ],
                [
                    'UNIT_NAME:合計',
                    new Decimal('1001'),
                    new Decimal('4002'),
                    new Decimal('4002'),
                ],
            ]);
        });

        test('with amount complement', () => {
            bound3 = new UnitComponent({
                timetable,
                db,
                hyperMG,
                amountComplement: false,
            });
            // amount
            bound3.amount.setName('数量');
            bound3.amount.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20')),
            ]);
            expect(bound3.amount.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);

            // value
            bound3.value.setName('価格');
            bound3.value.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('100')),
                new BizValue(new Date(2020, 2, 1), new Decimal('200')),
            ]);
            expect(bound3.value.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('100')),
                new BizValue(new Date(2020, 2, 1), new Decimal('200')),
                new BizValue(new Date(2020, 3, 1), new Decimal('200')),
            ]);

            // adjuster
            bound3.adjuster.setName('調整');
            bound3.adjuster.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2')),
            ]);
            expect(bound3.adjuster.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('2')),
                new BizValue(new Date(2020, 3, 1), new Decimal('2')),
            ]);

            // check auto update
            bound3.prepareAndUpdateFullCollectionsForAllTerms();
            bound3.totalValue.setName('合計');
            expect(bound3.totalValue.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('1001')),
                new BizValue(new Date(2020, 2, 1), new Decimal('4002')),
                new BizValue(new Date(2020, 3, 1), new Decimal('2')),
            ]);

            expect(bound3.exportAsTable()).toEqual([
                [
                    'UnitComponent:数量',
                    new Decimal('10'),
                    new Decimal('20'),
                    new Decimal('0'),
                ],
                [
                    'UnitComponent:価格',
                    new Decimal('100'),
                    new Decimal('200'),
                    new Decimal('200'),
                ],
                [
                    'UnitComponent:調整',
                    new Decimal('1'),
                    new Decimal('2'),
                    new Decimal('2'),
                ],
                [
                    'UnitComponent:合計',
                    new Decimal('1001'),
                    new Decimal('4002'),
                    new Decimal('2'),
                ],
            ]);
        });
    });
});
