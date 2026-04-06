import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import { MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { CollectionBizIO, CollectionSummarizeMode } from './CollectionBizIO';

describe('CollectionBizIO のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let folder0: CollectionBizIO;
    let folder1: CollectionBizIO;
    let folder2: CollectionBizIO;
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
    let systemRequiredRoot: CollectionBizIO;
    let systemRequiredBizIO1: MonetaryBizIO;
    let systemRequiredCollectionO1: CollectionBizIO;

    beforeEach(() => {
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
            name: 'category_1',
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
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: false,
            initData: [category2, bizIO1, bizIO2],
        });

        aliasCategory6 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'alias_category_6',
            bizIOId: 'alias_category_6',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
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

        // folder
        folder0 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'FOLDER_ID_0',
            name: 'FOLDER_NAME_0',
        });
        folder1 = new CollectionBizIO({ timetable, db, hyperMG });
        folder2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'FOLDER_ID_2',
            name: 'FOLDER_NAME_2',
        });

        // systemRequired
        systemRequiredRoot = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'SYSTEM_REQUIRED_ROOT',
            name: 'SYSTEM_REQUIRED_ROOT',
            systemLabeledOnly: true,
        });
        systemRequiredBizIO1 = new MonetaryBizIO({
            timetable,
            db,
            bizIOId: 'SYSTEM_REQUIRED_BIZ_IO_1',
            name: 'SYSTEM_REQUIRED_BIZ_IO_1',
        });
        systemRequiredCollectionO1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'SYSTEM_REQUIRED_COLLECTION_IO_1',
            name: 'SYSTEM_REQUIRED_COLLECTION_IO_1',
        });
        systemRequiredRoot.appendChildren(
            [systemRequiredBizIO1, systemRequiredCollectionO1],
            ['1', '2']
        );
    });

    describe('setName', () => {
        test('setName', () => {
            expect(category1.name).toBe('category_1');
            category1.setName('category_1_changed');
            expect(category1.name).toBe('category_1_changed');
        });
    });

    describe('Tree & appendChild', () => {
        test('Tree: Folder & Collection & BizIO', () => {
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
            category1.appendChild(aliasCategory4); // initData: [category2, bizIO1, bizIO2],
            category2.appendChild(bizIO3);
            category2.appendChild(bizIO4);
            category2.appendChild(category3);
            category3.appendChild(bizIO5);
            category3.appendChild(category5);
            category3.appendChild(aliasCategory6); // initData: [bizIO5, bizIO6],
            category5.appendChild(bizIO6);
            category1.prepareAndUpdateFullCollectionsForAllTerms();

            const result = category1.exportAsTable();

            const expected = [
                [
                    'category_1:bizio_1',
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
                    'category_1:bizio_2',
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
                    'category_1:category_2:bizio_3',
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
                    'category_1:category_2:bizio_4',
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
                    'category_1:category_2:category_3:bizio_5',
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
                    'category_1:category_2:category_3:category_5:bizio_6',
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
                    'category_1:category_2:category_3:category_5',
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
                    'category_1:category_2:category_3:alias_category_6',
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
                    'category_1:category_2:category_3',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('20.2'),
                    new Decimal('40.4'),
                    new Decimal('40.4'),
                    new Decimal('40.4'),
                    new Decimal('40.4'),
                    new Decimal('60.6'),
                ],
                [
                    'category_1:category_2',
                    new Decimal('0'),
                    new Decimal('0'),
                    new Decimal('10.1'),
                    new Decimal('20.2'),
                    new Decimal('40.4'),
                    new Decimal('60.6'),
                    new Decimal('60.6'),
                    new Decimal('70.7'),
                    new Decimal('80.8'),
                    new Decimal('101'),
                ],
                [
                    'category_1:alias_category_4',
                    new Decimal('10.1'),
                    new Decimal('20.2'),
                    new Decimal('30.3'),
                    new Decimal('40.4'),
                    new Decimal('60.6'),
                    new Decimal('90.9'),
                    new Decimal('101'),
                    new Decimal('111.1'),
                    new Decimal('121.2'),
                    new Decimal('141.4'),
                ],
                [
                    'category_1',
                    new Decimal('20.2'),
                    new Decimal('40.4'),
                    new Decimal('60.6'),
                    new Decimal('80.8'),
                    new Decimal('121.2'),
                    new Decimal('181.8'),
                    new Decimal('202'),
                    new Decimal('222.2'),
                    new Decimal('242.4'),
                    new Decimal('282.8'),
                ],
            ];
            expect(result).toEqual(expected);
        });

        test('Tree: Folder & BizIO', () => {
            /*
        for Complex Test
        --------------------------------------------------
        Folder: folder1
            MonetaryBizIO: bizio1
            MonetaryBizIO: bizio2
            Folder: folder2
                MonetaryBizIO: bizio3
                Folder: folder0
                    MonetaryBizIO: bizio4
        --------------------------------------------------
        */
            folder1.appendChild(bizIO1);
            folder1.appendChild(bizIO2);
            folder1.appendChild(folder2);
            folder2.appendChild(bizIO3);
            folder2.appendChild(folder0);
            folder0.appendChild(bizIO4);
            folder1.prepareAndUpdateFullCollectionsForAllTerms();

            const expected = [
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
                    'CollectionBizIO:FOLDER_NAME_2:bizio_3',
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
                    'CollectionBizIO:FOLDER_NAME_2:FOLDER_NAME_0:bizio_4',
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
            ];
            expect(folder1.exportAsTable()).toEqual(expected);
        });
    });

    describe('Folder', () => {
        describe('init', () => {
            test('without param', () => {
                expect(folder1.timetable).toBe(timetable);
                expect(folder1.db).toBe(db);
                expect(folder1.id).not.toBeUndefined();
                expect(folder1.name).toEqual('CollectionBizIO');
                expect(folder1.children).toEqual([]);
                expect(folder1.systemLabeledChildren).toEqual([]);
                expect(folder1.timetableHistory).toEqual([
                    new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 3, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 4, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 5, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 6, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 7, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 8, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 9, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 10, 1), new Decimal('NaN')),
                ]);
            });

            test('with param', () => {
                expect(folder2.timetable).toBe(timetable);
                expect(folder2.db).toBe(db);
                expect(folder2.id).toEqual('FOLDER_ID_2');
                expect(folder2.name).toEqual('FOLDER_NAME_2');
                expect(folder2.children).toEqual([]);
                expect(folder2.systemLabeledChildren).toEqual([]);
                expect(folder2.timetableHistory).toEqual([
                    new BizValue(new Date(2020, 1, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 2, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 3, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 4, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 5, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 6, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 7, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 8, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 9, 1), new Decimal('NaN')),
                    new BizValue(new Date(2020, 10, 1), new Decimal('NaN')),
                ]);
            });
        });

        describe('add', () => {
            test('common', () => {
                // 共通
                category1.appendChild(bizIO1);
                category1.appendChild(bizIO2);
                category1.appendChild(category2);
                category2.appendChild(bizIO3);
                category2.appendChild(bizIO4);
                category2.appendChild(category3);
                category3.appendChild(bizIO5);
                category1.appendChild(aliasCategory4);
                category3.appendChild(category5);
                category5.appendChild(bizIO6);
                category3.appendChild(aliasCategory6);
                // 固有
                folder1.appendChild(bizIO1);
                folder1.appendChild(category5);
                folder1.appendChild(folder2);
                folder2.appendChild(category3);

                expect(folder1.children).toHaveLength(3);
                expect(folder1.systemLabeledChildren).toEqual([]);
                let expected = [
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
                        'CollectionBizIO:category_5:bizio_6',
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
                        'CollectionBizIO:category_5',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:bizio_5',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:category_5:bizio_6',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:category_5',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:alias_category_6',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('20.2'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('60.6'),
                    ],
                ];

                folder1.prepareAndUpdateFullCollectionsForAllTerms();
                const res = folder1.exportAsTable();
                expect(res).toEqual(expected);

                bizIO5.setValue(new Date(2020, 10, 1), new Decimal('202.0'));
                folder1.prepareAndUpdateFullCollectionsForAllTerms();

                expected = [
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
                        'CollectionBizIO:category_5:bizio_6',
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
                        'CollectionBizIO:category_5',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:bizio_5',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('10.1'),
                        new Decimal('10.1'),
                        new Decimal('10.1'),
                        new Decimal('10.1'),
                        new Decimal('10.1'),
                        new Decimal('202.0'),
                    ],
                    [
                        'CollectionBizIO:FOLDER_NAME_2:category_3:category_5:bizio_6',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:category_5',
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
                        'CollectionBizIO:FOLDER_NAME_2:category_3:alias_category_6',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('10.1'),
                        new Decimal('20.2'),
                        new Decimal('20.2'),
                        new Decimal('20.2'),
                        new Decimal('20.2'),
                        new Decimal('212.1'),
                    ],
                    [
                        'CollectionBizIO:FOLDER_NAME_2:category_3',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('20.2'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('40.4'),
                        new Decimal('424.2'),
                    ],
                ];
                expect(folder1.exportAsTable()).toEqual(expected);
            });

            test('when added non system label on system, it must be failed.', () => {
                expect(systemRequiredRoot.systemLabeledOnly).toBe(true);
                expect(systemRequiredCollectionO1.systemLabeledOnly).toBe(
                    false
                );
                expect(systemRequiredRoot.children.length).toBe(2);

                // add non system label on system
                const result = systemRequiredRoot.appendChild(bizIO1);

                expect(systemRequiredRoot.children.length).toBe(2);
            });
        });
    });

    describe('addSeedFolder', () => {
        test('common', () => {
            // new
            expect(folder2.children.length).toBe(0);
            let result = folder2.addSeedFolder('TEST_1');
            expect(folder2.children.length).toBe(1);
            expect(result?.name).toBe('TEST_1');

            result = folder2.addSeedFolder('TEST_2');
            expect(folder2.children.length).toBe(2);
            expect(result?.name).toBe('TEST_2');

            // unique by name is true
            result = folder2.addSeedFolder('TEST_1');
            expect(folder2.children.length).toBe(2);
            expect(result).toBeUndefined();
        });
    });

    describe('systemLabeledChildren & removeChild', () => {
        test('common', () => {
            expect(folder1.children.length).toBe(0);
            expect(folder1.systemLabeledChildren.length).toBe(0);

            folder1.appendChild(bizIO1);
            expect(folder1.children.length).toBe(1);
            expect(folder1.systemLabeledChildren.length).toBe(0);

            folder1.appendChild(bizIO2, 'sys_name_1');
            expect(folder1.children.length).toBe(2);
            expect(folder1.systemLabeledChildren.length).toBe(1);

            folder1.appendChild(bizIO3, 'sys_name_2');
            expect(folder1.children.length).toBe(3);
            expect(folder1.systemLabeledChildren.length).toBe(2);

            // system labeled childe is not removed
            folder1.removeChild(bizIO3.id);
            expect(folder1.children.length).toBe(3);
            expect(folder1.systemLabeledChildren.length).toBe(2);

            // non system labeled childe is removed
            folder1.removeChild(bizIO1.id);
            expect(folder1.children.length).toBe(2);
            expect(folder1.systemLabeledChildren.length).toBe(2);

            // system labeled childe is not removed
            folder1.removeChild(bizIO2.id);
            expect(folder1.children.length).toBe(2);
            expect(folder1.systemLabeledChildren.length).toBe(2);

            // with enforcing
            folder1.removeChild(bizIO2.id, true);
            expect(folder1.children.length).toBe(1);
            expect(folder1.systemLabeledChildren.length).toBe(1);

            // with enforcing
            folder1.removeChild(bizIO3.id, true);
            expect(folder1.children.length).toBe(0);
            expect(folder1.systemLabeledChildren.length).toBe(0);
        });

        test('removing system labeled is not allowed in default', () => {
            expect(systemRequiredRoot.selectChildBySystemName('2')).toBe(
                systemRequiredCollectionO1
            );
            systemRequiredRoot.removeChild(systemRequiredCollectionO1.id);
            expect(systemRequiredRoot.selectChildBySystemName('2')).toBe(
                systemRequiredCollectionO1
            );
        });

        test('removing system labeled is allowed with enforcing', () => {
            expect(systemRequiredRoot.selectChildBySystemName('2')).toBe(
                systemRequiredCollectionO1
            );

            systemRequiredRoot.removeChild(systemRequiredCollectionO1.id, true);

            expect(
                systemRequiredRoot.selectChildBySystemName('2')
            ).toBeUndefined();
        });
    });

    describe('exportAsTable', () => {
        describe('hasOwnValue: false', () => {
            test('exportWithChildren: false', () => {
                const layer1 = new CollectionBizIO({
                    timetable,
                    db,
                    hyperMG,
                    name: 'layer1',
                    exportWithChildren: false,
                });
                expect(layer1.exportAsTable()).toEqual([]);
            });

            test('exportWithChildren: true', () => {
                const layer1 = new CollectionBizIO({
                    timetable,
                    db,
                    hyperMG,
                    name: 'layer1',
                    exportWithChildren: true,
                });
                expect(layer1.exportAsTable()).toEqual([]);
            });
        });

        describe('summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT', () => {
            test('exportWithChildren: false', () => {
                const layer1 = new CollectionBizIO({
                    timetable,
                    db,
                    hyperMG,
                    name: 'layer1',
                    exportWithChildren: false,
                    summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                });
                expect(layer1.exportAsTable()).toEqual([
                    [
                        'layer1',
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
            });

            test('exportWithChildren: true', () => {
                const layer1 = new CollectionBizIO({
                    timetable,
                    db,
                    hyperMG,
                    name: 'layer1',
                    exportWithChildren: true,
                    summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                });
                expect(layer1.exportAsTable()).toEqual([
                    [
                        'layer1',
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
            });
        });
    });

    test('childrenWithSystemLabeledFlag', () => {
        expect(systemRequiredRoot.exposedChildrenWithSystemLabeledFlag).toEqual(
            [
                { bizIO: systemRequiredBizIO1, systemLabeled: true },
                { bizIO: systemRequiredCollectionO1, systemLabeled: true },
            ]
        );
    });
});
