import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizProcessorRequiredParam,
    BizProcessorToObject,
} from 'bizmo/core/bizProcessor/BizProcessor';
import { BizFunction, FuncId } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizProcOutput,
    BizProcOutputID,
    BizProcOutputMode,
    RelatedDirection,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { DateMapToObject } from 'bizmo/core/util/DateMap';
import Decimal from 'decimal.js';
import { BizActionType } from '../BizActionType';
import {
    BizActionBase,
    BizActionBaseOptionalParam,
    BizActionParamsToObject,
} from './BizActionBase';
import { BizActionProcessor } from './BizActionProcessor';
import { BizRelation, BizRelationID, BizRelationParam } from './BizRelation';

export type BizActionParam<T = any, R = any> = BizProcessorRequiredParam<
    T,
    BizComponentGroupType
> &
    BizActionOptionalParam<T, R>;

export type BizActionOptionalParam<
    T = any,
    R = any,
> = BizActionBaseOptionalParam<T> &
    Partial<{
        orderedFunctions: Array<BizFunction>;
        outputs: Array<BizProcOutput>;
        relations: Map<BizRelationID, BizRelation<R>>;
    }>;

/**
 * 一つの事業活動をシミュレーションするクラス
 *
 * BizActor 間の事業活動だけでなく、Non-BizActor の活動（変化）も対象とする。
 * 複数の term に渡って適用することができる。
 *
 * ＝ BizRelation との関係 ＝
 * BizAction は事業活動毎にシミュレーションを行うだけで、シミュレーション出力先には複数のBizActorを指定することができる。
 *   <= Environment も BizActor として扱うことになったので、BizComponentの構成要素は BizActorとして扱える。
 *   <= BizActionParamは、BizAction結果を保存しない想定なので。
 * この複数のBizActorの間の関係を、ビジネスモデルとして意味のある形で付与するのが BizRelation である。
 *
 * 【注意：　利用方法】
 * BizRelation は、BizAction を主として設定される必要があると同時に BizRelation で設定された制約を前提とする。
 * そのため、以下の利用法を想定する。
 *
 * 1. BizAction は未設定のままで BizRelation を 設定
 * 　BizActor 間なのか、Non-BizActor 間なのかなども、この制約で決まる。
 * 2. BizRelation の制約上で BizAction を 設定する
 * 　BizActionでProcOutputを生成・変更する場合に、BizRelationとの整合性を確認する
 * 　BizProcOutputに、関連付けたいBizRelationの情報を持たせる
 *
 */
export class BizAction<T = any, R = any> extends BizActionBase<T, R> {
    private __orderedProcessors: Array<BizActionProcessor>;

    /**
     *
     * @param {BizActionParam} param0
     */
    constructor({
        timetable,
        db,
        hyperMG,
        actionId,
        name,
        actionType = BizActionType.GENERAL,
        priorityEntity,
        actionParam,
        orderedFunctions,
        outputs,
        relations,
        externalData,
    }: BizActionParam) {
        super({
            timetable,
            db,
            hyperMG,
            name,
            actionId,
            actionType,
            priorityEntity,
            actionParam,
            externalData,
        });

        // overwrite
        this._relations = relations ?? new Map<BizRelationID, BizRelation<R>>();
        this.__orderedProcessors = []; // 最小でも1要素を保持し続ける
        this.appendActionProcessor(orderedFunctions, outputs);

        // BizAction 初期化処理
        this._initAction();
    }

    // 初期化

    /**
     * [overwrite 専用]
     * BizAction の通常の初期化処理の最後に処理を行う
     */
    protected _initAction(): void {}

    // overwrite: BizActionBase

    /**
     *
     */
    prepareProcess(): void {
        this.orderedProcessors.forEach((processor) =>
            processor.prepareProcess()
        );
    }

    /**
     *
     * @param {Array<Decimal>} sysInputs
     */
    process(sysInputs: Array<Decimal>): void {
        if (this.priorities[this.timetable.currentIndex]) {
            // TODO ここで判定していいのか？
            this._prepareEachTermProcess();
            this.orderedProcessors.forEach((processor) =>
                processor.process(sysInputs)
            );
        }
    }

