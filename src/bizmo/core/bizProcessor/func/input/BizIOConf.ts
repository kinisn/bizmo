import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';

/**
 * BizFunctionへの入力Data： BizIO形式
 */
export class BizIOConf {
    public targetId: BizIOId;
    public relativeTermIndex: number;
    /**
     *
     * @param {BizIoId} targetId 入力となるBizIOのID
     * @param {number} relativeTermIndex 現在処理中のtermのインデックスを「0」とした、相対的な対象termインデックス。デフォルト 1（＝直前term）
     *  未来を示す -1 以下は取れない。
     */
    constructor(targetId: BizIOId, relativeTermIndex?: number) {
        this.targetId = targetId;
        this.relativeTermIndex = relativeTermIndex ?? 1;
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizIOConfToObject {
        return {
            targetId: this.targetId,
            relativeTermIndex: this.relativeTermIndex,
        };
    }

    static fromObject(obj: BizIOConfToObject): BizIOConf {
        return new BizIOConf(obj.targetId, obj.relativeTermIndex);
    }

    static fromSerialized({ serialized }: { serialized: string }): BizIOConf {
        const obj: ReturnType<BizIOConf['toObject']> = JSON.parse(serialized);
        return BizIOConf.fromObject(obj);
    }
}

export type BizIOConfToObject = {
    targetId: BizIOId;
    relativeTermIndex?: number;
};
