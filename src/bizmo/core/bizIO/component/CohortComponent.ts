import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { BizProcessorRequiredParam } from 'bizmo/core/bizProcessor/BizProcessor';
import { CohortFucProtocol } from 'bizmo/core/bizProcessor/func/parser/core/SpecialFunctionTokens';
import { PublisherTriggerEventParam } from 'bizmo/core/util/Pubsub';
import Decimal from 'decimal.js';
import formatToYYYYMMDD from '../../util/DateFormatter';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
import {
    BizIO,
    BizIOInit,
    BizIOOptionalParam,
    ReadOnlyBizIO,
} from '../single/BizIOs';
import { BizValue } from '../value/BizValue';
import { RateComponent } from './RateComponent';

/**
 * Cohort Setting Parts
 *
 * 各termにおける経過期間（経過term数:0,1,...,N-2,N-1）の設定を容易にするための仕組み。
 * 例） 各termで想定する Action1 実施からの経過term数による reaction rate ⇒ 実際の特定termにおける cohort rate
 *
 * ＜背景＞
 * BizProcessor が 特定term を処理している際は、他のtermを処理することができない。
 * そのため、Action 1st からの経過term数に依存して変化する値のシミュレートが必要な場合（例：継続率）には、
 * 特定termにおける配列のようなデータを取り扱う必要がある。
 * しかし、上記 BizProcessor の特性上、配列要素はindex単位で別BizIOに分解する必要があるため、このクラスにて仕組を提供する
 *
 * ＜前提＞
 * クラス内で子要素として内部で生成された要素は、その要素が削除されることはないとする。
 */
export class CohortSettingParts<
    T = any,
    S extends string = string,
> extends CollectionBizIO<T, S> {
    // eslint-disable-next-line require-jsdoc
    static inputIndexLabel(index: number): string {
        return `INPUT_INDEX_${index}`;
    }
    // eslint-disable-next-line require-jsdoc
    static outputFor1stAtLabel(term: Date): string {
        return `OUTPUT_FOR_1ST_AT_${formatToYYYYMMDD(term)}`;
    }

    /**
     * [overwrite]
     * 重要： 初期化処理の高速化のために auto update を一時停止している前提
     * @param {BizIOInit} initData
     */
    _initData(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initData?: BizIOInit
    ): void {
        // input
        for (let index = 0; index < this.timetable.length; index++) {
            // input
            let label = CohortSettingParts.inputIndexLabel(index);
            this.appendChild(
                new BizIO<T, S>({
                    timetable: this.timetable,
                    db: this.db,
                    name: label,
                }),
                label
            );
            // output
            label = CohortSettingParts.outputFor1stAtLabel(
                this.timetable.terms[index]
            );
            this.appendChild(
                new ReadOnlyBizIO<T, S>({
                    timetable: this.timetable,
                    db: this.db,
                    name: label,
                }),
                label
            );
        }
    }

    /**
     * 指定経過term数における数値を設定・管理するBizIO
     * @param {number} index
     * @return {BizIO<T,S> | undefined}
     */
    inputIndex(index: number): BizIO<T, S> | undefined {
        return this.selectChildBySystemName(
            CohortSettingParts.inputIndexLabel(index)
        );
    }

    /**
     * [ユーザーはRead Only]
     * 指定したtermに Action 1st をしたグループに期間における、出力
     * @param {Date} targetDate
     * @return {ReadOnlyBizIO | undefined}
     */
    outputFor1stAt(targetDate: Date): ReadOnlyBizIO<T, S> | undefined {
        return this.selectChildBySystemName(
            CohortSettingParts.outputFor1stAtLabel(targetDate)
        );
    }

    /**
     * [overwrite] 要素を完全に削除する
     * @param {boolean} triggerEvent
     */
    delete(triggerEvent: boolean = true): void {
        this.systemLabeledChildren.forEach((child) =>
            child.delete(triggerEvent)
        );
        super.delete(triggerEvent);
    }

    /**
     * Output を更新する
     * 設定されている input_index をもとに output_for_1st_at を更新する
     *
     * term     |  t0  |  t1  |  t2  |  t3  |
     * -------------------------------------
     * index_0  |  c00 |  c01 |  c02 |  c03 |
     * index_1  |  c10 |  c11 |  c12 |  c13 |
     * index_2  |  c20 |  c21 |  c22 |  c23 |
     * index_3  |  c30 |  c31 |  c32 |  c33 |
     * -------------------------------------
     * cohort_t0|  c00 |  c11 |  c22 |  c33 |
     * cohort_t1|  --  |  c01 |  c12 |  c23 |
     * cohort_t2|  --  |  --  |  c02 |  c13 |
     * cohort_t3|  --  |  --  |  --  |  c03 |
     *
     * @param {boolean} isCapped 前termに上限を設定するかどうか
     */
    updateOutput(isCapped: boolean): void {
        // output を設定
        for (
            let act1Index = 0;
            act1Index < this.timetable.terms.length;
            act1Index++
        ) {
            const act1Term = this.timetable.terms[act1Index];
            const cohort = [];
            for (
                let makingIndex = 0;
                makingIndex < this.timetable.terms.length;
                makingIndex++
            ) {
                const makingTerm = this.timetable.terms[makingIndex];
                let value = new Decimal(0);
                if (
                    act1Index <= makingIndex &&
                    makingIndex <= this.timetable.currentIndex
                ) {
                    value = this.inputIndex(makingIndex - act1Index)! // 必ずあるはず
                        .timetableHistory[makingIndex].value;
                    // cap設定
                    if (
                        isCapped &&
                        act1Index < makingIndex &&
                        cohort[cohort.length - 1].value < value
                    ) {
                        value = cohort[cohort.length - 1].value;
                    }
                } // TODO 本当は term があるところだけ編集すればいい

                cohort.push(new BizValue(makingTerm, value));
            }

            const outputFor1st = this.outputFor1stAt(act1Term)!; // 必ずあるはず
            outputFor1st.setEditable(true);
            outputFor1st.setHistory(cohort);
            outputFor1st.setEditable(false);
        }
    }
}

