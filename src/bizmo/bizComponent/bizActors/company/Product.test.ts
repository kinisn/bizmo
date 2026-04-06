import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { Product } from './Product';
import i18n from 'i18n/configs';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';

describe('Product のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase<any, BizComponentGroupType>;
    let hyperMG: HyperParamManager;
    let product1: Product;
    let product2: Product;

    beforeEach(() => {
        i18n.changeLanguage('test');
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        product1 = new Product({ timetable, db, hyperMG });
        product2 = new Product({
            timetable,
            db,
            hyperMG,
            name: 'PRODUCT_NAME',
            bizIOId: 'PRODUCT_ID',
        });
    });

    describe('init', () => {
        test('default', () => {
            expect(product1.timetable).toBe(timetable);
            expect(product1.db).toBe(db);
            expect(product1.id).not.toBeUndefined();
            expect(product1.name).toBe('Product');
            expect(product1.children.length).toBe(7);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                product1.stage,
                product1.accumulateRDCost,
                product1.production.amount,
                product1.production.value,
                product1.production.adjuster,
                product1.production.totalValue,
                product1.sales.amount,
                product1.sales.value,
                product1.sales.adjuster,
                product1.sales.totalValue,
                product1.disposal.amount,
                product1.disposal.value,
                product1.disposal.adjuster,
                product1.disposal.totalValue,
                product1.stock.amount,
                product1.stock.value,
                product1.stock.adjuster,
                product1.stock.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });

        test('with param', () => {
            expect(product2.timetable).toBe(timetable);
            expect(product2.db).toBe(db);
            expect(product2.id).toBe('PRODUCT_ID');
            expect(product2.name).toBe('PRODUCT_NAME');
            expect(product2.children.length).toBe(7);

            const expected = [
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ];
            [
                product2.stage,
                product2.accumulateRDCost,
                product2.production.amount,
                product2.production.value,
                product2.production.adjuster,
                product2.production.totalValue,
                product2.sales.amount,
                product2.sales.value,
                product2.sales.adjuster,
                product2.sales.totalValue,
                product2.disposal.amount,
                product2.disposal.value,
                product2.disposal.adjuster,
                product2.disposal.totalValue,
                product2.stock.amount,
                product2.stock.value,
                product2.stock.adjuster,
                product2.stock.totalValue,
            ].forEach((target) => {
                expect(target.timetable).toBe(timetable);
                expect(target.db).toBe(db);
                expect(String(target.timetableHistory)).toBe(String(expected));
            });
        });
    });

    test('test_manual_update', () => {
        // stage
        product1.stage.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        expect(product1.stage.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);

        // rd_cost
        product1.rdCost.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(100)),
        ]);
        expect(product1.rdCost.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(100)),
            new BizValue(new Date(2020, 3, 1), new Decimal(100)),
        ]);

        // stock amount
        expect(product1.stock.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(0)),
            new BizValue(new Date(2020, 3, 1), new Decimal(0)),
        ]);

        // == PRODUCTION ==
        // production: amount
        product1.production.amount.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(101)),
            new BizValue(new Date(2020, 3, 1), new Decimal(102)),
        ]);
        expect(product1.production.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(101)),
            new BizValue(new Date(2020, 3, 1), new Decimal(102)),
        ]);

        // production: value
        product1.production.value.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        expect(product1.production.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);

        // production: adjuster
        product1.production.adjuster.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);
        expect(product1.production.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);

        // production: total_value
        product1.prepareAndUpdateFullCollectionsForAllTerms();
        expect(product1.production.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(2010)),
            new BizValue(new Date(2020, 3, 1), new Decimal(4040)),
        ]);

        // stock amount
        expect(product1.stock.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(101)),
            new BizValue(new Date(2020, 3, 1), new Decimal(203)),
        ]);

        // ## SALES
        // sales: amount
        product1.sales.amount.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(51)),
            new BizValue(new Date(2020, 3, 1), new Decimal(52)),
        ]);
        expect(product1.sales.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(51)),
            new BizValue(new Date(2020, 3, 1), new Decimal(52)),
        ]);

        // sales: value
        product1.sales.value.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        expect(product1.sales.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);

        // sales: adjuster
        product1.sales.adjuster.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);
        expect(product1.sales.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);

        // sales: total_value
        product1.prepareAndUpdateFullCollectionsForAllTerms();
        expect(product1.sales.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1510)),
            new BizValue(new Date(2020, 3, 1), new Decimal(3040)),
        ]);

        // sales: amount
        expect(product1.stock.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(50)),
            new BizValue(new Date(2020, 3, 1), new Decimal(100)),
        ]);

        // ## disposal
        // disposal: amount
        product1.disposal.amount.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(11)),
        ]);
        expect(product1.disposal.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(11)),
        ]);

        // disposal: value
        product1.disposal.value.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);
        expect(product1.disposal.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(10)),
            new BizValue(new Date(2020, 3, 1), new Decimal(20)),
        ]);

        // disposal: adjuster
        product1.disposal.adjuster.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);
        expect(product1.disposal.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);

        // disposal: total_value
        product1.prepareAndUpdateFullCollectionsForAllTerms();
        expect(product1.disposal.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1100)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2220)),
        ]);

        // stock amount
        expect(product1.stock.amount.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(40)),
            new BizValue(new Date(2020, 3, 1), new Decimal(79)),
        ]);

        // ## stock
        // stock: value
        product1.stock.value.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(100)),
            new BizValue(new Date(2020, 3, 1), new Decimal(10)),
        ]);
        expect(product1.stock.value.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(100)),
            new BizValue(new Date(2020, 3, 1), new Decimal(10)),
        ]);

        // stock: adjuster
        product1.stock.adjuster.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);
        expect(product1.stock.adjuster.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(1000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2000)),
        ]);

        // stock: total_value
        product1.prepareAndUpdateFullCollectionsForAllTerms();
        expect(product1.stock.totalValue.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(5000)),
            new BizValue(new Date(2020, 3, 1), new Decimal(2790)),
        ]);

        expect(product1.exportAsTable()).toEqual([
            [
                'Product:STAGE',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
            ],
            [
                'Product:RD_COST',
                new Decimal('0'),
                new Decimal('100'),
                new Decimal('100'),
            ],
            [
                'Product:PRODUCTION:AMOUNT',
                new Decimal('0'),
                new Decimal('101'),
                new Decimal('102'),
            ],
            [
                'Product:PRODUCTION:VALUE',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
            ],
            [
                'Product:PRODUCTION:ADJUSTER',
                new Decimal('0'),
                new Decimal('1000'),
                new Decimal('2000'),
            ],
            [
                'Product:PRODUCTION:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('2010'),
                new Decimal('4040'),
            ],
            [
                'Product:SALES:AMOUNT',
                new Decimal('0'),
                new Decimal('51'),
                new Decimal('52'),
            ],
            [
                'Product:SALES:VALUE',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
            ],
            [
                'Product:SALES:ADJUSTER',
                new Decimal('0'),
                new Decimal('1000'),
                new Decimal('2000'),
            ],
            [
                'Product:SALES:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('1510'),
                new Decimal('3040'),
            ],
            [
                'Product:DISPOSAL:AMOUNT',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('11'),
            ],
            [
                'Product:DISPOSAL:VALUE',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('20'),
            ],
            [
                'Product:DISPOSAL:ADJUSTER',
                new Decimal('0'),
                new Decimal('1000'),
                new Decimal('2000'),
            ],
            [
                'Product:DISPOSAL:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('1100'),
                new Decimal('2220'),
            ],
            [
                'Product:ACCUM_RD_COST',
                new Decimal('0'),
                new Decimal('100'),
                new Decimal('200'),
            ],
            [
                'Product:STOCK:AMOUNT',
                new Decimal('0'),
                new Decimal('40'),
                new Decimal('79'),
            ],
            [
                'Product:STOCK:VALUE',
                new Decimal('0'),
                new Decimal('100'),
                new Decimal('10'),
            ],
            [
                'Product:STOCK:ADJUSTER',
                new Decimal('0'),
                new Decimal('1000'),
                new Decimal('2000'),
            ],
            [
                'Product:STOCK:TOTAL_VALUE',
                new Decimal('0'),
                new Decimal('5000'),
                new Decimal('2790'),
            ],
        ]);
    });
});
