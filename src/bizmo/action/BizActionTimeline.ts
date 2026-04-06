import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizProcessorRequiredParam } from 'bizmo/core/bizProcessor/BizProcessor';
import { SystemInput } from 'bizmo/core/bizProcessor/func/input/SystemInput';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizActionDeserializer } from './BizActionDeserializer';
import { PriorityGenerator } from './PriorityGenerator';
import { BizAction, BizActionToObject } from './core/BizAction';
import { BizActionBase, BizActionId } from './core/BizActionBase';

export type BizActionTimelineParam<
    T = any,
    R = any,
> = BizProcessorRequiredParam<T, BizComponentGroupType> &
    BizActionTimelineOptionParam<T, R>;

export type BizActionTimelineOptionParam<T = any, R = any> = Partial<{
    id: string;
    actions: Map<BizActionId, BizAction<T, R>>;
    priorityCounter: Decimal;
}>;

/**
 * 全 BizAction のタイムライン
 *
 * 全 BizAction を保持し、各 Action の term 毎の優先度から、処理順序を管理する
 *
 * =  使い方  =
 * 1. BizAction を登録・設定する
 *      set_action
 *      remove_action
 * ２．BizAction を計算順に並び替える
 *      sort_to_timeline
 * ３．シミュレーションを実施する(並び替えも自動で行われる)
 *      process
 */
export class BizActionTimeline<T = any, R = any> {
    private __id: string;
    private __timetable: Timetable;
    private __db: BizDatabase<T, BizComponentGroupType>;
    private __hyperMG: HyperParamManager;
    private __preparedUpdateFullCollections: Array<
        BizIO<T, BizComponentGroupType>
    >;
    private __actions: Map<BizActionId, BizAction<T, R>>;
    private __priorityGenerator: PriorityGenerator;

    /**
     *
     * @param {BizActionTimelineParam} param0
     */
    constructor({
        timetable,
        db,
        hyperMG,
        actions,
        priorityCounter,
        id,
    }: BizActionTimelineParam<T, R>) {
        this.__id = id ?? IDGenerator.generateId();
        this.__timetable = timetable;
        this.__db = db as BizDatabase<T, BizComponentGroupType>; // DB側で制約しているものをそのまま受けいれる前提
        this.__hyperMG = hyperMG;
        this.__preparedUpdateFullCollections = [];
        this.__actions = new Map<BizActionId, BizAction<T, R>>();
        if (actions) {
            actions.forEach((action) => this.setAction(action));
        }
        this.__priorityGenerator = new PriorityGenerator(priorityCounter);
    }

    get id(): string {
        return this.__id;
    }

    /**
     * 対象 timetable
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     * 対象 db
     */
    get db(): BizDatabase<T, BizComponentGroupType> {
        return this.__db;
    }

    /**
     * 対象 HyperParamManager
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    /**
     * 優先度の自動生成器
     */
    get priorityGenerator(): PriorityGenerator {
        return this.__priorityGenerator;
    }

    /**
     * 登録されているActionの配列
     */
    get storedActions(): Array<BizAction<T, R>> {
        return Array.from(this.__actions.values());
    }

    // 1. BizAction を登録・設定する

    /**
     * BizAction を設定する
     * BizActionIDが同じ場合には、置き換えられる。
     *
     * 注意：  BizAction に priority が全く設定されていないと、process されない。
     * @param {BizAction} action
     * @param {DateMap<Decimal>} priorityEntity
     */
    setAction(
        action: BizAction<T, R>,
        priorityEntity?: DateMap<Decimal>
    ): void {
        this.__actions.set(action.actionId, action);
        if (priorityEntity) {
            action.setPriorities(priorityEntity);
        } else if (priorityEntity == undefined && !action.hasAnyPriority()) {
            // BizAction に priority が全く設定されていないと、process されないため自動設定
            action.setPriorityAt(
                this.timetable.startDate,
                new Decimal(this.priorityGenerator.generate())
            );
        }
    }

    /**
     * 指定したBizActionを削除する
     *
     * @param {BizActionId} actionId
     * @return {boolean}
     */
    removeAction(actionId: BizActionId): boolean {
        return this.__actions.delete(actionId);
    }

    // ２．BizAction を計算順に並び替える

