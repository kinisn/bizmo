import { BizIOId } from '../bizIO/single/BizIOs';
import { BizGraphEdge, BizGraphEdgeKey } from './BizGraphEdge';
import { BizGraphNode } from './BizGraphNode';
import { TSortState } from './BizIOGraph';

class Testee {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    toObject(): any {
        return {};
    }
}

describe('BizGraphNode のテスト', () => {
    const nodeID1 = 'nodeId1';
    const nodeID2 = 'nodeId2';
    const nodeID3 = 'nodeId3';
    const nodeID4 = 'nodeId4';
    const nodeID5 = 'nodeId5';

    describe('初期化', () => {
        test('必須パラメータのみ', () => {
            const node1 = new BizGraphNode<Testee>({
                nodeId: 'nodeId1',
                node: new Testee('node1'),
            });
            expect(node1.nodeId).toEqual('nodeId1');
            expect(node1.tSortState).toEqual(TSortState.ReadyToSort);
            expect(node1.edgesFromThisTo).toEqual(new Set<BizIOId>());
            expect(node1.edgesToThisFrom).toEqual(new Set<BizIOId>());
            expect(node1.node).toEqual({
                name: 'node1',
            });
            expect(node1.relatedEdgeKeys).toEqual(new Set<BizGraphEdgeKey>());
        });

        test('全パラメータ', () => {
            const node1 = new BizGraphNode<Testee>({
                nodeId: 'nodeId1',
                node: new Testee('node1'),
                relatedEdgeKeys: new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ]),
            });
            expect(node1.nodeId).toEqual('nodeId1');
            expect(node1.tSortState).toEqual(TSortState.ReadyToSort);
            expect(node1.node).toEqual(new Testee('node1'));
            expect(node1.edgesFromThisTo).toEqual(new Set([nodeID2, nodeID3]));
            expect(node1.edgesToThisFrom).toEqual(new Set([nodeID4]));
            expect(node1.relatedEdgeKeys).toEqual(
                new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ])
            );
        });
    });

    describe('RelatedEdgeKey 操作', () => {
        test('add', () => {
            const node1 = new BizGraphNode<Testee>({
                nodeId: 'nodeId1',
                node: new Testee('node1'),
            });
            expect(node1.nodeId).toEqual('nodeId1');
            expect(node1.tSortState).toEqual(TSortState.ReadyToSort);
            expect(node1.edgesFromThisTo).toEqual(new Set<BizIOId>());
            expect(node1.edgesToThisFrom).toEqual(new Set<BizIOId>());
            expect(node1.node).toEqual(new Testee('node1'));
            expect(node1.relatedEdgeKeys).toEqual(new Set<BizGraphEdgeKey>());

            // 異常系 add
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID5, nodeID2).key); // 自分を含まないものは入らない
            expect(node1.relatedEdgeKeys).toEqual(new Set<BizGraphEdgeKey>());

            // 正常系 add
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID1, nodeID2).key);
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID1, nodeID2).key); // 同一Keyは無視される
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID1, nodeID3).key);
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID4, nodeID1).key);
            node1.addRelatedEdgeKey(new BizGraphEdge(nodeID4, nodeID1).key); // 同一Keyは無視される
            expect(node1.edgesFromThisTo).toEqual(new Set([nodeID2, nodeID3]));
            expect(node1.edgesToThisFrom).toEqual(new Set([nodeID4]));
            expect(node1.relatedEdgeKeys).toEqual(
                new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ])
            );
        });

        test('remove', () => {
            const node1 = new BizGraphNode<Testee>({
                nodeId: 'nodeId1',
                node: new Testee('node1'),
                relatedEdgeKeys: new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ]),
            });
            expect(node1.nodeId).toEqual('nodeId1');
            expect(node1.tSortState).toEqual(TSortState.ReadyToSort);
            expect(node1.node).toEqual(new Testee('node1'));
            expect(node1.edgesFromThisTo).toEqual(new Set([nodeID2, nodeID3]));
            expect(node1.edgesToThisFrom).toEqual(new Set([nodeID4]));
            expect(node1.relatedEdgeKeys).toEqual(
                new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ])
            );

            // remove
            node1.removeRelatedEdgeKey(new BizGraphEdge(nodeID5, nodeID1).key); // 存在しない
            expect(node1.relatedEdgeKeys).toEqual(
                new Set([
                    new BizGraphEdge(nodeID1, nodeID2).key,
                    new BizGraphEdge(nodeID1, nodeID3).key,
                    new BizGraphEdge(nodeID4, nodeID1).key,
                ])
            );

            node1.removeRelatedEdgeKey(new BizGraphEdge(nodeID1, nodeID2).key);
            node1.removeRelatedEdgeKey(new BizGraphEdge(nodeID1, nodeID3).key);
            expect(node1.relatedEdgeKeys).toEqual(
                new Set([new BizGraphEdge(nodeID4, nodeID1).key])
            );
            expect(node1.edgesFromThisTo).toEqual(new Set());
            expect(node1.edgesToThisFrom).toEqual(new Set([nodeID4]));

            node1.removeRelatedEdgeKey(new BizGraphEdge(nodeID4, nodeID1).key);
            expect(node1.relatedEdgeKeys).toEqual(new Set());
            expect(node1.edgesFromThisTo).toEqual(new Set());
            expect(node1.edgesToThisFrom).toEqual(new Set());
        });
    });
});
