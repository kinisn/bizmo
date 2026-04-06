import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import { MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { CollectionBizIO, CollectionSummarizeMode } from './CollectionBizIO';

describe('CollectionBizIO: Collection Accumulate のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let category1: CollectionBizIO;
    let category2: CollectionBizIO;
    let category3: CollectionBizIO;
    let aliasCategory4: CollectionBizIO;
    let category5: CollectionBizIO;
    let aliasCategory6: CollectionBizIO;
    let bizIO1: MonetaryBizIO;
    let bizIO2: MonetaryBizIO;
    let bizIO3: MonetaryBizIO;
    let bizIO4: MonetaryBizIO;
    let bizIO5: MonetaryBizIO;
    let bizIO6: MonetaryBizIO;
    let simpleBizIO: MonetaryBizIO;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        hyperMG = new HyperParamManager();

        category1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_1',
            bizIOId: 'category_1',
            exportWithChildren: true,
        });
        category2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_2',
            bizIOId: 'category_2',
            exportWithChildren: true,
        });
        category3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_3',
            bizIOId: 'category_3',
            exportWithChildren: true,
        });
        category5 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_5',
            bizIOId: 'category_5',
            exportWithChildren: true,
        });

        bizIO1 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_1',
            bizIOId: 'bizio_1',
        });
        bizIO2 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_2',
            bizIOId: 'bizio_2',
        });
        bizIO3 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_3',
            bizIOId: 'bizio_3',
        });
        bizIO4 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_4',
            bizIOId: 'bizio_4',
        });
        bizIO5 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_5',
            bizIOId: 'bizio_5',
        });
        bizIO6 = new MonetaryBizIO({
            timetable: timetable,
            db: db,
            name: 'bizio_6',
            bizIOId: 'bizio_6',
        });

        aliasCategory4 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'alias_category_4',
            bizIOId: 'alias_category_4',
            exportWithChildren: false,
            initData: [category2, bizIO1, bizIO2],
        });

        aliasCategory6 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'alias_category_6',
            bizIOId: 'alias_category_6',
            exportWithChildren: false,
            initData: [bizIO5, bizIO6],
        });

        bizIO1.setHistory([
            new BizValue(new Date(2020, 1, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 6, 1), new Decimal('20.2')),
        ]);
        bizIO2.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 7, 1), new Decimal('20.2')),
        ]);
        bizIO3.setHistory([
            new BizValue(new Date(2020, 3, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 8, 1), new Decimal('20.2')),
        ]);
        bizIO4.setHistory([
            new BizValue(new Date(2020, 4, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 9, 1), new Decimal('20.2')),
        ]);
        bizIO5.setHistory([
            new BizValue(new Date(2020, 5, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 10, 1), new Decimal('20.2')),
        ]);
        bizIO6.setHistory([
            new BizValue(new Date(2020, 6, 1), new Decimal('10.1')),
        ]);

        // 基本構造
        /*
        for Complex Test
        --------------------------------------------------
        Category: category_1
            MonetaryBizIO: bizio_1  <-- alias_category_4
            MonetaryBizIO: bizio_2  <-- alias_category_4
            Category: category_2  <-- alias_category_4
                MonetaryBizIO: bizio_3
                MonetaryBizIO: bizio_4
                Category: category_3
                    MonetaryBizIO: bizio_5
                    Category: category_5
                        MonetaryBizIO: bizio_6
                    AliasCategory: alias_category_6
                        refer to: bizio_5, bizio_6
            AliasCategory: alias_category_4
                refer to: category_2, bizio_1, bizio_2
        --------------------------------------------------
        */
        category1.appendChild(bizIO1);
        category1.appendChild(bizIO2);
        category1.appendChild(category2);
        category1.appendChild(aliasCategory4);
        category2.appendChild(bizIO3);
        category2.appendChild(bizIO4);
        category2.appendChild(category3);
        category3.appendChild(bizIO5);
        category3.appendChild(category5);
        category3.appendChild(aliasCategory6);
        category5.appendChild(bizIO6);

        // ===== simplebizio =====
        simpleBizIO = new MonetaryBizIO({
            timetable,
            db,
            name: 'simple_biz',
            bizIOId: 'simple_biz_io_1',
        });
        simpleBizIO.setHistory([
            new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
        ]);
    });

    test('Accumulate', () => {
        // 初期設定
        timetable.length = 10;
        const accum = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            exportWithChildren: true,
            summarizeMode: CollectionSummarizeMode.ACCUMULATE,
        });
        accum.prepareAndUpdateFullCollectionsForAllTerms();
        expect(accum.exportAsTable()).toEqual([
            [
                'CollectionBizIO',
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
                new Decimal('0'),
            ],
        ]);

        accum.appendChild(bizIO1);
        accum.prepareAndUpdateFullCollectionsForAllTerms();

        expect(accum.exportAsTable()).toEqual([
            [
                'CollectionBizIO:bizio_1',
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
                'CollectionBizIO',
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('50.5'),
                new Decimal('70.7'),
                new Decimal('90.9'),
                new Decimal('111.1'),
                new Decimal('131.3'),
                new Decimal('151.5'),
            ],
        ]);

        accum.appendChild(bizIO2);
        accum.prepareAndUpdateFullCollectionsForAllTerms();

        expect(accum.exportAsTable()).toEqual([
            [
                'CollectionBizIO:bizio_1',
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
                'CollectionBizIO:bizio_2',
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
                'CollectionBizIO',
                new Decimal('10.1'),
                new Decimal('30.3'),
                new Decimal('50.5'),
                new Decimal('70.7'),
                new Decimal('90.9'),
                new Decimal('121.2'),
                new Decimal('161.6'),
                new Decimal('202.0'),
                new Decimal('242.4'),
                new Decimal('282.8'),
            ],
        ]);
    });
});
