import { Failure, Result, ResultError, Success } from 'bizmo/core/util/Result';
import { BizIO, BizIOId } from '../bizIO/single/BizIOs';
import { BizGraphEdge, BizGraphEdgeKey } from './BizGraphEdge';
import { BizGraphNode } from './BizGraphNode';

/**
 * topologicalSort関数：ソート状態
 */
export const TSortState = {
    ReadyToSort: 0,
    Temporary: 1,
    Permanent: 2,
} as const;
export type TSortState = (typeof TSortState)[keyof typeof TSortState];

/**
 * BizGraph
 *
 * BizIO間の依存関係を管理する
 *  - node: BizIO
 *  - edge: BizIO間の依存関係
 */
export class BizIOGraph<
    T = any,
    S extends string = string,
    N extends BizIO<T, S> = BizIO<T, S>,
> {
    private __nodeMap: Map<BizIOId, BizGraphNode<N>>;
    private __edgeSet: Set<BizGraphEdgeKey>;
    /**
     *
     * @param {Map<BizIOId, BizIO>} bizIOMap
     */
    constructor() {
        this.__nodeMap = new Map<BizIOId, BizGraphNode<N>>();
        this.__edgeSet = new Set<BizGraphEdgeKey>();
    }

    /**
     * 登録されているNode
     */
    get allNodes(): Array<N> {
        const nodes: Array<N> = [];
        this.__nodeMap.forEach((node) => nodes.push(node.node));
        return nodes;
    }

    /**
     * 登録されているEdge
     */
    get allEdges(): Array<BizGraphEdgeKey> {
        return Array.from(this.__edgeSet.values());
    }

    /**
     * ノードを新規追加する
     * @param {BizIOId} bizIOId
     * @param {N} node
     */
    addNode(bizIOId: BizIOId, node: N): void {
        this.__nodeMap.set(
            bizIOId,
            new BizGraphNode<N>({
                nodeId: bizIOId,
                node: node,
            })
        );
    }

    /**
     * 対象となるノードを取得する。
     * 存在しない場合には undefined
     * @param {BizIOId} bizIOId
     * @return {N | undefined}
     */
    getNode(bizIOId: BizIOId): N | undefined {
        return this.__nodeMap.get(bizIOId)?.node;
    }

    /**
     * 対象となるノードを削除する
     * ・指定 biz_io_id ノードを持つエッジも削除される
     * ・CategoryBizIO だった場合でも、該当IDのみ削除。構成要素は削除しない。
     * @param {BizIOId} bizIOId
     * @return {boolean}
     */
    removeNode(bizIOId: BizIOId): boolean {
        let result = false;
        if (this.__nodeMap.get(bizIOId)) {
            // 本体を削除する前に、Edgeを削除
            this.__nodeMap
                .get(bizIOId)
                ?.relatedEdgeKeys.forEach((key) => this.removeEdge(key));
            result = this.__nodeMap.delete(bizIOId);
        }
        return result;
    }

    /**
     * 対象となるBizIOがノードとして存在するか確認する
     * @param {BizIOId} bizIOId
     * @return {boolean}
     */
    hasNode(bizIOId: BizIOId): boolean {
        return this.__nodeMap.has(bizIOId);
    }

    /**
     * ノード依存関係を追加する
     * 事前に from と to を構成するノードが登録されている必要がある
     *
     * @param {BizIOId} fromBizIOId
     * @param {BizIOId} toBizIOId
     * @return {boolean}
     */
    addEdge(fromBizIOId: BizIOId, toBizIOId: BizIOId): boolean {
        let result = false;
        const edgeKey = new BizGraphEdge(fromBizIOId, toBizIOId).key;
        if (!this.__edgeSet.has(edgeKey)) {
            const fromNode = this.__nodeMap.get(fromBizIOId);
            const toNode = this.__nodeMap.get(toBizIOId);
            if (fromNode && toNode && fromBizIOId != toBizIOId) {
                fromNode.addRelatedEdgeKey(edgeKey);
                toNode.addRelatedEdgeKey(edgeKey);
                this.__edgeSet.add(edgeKey);
                result = true;
            }
        }
        return result;
    }

    /**
     * 指定したノード依存関係を削除する
     *
     * @param {BizGraphEdgeKey} edgeKey
     * @return {boolean}
     */
    removeEdge(edgeKey: BizGraphEdgeKey): boolean {
        let result = false;
        if (this.__edgeSet.has(edgeKey)) {
            const edge = BizGraphEdge.createByKey(edgeKey);
            // 存在する edgeKey なら、必ず node もある前提
            this.__nodeMap.get(edge.from)?.removeRelatedEdgeKey(edgeKey);
            this.__nodeMap.get(edge.to)?.removeRelatedEdgeKey(edgeKey);
            this.__edgeSet.delete(edgeKey);
            result = true;
        }
        return result;
    }

    /**
     * 指定した BizIO の親要素を取得する
     * 注意：祖父母要素以上は取得できない
     * 存在しない場合は、空リストが返される
     * @param {BizIOId} bizIOId
     * @return {Set<BizIOId>}
     */
    successors(bizIOId: BizIOId): Set<BizIOId> {
        return (
            this.__nodeMap.get(bizIOId)?.edgesFromThisTo ?? new Set<BizIOId>()
        );
    }

    /**
     * 指定した BizIO の子要素を取得する
     * 注意：孫要素以下は取得できない
     * 存在しない場合は、空リストが返される
     * @param {BizIOId} bizIOId
     * @return {Set<BizIOId>}
     */
    predecessors(bizIOId: BizIOId): Set<BizIOId> {
        return (
            this.__nodeMap.get(bizIOId)?.edgesToThisFrom ?? new Set<BizIOId>()
        );
    }

    /**
     * グラフ内全ノードにつきトポロジカルソートを実行する
     *
     * Topological sorting : Depth-first search
     * https://en.wikipedia.org/wiki/Topological_sorting
     *
     * @return {Array<BizIOId>}
     */
    topologicalSort(): Result<Array<BizIOId>> {
        // L ← Empty list that will contain the sorted nodes
        this.__nodeMap.forEach(
            (node) => (node.tSortState = TSortState.ReadyToSort)
        );

        // while exists nodes without a permanent mark do
        //     select an unmarked node n
        //     visit(n)
        const sortedBizIOIds: Array<BizIOId> = [];
        let innerResult = false;
        for (const entry of this.__nodeMap.entries()) {
            if (entry[1].tSortState === TSortState.ReadyToSort) {
                innerResult = this.__topologicalSortVisit(
                    entry[0],
                    sortedBizIOIds
                );
                if (!innerResult) {
                    return new Failure(new ResultError('not a DAG'));
                }
            }
        }
        return new Success(sortedBizIOIds);
    }

    /**
     * [topologicalSortメソッド専用]
     * ノードを深さ優先探索する
     *
     * @param {BizIOId} key
     * @param {Array<BizIOId>} sortedBizIOIds
     * @return {boolean}
     */
    private __topologicalSortVisit(
        key: BizIOId,
        sortedBizIOIds: Array<BizIOId>
    ): boolean {
        const node = this.__nodeMap.get(key)!;
        switch (node.tSortState) {
            case TSortState.Permanent:
                //     if n has a permanent mark then
                //         return
                return true; // continue
            case TSortState.Temporary:
                //     if n has a temporary mark then
                //         stop   (not a DAG)
                return false;
            case TSortState.ReadyToSort:
                //     mark n with a temporary mark
                node.tSortState = TSortState.Temporary;
                // this.__nodeMap.set(key, node);
                break;
        }

        //     for each node m with an edge from n to m do
        //         visit(m)
        let innerResult = false;
        for (const bizIOId of node.edgesFromThisTo) {
            innerResult = this.__topologicalSortVisit(bizIOId, sortedBizIOIds);
            if (!innerResult) {
                return false;
            }
        }

        //     remove temporary mark from n
        //     mark n with a permanent mark
        node.tSortState = TSortState.Permanent;
        // this.__nodeMap.set(key, node);

        //     add n to head of L
        sortedBizIOIds.unshift(key);
        return true;
    }

    /**
     * DAGかどうかを判定する
     * 内部で topologicalSort を利用している
     * @return {boolean}
     */
    isDirectedAcyclicGraph(): boolean {
        return this.topologicalSort().isSuccess();
    }
}
