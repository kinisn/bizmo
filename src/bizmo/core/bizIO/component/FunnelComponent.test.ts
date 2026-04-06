import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
import { BizIO, MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { FunnelComponent } from './FunnelComponent';

describe('FunnelComponent のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let category1: CollectionBizIO;
    let category2: CollectionBizIO;
    let category3: CollectionBizIO;
    let category5: CollectionBizIO;
    let bizio1: MonetaryBizIO;
    let bizio2: MonetaryBizIO;
    let bizio3: MonetaryBizIO;
    let bizio4: MonetaryBizIO;
    let bizio5: MonetaryBizIO;
    let bizio6: MonetaryBizIO;

    let category4: CollectionBizIO;
    let funnelDefault: FunnelComponent;
    let funnel1: FunnelComponent;

    beforeEach(() => {
        /*
        --------------------------------------------------
        Category: category_1
            MonetaryBizIO: bizio_1
            MonetaryBizIO: bizio_2

        Category: category_2
            MonetaryBizIO: bizio_3
            MonetaryBizIO: bizio_4

        Category: category_3
            MonetaryBizIO: bizio_5
            Category: category_5
                MonetaryBizIO: bizio_6
        --------------------------------------------------
        */
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 10,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        category1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_1_1',
            bizIOId: 'category_1',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        category2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_2',
            bizIOId: 'category_2',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        category3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_3',
            bizIOId: 'category_3',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        category5 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_5',
            bizIOId: 'category_5',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });

        bizio1 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_1',
            bizIOId: 'biz_io_1',
        });
        bizio2 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_2',
            bizIOId: 'biz_io_2',
        });
        bizio3 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_3',
            bizIOId: 'biz_io_3',
        });
        bizio4 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_4',
            bizIOId: 'biz_io_4',
        });
        bizio5 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_5',
            bizIOId: 'biz_io_5',
        });
        bizio6 = new MonetaryBizIO({
            timetable,
            db,
            name: 'biz_io_6',
            bizIOId: 'biz_io_6',
        });

        category1.appendChild(bizio1);
        category1.appendChild(bizio2);
        category2.appendChild(bizio3);
        category2.appendChild(bizio4);
        category3.appendChild(bizio5);
        category3.appendChild(category5);
        category5.appendChild(bizio6);

        bizio1.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
        ]);
        bizio2.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
        ]);
        bizio3.setHistory([
            new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
        ]);
        bizio4.setHistory([
            new BizValue(new Date(2020, 4, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
        ]);
        bizio5.setHistory([
            new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 10, 1), new Decimal('20.2')),
        ]);
        bizio6.setHistory([
            new BizValue(new Date(2020, 6, 1), new Decimal('10.1')),
        ]);

        // for funnel id swap test
        category4 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_4',
            bizIOId: 'category_4',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });

        // funnel
        funnelDefault = new FunnelComponent({ timetable, db, hyperMG });
        funnel1 = new FunnelComponent({ timetable, db, hyperMG });
        funnel1.appendFunnelChild(category1);
        funnel1.appendFunnelChild(category2);
        funnel1.appendFunnelChild(category3);
    });

    describe('appendFunnelChildAt', () => {
        test('funnel elements less than two', () => {
            const funnel = funnelDefault;
            expect(funnel.children.length).toBe(0);
            expect(funnel.exposedChildren.length).toBe(0);
            expect(funnel.orderedBizIds.length).toBe(0);
            expect(funnel.orderedFunnelChildren.length).toBe(0);
            expect(funnel.orderedFunnelRates.length).toBe(0);

            funnel.appendFunnelChildAt(bizio1);
            expect(funnel.children.length).toBe(1);
            expect(funnel.exposedChildren.length).toBe(0);
            expect(funnel.orderedBizIds.length).toBe(1);
            expect(funnel.orderedFunnelChildren.length).toBe(1);
            expect(funnel.orderedFunnelRates.length).toBe(0);

            funnel.appendFunnelChildAt(bizio2);
            expect(funnel.children.length).toBe(3);
            expect(funnel.exposedChildren.length).toBe(1);
            expect(funnel.orderedBizIds.length).toBe(2);
            expect(funnel.orderedFunnelChildren.length).toBe(2);
            expect(funnel.orderedFunnelRates.length).toBe(1);

            const newBizIO = new BizIO({ timetable, db, name: 'bizioNew' });
            funnel.appendFunnelChildAt(newBizIO);
            const data = funnel.exportAsTable({ enforceDetail: true });
            expect(funnel.children.length).toBe(5); // 新規IOを指定したので、この要素も中に入る
            expect(funnel.exposedChildren.length).toBe(2);
            expect(funnel.orderedBizIds.length).toBe(3);
            expect(funnel.orderedFunnelChildren.length).toBe(3);
            expect(funnel.orderedFunnelRates.length).toBe(2);

            funnel.removeFunnelChild(bizio1.id);
            expect(funnel.children.length).toBe(3);
            expect(funnel.exposedChildren.length).toBe(1);
            expect(funnel.orderedBizIds.length).toBe(2);
            expect(funnel.orderedFunnelChildren.length).toBe(2);
            expect(funnel.orderedFunnelRates.length).toBe(1);

            /*
            funnel.removeFunnelChild(bizio2.id);
            expect(funnel.children.length).toBe(1);
            expect(funnel.exposedChildren.length).toBe(0);
            expect(funnel.orderedBizIds.length).toBe(1);
            expect(funnel.orderedFunnelChildren.length).toBe(1);
            expect(funnel.orderedFunnelRates.length).toBe(0);

            funnel.removeFunnelChild(newBizIO.id);
            expect(funnel.children.length).toBe(0);
            expect(funnel.exposedChildren.length).toBe(0);
            expect(funnel.orderedBizIds.length).toBe(0);
            expect(funnel.orderedFunnelChildren.length).toBe(0);
            expect(funnel.orderedFunnelRates.length).toBe(0);
            */
        });

        test('append funnel child at default is end', () => {
            const funnel = new FunnelComponent({ timetable, db, hyperMG });
            funnel.appendFunnelChild(category1);
            funnel.appendFunnelChild(category2);
            funnel.appendFunnelChild(category3);
            expect(funnel.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);
            expect(funnel.db.selectById('category_1')?.name).toEqual(
                'category_1_1'
            );
        });

        test('append funnel child at not in range', () => {
            let result = funnel1.appendFunnelChildAt(category4, 4);
            expect(result).toBeUndefined();
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);

            result = funnel1.appendFunnelChildAt(category4, -1);
            expect(result).toBeUndefined();
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);
        });

        test('append funnel child at top not included', () => {
            funnel1.appendFunnelChildAt(category4, 0);
            expect(funnel1.orderedBizIds).toEqual([
                'category_4',
                'category_1',
                'category_2',
                'category_3',
            ]);
        });

        test('append funnel child at first not included', () => {
            funnel1.appendFunnelChildAt(category4, 1);
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_4',
                'category_2',
                'category_3',
            ]);
        });

        test('append funnel child at middle not included', () => {
            funnel1.appendFunnelChildAt(category4, 2);
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_4',
                'category_3',
            ]);
        });
    });

    describe('swapFunnelChildAt', () => {
        test('common', () => {
            funnel1.swapFunnelChildAt(0, 1);
            expect(funnel1.orderedBizIds).toEqual([
                'category_2',
                'category_1',
                'category_3',
            ]);
            funnel1.swapFunnelChildAt(0, 2);
            expect(funnel1.orderedBizIds).toEqual([
                'category_3',
                'category_1',
                'category_2',
            ]);
            funnel1.swapFunnelChildAt(2, 0);
            expect(funnel1.orderedBizIds).toEqual([
                'category_2',
                'category_1',
                'category_3',
            ]);
            funnel1.swapFunnelChildAt(0, 1);
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);
        });

        test('error', () => {
            funnel1.swapFunnelChildAt(0, -1);
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);
            funnel1.swapFunnelChildAt(0, 3);
            expect(funnel1.orderedBizIds).toEqual([
                'category_1',
                'category_2',
                'category_3',
            ]);
        });
    });

    describe('funnel rate auto creation', () => {
        test('common', () => {
            funnel1.prepareAndUpdateFullCollectionsForAllTerms();
            const orderedFunnelChildren = funnel1.orderedFunnelChildren;

            expect(orderedFunnelChildren.length).toBe(3);
            expect(orderedFunnelChildren[0].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 4, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 5, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 6, 1), new Decimal('30.3')),
                new BizValue(new Date(2020, 7, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 8, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 9, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 10, 1), new Decimal('40.4')),
            ]);

            expect(orderedFunnelChildren[1].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 5, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('30.3')),
                new BizValue(new Date(2020, 9, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 10, 1), new Decimal('40.4')),
            ]);

            expect(orderedFunnelChildren[2].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('30.3')),
            ]);

            const orderedFunnelRates = funnel1.orderedFunnelRates;
            expect(orderedFunnelRates.length).toBe(2);

            expect(orderedFunnelRates[0].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0.5')),
                new BizValue(new Date(2020, 4, 1), new Decimal('1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('1')),
                new BizValue(
                    new Date(2020, 6, 1),
                    new Decimal('0.66666666666666666667')
                ),
                new BizValue(new Date(2020, 7, 1), new Decimal('0.5')),
                new BizValue(new Date(2020, 8, 1), new Decimal('0.75')),
                new BizValue(new Date(2020, 9, 1), new Decimal('1')),
                new BizValue(new Date(2020, 10, 1), new Decimal('1')),
            ]);

            expect(orderedFunnelRates[1].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('0.5')),
                new BizValue(new Date(2020, 6, 1), new Decimal('1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('1')),
                new BizValue(
                    new Date(2020, 8, 1),
                    new Decimal('0.66666666666666666667')
                ),
                new BizValue(new Date(2020, 9, 1), new Decimal('0.5')),
                new BizValue(new Date(2020, 10, 1), new Decimal('0.75')),
            ]);
        });

        test('test_funnel_rate_with_update', () => {
            bizio1.setValue(new Date(2020, 1, 1), new Decimal('101'));
            bizio1.setValue(new Date(2020, 6, 1), new Decimal('202'));
            funnel1.prepareAndUpdateFullCollectionsForAllTerms();

            const orderedFunnelChildren = funnel1.orderedFunnelChildren;
            expect(orderedFunnelChildren.length).toBe(3);
            expect(orderedFunnelChildren[0].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('101.0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('111.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('111.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('111.1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('111.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('212.1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('222.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('222.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('222.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('222.2')),
            ]);

            expect(orderedFunnelChildren[1].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 5, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('30.3')),
                new BizValue(new Date(2020, 9, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 10, 1), new Decimal('40.4')),
            ]);

            expect(orderedFunnelChildren[2].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('30.3')),
            ]);

            const orderedFunnelRates = funnel1.orderedFunnelRates;

            expect(orderedFunnelRates[0].timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(
                    new Date(2020, 3, 1),
                    new Decimal('0.090909090909090909091')
                ),
                new BizValue(
                    new Date(2020, 4, 1),
                    new Decimal('0.18181818181818181818')
                ),
                new BizValue(
                    new Date(2020, 5, 1),
                    new Decimal('0.18181818181818181818')
                ),
                new BizValue(
                    new Date(2020, 6, 1),
                    new Decimal('0.095238095238095238095')
                ),
                new BizValue(
                    new Date(2020, 7, 1),
                    new Decimal('0.090909090909090909091')
                ),
                new BizValue(
                    new Date(2020, 8, 1),
                    new Decimal('0.13636363636363636364')
                ),
                new BizValue(
                    new Date(2020, 9, 1),
                    new Decimal('0.18181818181818181818')
                ),
                new BizValue(
                    new Date(2020, 10, 1),
                    new Decimal('0.18181818181818181818')
                ),
            ]);
        });
    });

    test('removeFunnelChild', () => {
        funnel1.removeFunnelChild(category1.id);
        const orderedFunnelChildren = funnel1.orderedFunnelChildren;
        const orderedFunnelRates = funnel1.orderedFunnelRates;
        funnel1.prepareAndUpdateFullCollectionsForAllTerms();

        expect(orderedFunnelChildren.length).toBe(2);
        expect(orderedFunnelRates.length).toBe(1);
        expect(orderedFunnelRates[0].timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            new BizValue(new Date(2020, 4, 1), new Decimal('0')),
            new BizValue(new Date(2020, 5, 1), new Decimal('0.5')),
            new BizValue(new Date(2020, 6, 1), new Decimal('1')),
            new BizValue(new Date(2020, 7, 1), new Decimal('1')),
            new BizValue(
                new Date(2020, 8, 1),
                new Decimal('0.66666666666666666667')
            ),
            new BizValue(new Date(2020, 9, 1), new Decimal('0.5')),
            new BizValue(new Date(2020, 10, 1), new Decimal('0.75')),
        ]);
    });

    test('funnel rate on non cyclic family', () => {
        funnelDefault.appendFunnelChildAt(category3);
        funnelDefault.appendFunnelChildAt(category5); // child of category3
        funnelDefault.prepareAndUpdateFullCollectionsForAllTerms();

        expect(funnelDefault.orderedFunnelChildren[0].timetableHistory).toEqual(
            [
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('30.3')),
            ]
        );

        expect(funnelDefault.orderedFunnelChildren[1].timetableHistory).toEqual(
            [
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('0')),
                new BizValue(new Date(2020, 6, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 8, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 9, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 10, 1), new Decimal('10.1')),
            ]
        );

        expect(funnelDefault.orderedFunnelRates[0].timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 3, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 4, 1), new Decimal('NaN')),
            new BizValue(new Date(2020, 5, 1), new Decimal('0')),
            new BizValue(new Date(2020, 6, 1), new Decimal('0.5')),
            new BizValue(new Date(2020, 7, 1), new Decimal('0.5')),
            new BizValue(new Date(2020, 8, 1), new Decimal('0.5')),
            new BizValue(new Date(2020, 9, 1), new Decimal('0.5')),
            new BizValue(
                new Date(2020, 10, 1),
                new Decimal('0.33333333333333333333')
            ),
        ]);
    });

    test('test_update_funnel_elem', () => {
        funnel1.prepareAndUpdateFullCollectionsForAllTerms();
        expect(funnel1.exportAsTable({ enforceDetail: true })).toEqual([
            [
                'FunnelComponent:category_1_1:biz_io_1',
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_1_1:biz_io_2',
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_1_1',
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
            ],
            [
                'FunnelComponent:category_2:biz_io_3',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_2:biz_io_4',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('40.4'),
            ],
            [
                'FunnelComponent:category_3:biz_io_5',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_3:category_5:biz_io_6',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
            ],
            [
                'FunnelComponent:category_3:category_5',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
            ],
            [
                'FunnelComponent:category_3',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
            ],
            [
                'FunnelComponent:category_1_1 → category_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.5'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('0.66666666666666666667'),
                new Decimal('0.5'),
                new Decimal('0.75'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'FunnelComponent:category_2 → category_3',
                new Decimal('NaN'),
                new Decimal('NaN'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.5'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('0.66666666666666666667'),
                new Decimal('0.5'),
                new Decimal('0.75'),
            ],
        ]);

        // update bizio_6
        bizio6.setValue(new Date(2020, 1, 1), new Decimal('10.1'));
        funnel1.prepareAndUpdateFullCollectionsForAllTerms();

        expect(funnel1.exportAsTable({ enforceDetail: true })).toEqual([
            [
                'FunnelComponent:category_1_1:biz_io_1',
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_1_1:biz_io_2',
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_1_1',
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
            ],
            [
                'FunnelComponent:category_2:biz_io_3',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_2:biz_io_4',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('40.4'),
            ],
            [
                'FunnelComponent:category_3:biz_io_5',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
            ],
            [
                'FunnelComponent:category_3:category_5:biz_io_6',
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
            ],
            [
                'FunnelComponent:category_3:category_5',
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
            ],
            [
                'FunnelComponent:category_3',
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
            ],
            [
                'FunnelComponent:category_1_1 → category_2',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0.5'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('0.66666666666666666667'),
                new Decimal('0.5'),
                new Decimal('0.75'),
                new Decimal('1'),
                new Decimal('1'),
            ],
            [
                'FunnelComponent:category_2 → category_3',
                new Decimal('NaN'),
                new Decimal('NaN'),
                new Decimal('1'),
                new Decimal('0.5'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('1'),
                new Decimal('0.66666666666666666667'),
                new Decimal('0.5'),
                new Decimal('0.75'),
            ],
        ]);
    });
});