    /**
     * 登録BizAction をタイムラインに並べた結果を取得する
     * @return {Array<Array<BizActionBase<T,R>>>}
     */
    sortToTimeline(): Array<Array<BizActionBase<T, R>>> {
        const result: Array<Array<BizActionBase<T, R>>> = [];
        const termDicts: Array<Map<BizActionId, Decimal>> = [];
        this.timetable.terms.forEach(() => {
            termDicts.push(new Map<BizActionId, Decimal>());
        });

        // action の priorities を term 毎に収集
        Array.from(this.__actions.values()).forEach((action) => {
            action.priorities.forEach((priority, pIndex) => {
                if (priority && !priority.isNaN()) {
                    termDicts[pIndex].set(action.actionId, priority);
                }
            });
        });

        // 各 term の priority で sort
        termDicts.forEach((termDict) => {
            result.push(
                Array.from(termDict.entries())
                    .sort((a, b) => a[1].minus(b[1]).toNumber())
                    .map((value) => this.__actions.get(value[0])!)
            );
        });
        return result;
    }

    // ３．シミュレーションを実施する

    /**
     * シミュレーション毎に process の実行準備を行う
     */
    prepareProcess(): void {
        Array.from(this.__actions.values()).forEach((action) =>
            action.prepareProcess()
        );
        // 設定されたFolder構成について自動更新準備
        this.__preparedUpdateFullCollections =
            this.db.prepareUpdateFullCollections();
    }

    /**
     * 企業活動を実施する
     * 必要に応じてリソースを消費し、増加させる
     *
     * @param {number} [startIndex=0]
     */
    process(startIndex: number = 0): void {
        if (this.timetable.isInRangeIndex(startIndex)) {
            const allOrderedActions = this.sortToTimeline();
            this.timetable.currentIndex = startIndex;
            for (
                let index = this.timetable.currentIndex;
                index < this.timetable.length;
                index++
            ) {
                // 全Folderの更新  TODO  ここ重すぎて注意かも。。子要素変更時に全termを処理していたときのほうがましか？
                this.db.updateFullCollections(
                    this.__preparedUpdateFullCollections
                );
                // BizAction の実行
                const orderedActions = allOrderedActions[index];
                if (orderedActions) {
                    const systemParam = new SystemInput(
                        index,
                        this.timetable.terms[index]
                    );
                    orderedActions.forEach((action) =>
                        action.process(systemParam.inputs)
                    );
                }
                if (index < this.timetable.length - 1) {
                    // 最終Indexを除き、毎Termごとに更新モードのHyperParamを選出する
                    this.hyperMG.prepareForNextTerm();
                }
                this.timetable.next();
            }
        }
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizActionTimelineToObject<T, R> {
        return {
            id: this.id,
            actions: Array.from(this.__actions.entries()).map(
                ([key, value]) => [key, value.toObject()]
            ),
            priorityCounter: String(
                this.priorityGenerator.getCurrentPriorityCounter()
            ),
        };
    }

    static fromObject<T = any, R = any>({
        obj,
        db,
        timetable,
        hyperMG,
    }: {
        obj: BizActionTimelineToObject<T, R>;
        db: BizDatabase<T, BizComponentGroupType>;
        timetable: Timetable;
        hyperMG: HyperParamManager;
    } & BizActionTimelineOptionParam<T, R>): BizActionTimeline<T, R> {
        let actions: Map<BizActionId, BizAction> | undefined;
        if (obj.actions) {
            actions = new Map<BizActionId, BizAction>(
                obj.actions.map(([key, value]) => {
                    return [
                        key,
                        BizActionDeserializer.fromObject<T, R>({
                            obj: value,
                            timetable,
                            db,
                            hyperMG,
                        })!,
                    ];
                })
            );
        }
        //console.log('BizActionTimeline: fromObject: actions', actions);

        return new BizActionTimeline<T, R>({
            db,
            timetable,
            hyperMG,
            id: obj.id,
            priorityCounter: obj.priorityCounter
                ? new Decimal(obj.priorityCounter)
                : undefined,
            actions: actions,
        });
    }
}

export type BizActionTimelineToObject<T = any, R = any> = {
    id: string;
    actions: Array<[BizActionId, BizActionToObject<T, R>]> | undefined;
    priorityCounter: string | undefined;
};
