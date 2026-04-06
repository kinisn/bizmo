import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { vi } from 'vitest';
import { BizDatabase } from '../../db/BizDatabase';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
import { MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { RateComponent } from './RateComponent';

describe('UnitComponent のテスト', () => {
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
    let rate1: RateComponent;
    let rate2: RateComponent;

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

        // rate
        rate1 = new RateComponent({
            timetable,
            db,
            hyperMG,
            numerator: category5,
            denominator: category3,
            bizIOId: 'rate_1_id',
            name: 'name_rate',
        });
        rate2 = new RateComponent({
            timetable,
            db,
            hyperMG,
            numerator: bizio2,
            denominator: bizio1,
            bizIOId: 'rate_2_id',
            name: 'name_rate_2',
        });
        rate1.prepareAndUpdateFullCollectionsForAllTerms();
    });

    describe('init', () => {
        test('default', () => {
            expect(rate1.children.length).toBe(2);

            // 分子
            expect(category5.timetableHistory).toEqual([
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
            ]);

            // 分母
            expect(category3.timetableHistory).toEqual([
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

            // rate
            expect(rate1.timetableHistory).toEqual([
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
    });

    describe('update', () => {
        test('common', () => {
            bizio5.set(new BizValue(new Date(2020, 5, 1), new Decimal('101')));
            bizio5.set(new BizValue(new Date(2020, 10, 1), new Decimal('202')));
            bizio6.set(new BizValue(new Date(2020, 6, 1), new Decimal('101')));
            rate1.prepareAndUpdateFullCollectionsForAllTerms();

            // 分子
            expect(category5.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('0')),
                new BizValue(new Date(2020, 6, 1), new Decimal('101')),
                new BizValue(new Date(2020, 7, 1), new Decimal('101')),
                new BizValue(new Date(2020, 8, 1), new Decimal('101')),
                new BizValue(new Date(2020, 9, 1), new Decimal('101')),
                new BizValue(new Date(2020, 10, 1), new Decimal('101')),
            ]);

            // 分母
            expect(category3.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0')),
                new BizValue(new Date(2020, 5, 1), new Decimal('101')),
                new BizValue(new Date(2020, 6, 1), new Decimal('202')),
                new BizValue(new Date(2020, 7, 1), new Decimal('202')),
                new BizValue(new Date(2020, 8, 1), new Decimal('202')),
                new BizValue(new Date(2020, 9, 1), new Decimal('202')),
                new BizValue(new Date(2020, 10, 1), new Decimal('303')),
            ]);

            // rate
            expect(rate1.timetableHistory).toEqual([
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

        test('error', () => {
            const logSpy = vi.spyOn(console, 'log');
            rate1.setRatesToUpdateNumerator(
                [new BizValue(new Date(2020, 9, 1), new Decimal('1.1'))],
                false
            );
            expect(logSpy).toHaveBeenCalledWith(
                'setRatesToUpdateNumerator does not support CollectionBizIO.'
            );
        });
    });

    describe('setRatesToUpdateNumerator', () => {
        test('not replace full rates', () => {
            rate2.setRatesToUpdateNumerator(
                [
                    new BizValue(new Date(2020, 6, 1), new Decimal('2.0')),
                    new BizValue(new Date(2020, 10, 1), new Decimal('1.1')),
                ],
                false
            );
            rate2.prepareAndUpdateFullCollectionsForAllTerms();

            /*
            bizio1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
            ]);
            bizio2.setHistory([
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
            ]);
            */
            // 分母
            expect(bizio1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('20.2')),
            ]);

            // 分子
            expect(bizio2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')), // original
                new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('40.4')), // target
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')), // original  <- 不確定範囲
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')), // <- 不確定範囲
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')), // <- 不確定範囲
                new BizValue(new Date(2020, 10, 1), new Decimal('22.22')), // target2
            ]);

            expect(rate2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('1')),
                new BizValue(new Date(2020, 8, 1), new Decimal('1')),
                new BizValue(new Date(2020, 9, 1), new Decimal('1')),
                new BizValue(new Date(2020, 10, 1), new Decimal('1.1')),
            ]);
        });

        test('replace full rates', () => {
            rate2.setRatesToUpdateNumerator([
                new BizValue(new Date(2020, 2, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('2.0')),
                new BizValue(new Date(2020, 9, 1), new Decimal('1.1')),
            ]);
            rate2.prepareAndUpdateFullCollectionsForAllTerms();

            // 分母
            expect(bizio1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
                new BizValue(new Date(2020, 10, 1), new Decimal('20.2')),
            ]);

            // 分子
            expect(bizio2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('1.01')),
                new BizValue(new Date(2020, 3, 1), new Decimal('1.01')),
                new BizValue(new Date(2020, 4, 1), new Decimal('1.01')),
                new BizValue(new Date(2020, 5, 1), new Decimal('1.01')),
                new BizValue(new Date(2020, 6, 1), new Decimal('2.02')),
                new BizValue(new Date(2020, 7, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 8, 1), new Decimal('40.4')),
                new BizValue(new Date(2020, 9, 1), new Decimal('22.22')),
                new BizValue(new Date(2020, 10, 1), new Decimal('22.22')),
            ]);

            expect(rate2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 4, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 5, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 6, 1), new Decimal('0.1')),
                new BizValue(new Date(2020, 7, 1), new Decimal('2.0')),
                new BizValue(new Date(2020, 8, 1), new Decimal('2.0')),
                new BizValue(new Date(2020, 9, 1), new Decimal('1.1')),
                new BizValue(new Date(2020, 10, 1), new Decimal('1.1')),
            ]);
        });
    });
});
