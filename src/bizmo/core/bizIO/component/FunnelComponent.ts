import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIORequiredParam,
    CollectionBizIOToObject,
} from '../collection/CollectionBizIO';
import {
    BizIO,
    BizIOId,
    ExportAsTableParam,
    ExportTable,
} from '../single/BizIOs';
import { RateComponent } from './RateComponent';

export type FunnelExportAsTableParam = ExportAsTableParam & {
    enforceDetail?: boolean;
};

/**
 * Funnel Component
 *
 * ・【概念上の包含関係】がある CategoryBizIO（＝Funnel要素）の【包含率=rate】に着目する、特別な構造のカテゴリー
 *   注意： 要素間に循環参照があってはならない
 * ・各rateは、個別のBizIOとして格納される ⇒ 子要素の変更に伴い、自動的にrateは更新される
 *
 * = 前提 =
 * ・Funnelの構成要素たる集合 [Ga, Gb, Gc ... Gn] につき Ga ⊇ Gb, Gb ⊇ Gc ... Gn-1 ⊇ Gn が成立する。
 * ---------------------------------
 * | Ga                            | 第1順位要素： CategoryBizIO
 * |   |---------------------------|
 * |   | Gb                        |
 * |   |   |-----------------------|
 * |   |   | Gc                    |
 * |   |   | ...                   |
 * |   |   | ...     |-------------|
 * |   |   | ...     | Gn-1        |
 * |   |   | ...     |   |---------|
 * |   |   | ...     |   | Gn      | 最下位要素： CategoryBizIO
 * ---------------------------------
 * ・最上位要素から最上位要素まで【要素順位による包含関係】となる
 *
 * = 構成 =
 *   Funnel
 *     │
 *     │  = CategoryBizIO: funnel element ( Not exported) =
 *     ├ funnel_1
 *     ├ funnel_2
 *     │  ...
 *     ├ funnel_n-1
 *     ├ funnel_n
 *     │
 *     │ = AliasBizIO: rate =
 *     ├ funnel_rate_1
 *     │  ...
 *     └ funnel_rate_n-1
 */
export class FunnelComponent<
    T = any,
    S extends string = string,
