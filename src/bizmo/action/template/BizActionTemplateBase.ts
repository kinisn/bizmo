import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { DateMap } from 'bizmo/core/util/DateMap';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { PriorityGenerator } from '../PriorityGenerator';

/**
 * [抽象クラス]
 * 典型的な BizAction を生成する Factory の根底クラス。
 *
 * ・BizActionに必要な BizIO は、各メソッドを呼び出したタイミング（＝モデル設定時）で、自動的に追加すること。
 * ・BizActionの起点Termは、設定時の Timetable の current index により決定されること。
 *
 * ・各Template の入力パラメータは BizFunction で設定する
 *   ⇒ よくある 固定値（Decimal）と 確率値（ProbInput）と BizIOだけ の場合は、メソッドで提供する
 *
 * ＜POINT＞
 * ・BizAction を設定するためには、事前にBizIOがDBに登録されていることが必要になる。
 *   そのため、必要な BizIO は、Factory利用時に BizComponent に追加する必要がある。
 */
export class BizActionTemplateBase<T = any> {
    private __timetable: Timetable;
    private __db: BizDatabase<T, BizComponentGroupType>;
    private __hyperMG: HyperParamManager;
    private __bizComponent: BizComponent<T>;
    private __priorityGenerator: PriorityGenerator;

    /**
     *
     * @param {Object} params
     * @param {Timetable} params.timetable
     * @param {BizDatabase} params.db
     * @param {BizComponent} params.bizComponent
     * @param {PriorityGenerator} params.priorityGenerator
     */
    constructor({
        timetable,
        db,
        hyperMG,
        bizComponent,
        priorityGenerator,
    }: {
        timetable: Timetable;
        db: BizDatabase<T, BizComponentGroupType>;
        hyperMG: HyperParamManager;
        bizComponent: BizComponent<T>;
        priorityGenerator: PriorityGenerator;
    }) {
        this.__timetable = timetable;
        this.__db = db;
        this.__hyperMG = hyperMG;
        this.__bizComponent = bizComponent;
        this.__priorityGenerator = priorityGenerator;
    }

    // == Props ==

    /**
     * 共通して利用されるTimetable
     * @return {Timetable}
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     * 共通して利用されるBizDatabase
     * @return {BizDatabase<T, BizComponentGroupType>}
     */
    get db(): BizDatabase<T, BizComponentGroupType> {
        return this.__db;
    }

    /**
     * 共通して利用される HyperParamManager
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    /**
     * 生成 BizAction に適用される BizComponent
     * @return {BizComponent}
     */
    get bizComponent(): BizComponent<T> {
        return this.__bizComponent;
    }

    /**
     * 優先度の自動生成器
     * @return {PriorityGenerator}
     */
    get priorityGenerator(): PriorityGenerator {
        return this.__priorityGenerator;
    }

    // == Util ==

    /**
     * [継承先専用]
     * 当Termにだけ Action するように優先度を設定した 優先度辞書 を生成する
     * @return {DateMap<Decimal>}
     */
    protected _makePriorityDictOnlyForThisTerm(): DateMap<Decimal> {
        const priorityDict = new DateMap<Decimal>([
            [this.timetable.currentDate, this.priorityGenerator.generate()],
        ]);
        if (this.timetable.isInRangeIndex(this.timetable.currentIndex + 1)) {
            priorityDict.set(
                this.timetable.terms[this.timetable.currentIndex + 1],
                new Decimal('NaN') // 該当Term
            );
        }
        return priorityDict;
    }
}
