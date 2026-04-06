import { BizRelationID } from 'bizmo/action/core/BizRelation';
import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';
import { FuncId } from '../func/BizFunction';

/**
 * BizRelation との関連付け
 */
export const RelatedDirection = {
    FROM: 'FROM', // BizRelation の始点となる BizIO　側に関連付ける
    TO: 'TO', // BizRelation の終点となる BizIO 側に関連付ける
} as const;
export type RelatedDirection =
    (typeof RelatedDirection)[keyof typeof RelatedDirection];

export type RelationOnOutput<R = any> = {
    relationId: BizRelationID; // 関連付ける BizRelation のID
    direction: RelatedDirection; // 関連付ける方向
    externalData?: R; // 関連付ける際に付与する外部データ
};

/**
 * BizActOutputBase の出力モード
 */
export const BizProcOutputMode = {
    REPLACE: 'REPLACE', // 置換
    ADD: 'ADD', // 加算
    SUB: 'SUB', // 減算
} as const;
export type BizProcOutputMode =
    (typeof BizProcOutputMode)[keyof typeof BizProcOutputMode];

export type BizProcOutputID = string;

/**
 * BizProcOutputの初期化Param
 * @param {BizProcOutputID} outputId 当該 BizProcOutput のID
 * @param {BizIOId} parentId: 出力先BizIOの親BizIOのID
 * @param {BizIOId} outputBizId: 出力先BizIOのID
 * @param {FuncId} outputFuncId: 出力するBizFunctionのID
 * @param {BizIOId} outputMode: 出力する方法 デフォルト： 置換
 */
export type BizProcOutputParam<R = any> = {
    outputId?: BizProcOutputID;
    parentId?: BizIOId;
    outputBizId?: BizIOId;
    outputFuncId?: FuncId;
    outputMode?: BizProcOutputMode;
    relations?: Array<RelationOnOutput<R>>;
};

/**
 * BizProcessor の出力先Data
 * ・全てのBizFunctionの結果が出た後に処理される
 */
export class BizProcOutput<R = any> {
    private __outputId: BizProcOutputID;
    public parentId: BizIOId | undefined;
    public outputBizId: BizIOId | undefined;
    public outputFuncId: FuncId | undefined;
    public outputMode: BizProcOutputMode;

    // BizRelation との関連付け
    public relations: Array<RelationOnOutput<R>>;

    /**
     * @param {BizProcOutputParam} param0
     */
    constructor({
        outputId,
        parentId,
        outputBizId,
        outputFuncId,
        outputMode = BizProcOutputMode.REPLACE,
        relations,
    }: BizProcOutputParam<R> = {}) {
        this.__outputId = outputId ?? IDGenerator.generateId();
        this.parentId = parentId;
        this.outputBizId = outputBizId;
        this.outputFuncId = outputFuncId;
        this.outputMode = outputMode ?? BizProcOutputMode.REPLACE;
        this.relations = relations ?? [];
    }

    /**
     * BizProcOutputID
     * インスタンス生成時にのみ設定可能
     */
    get outputId(): BizProcOutputID {
        return this.__outputId;
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizProcOutputToObject<R> {
        return {
            outputId: this.outputId,
            parentId: this.parentId,
            outputBizId: this.outputBizId,
            outputFuncId: this.outputFuncId,
            outputMode: String(this.outputMode),
            relations: this.relations.map((r) => {
                return {
                    relationId: r.relationId,
                    direction: String(r.direction),
                    externalData: r.externalData,
                };
            }),
        };
    }

    static fromObject<R>(obj: BizProcOutputToObject<R>): BizProcOutput<R> {
        return new BizProcOutput({
            ...obj,
            outputMode: obj.outputMode as BizProcOutputMode,
            relations: obj.relations.map((r) => {
                return {
                    relationId: r.relationId,
                    direction: r.direction as RelatedDirection,
                    externalData: r.externalData,
                };
            }),
        });
    }

    static fromSerialized<R>(serialized: string): BizProcOutput<R> | undefined {
        const obj = JSON.parse(serialized);
        return BizProcOutput.fromObject(obj);
    }
}

export type BizProcOutputToObject<R> = Omit<
    BizProcOutputParam<R>,
    'outputMode' | 'relations'
> & {
    outputMode: string;
    relations: Array<{
        relationId: string;
        direction: string;
        externalData?: R;
    }>;
};
