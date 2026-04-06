import { BizIOId } from '../bizIO/single/BizIOs';
import { BizGraphEdge, BizGraphEdgeKey } from './BizGraphEdge';
import { TSortState } from './BizIOGraph';

export type Serializable = {
    toObject: () => any;
};

/**
 * BizGraphにおけるノード
 * 特定のBizIOを示すと共に、当該BizIOと依存関係のあるエッジおよび、その示すノード情報をもつ
 *
 * 備考：テスト目的でノードを＜N＞にジェネリクス化
 */
export class BizGraphNode<N extends Serializable> {
    private __nodeId: BizIOId;
    private __node: N;
    private __relatedEdgeKeys: Set<BizGraphEdgeKey>;
    private __edgesToThisFrom: Set<BizIOId>;
    private __edgesFromThisTo: Set<BizIOId>;
    public tSortState: TSortState;

    /**
     *
     * @param {BizIOId} nodeId 当該BizIOのID
     * @param {N} node 当該BizIO
     * @param {Set<BizGraphEdgeKey>} relatedEdgeKeys
     * @param {Set<BizIOId>} relatedEdgeKeys
     * @param {Set<BizIOId>} relatedEdgeKeys
     */
    constructor({
        nodeId,
        node,
        relatedEdgeKeys,
    }: {
        nodeId: BizIOId;
        node: N;
        relatedEdgeKeys?: Set<BizGraphEdgeKey>;
    }) {
        this.__nodeId = nodeId;
        this.__node = node;
        this.__relatedEdgeKeys = new Set();
        this.__edgesFromThisTo = new Set();
        this.__edgesToThisFrom = new Set();
        this.tSortState = TSortState.ReadyToSort;
        relatedEdgeKeys?.forEach((key) => this.addRelatedEdgeKey(key));
    }

    /**
     * 包含するBizIOのid
     */
    get nodeId(): BizIOId {
        return this.__nodeId;
    }

    /**
     * 包含するBizIO
     */
    get node(): N {
        return this.__node;
    }

    /**
     * 包含するBizIOを設定する
     * 【注意】
     * もともとのEdgeが残存するため、NodeがCollectionBizIOだった場合には不整合が発生する危険性がある。
     * 利用時には注意すること
     * @param {N} node
     */
    setNode(node: N): void {
        this.__node = node;
    }

    /**
     * 当該ノードを子要素とする親要素のBizIO
     */
    get edgesFromThisTo(): Set<BizIOId> {
        return this.__edgesFromThisTo;
    }

    /**
     * 当該ノードを親要素とする子要素のBizIO
     */
    get edgesToThisFrom(): Set<BizIOId> {
        return this.__edgesToThisFrom;
    }

    /**
     * 関連する全てのedgeKey
     */
    get relatedEdgeKeys(): Set<BizGraphEdgeKey> {
        return this.__relatedEdgeKeys;
    }

    /**
     * 自らを含むノード依存関係を追加する
     *
     * @param {BizGraphEdgeKey} relatedEdgeKey
     * @return {boolean}
     */
    addRelatedEdgeKey(relatedEdgeKey: BizGraphEdgeKey): boolean {
        let result = false;
        if (!this.__relatedEdgeKeys.has(relatedEdgeKey)) {
            const edge = BizGraphEdge.createByKey(relatedEdgeKey);
            const isFromThis = edge.from == this.nodeId; // 当該Nodeが子要素
            const isToThis = edge.to == this.nodeId; // 当該Nodeが親要素
            if ((isFromThis && !isToThis) || (!isFromThis && isToThis)) {
                if (isFromThis) {
                    this.__edgesFromThisTo.add(edge.to);
                } else {
                    this.__edgesToThisFrom.add(edge.from);
                }
                this.__relatedEdgeKeys.add(relatedEdgeKey);
                result = true;
            }
        }
        return result;
    }

    /**
     * 登録されているノード依存関係を削除する
     * @param {BizGraphEdgeKey} relatedEdgeKey
     * @return {boolean}
     */
    removeRelatedEdgeKey(relatedEdgeKey: BizGraphEdgeKey): boolean {
        let result = false;
        if (this.__relatedEdgeKeys.has(relatedEdgeKey)) {
            const edge = BizGraphEdge.createByKey(relatedEdgeKey);
            if (edge.from == this.nodeId) {
                this.__edgesFromThisTo.delete(edge.to);
            }
            if (edge.to == this.nodeId) {
                this.__edgesToThisFrom.delete(edge.from);
            }
            this.__relatedEdgeKeys.delete(relatedEdgeKey);
            result = true;
        }
        return result;
    }

    toObject(): BizGraphNodeToObject<N> {
        return {
            nodeId: this.nodeId,
            node: this.node.toObject(),
            relatedEdgeKeys: Array.from(this.relatedEdgeKeys),
        };
    }
}

export type BizGraphNodeToObject<N extends Serializable> = {
    nodeId: BizIOId;
    node: N;
    relatedEdgeKeys: BizGraphEdgeKey[];
};