    // overwrite用

    /**
     * [overwrite 専用]
     * 各Termのprocess開始直前に行う処理
     *
     * 主な利用目的
     * ・BizActionParams から 各term専用の設定を行う
     */
    protected _prepareEachTermProcess(): void {}

    // BizActionProcessor

    /**
     * 順に登録された全ての BizActionProcessor
     */
    get orderedProcessors(): Array<BizActionProcessor> {
        return this.__orderedProcessors;
    }

    /**
     * 第1順位の BizActionProcessor。必ず存在する
     */
    get processor1st(): BizActionProcessor {
        return this.__orderedProcessors[0];
    }

    /**
     * 新しい BizActionProcessor を最後に追加する
     * @param {Array<BizFunction>} orderedFunctions
     * @param {Array<BizProcOutput>} outputs
     * @return {BizActionProcessor}
     */
    appendActionProcessor(
        orderedFunctions?: Array<BizFunction>,
        outputs?: Array<BizProcOutput>
    ): BizActionProcessor {
        const processor = new BizActionProcessor({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            orderedFunctions: orderedFunctions,
            outputs: outputs,
        });
        this.__orderedProcessors.push(processor);
        return processor;
    }

    /**
     * 2つの BizActionProcessor の順序を入れ替える
     * @param {number} orderIndex1
     * @param {number} orderIndex2
     */
    swapActionProcessorOrderAt(orderIndex1: number, orderIndex2: number): void {
        if (
            0 <= orderIndex1 &&
            orderIndex1 < this.orderedProcessors.length &&
            0 <= orderIndex2 &&
            orderIndex2 < this.orderedProcessors.length
        ) {
            [
                this.__orderedProcessors[orderIndex1],
                this.__orderedProcessors[orderIndex2],
            ] = [
                this.__orderedProcessors[orderIndex2],
                this.__orderedProcessors[orderIndex1],
            ];
        }
    }

    /**
     * 指定した順序の BizActionProcessor を削除する
     * ただし、最小でも1要素以下にはならない
     * @param {number} orderIndex
     * @return {BizActionProcessor | undefined}
     */
    removeActionProcessorAt(
        orderIndex: number
    ): BizActionProcessor | undefined {
        if (
            this.orderedProcessors.length > 1 &&
            0 <= orderIndex &&
            orderIndex < this.orderedProcessors.length
        ) {
            const result = this.orderedProcessors.splice(orderIndex, 1);
            if (result) return result[0];
        }
    }

    // util

    /**
     * BizAction の条件に沿った BizProcOutput を生成する。
     * 条件から外れた場合には NaN が戻される。
     * Return結果に outputFuncId を適用する想定。
     *
     * BizActionの条件
     * ・relations に登録された Actor（およびその子孫）
     * ＊ parent_biz_id と target_biz_id の、 Actor との子孫関係は BizActionProcessor で確認される。
     *   そのため parent_biz_id が relations に登録されているかどうかだけがポイント。
     *
     * @param {BizIOId} parentBizId
     * @param {BizIOId} targetBizId
     * @param {FuncId} outputFuncId
     * @param {BizProcOutputID} outputId
     * @param {BizProcOutputMode} outputMode
     * @return {BizProcOutput | undefined}
     */
    createSeedProcOutput({
        parentBizId,
        targetBizId,
        outputFuncId,
        outputId,
        outputMode,
    }: {
        parentBizId: BizIOId;
        targetBizId?: BizIOId;
        outputFuncId?: FuncId;
        outputId?: BizProcOutputID;
        outputMode?: BizProcOutputMode;
    }): BizProcOutput | undefined {
        const relations = Array.from(this.relations.values());
        for (let cnt = 0; cnt < relations.length; cnt++) {
            const relation = relations[cnt];
            if (
                relation.toBizIOId == parentBizId ||
                relation.fromBizIOId == parentBizId
            ) {
                return new BizProcOutput({
                    outputId,
                    parentId: parentBizId,
                    outputBizId: targetBizId,
                    outputFuncId,
                    outputMode,
                });
            }
        }
    }