/**
 * CohortComponentParam
 *
 * 独自
 * @param {BizIO} action1stAgent First Action の変遷を管理するBizIO。ただし自己の内部Childを含めてはいけない
 */
export type CohortComponentParam<
    T = any,
    S extends string = string,
> = BizProcessorRequiredParam<T, S> &
    BizIOOptionalParam & {
        action1stAgent?: BizIO<T, S>;
    };

export const CohortTypes = {
    REACTION: 'REACTION_COHORT',
    MONETARY_VALUE: 'MONETARY_VALUE_COHORT',
} as const;
export type CohortTypes = (typeof CohortTypes)[keyof typeof CohortTypes];

/**
 * Cohort Component
 *
 * 経過観察をシミュレートするためのモデル
 * ユーザーが【termXで行為Aを行った】後、【term経過毎に行為Bを行った】ことをシミュレートする。
 *
 * # 利用方法
 * 1. input項目を設定
 * 2. update_cohort を実施
 *      2-1. BizProcess経由
 *      注意： BizFunc の中で「更新」してしまうため、同一 BizProcess の中で、Input を変更しても反映されない。
 *              => 2つの BizProcess に分離して、設定と実行として行うこと。
 *                 <= cohort output の順序を後ろにしても、output phase に入る前に、process phase で更新されてしまうため。
 * 3. output に計算結果を格納
 *
 * = POINT =
 * 有償サブスクをシミュレートする際に、途中でCohortのレートが「向上」する方に変更された場合、
 * 既にやめてしまったUserが呼び戻されるような異常な結果が想定されるが、どう対処するか？
 * 前提： 母集団は変更しない
 * 解決： 前termの値より「大きくなる」場合には、自動的に前termの値が適用されて、Capされる。
 *       ⇒ 大きいのがまずいのか、小さいのがまずいのかは、対象によるため、選択できるべきだが、今は大きい方のみ
 *
 * ＜前提＞
 * クラス内で子要素として内部で生成された要素は、その要素が削除されることはないとする。
 */
