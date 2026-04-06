import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import {
    BizProcessorRequiredParam,
    Processable,
} from 'bizmo/core/bizProcessor/BizProcessor';
import { BizProcOutputID } from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import {
    DateMap,
    DateMapContentDecoder,
    DateMapToObject,
} from 'bizmo/core/util/DateMap';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';
import { Interpolation } from 'bizmo/core/util/Interpolation';
import {
    LabeledDict,
    LabeledDictToObject,
    isLabeledDictToObject,
} from 'bizmo/core/util/LabeledDict';
import { PubSub, PublisherTriggerEventParam } from 'bizmo/core/util/Pubsub';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizActionType } from '../BizActionType';
import { BizRelation, BizRelationID } from './BizRelation';

export type BizActionId = string;
export type BizActionParamType = any;
/**
 * term 別に保存された BizAction のパラメータ
 *
 * 基本は HyperParam を BizFunction の形式のパラメータとして設定することが多くなるはず
 *
 * BizCompで【管理されない】ことがポイント
 */
export class BizActionParams {
    private __timetable: Timetable;
    private __paramsGeneral: LabeledDict<BizActionParamType>;
    private __paramsTermGeneral: DateMap<LabeledDict<BizActionParamType>>;

    /**
     *
     * @param {Timetable} timetable
     */
    constructor(timetable: Timetable) {
        this.__timetable = timetable;
        this.__paramsGeneral = new LabeledDict();
        this.__paramsTermGeneral = new DateMap<
            LabeledDict<BizActionParamType>
        >();
        this.initialize();
    }

    /**
     *
     */
    initialize(): void {
        this.__paramsGeneral = new LabeledDict();
        this.__paramsTermGeneral = new DateMap<
            LabeledDict<BizActionParamType>
        >();
        this.__timetable.terms.forEach((term) =>
            this.__paramsTermGeneral.set(
                term,
                new LabeledDict<BizActionParamType>()
            )
        );
    }

    /**
     * 全term で共通して利用できる汎用パラメータを取得する
     *
     * @param {string} label
     * @return {T | undefined}
     */
    getForAllTerm<T = BizActionParamType>(label: string): T | undefined {
        return this.__paramsGeneral.getContentByLabel<T>(label);
    }

    /**
     * 全term で共通して利用できる汎用パラメータを設定する
     *
     * @param {string} label
     * @param {any} content
     * @return {any | undefined}
     */
    setForAllTerm(
        label: string,
        content: BizActionParamType
    ): BizActionParamType | undefined {
        return this.__paramsGeneral.setContentWithLabel(content, label);
    }

    /**
     * 特定term でのみ利用できる汎用パラメータを取得する
     *
     * @param {Date} term
     * @param {string} label
     * @return {any | undefined}
     */
    get<T = BizActionParamType>(term: Date, label: string): T | undefined {
        return this.__paramsTermGeneral.get(term)?.getContentByLabel<T>(label);
    }

