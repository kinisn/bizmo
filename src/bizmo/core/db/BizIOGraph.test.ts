import { CollectionBizIO } from '../bizIO/collection/CollectionBizIO';
import { BizIO } from '../bizIO/single/BizIOs';
import { HyperParamManager } from '../hyperParam/HyperParamManager';
import { Timetable } from '../util/Timetable';
import { BizDatabase } from './BizDatabase';
import { BizGraphEdge } from './BizGraphEdge';
import { BizIOGraph } from './BizIOGraph';

describe('BizIOGraph のテスト', () => {
    const timetable = new Timetable();
    const db = new BizDatabase();
    const hyperMG = new HyperParamManager();
    const core = { timetable, db, hyperMG };

    const bizIOId1 = 'bizIOId1';
    const bizIOId2 = 'bizIOId2';
    const bizIOId3 = 'bizIOId3';
    const bizIOId4 = 'bizIOId4';
    const bizIOId5 = 'bizIOId5';
    const bizIOId6 = 'bizIOId6';
    const bizIOId7 = 'bizIOId7';
    const bizIOId8 = 'bizIOId8';
    const bizIOId9 = 'bizIOId9';
    const bizIO1 = new BizIO({
        bizIOId: bizIOId1,
        name: 'bizIO1',
        ...core,
    });
    const bizIO2 = new BizIO({
        bizIOId: bizIOId2,
        name: 'bizIO2',
        ...core,
    });
    const bizIO3 = new BizIO({
        bizIOId: bizIOId3,
        name: 'bizIO3',
        ...core,
    });
    const bizIO4 = new BizIO({
        bizIOId: bizIOId4,
        name: 'bizIO4',
        ...core,
    });
    const bizIO5 = new BizIO({
        bizIOId: bizIOId5,
        name: 'bizIO5',
        ...core,
    });
    const bizIO6 = new BizIO({
        bizIOId: bizIOId6,
        name: 'bizIO6',
        ...core,
    });
    const bizIO7 = new BizIO({
        bizIOId: bizIOId7,
        name: 'bizIO7',
        ...core,
    });
    const bizIO8 = new BizIO({
        bizIOId: bizIOId8,
        name: 'bizIO8',
        ...core,
    });
    const bizIO9 = new BizIO({
        bizIOId: bizIOId9,
        name: 'bizIO9',
        ...core,
    });

    let graph1: BizIOGraph<Object>;
    let graph2: BizIOGraph<Object>;
    let graph3: BizIOGraph<Object>;

    beforeEach(() => {
        // 初期テスト
        graph1 = new BizIOGraph<Object>();
        // データ保持
        // bizIO1(子) -> bizIO2 -> bizIO3(親)
        graph2 = new BizIOGraph<Object>();
        graph2.addNode(bizIOId1, bizIO1);
        graph2.addNode(bizIOId2, bizIO2);
        graph2.addNode(bizIOId3, bizIO3);
        graph2.addEdge(bizIOId1, bizIOId2);
        graph2.addEdge(bizIOId2, bizIOId3);

        graph3 = new BizIOGraph<Object>();
        graph3.addNode(bizIOId1, bizIO1);
        graph3.addNode(bizIOId2, bizIO2);
        graph3.addNode(bizIOId3, bizIO3);
        graph3.addNode(bizIOId4, bizIO4);
        graph3.addNode(bizIOId5, bizIO5);
        graph3.addNode(bizIOId6, bizIO6);
        graph3.addNode(bizIOId7, bizIO7);
        graph3.addNode(bizIOId8, bizIO8);
        graph3.addNode(bizIOId9, bizIO9);
    });

    test('init', () => {
        expect(graph1.allNodes).toEqual([]);
        expect(graph1.allEdges).toEqual([]);
        const result = graph1.topologicalSort();
        expect(result.isSuccess()).toBeTruthy();
        expect(result.value).toEqual([]);
    });

    test('hasNode', () => {
        // not existed
        expect(graph2.hasNode('NOT_EXISTED')).toBeFalsy();

        // existed
        expect(graph2.hasNode(bizIOId1)).toBeTruthy();
        expect(graph2.hasNode(bizIOId2)).toBeTruthy();
        expect(graph2.hasNode(bizIOId3)).toBeTruthy();
    });

    test('getNode & allNodes & allEdges', () => {
        // existed
        expect(graph2.getNode(bizIOId1)).toBe(bizIO1);
        expect(graph2.getNode(bizIOId2)).toBe(bizIO2);
        expect(graph2.getNode(bizIOId3)).toBe(bizIO3);
        expect(graph2.allNodes).toEqual([bizIO1, bizIO2, bizIO3]);
        expect(graph2.allEdges).toEqual([
            new BizGraphEdge(bizIOId1, bizIOId2).key,
            new BizGraphEdge(bizIOId2, bizIOId3).key,
        ]);

        // not existed
        expect(graph2.getNode('NOT_EXISTED')).toBeUndefined();
    });

    test('addNode & addEdge', () => {
        // insert node
        const result = graph2.topologicalSort();
        expect(result.isSuccess()).toBeTruthy();
        expect(result.value).toEqual([bizIOId1, bizIOId2, bizIOId3]);
        expect(graph2.getNode(bizIOId1)).toBe(bizIO1); // update target
        expect(graph2.allNodes).toEqual([bizIO1, bizIO2, bizIO3]);
        expect(graph2.allEdges).toEqual([
            new BizGraphEdge(bizIOId1, bizIOId2).key,
            new BizGraphEdge(bizIOId2, bizIOId3).key,
        ]);

        // update node
        graph2.addNode(
            bizIOId1,
            new BizIO({
                name: 'bizIO1_UPDATED',
                ...core,
            })
        );
        expect(graph2.getNode(bizIOId1)).not.toBe(
            new BizIO({
                name: 'bizIO1_UPDATED',
                ...core,
            })
        );
    });

    test('removeNode', () => {
        // not existed
        graph2.removeNode('NOT_EXISTED');
        expect(graph2.getNode(bizIOId1)).toBe(bizIO1);
        expect(graph2.getNode(bizIOId2)).toBe(bizIO2);
        expect(graph2.getNode(bizIOId3)).toBe(bizIO3);

        // existed: 関係ノードも自動的に削除
        graph2.removeNode(bizIOId1);
        expect(graph2.getNode(bizIOId2)).toBe(bizIO2);
        expect(graph2.getNode(bizIOId3)).toBe(bizIO3);
        expect(graph2.allNodes).toEqual([bizIO2, bizIO3]);
        expect(graph2.allEdges).toEqual([
            new BizGraphEdge(bizIOId2, bizIOId3).key,
        ]);
    });

    test('removeEdge', () => {
        // not existed
        graph2.removeEdge('NOT_EXISTED');
        expect(graph2.allNodes).toEqual([bizIO1, bizIO2, bizIO3]);
        expect(graph2.allEdges).toEqual([
            new BizGraphEdge(bizIOId1, bizIOId2).key,
            new BizGraphEdge(bizIOId2, bizIOId3).key,
        ]);

        // existed: 関係ノードも自動的に削除
        graph2.removeEdge(new BizGraphEdge(bizIOId1, bizIOId2).key);
        expect(graph2.allNodes).toEqual([bizIO1, bizIO2, bizIO3]);
        expect(graph2.allEdges).toEqual([
            new BizGraphEdge(bizIOId2, bizIOId3).key,
        ]);
    });

    test('successors', () => {
        // existed
        expect(graph2.successors(bizIOId1)).toEqual(new Set([bizIOId2]));
        expect(graph2.successors(bizIOId2)).toEqual(new Set([bizIOId3]));
        expect(graph2.successors(bizIOId3)).toEqual(new Set([]));

        // not existed
        expect(graph2.successors('NOT_EXISTED')).toEqual(new Set([]));
    });

    test('predecessors', () => {
        // existed
        expect(graph2.predecessors(bizIOId1)).toEqual(new Set([]));
        expect(graph2.predecessors(bizIOId2)).toEqual(new Set([bizIOId1]));
        expect(graph2.predecessors(bizIOId3)).toEqual(new Set([bizIOId2]));

        // not existed
        expect(graph2.predecessors('NOT_EXISTED')).toEqual(new Set([]));
    });

    describe('topologicalSort & isDirectedAcyclicGraph のテスト', () => {
        test('DAG', () => {
            /**
             * DAG
             *  5 ─── 2
             *   │    │ (3が2を参照)
             *   └─── 3 ─── 4 ─── 9 ─── 7
             *        └──── 1 ───┘ └─── 8
             *  6             (9が1を参照)
             */
            // あえて接続順をグチャグチャにしてテスト
            graph3.addEdge(bizIOId7, bizIOId9);
            graph3.addEdge(bizIOId2, bizIOId5);
            graph3.addEdge(bizIOId8, bizIOId9);
            graph3.addEdge(bizIOId3, bizIOId5);
            graph3.addEdge(bizIOId9, bizIOId4);
            graph3.addEdge(bizIOId4, bizIOId3);
            graph3.addEdge(bizIOId1, bizIOId3);
            graph3.addEdge(bizIOId2, bizIOId3); // 3が2を参照
            graph3.addEdge(bizIOId1, bizIOId9); // 9が1を参照

            const result = graph3.topologicalSort();
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toEqual([
                bizIOId8,
                bizIOId7,
                bizIOId6,
                bizIOId2,
                bizIOId1,
                bizIOId9,
                bizIOId4,
                bizIOId3,
                bizIOId5,
            ]);
            expect(graph3.isDirectedAcyclicGraph()).toBeTruthy();
        });

        test('not DAG 1', () => {
            /**
             * not DAG
             * 1 -> 2
             *   <-
             */
            graph1.addNode(bizIOId1, bizIO1);
            graph1.addNode(bizIOId2, bizIO2);
            graph1.addEdge(bizIOId1, bizIOId2);
            graph1.addEdge(bizIOId2, bizIOId1);

            expect(graph1.isDirectedAcyclicGraph()).toBeFalsy();
            const result = graph1.topologicalSort();
            expect(result.isSuccess()).toBeFalsy();
        });

        test('not DAG 2', () => {
            /**
             * not DAG
             * 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 1
             */
            graph3.addEdge(bizIOId1, bizIOId2);
            graph3.addEdge(bizIOId2, bizIOId3);
            graph3.addEdge(bizIOId3, bizIOId4);
            graph3.addEdge(bizIOId4, bizIOId5);
            graph3.addEdge(bizIOId5, bizIOId6);
            graph3.addEdge(bizIOId6, bizIOId7);
            graph3.addEdge(bizIOId7, bizIOId8);
            graph3.addEdge(bizIOId8, bizIOId9);
            graph3.addEdge(bizIOId9, bizIOId1);

            expect(graph3.isDirectedAcyclicGraph()).toBeFalsy();
            const result = graph3.topologicalSort();
            expect(result.isSuccess()).toBeFalsy();
        });

        test('DAG 2', () => {
            /*
            --------------------------------------------------
            bizIOId1
                bizIOId2
                    bizIOId3
                        bizIOId5
                        bizIOId6
                bizIOId4
                    bizIOId2
            --------------------------------------------------
            */
            graph1 = new BizIOGraph<Object>();
            graph1.addNode(bizIOId1, bizIO1);
            graph1.addNode(bizIOId2, bizIO2);
            graph1.addNode(bizIOId3, bizIO3);
            graph1.addNode(bizIOId4, bizIO4);
            graph1.addNode(bizIOId5, bizIO5);
            graph1.addNode(bizIOId6, bizIO6);

            // edge
            graph1.addEdge(bizIOId2, bizIOId1);
            graph1.addEdge(bizIOId4, bizIOId1);
            graph1.addEdge(bizIOId3, bizIOId2);
            graph1.addEdge(bizIOId5, bizIOId3);
            graph1.addEdge(bizIOId6, bizIOId3);
            graph1.addEdge(bizIOId2, bizIOId4);

            const result = graph1.topologicalSort();
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toEqual([
                bizIOId6,
                bizIOId5,
                bizIOId3,
                bizIOId2,
                bizIOId4,
                bizIOId1,
            ]);
            expect(graph1.isDirectedAcyclicGraph()).toBeTruthy();
        });

        test('DAG 3', () => {
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
                        AliasCategory: alias_category_6
                            refer to: bizio_5, bizio_6
                AliasCategory: alias_category_4
                    refer to: category_2, bizio_1, bizio_2
            --------------------------------------------------
            */

            const category1ID = 'category1ID';
            const category1 = new CollectionBizIO({
                bizIOId: category1ID,
                name: 'category_1',
                ...core,
            });

            const bizio1ID = 'bizio1ID';
            const bizio1 = new BizIO({
                bizIOId: bizio1ID,
                name: 'bizio_1',
                ...core,
            });
            const bizio2ID = 'bizio2ID';
            const bizio2 = new BizIO({
                bizIOId: bizio2ID,
                name: 'bizio_2',
                ...core,
            });
            const category2ID = 'category2ID';
            const category2 = new CollectionBizIO({
                bizIOId: category2ID,
                name: 'category_2',
                ...core,
            });

            const bizio3ID = 'bizio3ID';
            const bizio3 = new BizIO({
                bizIOId: bizio3ID,
                name: 'bizio_3',
                ...core,
            });
            const bizio4ID = 'bizio4ID';
            const bizio4 = new BizIO({
                bizIOId: bizio4ID,
                name: 'bizio_4',
                ...core,
            });
            const category3ID = 'category3ID';
            const category3 = new CollectionBizIO({
                bizIOId: category3ID,
                name: 'category_3',
                ...core,
            });

            const bizio5ID = 'bizio5ID';
            const bizio5 = new BizIO({
                bizIOId: bizio5ID,
                name: 'bizio_5',
                ...core,
            });
            const category5ID = 'category5ID';
            const category5 = new CollectionBizIO({
                bizIOId: category5ID,
                name: 'category_5',
                ...core,
            });

            const bizio6ID = 'bizio6ID';
            const bizio6 = new BizIO({
                bizIOId: bizio6ID,
                name: 'bizio_6',
                ...core,
            });
            const aliasCategory6ID = 'aliasCategory6ID';
            const aliasCategory6 = new CollectionBizIO({
                bizIOId: aliasCategory6ID,
                name: 'alias_category_6',
                ...core,
            });
            const aliasCategory4ID = 'aliasCategory4ID';
            const aliasCategory4 = new CollectionBizIO({
                bizIOId: aliasCategory4ID,
                name: 'alias_category_4',
                ...core,
            });

            // node
            graph1.addNode(category1ID, category1);
            graph1.addNode(bizio1ID, bizio1);
            graph1.addNode(bizio2ID, bizio2);
            graph1.addNode(category2ID, category2);
            graph1.addNode(bizio3ID, bizio3);
            graph1.addNode(bizio4ID, bizio4);
            graph1.addNode(category3ID, category3);
            graph1.addNode(category5ID, category5);
            graph1.addNode(bizio5ID, bizio5);
            graph1.addNode(bizio6ID, bizio6);
            graph1.addNode(aliasCategory6ID, aliasCategory6);
            graph1.addNode(aliasCategory4ID, aliasCategory4);

            // edge
            graph1.addEdge(bizio2ID, category1ID);
            graph1.addEdge(bizio1ID, category1ID);
            graph1.addEdge(category2ID, category1ID);
            graph1.addEdge(aliasCategory4ID, category1ID);
            graph1.addEdge(bizio2ID, aliasCategory4ID);
            graph1.addEdge(bizio1ID, aliasCategory4ID);
            graph1.addEdge(category2ID, aliasCategory4ID);
            graph1.addEdge(bizio3ID, category2ID);
            graph1.addEdge(bizio4ID, category2ID);
            graph1.addEdge(category3ID, category2ID);
            graph1.addEdge(category5ID, category3ID);
            graph1.addEdge(bizio5ID, category3ID);
            graph1.addEdge(aliasCategory6ID, category3ID);
            graph1.addEdge(bizio5ID, aliasCategory6ID);
            graph1.addEdge(bizio6ID, aliasCategory6ID);
            graph1.addEdge(bizio6ID, category5ID);

            const result = graph1.topologicalSort();
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toEqual([
                'bizio6ID',
                'bizio5ID',
                'aliasCategory6ID',
                'category5ID',
                'category3ID',
                'bizio4ID',
                'bizio3ID',
                'category2ID',
                'bizio2ID',
                'bizio1ID',
                'aliasCategory4ID',
                'category1ID',
            ]);
            expect(graph1.isDirectedAcyclicGraph()).toBeTruthy();
        });
    });
});
