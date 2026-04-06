import { Journal } from 'bizmo/core/accounting/Journal';
import { CollectionBizIO } from '../bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId } from '../bizIO/single/BizIOs';
import { BizGraphEdge } from './BizGraphEdge';
import { BizIOGraph } from './BizIOGraph';

/**
 * BizIOJournalDatabase
 *
 * BizIOおよび継承クラスのオブジェクト、ならびにJournalを、一括して保持・管理する。
 *
 * = Deserialize による復元方法 =
 * BizIOのインスタンス化にはBizDatabaseが必要になると同時に、 BizIOGraphの内部にBizIOのインスタンスが保持されることから、
 * BizDatabaseのコンストラクタから復元する方法は不可能である。
 *
 *
 */
export class BizDatabase<
    T = any,
    S extends string = string,
    N extends BizIO<T, S> = BizIO<T, S>,
> {
    public static KEY_BIZ_IO: string = 'KEY_BIZ_IO';
    public static DUMMY_EDGE_KEY: string = 'DUMMY_EDGE_KEY';
    public static KEY_BIZ_COMPONENT_ID: string = 'KEY_BIZ_COMPONENT_ID';

    private __graph: BizIOGraph<T, S, N>;
    private __autoUpdateDependencies: boolean;
    private __journal: Journal;
    public bizComponentId: BizIOId | undefined;

    /**
     *
     * @param {BizIOGraph} graph
     */
    constructor(initData?: { graph: BizIOGraph<T, S, N>; journal: Journal }) {
        // BizIO
        this.__graph = initData?.graph ?? new BizIOGraph<T, S, N>();
        this.__autoUpdateDependencies = true;

        // Journal
        this.__journal = initData?.journal ?? new Journal();

        // BizIoId of BizComponent
        this.bizComponentId = undefined;
    }

    /**
     *
     */
    get graph(): BizIOGraph<T, S, N> {
        return this.__graph;
    }

    /**
     * 会計：仕訳帳
     */
    get journal(): Journal {
        return this.__journal;
    }

    // update dependencies automatically on CategoryBizIO

    /**
     * FolderBizIO の依存する値が更新されたときに、それを【自動的に反映するか】どうか
     */
    get autoUpdateDependencies(): boolean {
        return this.__autoUpdateDependencies;
    }

    /**
     * FolderBizIO の依存する値が更新されたときに、それを【自動的に反映するか】どうかを設定する
     * ・フラグが False -> True に変化した場合、最新グラフから自動的に全ての値を更新する
     * @param {boolean} flag
     */
    set autoUpdateDependencies(flag: boolean) {
        if (!this.autoUpdateDependencies && flag) {
            // # False -> True: 現グラフ上の情報をトポロジカルソートして全て更新
            const result = this.graph.topologicalSort();
            if (result.isSuccess()) {
                for (const bizId of result.value) {
                    this.selectById(
                        bizId
                    )?._updateHistoryReferenceWithoutNotification();
                }
            }
        }
        this.__autoUpdateDependencies = flag;
    }

    // update/delete

    /**
     * BizIOを追加する
     *
     * 前提：
     * ・新しいBizIOを加えてもDAGが保たれる場合に追加される。
     *
     * @param {T} bizIO
     * @param {CollectionBizIO<T, S>} parentBizIO
     * @return {T | undefined}
     */
    insert(bizIO: N, parentBizIO?: CollectionBizIO<T, S>): N | undefined {
        // validate
        if (!parentBizIO || this.validateToAddChild(bizIO, parentBizIO)) {
            if (!this.graph.hasNode(bizIO.id)) {
                this.graph.addNode(bizIO.id, bizIO);
            } else {
                // 同一BizIOIdなのに別なBizIOに変わっていることは想定しない。
                // 考慮する場合には、graph上の既存Nodeを置き換えつつ、
                // 当該Nodeから他Nodeへの参照を更新する処理が必要。
            }
            if (parentBizIO) {
                // エッジは「子要素 -> 親要素」となる
                if (this.graph.addEdge(bizIO.id, parentBizIO.id)) {
                    bizIO._addChildrenValuesUpdatedEventListener(parentBizIO);
                    return bizIO;
                } else {
                    if (this.graph.hasNode(bizIO.id)) {
                        // bizIOが既存ノード： エッジのみ削除
                        this.graph.removeEdge(
                            new BizGraphEdge(bizIO.id, parentBizIO.id).key
                        );
                    } else {
                        // bizIOが新規ノード： ノードもエッジも削除
                        this.graph.removeNode(bizIO.id);
                    }
                }
            }
        }
    }

    /**
     * 指定した biz_io_id を削除する
     * ・指定 biz_io_id ノードを持つエッジも削除される
     * ・CategoryBizIO だった場合でも、該当IDのみ削除。構成要素は削除しない。
     * @param {BizIOId} bizIOId
     */
    delete(bizIOId: BizIOId): void {
        this.graph.removeNode(bizIOId);
    }

    /**
     * 指定したエッジを削除する
     *
     * remove_child で要素間の関係を消すときに利用する
     * @param {BizIOId} parentId
     * @param {BizIOId} childId
     */
    deleteEdgeOn(parentId: BizIOId, childId: BizIOId): void {
        this.graph.removeEdge(new BizGraphEdge(childId, parentId).key);
    }

    // read

    /**
     * 該当する biz_io_id が登録されているかどうか
     *
     * @param {BizIOId} bizIOId
     * @return {boolean}
     */
    isIncluded(bizIOId: BizIOId): boolean {
        return this.graph.hasNode(bizIOId);
    }

    /**
     * 指定した Id の BizID が存在すれば取得する
     * @param {BizIOId} bizIOId
     * @return {T | undefined}
     */
    selectById<FT extends BizIO<T, S> = BizIO<T, S>>(
        bizIOId?: BizIOId
    ): FT | undefined {
        return bizIOId
            ? (this.graph.getNode(bizIOId) as FT | undefined)
            : undefined;
    }

    /**
     * 指定した BizIO の構成要素（子要素）を取得する
     * 注意：孫要素以下は取得できない
     * 存在しない場合は、空リストが返される
     * @param {BizIOId} bizIOId
     * @return {Array<BizIO<T, S> >}
     */
    childrenOf(bizIOId: BizIOId): Array<BizIO<T, S>> {
        const children = [];
        for (const childId of this.graph.predecessors(bizIOId)) {
            const child = this.selectById(childId);
            if (child) {
                children.push(child);
            }
        }
        return children;
    }

    /**
     * 指定した BizIO の構成要素（親要素）を取得する
     * 注意：祖父母要素以上は取得できない
     * 存在しない場合は、空リストが返される
     * @param {BizIOId} bizIOId
     * @return {Array<CollectionBizIO<T, S>>}
     */
    parentsOf(bizIOId: BizIOId): Array<CollectionBizIO<T, S>> {
        const parents: Array<CollectionBizIO<T, S>> = [];
        for (const parentId of this.graph.successors(bizIOId)) {
            const child = this.selectById(parentId);
            if (child && child instanceof CollectionBizIO) {
                // 子要素を持てるBizIOは、CollectionBizIOのみ
                parents.push(child);
            }
        }
        return parents;
    }

    ancestorsOf(bizIOId: BizIOId): Array<BizIO<T, S>> {
        // 本来は複数の祖先が存在する可能性があるので、この方法では不十分
        const ancestors = [];
        for (const parentId of this.graph.successors(bizIOId)) {
            const parent = this.selectById(parentId);
            if (parent) {
                ancestors.push(parent);
                ancestors.push(...this.ancestorsOf(parentId));
            }
        }
        return ancestors;
    }

    // Util

    /**
     * root（上位）から target（下位）に至るまでの階層を取得する
     *
     * 複数のパスが有る場合でも最初に発見された１種類のみが選択される
     * パスが存在しない場合には、undefined が返される
     *
     * @param root
     * @param target
     * @returns
     */
    resolveHierarchy(
        root: BizIO<T, S>,
        target?: BizIO<T, S>
    ): Array<BizIO<T, S>> | undefined {
        if (!target) return undefined;
        return this.__resolveChild([root], root, target);
    }

    /**
     * [内部解決用]
     * @param currentHierarchy
     * @param parent
     * @param target
     * @returns
     */
    private __resolveChild(
        currentHierarchy: Array<BizIO<T, S>>,
        parent: BizIO<T, S>,
        target: BizIO<T, S>
    ): Array<BizIO<T, S>> | undefined {
        const children = this.childrenOf(parent.id);
        for (const child of children) {
            const tempHierarchy = [...currentHierarchy, child];
            if (child.id === target.id) {
                return tempHierarchy;
            } else {
                const result = this.__resolveChild(
                    tempHierarchy,
                    child,
                    target
                );
                if (result) return result;
            }
        }
        return undefined;
    }

    /**
     * parent の構成要素として challenger を追加できるか
     *
     * = 前提 =
     * DB はシミュレート内では同一インスタンスを共通して利用することとする
     *
     * @param {BizIO<T, S>} challenger
     * @param {BizIO<T, S>} parent
     * @return {boolean}
     */
    validateToAddChild(challenger: BizIO<T, S>, parent?: BizIO<T, S>): boolean {
        // BizIOはインスタンス生成時に自分をDBに登録しているので、双方とも存在するはず
        if (
            parent &&
            this.isIncluded(challenger.id) &&
            this.isIncluded(parent.id)
        ) {
            // 挑戦者を仮に追加して確認
            let result = this.graph.addEdge(challenger.id, parent.id);
            if (result) {
                result = this.graph.isDirectedAcyclicGraph();
                this.graph.removeEdge(
                    new BizGraphEdge(challenger.id, parent.id).key
                );
            }
            return result;
        } else {
            return false;
        }
    }

    /**
     * [利用注意]
     * db に登録されている全BizIOにつきトポロジカルソートを行い、更新するFolderだけを、順番に抽出する
     *
     * ＝前提＝
     * BizIO構造がシミュレーション中に変化しないこと
     * @return {Array<BizIO<T, S>>}
     */
    prepareUpdateFullCollections(): Array<BizIO<T, S>> {
        const result = [];
        const sortResult = this.graph.topologicalSort();
        if (sortResult.isSuccess())
            for (const bizId of sortResult.value) {
                const bizIO = this.selectById(bizId);
                if (bizIO instanceof CollectionBizIO) {
                    // Hack Folder にしないと簡単に動かない。いずれ Folder と Collection を統合するべき
                    result.push(bizIO);
                }
            }
        return result;
    }

    /**
     * [利用注意]
     * DBに登録されているFolderだけをトポロジカルソートした順に更新する
     * 事前に prepare_update_full_collections した結果を利用する。
     *
     * ＝前提＝
     * BizIO構造がシミュレーション中に変化しないこと
     * @param {Array<BizIO<T, S>>} collections
     */
    updateFullCollections(collections: Array<BizIO<T, S>>): void {
        collections?.forEach((collection) =>
            collection._updateHistoryReferenceWithoutNotification()
        );
    }
}