    /**
     * 特定term でのみ利用できる汎用パラメータを設定する
     *
     * @param {Date} term
     * @param {string} label
     * @param {BizActionParamType} content
     * @return {BizActionParamType | undefined}
     */
    set(
        term: Date,
        label: string,
        content: BizActionParamType
    ): BizActionParamType | undefined {
        if (
            this.__timetable.terms.some((t) => t.getTime() === term.getTime())
        ) {
            return this.__paramsTermGeneral
                .get(term)
                ?.setContentWithLabel(content, label);
        }
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizActionParamsToObject {
        return {
            paramsGeneral: this.__paramsGeneral.toObject(),
            paramsTermGeneral: this.__paramsTermGeneral.toObject(),
        };
    }

    static fromObject<DG = any, DTG = any>({
        timetable,
        paramsGeneral,
        paramsTermGeneral,
        decoderForGeneral,
        decoderForTermGeneral,
    }: {
        timetable: Timetable;
        decoderForGeneral?: DateMapContentDecoder<DG>;
        decoderForTermGeneral?: DateMapContentDecoder<DTG>;
    } & BizActionParamsToObject): BizActionParams {
        const newBizActionParam = new BizActionParams(timetable);
        LabeledDict.fromObject<DG>(paramsGeneral, decoderForGeneral)
            .getEntries()
            .forEach(([label, content]) => {
                //console.log('setForAllTerm', label, content);
                newBizActionParam.setForAllTerm(label, content);
            });

        const paramsTermGeneralDataMap = DateMap.fromObject(paramsTermGeneral);
        paramsTermGeneralDataMap.forEach((value, key) => {
            if (isLabeledDictToObject<DTG>(value)) {
                LabeledDict.fromObject<DTG>(value, decoderForTermGeneral)
                    .getEntries()
                    .forEach(([label, content]) =>
                        newBizActionParam.set(key, label, content)
                    );
            }
        });
        //console.log('BizActionParams.fromObject', newBizActionParam);
        return newBizActionParam;
    }
}

export type BizActionParamsToObject = {
    paramsGeneral: LabeledDictToObject<BizActionParamType>;
    paramsTermGeneral: DateMapToObject<LabeledDict<BizActionParamType>>;
};

// BizActionBase

export type BizActionBaseParam<T = any> = BizProcessorRequiredParam<
    T,
    BizComponentGroupType
> &
    BizActionBaseOptionalParam<T>;

export type BizActionBaseOptionalParam<T> = Partial<{
    name: string;
    description: string;
    actionId: BizActionId;
    actionType: BizActionType;
    priorityEntity: DateMap<Decimal>;
    actionParam: BizActionParams;
    externalData: T;
}>;

/**
 * [抽象クラス]
 * BizAction の基礎となる抽象クラス
 *
 * BizRelation により適切に設定された BizActionProcessor を処理する
 */
export abstract class BizActionBase<T = any, R = any>
    extends PubSub
    implements Processable
{
    private __timetable: Timetable;
    private __db: BizDatabase<T, BizComponentGroupType>;
    private __hyperMG: HyperParamManager;
    private __actionId: BizActionId;
    private __actionParam: BizActionParams;

    protected _priorities: Array<Decimal>;
    protected _priorityEntity: DateMap<Decimal>;
    protected _relations: Map<BizRelationID, BizRelation<R>>;

    // 公開プロパティ
    name: string;
    description: string | undefined;
    actionType: BizActionType;

    /**
     * 外部から設定されるデータ
     * @param {T} externalData
     */
    public externalData: T | undefined;

    /**
     *
     * @param {BizActionBaseParam} param0
     */
    constructor({
        timetable,
        db,
        hyperMG,
        name,
        description,
        actionId,
        actionType = BizActionType.GENERAL,
        priorityEntity,
        actionParam,
        externalData,
    }: BizActionBaseParam<T>) {
        super();

        this.__timetable = timetable;
        this.__timetable.addEventListener(
            Timetable.EVENT_TIMETABLE_UPDATED,
            this
        );
        this.__db = db;
        this.__hyperMG = hyperMG;
        this.__actionId = actionId ?? IDGenerator.generateId();
        this.__actionParam = actionParam ?? new BizActionParams(timetable);

        this.name = name ?? this.constructor.name;
        this.description = description;
        this.actionType = actionType;
        this.externalData = externalData;

        this._priorities = [];
        this._priorityEntity = priorityEntity ?? new DateMap<Decimal>();
        this._updatePriority();

        // overwrite 対象
        this._relations = new Map<BizRelationID, BizRelation<R>>();
    }

    /**
     * [override] PubSub
     * @param {string} eventName
     * @param {PublisherTriggerEventParam} keyParams
     */
    override handleEvent(
        eventName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        keyParams?: PublisherTriggerEventParam
    ): void {
        if (eventName == Timetable.EVENT_TIMETABLE_UPDATED) {
            this._updatePriority();
        }
    }

    // abstract Processable
    /**
     *
     */
    abstract prepareProcess(): void;

    /**
     *
     * @param {Array<Decimal>} sysInputs
     */
    abstract process(sysInputs: Array<Decimal>): void;

    // Props

    /**
     *
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     *
     */
    get db(): BizDatabase<T, BizComponentGroupType> {
        return this.__db;
    }

    /**
     *
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    /**
     *
     */
    get actionId(): BizActionId {
        return this.__actionId;
    }

    /**
     *
     */
    get relations(): Map<BizRelationID, BizRelation<R>> {
        return this._relations;
    }

    /**
     * term毎の優先度。同一termの中に同じ優先度があるときの実行順序は 保証されない。
     * 優先度の値が大きいほど「後」に計算される。
     *
     * かならず terms と同等の長さの配列になる。
     * NaN か Decimal(NaN) の要素の場合には、その term では利用されないことを意味する
     */
    get priorities(): Array<Decimal> {
        return this._priorities;
    }

    /**
     *
     */
    get actionParam(): BizActionParams {
        return this.__actionParam;
    }

    /**
     *
     */
    get bizComponent(): BizComponent | undefined {
        if (this.db.bizComponentId) {
            return this.db.selectById(this.db.bizComponentId);
        }
    }

    // Priority

    /**
     *
     */
    protected _updatePriority(): void {
        const priority: Array<Decimal> = [];
        this.timetable.terms.forEach((term) => {
            const result = Interpolation.interpolateByLatestValue(
                term,
                this._priorityEntity
            );
            if (result.isSuccess()) {
                priority.push(result.value);
            } else {
                priority.push(new Decimal('NaN'));
            }
        });
        this._priorities = priority;
    }

    /**
     * 優先度が設定されているかどうか
     *
     * @return {boolean}
     */
    hasAnyPriority(): boolean {
        return this._priorityEntity.size > 0;
    }

    /**
     * 指定term 以降に 優先度を更新・設定する
     *
     * @param {Date} targetDate
     * @param {Decimal} priority
     */
    setPriorityAt(targetDate: Date, priority: Decimal): void {
        this._priorityEntity.set(targetDate, priority);
        this._updatePriority();
    }

    /**
     * 優先度を初期化し、まとめて設定しなおす
     *
     * @param {DateMap<Decimal>} priorityEntity
     */
    setPriorities(priorityEntity: DateMap<Decimal>): void {
        this._priorityEntity = priorityEntity;
        this._updatePriority();
    }

    // BizRelation

    /**
     * Actor間の関係を設定する
     *
     * @param {BizRelation<R>} relation
     */
    setRelation(relation: BizRelation<R>): void {
        this.relations.set(relation.relationId, relation);
    }

    /**
     * 指定したActor間の関係を取得する
     *
     * @param {BizRelationID} relationId
     * @return {BizRelation<R> | undefined}
     */
    getRelation(relationId: BizRelationID): BizRelation<R> | undefined {
        return this.relations.get(relationId);
    }

    /**
     * 指定したActor間の関係を削除する
     *
     * @param {BizRelationID} relationId
     * @return {boolean}
     */
    removeRelation(relationId: BizRelationID): boolean {
        return this.relations.delete(relationId);
    }

    /**
     * 設定用Relation を生成する
     *
     * @param {BizProcOutputID} fromActorId
     * @param {BizProcOutputID} toActorId
     * @param {BizRelationID} relationId
     * @return {BizRelation<R>}
     */
    createSeedRelation(
        fromActorId: BizProcOutputID,
        toActorId: BizProcOutputID,
        relationId?: BizRelationID
    ): BizRelation<R> {
        return new BizRelation<R>({
            fromBizIOId: fromActorId,
            toBizIOId: toActorId,
            relationId,
        });
    }
}
