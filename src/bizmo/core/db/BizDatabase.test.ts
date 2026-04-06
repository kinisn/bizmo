import Decimal from 'decimal.js';
import { CollectionBizIO } from '../bizIO/collection/CollectionBizIO';
import { MonetaryBizIO } from '../bizIO/single/BizIOs';
import { BizValue } from '../bizIO/value/BizValue';
import { HyperParamManager } from '../hyperParam/HyperParamManager';
import { Timetable } from '../util/Timetable';
import { BizDatabase } from './BizDatabase';

describe('BizDatabase のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let dbDefault: BizDatabase;
    let dbSameCategory1: BizDatabase;
    let category1: CollectionBizIO;
    let category2: CollectionBizIO;
    let category3: CollectionBizIO;
    let aliasCategory4: CollectionBizIO;
    let category5: CollectionBizIO;
    let aliasCategory6: CollectionBizIO;
    let bizio1: MonetaryBizIO;
    let bizio2: MonetaryBizIO;
    let bizio3: MonetaryBizIO;
    let bizio4: MonetaryBizIO;
    let bizio5: MonetaryBizIO;
    let bizio6: MonetaryBizIO;
    let existedIdList: Array<string>;

    beforeEach(() => {
        /**
        # for complex tests
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
        });
        category2 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_2',
            bizIOId: 'category_2',
        });
        category3 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_3',
            bizIOId: 'category_3',
        });
        category5 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'category_5',
            bizIOId: 'category_5',
        });
        bizio1 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_1',
            bizIOId: 'bizio_1',
        });
        bizio2 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_2',
            bizIOId: 'bizio_2',
        });
        bizio3 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_3',
            bizIOId: 'bizio_3',
        });
        bizio4 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_4',
            bizIOId: 'bizio_4',
        });
        bizio5 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_5',
            bizIOId: 'bizio_5',
        });
        bizio6 = new MonetaryBizIO({
            timetable,
            db: db,
            name: 'bizio_6',
            bizIOId: 'bizio_6',
        });

        category1.appendChild(bizio1);
        category1.appendChild(bizio2);
        category1.appendChild(category2);
        category2.appendChild(bizio3);
        category2.appendChild(bizio4);
        category2.appendChild(category3);
        category3.appendChild(bizio5);

        aliasCategory4 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'alias_category_4',
            bizIOId: 'alias_category_4',
            exportWithChildren: false,
            initData: [category2, bizio1, bizio2],
        });
        category1.appendChild(aliasCategory4);

        category3.appendChild(category5);
        category5.appendChild(bizio6);

        aliasCategory6 = new CollectionBizIO({
            timetable,
            db,
            hyperMG,
            name: 'alias_category_6',
            bizIOId: 'alias_category_6',
            exportWithChildren: false,
            initData: [bizio5, bizio6],
        });
        category3.appendChild(aliasCategory6);

        //
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

        // db only test
        dbDefault = new BizDatabase();
        dbSameCategory1 = new BizDatabase({
            graph: category1.db.graph,
            journal: category1.db.journal,
        });
        existedIdList = [
            'category_1',
            'category_2',
            'category_3',
            'category_5',
            'bizio_1',
            'bizio_2',
            'bizio_3',
            'bizio_4',
            'bizio_5',
            'bizio_6',
            'alias_category_4',
            'alias_category_6',
        ];
    });

    describe('init & graph', () => {
        test('test_default_db_same_db_reference', () => {
            expect(category1.db.graph).toBe(dbSameCategory1.graph);
        });

        test('test_replace_graph', () => {
            expect(category1.db.graph).not.toEqual(dbDefault.graph);
        });
    });

    describe('read', () => {
        test('test_is_included', () => {
            // not included
            expect(dbSameCategory1.isIncluded('NOT_EXISTED_ID')).toBeFalsy();
            // included
            existedIdList.forEach((expectedId) => {
                expect(dbSameCategory1.isIncluded(expectedId)).toBeTruthy();
                expect(category2.db.isIncluded(expectedId)).toBeTruthy();
                expect(category3.db.isIncluded(expectedId)).toBeTruthy();
                expect(category5.db.isIncluded(expectedId)).toBeTruthy();
                expect(aliasCategory4.db.isIncluded(expectedId)).toBeTruthy();
                expect(aliasCategory6.db.isIncluded(expectedId)).toBeTruthy();
            });
        });

        test('test_children_included_id', () => {
            const expectedData = new Map<string, Array<string>>([
                [
                    'category_1',
                    ['bizio_1', 'bizio_2', 'category_2', 'alias_category_4'],
                ],
                ['category_2', ['bizio_3', 'bizio_4', 'category_3']],
                ['category_3', ['bizio_5', 'category_5', 'alias_category_6']],
                ['category_5', ['bizio_6']],
                ['alias_category_4', ['category_2', 'bizio_1', 'bizio_2']],
                ['alias_category_6', ['bizio_5', 'bizio_6']],
            ]);
            Array.from(expectedData.keys()).forEach((parentId) => {
                const test = dbSameCategory1
                    .childrenOf(parentId)
                    .map((bizIO) => bizIO.id);
                expect(test).toEqual(expectedData.get(parentId));
            });
        });

        test('test_children_not_included_id', () => {
            const test = dbSameCategory1
                .childrenOf('NOT_EXISTED_ID')
                .map((bizIO) => bizIO.id);
            expect(test).toEqual([]);
        });

        test('test_parents_of', () => {
            /**
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

            const expectedData = new Map<string, Array<string>>([
                ['bizio_1', ['category_1', 'alias_category_4']],
                ['bizio_2', ['category_1', 'alias_category_4']],
                ['bizio_3', ['category_2']],
                ['bizio_4', ['category_2']],
                ['bizio_5', ['category_3', 'alias_category_6']],
                ['bizio_6', ['category_5', 'alias_category_6']],
                ['category_1', []],
                ['category_2', ['category_1', 'alias_category_4']],
                ['category_3', ['category_2']],
                ['category_5', ['category_3']],
                ['alias_category_4', ['category_1']],
                ['alias_category_6', ['category_3']],
            ]);
            Array.from(expectedData.keys()).forEach((parentId) => {
                const test = dbSameCategory1
                    .parentsOf(parentId)
                    .map((bizIO) => bizIO.id);
                expect(test).toEqual(expectedData.get(parentId));
            });
        });

        describe('test_select_by_id', () => {
            test('existed', () => {
                existedIdList.forEach((expectedId) => {
                    expect(
                        dbSameCategory1.selectById(expectedId)
                    ).not.toBeUndefined();
                    expect(dbSameCategory1.selectById(expectedId)!.id).toBe(
                        expectedId
                    );
                });
            });

            test('id not included', () => {
                expect(
                    dbSameCategory1.selectById('NOT_EXISTED_ID')
                ).toBeUndefined();
            });

            test('complex', () => {
                /**
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
                 */
                expect(category1.db.selectById(bizio1.id)?.name).toBe(
                    'bizio_1'
                );
                expect(category1.db.selectById(bizio2.id)?.name).toBe(
                    'bizio_2'
                );
                expect(category1.db.selectById(bizio3.id)?.name).toBe(
                    'bizio_3'
                );
                expect(category1.db.selectById(bizio4.id)?.name).toBe(
                    'bizio_4'
                );
                expect(category1.db.selectById(bizio5.id)?.name).toBe(
                    'bizio_5'
                );
                expect(category1.db.selectById(bizio6.id)?.name).toBe(
                    'bizio_6'
                );
                expect(category1.db.selectById(category1.id)?.name).toBe(
                    'category_1'
                );
                expect(category1.db.selectById(category2.id)?.name).toBe(
                    'category_2'
                );
                expect(category1.db.selectById(category3.id)?.name).toBe(
                    'category_3'
                );

                expect(category1.db.selectById(aliasCategory4.id)?.name).toBe(
                    'alias_category_4'
                );
                expect(category1.db.selectById(category5.id)?.name).toBe(
                    'category_5'
                );
                expect(category1.db.selectById(aliasCategory6.id)?.name).toBe(
                    'alias_category_6'
                );

                expect(
                    category1.db.selectById('NOT_EXISTED_ID')
                ).toBeUndefined();
            });
        });

        describe('resolveHierarchy', () => {
            test('親子関係', () => {
                const result1 = db.resolveHierarchy(category2, bizio3);
                expect(result1).toEqual([category2, bizio3]);
            });

            test('親孫関係', () => {
                const result2 = db.resolveHierarchy(category1, bizio6);
                expect(result2).toEqual([
                    category1,
                    category2,
                    category3,
                    category5,
                    bizio6,
                ]);
            });

            test('親子関係なし', () => {
                expect(db.resolveHierarchy(category2, bizio1)).toBeUndefined();
            });
        });
    });

    describe('insert', () => {
        test('test_insert_update_delete_without_cyclic_reference', () => {
            const testId = 'test_id';

            // initial status is none
            expect(dbDefault.isIncluded(testId)).toBeFalsy();

            // insert: Bizio
            dbDefault.insert(
                new MonetaryBizIO({
                    timetable: timetable,
                    db: dbDefault,
                    bizIOId: testId,
                    name: 'TEST_1',
                })
            );
            expect(dbDefault.isIncluded(testId)).toBeTruthy();
            expect(dbDefault.selectById(testId)?.name).toBe('TEST_1');
            expect(dbDefault.graph.allNodes.length).toBe(1);
            expect(dbDefault.graph.allEdges.length).toBe(0);

            // To update(replace) with other instance: Category is not allowed
            dbDefault.insert(
                new CollectionBizIO({
                    timetable: timetable,
                    db: dbDefault,
                    hyperMG,
                    bizIOId: testId,
                    name: 'TEST_2',
                })
            );

            expect(dbDefault.selectById(testId)?.name).toBe('TEST_1');
            expect(dbDefault.graph.allNodes.length).toBe(1);
            expect(dbDefault.graph.allEdges.length).toBe(0);

            // update internally
            let bizIO = new MonetaryBizIO({
                timetable: timetable,
                db: dbDefault,
                bizIOId: testId,
                name: 'TEST_3',
            });
            dbDefault.insert(bizIO);
            expect(dbDefault.selectById(testId)?.name).toBe('TEST_1');

            bizIO = dbDefault.selectById(testId)!;
            bizIO.setName('TEST_4');
            expect(dbDefault.selectById(testId)?.name).toBe('TEST_4');
            expect(dbDefault.graph.allNodes.length).toBe(1);
            expect(dbDefault.graph.allEdges.length).toBe(0);

            // insert category with data
            const category01 = new CollectionBizIO({
                timetable,
                db: dbDefault,
                hyperMG,
                bizIOId: 'test_id_2',
                name: 'category_1',
            });
            category01.appendChild(
                new MonetaryBizIO({
                    timetable,
                    db: dbDefault,
                    bizIOId: 'biz_1',
                    name: 'biz_1',
                })
            );
            category01.appendChild(
                new MonetaryBizIO({
                    timetable,
                    db: dbDefault,
                    bizIOId: 'biz_2',
                    name: 'biz_2',
                })
            );
            dbDefault.insert(category01);
            expect(dbDefault.graph.allNodes.length).toBe(4);
            expect(dbDefault.graph.allEdges.length).toBe(2);

            // update internally: add children
            category01.appendChild(
                new MonetaryBizIO({
                    timetable,
                    db: dbDefault,
                    bizIOId: 'biz_3',
                    name: 'biz_3',
                })
            );
            expect(dbDefault.graph.allNodes.length).toBe(5);
            expect(dbDefault.graph.allEdges.length).toBe(3);

            // delete internally: remove children use db.delete_edge_on
            category01.removeChild('biz_3');
            expect(dbDefault.graph.allNodes.length).toBe(5);
            expect(dbDefault.graph.allEdges.length).toBe(2);

            // delete: removed children
            dbDefault.delete('biz_3');
            expect(dbDefault.graph.allNodes.length).toBe(4);
            expect(dbDefault.graph.allEdges.length).toBe(2);

            // delete with not existed id
            dbDefault.delete('NOT_EXITED_ID');
            expect(dbDefault.graph.allNodes.length).toBe(4);
            expect(dbDefault.graph.allEdges.length).toBe(2);

            // delete with existed id: remove all related edges
            dbDefault.delete('test_id_2');
            expect(dbDefault.graph.allNodes.length).toBe(3);
            expect(dbDefault.graph.allEdges.length).toBe(0);
        });
    });
});
