import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';

export type BizRelationID = string;

export type BizRelationParam<S = any> = {
    relationId?: BizRelationID; // 関係ID
    fromBizIOId: BizIOId; // 始点となる BizActor / Non-BizActor の ID
    toBizIOId: BizIOId; // 終点となる BizActor / Non-BizActor の ID
    name?: string; // 関係の名前
    externalData?: S; // 関連付ける際に付与する外部データ
};

/**
 * BizAction における 2つの BizActor/Non-BizActor 間の関係を示す 有向エッジ
 *
 * 一つのBizActionに複数のBizRelationを設定することができる
 * 【BizAction の全Output に BizRelation が定義されるわけではない】ことに注意。
 * 　例：　外部環境変化を表すBizAction
 *
 * 利用方法は、BizAction の説明を参照すること。
 * 一度生成したら、変更することはできないので、BizAction側で変更が必要であれば、再構築すること。
 *
 * なお BizProcOutput にて、BizRelation との関連付けをもつ。
 *
 */
export class BizRelation<S = any> {
    private __relationId: BizRelationID;
    private __fromBizIOId: BizIOId;
    private __toBizIOId: BizIOId;

    // 公開プロパティ
    name: string | undefined;
    externalData: S | undefined;

    /**
     *
     * @param {BizRelationParam} param0
     */
    constructor(props: BizRelationParam<S>) {
        const { relationId, fromBizIOId, toBizIOId, name, externalData } =
            props;
        this.__relationId = relationId ?? IDGenerator.generateId();
        this.__fromBizIOId = fromBizIOId;
        this.__toBizIOId = toBizIOId;

        this.name = name;
        this.externalData = externalData;
    }

    /**
     * 関係ID
     */
    get relationId(): BizRelationID {
        return this.__relationId;
    }

    /**
     * 始点となる BizActor の ID
     */
    get fromBizIOId(): BizIOId {
        return this.__fromBizIOId;
    }

    /**
     * 終点となる BizActor の ID
     */
    get toBizIOId(): BizIOId {
        return this.__toBizIOId;
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizRelationParam<S> {
        return {
            fromBizIOId: this.fromBizIOId,
            toBizIOId: this.toBizIOId,
            relationId: this.relationId,
            name: this.name,
            externalData: this.externalData,
        };
    }

    static fromObject<S>(props: BizRelationParam<S>): BizRelation {
        return new BizRelation<S>(props);
    }

    static fromSerialized<S = any>({
        serialized,
    }: {
        serialized: string;
    }): BizRelation<S> {
        const obj: ReturnType<BizRelation<S>['toObject']> =
            JSON.parse(serialized);
        return new BizRelation<S>(obj);
    }
}