> extends CollectionBizIO<T, S> {
    private __orderedBizIds: Array<BizIOId>;
    private __orderedFunnelRateIds: Array<BizIOId>;

    /**
     *
     * @param props
     */
    constructor(props: CollectionBizIOParam<T, S>) {
        super({ ...props, systemLabeledOnly: true });
        this.__orderedBizIds = [];
        this.__orderedFunnelRateIds = [];
    }

    /**
     * funnel rate の各AliasBizIOを初期設定する
     */
    private __initFunnelRate(): void {
        this.__orderedFunnelRateIds.forEach(
            (existedId) => super.removeChild(existedId, true) // hack. システム生成名称が一致する可能性があるため id で管理しているから
        );
        this.__orderedFunnelRateIds = [];
        for (let index = 0; index < this.orderedBizIds.length; index++) {
            if (index < this.orderedBizIds.length - 1) {
                const firstFunnelElem = this.db.selectById(
                    this.orderedBizIds[index]
                );
                const secondFunnelElem = this.db.selectById(
                    this.orderedBizIds[index + 1]
                );
                if (firstFunnelElem && secondFunnelElem) {
                    const rate = new RateComponent<T, S>({
                        timetable: this.timetable,
                        db: this.db,
                        hyperMG: this.hyperMG,
                        name: `${firstFunnelElem.name} → ${secondFunnelElem.name}`,
                        numerator: secondFunnelElem,
                        denominator: firstFunnelElem,
                    });
                    const result = super.appendChild(rate, rate.id); // hack. システム生成名称が一致する可能性があるため id で管理
                    if (result) {
                        this.__orderedFunnelRateIds.push(result.id);
                    }
                } else {
                    console.log(`Funnel element is not found.`);
                }
            }
        }
    }

    // === Props ===

    override get exposedChildren(): Array<BizIO<T, S>> {
        return this.orderedFunnelRates;
    }

    /**
     * funnel 要素IDの順位リスト
     */
    get orderedBizIds(): Array<BizIOId> {
        return this.__orderedBizIds;
    }

    /**
     * 順番に並べられた funnel 要素
     */
    get orderedFunnelChildren(): Array<BizIO<T, S>> {
        // TODO 外部削除された場合についての検討が甘いかも
        return this.__orderedBizIds.map((bizId) => this.db.selectById(bizId)!);
    }

    /**
     * 順番に並べられた RateComponent
     */
    get orderedFunnelRates(): Array<RateComponent<T, S>> {
        // TODO 外部削除された場合についての検討が甘いかも
        return this.__orderedFunnelRateIds.map(
            (funnelRateId) => this.db.selectById(funnelRateId)!
        )!;
    }

    // ==== original ====

    /**
     * 指定した順序の前に指定した要素を入れる
     * 既に存在する要素を指定した場合には、並び替えられる
     * @param {BizIO<T,S>} child
     * @param {number} index 該当要素の直前に挿入。指定しない場合は最後に挿入。範囲外は無視するので undefined を返し、内部要素が含まれる場合には追加されない。
     * @return {BizI<T,S> | undefined}
     */
    appendFunnelChildAt(
        child: BizIO<T, S>,
        index?: number
    ): BizIO<T, S> | undefined {
        const newIndex = index ?? this.orderedBizIds.length;
        if (0 <= newIndex && newIndex <= this.orderedBizIds.length) {
            // Funnel要素の追加・更新
            const result = this.appendFunnelChild(child); // 最後に追加
            if (result) {
                // ordered_biz_ids の修正
                this.__orderedBizIds.splice(
                    this.__orderedBizIds.indexOf(child.id),
                    1
                );
                this.__orderedBizIds.splice(newIndex, 0, child.id);

                // FunnelRate要素を初期化・再追加
                // TODO 無駄な処理をしているので高速化が必要なときには調整する
                this.__initFunnelRate();
                return result;
            }
        }
    }

    /**
     * 最終順位に要素を追加する
     * @param {BizIO<T,S>} child
     * @return {BizIO<T,S> | undefined}
     */
    appendFunnelChild(child: BizIO<T, S>): BizIO<T, S> | undefined {
        if (child.hasOwnValue) {
            // 課題感
            // child がここにしか存在しない場合、DB以外で管理されていないものができてしまう。。
            // funnel の性質上、他のBizIOが存在することは自明
            const result = super.appendChild(child, child.id); // Hack. 同一名称が発生しうるので強制的にIDを指定
            if (result) {
                // ordered_biz_ids の修正
                this.__orderedBizIds.push(child.id);
                // FunnelRate要素を初期化・再追加
                this.__initFunnelRate();
                return result;
            }
        }
    }

    /**
     * 指定した順序の要素を入れ替える
     * @param {number} orderIndex1
     * @param {number} orderIndex2
     */
    swapFunnelChildAt(orderIndex1: number, orderIndex2: number): void {
        if (
            0 <= orderIndex1 &&
            orderIndex1 < this.__orderedBizIds.length &&
            0 <= orderIndex2 &&
            orderIndex2 < this.__orderedBizIds.length
        ) {
            const temp1 = this.__orderedBizIds[orderIndex1];
            const temp2 = this.__orderedBizIds[orderIndex2];
            this.__orderedBizIds[orderIndex1] = temp2;
            this.__orderedBizIds[orderIndex2] = temp1;
            this.__initFunnelRate();
        }
    }

    /**
     * 順位関係なく削除できるが、該当順位が変更される
     * @param {BizIOId} bizId
     */
    removeFunnelChild(bizId: BizIOId): void {
        if (this.__orderedBizIds.includes(bizId)) {
            this.__orderedBizIds.splice(this.__orderedBizIds.indexOf(bizId), 1);
            this.__initFunnelRate();
            super.removeChild(bizId, true); // hack. 強制的にidでシステム登録したので
        }
    }

    // ==== overwrite ====

    /**
     * [overwrite] 順序づけずに append することはできない
     * @param {BizIO} child
     * @param {string} systemNamedLabel
     * @return {BizIO | undefined}
     */
    appendChild<T extends BizIO = BizIO>(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        child: T,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        systemNamedLabel?: string
    ): T | undefined {
        console.log(
            'FunnelComponent does not support appendChild. Please use appendFunnelChildAt instead.'
        );
        return undefined;
    }

    /**
     * [overwrite]
     * @param {string} bizId
     */
    removeChild(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        bizId: string
    ): void {
        console.log(
            'FunnelComponent does not support removeChild. Please use removeFunnelChild instead.'
        );
    }

    /**
     * [overwrite] ordered_funnel_rates の要素だけを export する
     * @param {ExportAsTableParam} param0
     * @return {ExportTable}
     */
    exportAsTable({
        nameSpace,
        idCol = false,
        nameCol = true,
        termRow = false,
        enforceDetail = false,
    }: FunnelExportAsTableParam = {}): ExportTable {
        let childrenTable: ExportTable = [];
        const fullName = nameSpace ? `${nameSpace}:${this.name}` : this.name;
        let processChild = false;
        if (this instanceof CollectionBizIO) {
            // FIXME has_own_value = True だけ _export_with_children が適用されるの？
            processChild = this.hasOwnValue ? this._exportWithChildren : true;
        }
        if (processChild) {
            const targets = enforceDetail
                ? this.children
                : this.orderedFunnelRates;
            targets.forEach((child) => {
                childrenTable = childrenTable.concat(
                    child.exportAsTable({
                        idCol: idCol,
                        nameCol: nameCol,
                        termRow: false,
                        nameSpace: fullName,
                    })
                );
            });
        }

        const myselfTable = this.hasOwnValue
            ? [this.timetableHistory.map((bizValue) => bizValue.value)]
            : undefined;
        const exportTable: ExportTable = this._addHeaderToExportTable(
            fullName,
            myselfTable,
            childrenTable,
            idCol,
            nameCol,
            termRow
        );
        return exportTable;
    }

    // serialize / deserialize

    toObject(): FunnelComponentToObject<T, S> {
        return {
            ...super.toObject(),
            orderedBizIds: this.orderedBizIds,
        };
    }

    /**
     * [static] deserialize
     * FunnelComponent は独自の子要素構造をもつため専用関数を用意する
     */
    static fromObject<T = any, S extends string = string>({
        obj,
        timetable,
        db,
        hyperMG,
    }: {
        obj: FunnelComponentToObject<T, S>;
    } & CollectionBizIORequiredParam<T, S>): FunnelComponent<T, S> {
        const funnel = new FunnelComponent({
            timetable,
            db,
            hyperMG,
            ...obj,
        });
        funnel.__orderedBizIds = obj.orderedBizIds;
        funnel.__initFunnelRate();
        return funnel;
    }
}

export type FunnelComponentToObject<
    T = any,
    S extends string = string,
> = CollectionBizIOToObject<T, S> & {
    orderedBizIds: Array<BizIOId>;
};
