import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { BizActionTimeline } from './action/BizActionTimeline';
import {
    BizComponent,
    BizComponentGroupType,
} from './bizComponent/BizComponent';
import { CollectionBizIORequiredParam } from './core/bizIO/collection/CollectionBizIO';
import { BizDatabase } from './core/db/BizDatabase';
import { HyperParamManager } from './core/hyperParam/HyperParamManager';
import { Timetable, TimetableToObject } from './core/util/Timetable';

/**
 * 事業シミュレーションを実行する
 */
export type BizSimulatorProps<T = any> = Partial<{
    component: BizComponent<T>;
    timeline: BizActionTimeline<T, RelationExtData>;
    id: string;
    name: string;
}> &
    Partial<CollectionBizIORequiredParam<T, BizComponentGroupType>>;

export class BizSimulator<T = any> {
    private __timetable: Timetable;
    private __db: BizDatabase<T, BizComponentGroupType>;
    private __hyperMG: HyperParamManager;
    private __component: BizComponent<T>;
    private __timeline: BizActionTimeline<T, RelationExtData>;

    id: string;
    name: string;

    constructor({
        timetable,
        db,
        hyperMG,
        timeline,
        component,
        id,
        name,
    }: BizSimulatorProps<T> = {}) {
        this.__timetable = timetable ?? new Timetable();
        this.__db = db ?? new BizDatabase<T, BizComponentGroupType>();
        this.__hyperMG = hyperMG ?? new HyperParamManager();
        this.__component =
            component ??
            new BizComponent<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
            });
        this.__timeline =
            timeline ??
            new BizActionTimeline<T, RelationExtData>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
            });

        this.name = name ?? 'BizSimulator';
        this.id = id ?? `BizSimulator_${this.timetable.currentDate.getTime()}`;
    }

    /**
     * Timetable
     * シミュレーションする期間
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     * BizDatabase
     * シミュレーションに利用するBizDatabase（BizIOおよび会計情報のDB）
     */
    get db(): BizDatabase<T, BizComponentGroupType> {
        return this.__db;
    }

    /**
     * BizComponent
     * シミュレーションするBizActionで利用できるBizComponent
     */
    get component(): BizComponent<T> {
        return this.__component;
    }

    /**
     * BizActionTimeline
     * シミュレーションするBizActionを管理する
     */
    get timeline(): BizActionTimeline<T, RelationExtData> {
        return this.__timeline;
    }

    /**
     * HyperParamManager
     * シミュレーションに利用する全てのユーザー設定Hyperパラメータの管理とBizAction・BizFunctionのための値生成
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    // simulate

    /**
     * シミュレーションを実行する。
     * @param startIndex 開始する term Index
     */
    simulate(startIndex?: number): void {
        this.timeline.prepareProcess();
        this.timeline.process(startIndex);
    }

    // == Serialize / Deserialize ==
    toObject(): BizSimulatorToObject {
        const topologicalSort = this.db.graph.topologicalSort();
        let dbSortedList: Array<string> = [];
        if (topologicalSort.isSuccess()) {
            dbSortedList = topologicalSort.value;
        }
        return {
            id: this.id,
            name: this.name,
            dataVersion: BIZMO_DATA_VERSION,
            timetable: this.timetable.toObject(),
            dbSortedList: dbSortedList,
            componentId: this.component.id,
            timelineId: this.timeline.id,
        };
    }
}

/**
 * データバージョン
 * データ構造に互換性のない変更があった場合にインクリメントする。
 * IDB に保存されたバージョンと一致しない場合、データを破棄して再初期化する。
 */
export const BIZMO_DATA_VERSION = 2;

export type BizSimulatorToObject = {
    id: string;
    name: string;
    dataVersion?: number;
    timetable: TimetableToObject;
    dbSortedList: Array<string>;
    componentId: string;
    timelineId: string;
};
