import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import { AmountBizIO, MonetaryBizIO } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { CollectionBizIO, CollectionSummarizeMode } from './CollectionBizIO';

describe('CollectionBizIO: summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let simpleCategory1: CollectionBizIO;
    let simpleCategory2: CollectionBizIO;
    let simpleCategory3: CollectionBizIO;
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

        // for simple tests
        simpleCategory1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        simpleCategory2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'TEST_CATEGORY_ID',
            name: 'TEST_CATEGORY_NAME',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        simpleCategory3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'TEST_CATEGORY_ID_2',
            name: 'TEST_CATEGORY_NAME',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });

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

    describe('init', () => {
        test('default', () => {
            expect(simpleCategory1.timetable).toBe(timetable);
            expect(simpleCategory1.id).not.toBeUndefined();
            expect(simpleCategory1.name).toEqual('CollectionBizIO');
            expect(simpleCategory1.summarizeMode).toEqual(
                CollectionSummarizeMode.TOTAL_AMOUNT
            );
            expect(simpleCategory1.children).toEqual([]);
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ]);
        });

        test('with param', () => {
            // MonetaryBizIO 共通
            expect(simpleCategory2.timetable).toBe(timetable);
            expect(simpleCategory2.id).toEqual('TEST_CATEGORY_ID');
            expect(simpleCategory2.name).toEqual('TEST_CATEGORY_NAME');

            //  Category 固有
            expect(simpleCategory2.summarizeMode).toEqual(
                CollectionSummarizeMode.TOTAL_AMOUNT
            );
            expect(simpleCategory2.children).toEqual([]);
            expect(simpleCategory2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal(0)),
                new BizValue(new Date(2020, 2, 1), new Decimal(0)),
                new BizValue(new Date(2020, 3, 1), new Decimal(0)),
            ]);
        });
    });

    describe('validateToAddChild', () => {
        test('正常系', () => {
            // 対象なしの場合は「成功」
            expect(
                category1.db.validateToAddChild(
                    new CollectionBizIO({
                        timetable,
                        db,
                        hyperMG,
                        summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                        exportWithChildren: true,
                    }),
                    category1
                )
            ).toBeTruthy();

            // 典型的な正常系
            expect(
                category1.db.validateToAddChild(bizIO5, category1)
            ).toBeTruthy();

            // 子孫関係を指定する(Addする親そのものは循環参照になるのでNG)
            expect(
                category1.db.validateToAddChild(bizIO5, category2)
            ).toBeTruthy();

            // 循環参照しないAliasCategoryを指定する
            expect(
                category1.db.validateToAddChild(aliasCategory6, category1)
            ).toBeTruthy();
        });

        test('異常系', () => {
            // 典型的な循環参照
            // 同一BizIOを参照する
            expect(
                category1.db.validateToAddChild(category1, category1)
            ).toBeFalsy();

            // 遠い循環参照
            const category = new CollectionBizIO({
                timetable,
                db,
                hyperMG,
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                exportWithChildren: true,
                initData: [category1],
            });
            expect(
                category1.db.validateToAddChild(category, category1)
            ).toBeFalsy();
        });
    });

    describe('appendChildren', () => {
        test('common', () => {
            const simpleBizIO2 = new MonetaryBizIO({
                timetable,
                db,
                name: 'simple_biz_2',
            });
            simpleBizIO2.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
            ]);

            // 子要素の確認
            expect(simpleBizIO.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleBizIO2.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10')),
                new BizValue(new Date(2020, 3, 1), new Decimal('10')),
            ]);

            // 設定前のCategoryの確認
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
            expect(simpleCategory1.children.length).toBe(0);

            // 設定
            const result = simpleCategory1.appendChildren([
                simpleBizIO,
                simpleBizIO2,
            ]);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();

            expect(result.length).toBe(2);
            expect(result[0]?.name).toEqual('simple_biz');
            expect(result[1]?.name).toEqual('simple_biz_2');

            // 設定後のCategoryの確認
            expect(simpleCategory1.children.length).toBe(2);
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('10')),
                new BizValue(new Date(2020, 2, 1), new Decimal('20.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('30.2')),
            ]);
        });

        test('with cyclic reference', () => {
            // 設定 w/ 自己参照
            const result = simpleCategory1.appendChildren([
                simpleCategory1,
                simpleBizIO,
            ]);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();

            expect(result.length).toBe(2);
            expect(result[0]).toBeUndefined();
            expect(result[1]?.name).toEqual('simple_biz');

            // 設定後のCategoryの確認
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleCategory1.children.length).toBe(1);
        });
    });

    describe('appendChild', () => {
        test('common', () => {
            // 設定
            const result = simpleCategory1.appendChild(simpleBizIO);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(result?.name).toEqual('simple_biz');

            // 設定後のCategoryの確認
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleCategory1.children.length).toBe(1);
        });

        test('same id is not allowed', () => {
            // 設定
            let result = simpleCategory1.appendChild(simpleBizIO);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(result?.name).toEqual('simple_biz');

            // 設定後のCategoryの確認
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleCategory1.children.length).toBe(1);

            // 同一BizID
            const simpleBizIO2 = new MonetaryBizIO({
                timetable,
                db,
                name: 'simple_biz_2',
                bizIOId: 'simple_biz_io_1',
            });
            simpleBizIO2.setHistory([
                new BizValue(new Date(2020, 2, 1), new Decimal('100.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('200.2')),
            ]);

            // 更新せず undefined になる
            result = simpleCategory1.appendChild(simpleBizIO2);
            expect(result).toBeUndefined();
        });

        test('循環参照はNG', () => {
            expect(
                simpleCategory1.appendChild(
                    new CollectionBizIO({
                        timetable,
                        db,
                        hyperMG,
                        name: 'error_alias_category',
                        summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                        exportWithChildren: true,
                        initData: [simpleCategory1],
                    })
                )
            ).toBeUndefined();
        });
    });

    describe('removeChild', () => {
        test('common', () => {
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
            // 設定
            simpleCategory1.appendChild(simpleBizIO);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleCategory1.children.length).toBe(1);

            // 削除（該当IDなし時には Category に変更がない）
            simpleCategory1.removeChild('NOT_EXISTED_ID');
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
                new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
            ]);
            expect(simpleCategory1.children.length).toBe(1);

            // 削除（該当IDが存在）
            simpleCategory1.removeChild(simpleBizIO.id);
            simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
            expect(simpleCategory1.children.length).toBe(0);
        });
    });

    describe('Folder独特への設定禁止', () => {
        test('set をサポートしない', () => {
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
            simpleCategory1.set(
                new BizValue(new Date(2020, 1, 1), new Decimal(123))
            );
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });

        test('setHistory をサポートしない', () => {
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
            simpleCategory1.setHistory([
                new BizValue(new Date(2020, 1, 1), new Decimal(123)),
            ]);
            expect(simpleCategory1.timetableHistory).toEqual([
                new BizValue(new Date(2020, 1, 1), new Decimal('0')),
                new BizValue(new Date(2020, 2, 1), new Decimal('0')),
                new BizValue(new Date(2020, 3, 1), new Decimal('0')),
            ]);
        });
    });

    describe('exportAsTable', () => {
        test('common', () => {
            simpleCategory2.appendChild(simpleBizIO);
            simpleCategory2.prepareAndUpdateFullCollectionsForAllTerms();

            expect(
                simpleCategory2.exportAsTable({
                    nameCol: true,
                    idCol: true,
                    termRow: false,
                })
            ).toEqual([
                [
                    'simple_biz_io_1',
                    'TEST_CATEGORY_NAME:simple_biz',
                    new Decimal('0'),
                    new Decimal('10.1'),
                    new Decimal('20.2'),
                ],
                [
                    'TEST_CATEGORY_ID',
                    'TEST_CATEGORY_NAME',
                    new Decimal('0'),
                    new Decimal('10.1'),
                    new Decimal('20.2'),
                ],
            ]);
        });

        test('large records', () => {
            timetable.length = 10;

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
            category1.prepareAndUpdateFullCollectionsForAllTerms();

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

            expect(
                category1.exportAsTable({
                    nameCol: true,
                    idCol: false,
                    termRow: false,
                })
            ).toEqual(expected);
        });
    });
    test('Alias BizIOの対象の値を変更すると追従する', () => {
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
        timetable.length = 10;
        bizIO5.setValue(new Date(2020, 1, 1), new Decimal('100'));
        category1.prepareAndUpdateFullCollectionsForAllTerms();

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
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
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
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
            ],
            [
                'category_1:category_2:category_3',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('20.2'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('60.6'),
            ],
            [
                'category_1:category_2',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('210.1'),
                new Decimal('220.2'),
                new Decimal('40.4'),
                new Decimal('60.6'),
                new Decimal('60.6'),
                new Decimal('70.7'),
                new Decimal('80.8'),
                new Decimal('101'),
            ],
            [
                'category_1:alias_category_4',
                new Decimal('210.1'),
                new Decimal('220.2'),
                new Decimal('230.3'),
                new Decimal('240.4'),
                new Decimal('60.6'),
                new Decimal('90.9'),
                new Decimal('101'),
                new Decimal('111.1'),
                new Decimal('121.2'),
                new Decimal('141.4'),
            ],
            [
                'category_1',
                new Decimal('420.2'),
                new Decimal('440.4'),
                new Decimal('460.6'),
                new Decimal('480.8'),
                new Decimal('121.2'),
                new Decimal('181.8'),
                new Decimal('202'),
                new Decimal('222.2'),
                new Decimal('242.4'),
                new Decimal('282.8'),
            ],
        ];

        expect(
            category1.exportAsTable({
                nameCol: true,
                idCol: false,
                termRow: false,
            })
        ).toEqual(expected);
    });

    test('カテゴリの中にカテゴリを追加して追従する', () => {
        timetable.length = 10;
        const alias1 = category1.appendChild(
            new CollectionBizIO({
                timetable,
                db,
                hyperMG,
                name: 'ALIAS_TEST_1',
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                exportWithChildren: false,
                initData: [category3],
            })
        );
        expect(alias1).not.toBeUndefined();
        const alias2 = category1.appendChild(
            new CollectionBizIO({
                timetable,
                db,
                hyperMG,
                name: 'ALIAS_OF_ALIAS',
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                exportWithChildren: false,
                initData: [alias1],
            })
        );
        expect(alias2).not.toBeUndefined();
        category1.prepareAndUpdateFullCollectionsForAllTerms();

        let expected = [
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
                'category_1:ALIAS_TEST_1',
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
                'category_1:ALIAS_OF_ALIAS',
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
                'category_1',
                new Decimal('20.2'),
                new Decimal('40.4'),
                new Decimal('60.6'),
                new Decimal('80.8'),
                new Decimal('161.6'),
                new Decimal('262.6'),
                new Decimal('282.8'),
                new Decimal('303'),
                new Decimal('323.2'),
                new Decimal('404'),
            ],
        ];

        expect(
            category1.exportAsTable({
                nameCol: true,
                idCol: false,
                termRow: false,
            })
        ).toEqual(expected);

        // 更新する
        bizIO5.setValue(new Date(2020, 1, 1), new Decimal('100'));
        category1.prepareAndUpdateFullCollectionsForAllTerms();
        expected = [
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
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
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
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('100'),
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('20.2'),
                new Decimal('30.3'),
            ],
            [
                'category_1:category_2:category_3',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('20.2'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('60.6'),
            ],
            [
                'category_1:category_2',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('210.1'),
                new Decimal('220.2'),
                new Decimal('40.4'),
                new Decimal('60.6'),
                new Decimal('60.6'),
                new Decimal('70.7'),
                new Decimal('80.8'),
                new Decimal('101'),
            ],
            [
                'category_1:alias_category_4',
                new Decimal('210.1'),
                new Decimal('220.2'),
                new Decimal('230.3'),
                new Decimal('240.4'),
                new Decimal('60.6'),
                new Decimal('90.9'),
                new Decimal('101'),
                new Decimal('111.1'),
                new Decimal('121.2'),
                new Decimal('141.4'),
            ],
            [
                'category_1:ALIAS_TEST_1',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('20.2'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('60.6'),
            ],
            [
                'category_1:ALIAS_OF_ALIAS',
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('200'),
                new Decimal('20.2'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('40.4'),
                new Decimal('60.6'),
            ],
            [
                'category_1',
                new Decimal('820.2'),
                new Decimal('840.4'),
                new Decimal('860.6'),
                new Decimal('880.8'),
                new Decimal('161.6'),
                new Decimal('262.6'),
                new Decimal('282.8'),
                new Decimal('303'),
                new Decimal('323.2'),
                new Decimal('404'),
            ],
        ];

        expect(
            category1.exportAsTable({
                nameCol: true,
                idCol: false,
                termRow: false,
            })
        ).toEqual(expected);
    });

    test('category を alias のように利用する', () => {
        timetable.length = 10;
        const aliasTest = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'ALIAS_TEST',
            exportWithChildren: false,
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
        });
        aliasTest.appendChild(category2);
        aliasTest.appendChild(bizIO1);
        aliasTest.appendChild(bizIO2);
        aliasTest.prepareAndUpdateFullCollectionsForAllTerms();
        expect(
            aliasTest.exportAsTable({
                nameCol: true,
                idCol: false,
                termRow: false,
            })
        ).toEqual([
            [
                'ALIAS_TEST',
                new Decimal('10.1'),
                new Decimal('20.2'),
                new Decimal('30.3'),
                new Decimal('40.4'),
                new Decimal('60.6'),
                new Decimal('90.9'),
                new Decimal('101.0'),
                new Decimal('111.1'),
                new Decimal('121.2'),
                new Decimal('141.4'),
            ],
        ]);
    });

    test('循環参照を無視する', () => {
        const categoryL1 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'category_1',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        const categoryL2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'category_2',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        const categoryL3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'category_3',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        const categoryL4 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            bizIOId: 'category_4',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        categoryL1.appendChild(categoryL2);
        categoryL2.appendChild(categoryL3);
        categoryL3.appendChild(categoryL4);

        expect(categoryL4.appendChild(category1)).toBeUndefined();
    });

    test('autoUpdateDependencies', () => {
        // db auto_update_dependencies を切る
        simpleCategory1.db.autoUpdateDependencies = false;
        const testCategory = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'test_category',
            bizIOId: 'test_category_id',
            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            exportWithChildren: true,
        });
        testCategory.appendChild(simpleBizIO);

        // append後 & auto=True前 のCategoryの確認
        simpleCategory1.appendChild(testCategory);
        expect(simpleCategory1.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal(0)),
            new BizValue(new Date(2020, 2, 1), new Decimal(0)),
            new BizValue(new Date(2020, 3, 1), new Decimal(0)),
        ]);

        // db auto_update_dependencies を有効にする
        simpleCategory1.db.autoUpdateDependencies = true;
        simpleCategory1.prepareAndUpdateFullCollectionsForAllTerms();

        // 設定後のCategoryの確認
        expect(simpleCategory1.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal('0')),
            new BizValue(new Date(2020, 2, 1), new Decimal('10.1')),
            new BizValue(new Date(2020, 3, 1), new Decimal('20.2')),
        ]);
    });

    test('idLabeledNames', () => {
        expect(category1.idLabeledNames.getAllLabels()).toEqual([
            'bizio_1',
            'bizio_2',
            'category_2',
            'alias_category_4',
        ]);
    });

    test('selectChildByName', () => {
        // 存在する
        expect(category1.selectChildByName('alias_category_4')?.name).toEqual(
            'alias_category_4'
        );

        // 存在しない
        expect(category1.selectChildByName('NOT_EXISTED_NAME')).toBeUndefined();

        // 子ではない（祖父以上・孫以下）
        expect(category1.selectChildByName('category_3')).toBeUndefined();
        expect(category1.selectChildByName('category_1')).toBeUndefined();
    });

    test('name change of child', () => {
        const bizIO = category1.selectChildByName('category_2');
        bizIO?.setName('CATEGORY_2');

        expect(category1.selectChildByName('category_2')).toBeUndefined();
        expect(category1.selectChildByName('CATEGORY_2')).not.toBeUndefined();
    });

    test('addSeedMonetaryIO and uniqueByName', () => {
        // = case: uniqueByName: false =
        // 初期
        expect(simpleCategory1.children.length).toBe(0);
        let bizIO = simpleCategory1.addSeedMonetaryIO('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(bizIO instanceof MonetaryBizIO).toBeTruthy();
        expect(simpleCategory1.children.length).toBe(1);

        // = case: uniqueByName: true =
        expect(simpleCategory2.children.length).toBe(0);
        bizIO = simpleCategory2.addSeedMonetaryIO('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(simpleCategory2.children.length).toBe(1);

        // uniqueByName: true => 同じ「名称」はNG
        bizIO = simpleCategory2.addSeedMonetaryIO('TEST');
        expect(bizIO).toBeUndefined();
        expect(simpleCategory2.children.length).toBe(1);
    });

    test('addSeedAmountIO and uniqueByName', () => {
        // = case: uniqueByName: false =
        // 初期
        expect(simpleCategory1.children.length).toBe(0);
        let bizIO = simpleCategory1.addSeedAmountIO('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(bizIO instanceof AmountBizIO).toBeTruthy();
        expect(simpleCategory1.children.length).toBe(1);

        // = case: uniqueByName: true =
        expect(simpleCategory2.children.length).toBe(0);
        bizIO = simpleCategory2.addSeedAmountIO('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(simpleCategory2.children.length).toBe(1);

        // uniqueByName: true => 同じ「名称」はNG
        bizIO = simpleCategory2.addSeedAmountIO('TEST');
        expect(bizIO).toBeUndefined();
        expect(simpleCategory2.children.length).toBe(1);
    });

    test('addSeedCategory & uniqueByName & allowSubcategory', () => {
        // = case: uniqueByName: false =
        // 初期
        expect(simpleCategory1.children.length).toBe(0);
        let bizIO = simpleCategory1.addSeedCategory('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(bizIO instanceof CollectionBizIO).toBeTruthy();
        expect(simpleCategory1.children.length).toBe(1);

        // = case: uniqueByName: true =
        expect(simpleCategory3.children.length).toBe(0);
        bizIO = simpleCategory3.addSeedCategory('TEST');
        expect(bizIO?.name).toEqual('TEST');
        expect(simpleCategory3.children.length).toBe(1);

        // uniqueByName: true => 同じ「名称」はNG
        bizIO = simpleCategory3.addSeedCategory('TEST');
        expect(bizIO).toBeUndefined();
        expect(simpleCategory3.children.length).toBe(1);
    });
});