    // BizRelation

    /**
     * Current Term を対象として BizRelation の情報から、BizCanvas で表示させるための情報を組み立てる。
     */
    getRelationsToDraw(): Array<BizRelationToDraw<T, R>> | undefined {
        if (this.relations.size > 0) {
            // _prepareEachTermProcess() を実行し、各Processorの出力先を確定させる
            this._prepareEachTermProcess();

            // 各Relation毎に、出力先を確認する
            const result: Array<BizRelationToDraw<T, R>> = [];
            Array.from(this.relations).forEach(([label, relation], index) => {
                const fromSide: Array<ExpandedProcData> = [];
                const toSide: Array<ExpandedProcData> = [];
                this.orderedProcessors.forEach((processor) => {
                    processor.procOutputs.forEach((output) => {
                        //BizRelation の From/To は、BizActor レベルだが、Outputはその子孫の BizIO も許容されるため、Output側にRelationIDを持たせる
                        output.relations.forEach((relationOnOutput) => {
                            if (
                                relationOnOutput.relationId ==
                                relation.relationId
                            ) {
                                const bizIO = this.db.selectById(
                                    output.outputBizId
                                );
                                if (
                                    relationOnOutput.direction ==
                                    RelatedDirection.FROM
                                ) {
                                    fromSide.push({
                                        proc: output,
                                        bizIO: bizIO,
                                        ext: relationOnOutput.externalData,
                                    });
                                } else {
                                    toSide.push({
                                        proc: output,
                                        bizIO: bizIO,
                                        ext: relationOnOutput.externalData,
                                    });
                                }
                            }
                        });
                    });
                });
                result.push({
                    relation: relation,
                    fromSide,
                    toSide,
                });
            });
            return result;
        }
    }

    /**
     * targetRelation が削除可能かどうかを判定する
     * 削除可能な場合は true を返す
     *
     * targetRelation は実際にBizActionに登録されている必要はない
     *
     * @param targetRelation
     * @returns
     */
    isUsedOnOutput(relationID: string): boolean {
        // output に利用されているBizIOを from（子孫含む） か to（子孫含む） に含む relation は削除不可
        return this.orderedProcessors.some((processor) =>
            processor.procOutputs.some((output) =>
                output.relations.some(
                    (relation) => relation.relationId == relationID
                )
            )
        );
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizActionToObject<T, R> {
        return {
            className: this.constructor.name,
            name: this.name,
            actionId: this.actionId,
            actionType: this.actionType,
            externalData: this.externalData,
            priorityEntity: this._priorityEntity.toObject(),
            actionParam: this.actionParam.toObject(),
            orderedProcessors: this.orderedProcessors.map((processor) =>
                processor.toObject()
            ),
            relations: Array.from(this.relations.entries()).map(
                ([key, value]) => [key, value.toObject()]
            ),
        };
    }
}

export type BizActionToObject<T = any, R = any> = {
    className: string;
} & Omit<
    BizActionParam<T>,
    | 'timetable'
    | 'db'
    | 'hyperMG'
    | 'priorityEntity'
    | 'actionParam'
    | 'orderedFunctions'
    | 'outputs'
    | 'relations'
> & {
        priorityEntity: DateMapToObject<Decimal>;
        actionParam: BizActionParamsToObject;
        orderedProcessors: Array<BizProcessorToObject<R>>;
        relations: Array<[string, BizRelationParam<R>]>;
    };

export type ExpandedProcData<T = any, S = any> = {
    proc: BizProcOutput;
    bizIO:
        | BizIO<T, BizComponentGroupType>
        | CollectionBizIO<T, BizComponentGroupType>
        | undefined;
    ext?: S;
};

export type BizRelationToDraw<T = any, R = any, S = any> = {
    relation: BizRelation<R>;
    fromSide: Array<ExpandedProcData<T, S>>;
    toSide: Array<ExpandedProcData<T, S>>;
};