export class CohortComponent<T = any, S extends string = string>
    extends CollectionBizIO<T, S>
    implements CohortFucProtocol
{
    // inputs
    static ACTION_1ST_AGENT: string = 'ACTION_1ST_AGENT';
    static EXISTED_ACTION_1ST: string = 'EXISTED_ACTION_1ST';
    static COHORT_RATE_OF_EXISTED_ACTION_1ST: string =
        'COHORT_RATE_OF_EXISTED_ACTION_1ST';
    static MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST: string =
        'MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST';
    static MONETARY_VALUE_OF_EXISTED_ACTION_1ST: string =
        'MONETARY_VALUE_OF_EXISTED_ACTION_1ST';

    // outputs
    static ACTION_1ST_ACCUM: string = 'ACTION_1ST_ACCUM';
    // eslint-disable-next-line require-jsdoc
    static action1stAccumulatedElemWithDate(term: Date): string {
        return `ACTION_1ST_ACCUM_ELEM_${formatToYYYYMMDD(term)}`;
    }
    static ACTION_2ND: string = 'ACTION_2ND';
    // eslint-disable-next-line require-jsdoc
    static action2ndOf1stAt(term: Date): string {
        return `ACTION_2ND_OF_1ST_AT_${formatToYYYYMMDD(term)}`;
    }
    static EXISTED_ACTION_2ND: string = 'EXISTED_ACTION_2ND';
    static RATE_1ST_2ND: string = 'RATE_1ST_2ND';

    static MONETARY_VALUE: string = 'MONETARY_VALUE';
    // eslint-disable-next-line require-jsdoc
    static monetaryValueOf1stAt(term: Date): string {
        return `MONETARY_VALUE_OF_1ST_AT_${formatToYYYYMMDD(term)}`;
    }

    // === params ===
    private __isCapped: boolean;
    private __isAction1stAgentCreated: boolean;

    /**
     *
     * @param {CohortComponentParam} param0
     */
    constructor({
        timetable,
        db,
        hyperMG,
        bizIOId,
        name,
        accountName = AccountNames.INHERITANCE,
        complement = true,
        initUpdate = true,
        action1stAgent,
    }: CohortComponentParam<T, S>) {
        super({
            timetable,
            db,
            hyperMG,
            bizIOId,
            accountName,
            complement,
            initUpdate,
            name,
        });
        this.__isCapped = false; // s_capped を初期化

        // 初期化処理のために内部子要素を設定するまで auto update を一時停止し、Folder への update伝播を停止する
        const currentMode = db.autoUpdateDependencies;
        this.db.autoUpdateDependencies = false;

        // === Input: read/write ===
        // action_1st_agent
        this.__isAction1stAgentCreated = false;
        let label = CohortComponent.ACTION_1ST_AGENT;
        let child = action1stAgent;
        if (!child) {
            child = new BizIO<T, S>({ timetable, db, name: label });
            this.__isAction1stAgentCreated = true;
        }
        this.appendChild(child, label);

        // existed_act_1st
        label = CohortComponent.EXISTED_ACTION_1ST;
        this.appendChild(
            new BizIO<T, S>({ timetable, db, name: label }),
            label
        );

        // cohort_rate_of_existed_act_1st
        label = CohortComponent.COHORT_RATE_OF_EXISTED_ACTION_1ST;
        this.appendChild(
            new BizIO<T, S>({ timetable, db, name: label }),
            label
        );

        // mon_unit_v_of_existed_act_1
        label = CohortComponent.MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST;
        this.appendChild(
            new BizIO<T, S>({ timetable, db, name: label }),
            label
        );

        // === Cohort: input & output ===
        // Cohort: reaction_rate
        label = CohortTypes.REACTION;
        this.appendChild(
            new CohortSettingParts<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
            }),
            label
        );

        // Cohort: avg_revenue
        label = CohortTypes.MONETARY_VALUE;
        this.appendChild(
            new CohortSettingParts<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
            }),
            label
        );

        // === Outputs:  read only ===
        // action 2nd of existed action 1st
        label = CohortComponent.EXISTED_ACTION_2ND;
        this.appendChild(
            new CollectionBizIO<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
                exportWithChildren: false,
                summarizeMode: CollectionSummarizeMode.TOTAL_MULTIPLE,
            }),
            label
        );
        this.existedAction2nd.appendChild(this.existedAction1st);
        this.existedAction2nd.appendChild(this.cohortRateOfExistedAction1st);

        // action 1st: accumulated
        label = CohortComponent.ACTION_1ST_ACCUM;
        this.appendChild(
            new CollectionBizIO<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
                exportWithChildren: false,
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            }),
            label
        );

        // action 1st: existed action 1st
        this.action1stAccum.appendChild(this.existedAction1st);

        // action 1st: normal action 1st element
        this.timetable.terms.forEach((term) => {
            label = CohortComponent.action1stAccumulatedElemWithDate(term);
            this.action1stAccum.appendChild(
                new ReadOnlyBizIO<T, S>({ timetable, db, name: label }),
                label
            );
        });

        // action 2nd
        label = CohortComponent.ACTION_2ND;
        this.appendChild(
            new CollectionBizIO<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
                exportWithChildren: true,
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            }),
            label
        );

        // action 2nd: existed action 2nd
        this.action2nd.appendChild(this.existedAction2nd);

        // action 2nd: normal action 2nd element
        this.timetable.terms.forEach((term) => {
            label = CohortComponent.action2ndOf1stAt(term);
            this.action2nd.appendChild(
                new CollectionBizIO<T, S>({
                    timetable,
                    db,
                    hyperMG,
                    name: label,
                    exportWithChildren: false,
                    summarizeMode: CollectionSummarizeMode.TOTAL_MULTIPLE,
                }),
                label
            );
            this.action2ndOf1stAt(term)!.appendChildren([
                this.action1stAt(term)!,
                this.cohortRateOf1stAt(term)!,
            ]);
        });

        // rate: 2nd / 1st-accum
        label = CohortComponent.RATE_1ST_2ND;
        this.appendChild(
            new RateComponent<T, S>({
                timetable,
                db,
                hyperMG,
                denominator: this.action1stAccum,
                numerator: this.action2nd,
                name: label,
            }),
            label
        );

        // monetary value
        label = CohortComponent.MONETARY_VALUE;
        this.appendChild(
            new CollectionBizIO<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
                exportWithChildren: false,
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
            }),
            label
        );

        // monetary value: existed action 1st
        label = CohortComponent.MONETARY_VALUE_OF_EXISTED_ACTION_1ST;
        this.appendChild(
            new CollectionBizIO<T, S>({
                timetable,
                db,
                hyperMG,
                name: label,
                exportWithChildren: false,
                summarizeMode: CollectionSummarizeMode.TOTAL_MULTIPLE,
            }),
            label
        );
        this.monetaryValueOfExistedAction1st.appendChildren([
            this.monetaryUnitValueOfExistedAction1st,
            this.existedAction2nd,
        ]);
        this.monetaryValue.appendChild(this.monetaryValueOfExistedAction1st);

        // monetary value: normal action 2nd element
        this.timetable.terms.forEach((term) => {
            label = CohortComponent.monetaryValueOf1stAt(term);
            this.appendChild(
                new CollectionBizIO<T, S>({
                    timetable,
                    db,
                    hyperMG,
                    name: label,
                    exportWithChildren: false,
                    summarizeMode: CollectionSummarizeMode.TOTAL_MULTIPLE,
                }),
                label
            );
            this.monetaryValueOf1stAt(term)!.appendChildren([
                this.monetaryUnitValueOf1stAt(term)!,
                this.action2ndOf1stAt(term)!,
            ]);
            this.monetaryValue.appendChild(this.monetaryValueOf1stAt(term)!);
        });

        this.db.autoUpdateDependencies = currentMode;

        // Agent 初期化
        this.__setHistoryOfAction1st();
    }

    /**
     * Action 1st の内部構造に値を設定する。
     * Timetable の current だけを対象にする
     */
    private __setHistoryOfAction1st(): void {
        if (this.action1st) {
            const bizValue =
                this.action1st.timetableHistory[this.timetable.currentIndex];
            const action1stElem = this.action1stAt(bizValue.date);
            // TODO termが長くなった場合には、問答無用で変更しないで、確認した方が早そう。
            if (action1stElem) {
                action1stElem.setEditable(true);
                action1stElem.set(bizValue);
                action1stElem.setEditable(false);
            }
        }
    }

    /**
     * [overwrite]
     * @param {string} eventName
     * @param {PublisherTriggerEventParam} keyParams
     */
    handleEvent(
        eventName: string,
        keyParams?: PublisherTriggerEventParam
    ): void {
        if (eventName == BizIO.EVENT_CHILDREN_VALUES_UPDATED) {
            const updatedBizIO = keyParams?.get(
                BizIO.EVENT_CHILDREN_VALUES_UPDATED__UPDATED_BIZ_IO
            ) as BizIO<T, S>;
            this._updateHistoryReference(updatedBizIO);
        }
    }

    /**
     * [overwrite]
     */
    _updateHistoryReferenceWithoutNotification(): void {
        // update_history_referenceの共通処理
        this.__setHistoryOfAction1st();
        super._processUpdate();
    }

    /**
     *
     * @param {boolean} triggerEvent
     */
    delete(triggerEvent: boolean): void {
        const action1stId = this.action1st.id;
        this.systemLabeledChildren.forEach((child) => {
            if (this.__isAction1stAgentCreated) {
                child.delete(false);
            } else if (child.id != action1stId) {
                child.delete(false);
            }
        });
        super.delete(triggerEvent);
    }

    // Overwrite: CohortFucProtocol

    /**
     * Cohort を更新する
     */
    updateCohort(): void {
        this.__cohortOf(CohortTypes.REACTION).updateOutput(this.isCapped);
        this.__cohortOf(CohortTypes.MONETARY_VALUE).updateOutput(false); // 金銭価値は絶対で固定
    }

    // === Config ===

    /**
     * output計算時に、前termの出力結果を上限とするかどうか
     */
    get isCapped(): boolean {
        return this.__isCapped;
    }

    /**
     * output計算時に、前termの出力結果を上限とするかどうか
     * @param {boolean} isCapped
     */
    set isCapped(isCapped: boolean) {
        this.__isCapped = isCapped;
    }

    // === Cohort Accessor ===

    /**
     * 内部Cohortパーツを取得する
     * @param {CohortTypes} cohortName
     * @return {CohortSettingParts<T,S>}
     */
    private __cohortOf(cohortName: CohortTypes): CohortSettingParts<T, S> {
        return this.selectChildBySystemName(cohortName) as CohortSettingParts<
            T,
            S
        >;
    }

    // === Input Accessor ===

    /**
     * [input] Action 1st の変遷を管理する BizIO。
     * オリジナルまでたどれば、どこかで書き込み可能なBizIO 例）新規ユーザー数
     * 注意： 既存 Action 1st は対象にならないので existed_action_1st を利用すること。
     */
    get action1st(): BizIO<T, S> {
        return this.selectChildBySystemName(CohortComponent.ACTION_1ST_AGENT)!;
    }

    /**
     * [input] Action 1stについて、 特定indexで想定する Action2転換率（のterm間の変移）
     * 注意： 既存 Action 1st は対象にならないので rate_2nd_of_existed_action_1st を利用すること。
     * @param {number} index
     * @return {BizIO<T,S> | undefined}
     */
    reactionRateIndex(index: number): BizIO<T, S> | undefined {
        return this.__cohortOf(CohortTypes.REACTION).inputIndex(index);
    }

    /**
     * [input] 特定index で想定する Action2nd 1回あたりの金銭価値（単価）
     * @param {number} index
     * @return {BizIO<T,S> | undefined}
     */
    monetaryUnitValueIndex(index: number): BizIO<T, S> | undefined {
        return this.__cohortOf(CohortTypes.MONETARY_VALUE).inputIndex(index);
    }

    // === 既存 Action 1st 関係 ===
    /**
     * [input] 既存 Action 1st
     * timeline 以前に Action 1st を実施した累積数。 例) 既存ユーザー数
     */
    get existedAction1st(): BizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.EXISTED_ACTION_1ST
        )!;
    }

    /**
     * [input] 既存 Action 1st の Action 2nd 転換率 （の経過観察結果）
     * ・既存 Action 1st が timeline の各 term で Action 2nd を実施する確率
     * ・既存ユーザーは Retention Rate が全体として安定しているという想定
     */
    get cohortRateOfExistedAction1st(): BizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.COHORT_RATE_OF_EXISTED_ACTION_1ST
        )!;
    }

    /**
     * [input] 既存 Action 1st グループにおける Action 2nd 1回あたりの金銭価値（単価）
     */
    get monetaryUnitValueOfExistedAction1st(): BizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST
        )!;
    }

    // === Output Accessors ===

    /**
     * Action 1st の 累計値。 existed_action_1st も含まれる。
     * 例） 累積新規ユーザー数 ≒ 会員数
     * [依存関係] Action 1st や existed_action_1st が設定・更新されると、自動的に計算される
     */
    get action1stAccum(): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(CohortComponent.ACTION_1ST_ACCUM)!;
    }

    /**
     * 指定term に Action 1st を実施した群
     * [依存関係] Action 1st が設定・更新されると、自動的に計算される
     * @param {Date} targetDate
     * @return {ReadOnlyBizIO | undefined}
     */
    action1stAt(targetDate: Date): ReadOnlyBizIO<T, S> {
        return this.action1stAccum?.selectChildBySystemName(
            CohortComponent.action1stAccumulatedElemWithDate(targetDate)
        )!;
    }

    /**
     * 指定term に Action 1st を実施した群について、経過観察した Action 2nd の発生確率 を取得する
     * [依存関係] update_cohort メソッドにより生成される。
     * @param {Date} targetDate
     * @return {ReadOnlyBizIO | undefined}
     */
    cohortRateOf1stAt(targetDate: Date): ReadOnlyBizIO<T, S> {
        return this.__cohortOf(CohortTypes.REACTION).outputFor1stAt(
            targetDate
        )!;
    }

    /**
     * 指定term に Action 1st を実施した群について、経過観察した Action 2nd の実数を取得する
     * [依存関係] cohort_rate_of_1st_at が設定・更新されると、自動的に計算される
     * @param {Date} targetDate
     * @return {CollectionBizIO | undefined}
     */
    action2ndOf1stAt(targetDate: Date): CollectionBizIO<T, S> {
        return this.action2nd.selectChildBySystemName(
            CohortComponent.action2ndOf1stAt(targetDate)
        )!;
    }

    /**
     * Action 1st 実施後に Action 2nd を行った数の累計値。existed_action_2nd を含む
     * 例） 課金ユーザー数
     * ・数が、人数（Unique User）なのか 行動回数 なのかは 利用者次第
     * [依存関係] action_2nd_of_1st_at や existed_action_2nd が設定・更新されると、自動的に計算される
     */
    get action2nd(): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(CohortComponent.ACTION_2ND)!;
    }

    /**
     * 全体 Action 2nd 転換率
     * Action 1st 累計値 / Action 2nd 累計値
     * [依存関係] action_1st と action_2nd が設定・更新されると、自動的に計算される
     */
    get rate1st2nd(): RateComponent<T, S> {
        return this.selectChildBySystemName(CohortComponent.RATE_1ST_2ND)!;
    }

    /**
     * [output]
     * 既存 Action 1st の Action 2nd 実施数
     * [依存関係]existed_action_1st と cohort_rate_of_existed_action_1st が設定・更新されると、自動的に計算される
     */
    get existedAction2nd(): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.EXISTED_ACTION_2ND
        )!;
    }

    /**
     * [output]
     * Action 2nd 全体の金銭価値
     */
    get monetaryValue(): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(CohortComponent.MONETARY_VALUE)!;
    }

    /**
     * 指定term に Action 1st を実施した群について、経過観察した Action 2nd あたりの単価を取得する
     * なお、既存 Action 1st は対象にしない。
     * [依存関係] update_cohort メソッドにより生成される。
     * @param {Date} targetDate
     * @return {ReadOnlyBizIO | undefined}
     */
    monetaryUnitValueOf1stAt(targetDate: Date): ReadOnlyBizIO<T, S> {
        return this.__cohortOf(CohortTypes.MONETARY_VALUE).outputFor1stAt(
            targetDate
        )!;
    }

    /**
     * 指定term に Action 1st を実施した群について、経過観察した Action 2nd の金銭価値 を取得する。
     * なお、既存 Action 1st は対象にしない。
     * [依存関係] monetary_unit_value_of_1st_at が設定・更新されると、自動的に計算される
     * @param {Date} targetDate
     * @return {CollectionBizIO<T,S> | undefined}
     */
    monetaryValueOf1stAt(targetDate: Date): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.monetaryValueOf1stAt(targetDate)
        )!;
    }

    /**
     * 既存 Action 1st グループについて、経過観察した Action 2nd 全体の金銭価値 を取得する。
     * [依存関係] existed_action_2nd や monetary_unit_value_of_existed_action_1st が設定・更新されると、自動的に計算される
     */
    get monetaryValueOfExistedAction1st(): CollectionBizIO<T, S> {
        return this.selectChildBySystemName(
            CohortComponent.MONETARY_VALUE_OF_EXISTED_ACTION_1ST
        )!;
    }
}
