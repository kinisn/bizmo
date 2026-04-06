import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizProcOutput } from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { BizAction } from './BizAction';
import { BizActionProcessor } from './BizActionProcessor';

/**
 * [deprecated]
 */
export class CohortBizActionProcessor extends BizActionProcessor {
    /**
     *
     * @param {string} parentId
     * @param {string} targetId
     * @return {boolean}
     */
    override validateProcOutputFuncTemplate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        parentId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        targetId: string
    ): boolean {
        return true;
    }
}

/**
 * [deprecated]
 * Cohort 操作専用BizAction
 *
 * 2つの processor をもち、設定と更新をそれぞれ行うことができる。
 */
export class CohortBizAction extends BizAction {
    private static ACTION_1ST: string = 'ACTION_1ST';
    private static REACTION_RATES: string = 'REACTION_RATES';
    private static MONETARY_UNIT_VALUES: string = 'MONETARY_UNIT_VALUES';

    private static EXISTED_ACTION_1ST: string = 'EXISTED_ACTION_1ST';
    private static COHORT_RATE_OF_EXISTED_1ST: string =
        'COHORT_RATE_OF_EXISTED_1ST';
    private static MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST: string =
        'MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST';

    private static COHORT: string = 'COHORT';
    private static TERM_RELATIVE_INDEX: string = 'TERM_RELATIVE_INDEX';

    // param

    /**
     *
     * @param {Date} term
     * @return {BizFunction}
     */
    action1st(term: Date): BizFunction {
        return this.actionParam.get<BizFunction>(
            term,
            CohortBizAction.ACTION_1ST
        )!;
    }

    /**
     *
     * @param {Date} term
     * @return {Array<BizFunction>}
     */
    reactionRates(term: Date): Array<BizFunction> {
        return this.actionParam.get<Array<BizFunction>>(
            term,
            CohortBizAction.REACTION_RATES
        )!;
    }

    /**
     *
     * @param {Date} term
     * @return {Array<BizFunction>}
     */
    monetaryUnitValues(term: Date): Array<BizFunction> {
        return this.actionParam.get<Array<BizFunction>>(
            term,
            CohortBizAction.MONETARY_UNIT_VALUES
        )!;
    }

    /**
     *
     * @param {Date} term
     * @return {Array<BizFunction>}
     */
    existedAction1st(term: Date): BizFunction {
        return this.actionParam.get<BizFunction>(
            term,
            CohortBizAction.EXISTED_ACTION_1ST
        )!;
    }

    /**
     *
     * @param {Date} term
     * @return {Array<BizFunction>}
     */
    cohortRateOfExistedAction1st(term: Date): BizFunction {
        return this.actionParam.get<BizFunction>(
            term,
            CohortBizAction.COHORT_RATE_OF_EXISTED_1ST
        )!;
    }

    /**
     *
     * @param {Date} term
     * @return {Array<BizFunction>}
     */
    monetaryUnitValueOfExistedAction1st(term: Date): BizFunction {
        return this.actionParam.get<BizFunction>(
            term,
            CohortBizAction.MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST
        )!;
    }

    /**
     *
     * @param {Date} term
     * @param {BizFunction} action1st
     * @param {Array<BizFunction>} reactionRates
     * @param {Array<BizFunction>} monetaryUnitValues
     * @param {BizFunction} existedAction1st
     * @param {BizFunction} cohortRateOfExistedAction1st
     * @param {BizFunction} monetaryUnitValueOfExistedAction1st
     */
    setCohortSettingAt({
        term,
        action1st,
        reactionRates,
        monetaryUnitValues,
        existedAction1st,
        cohortRateOfExistedAction1st,
        monetaryUnitValueOfExistedAction1st,
    }: {
        term: Date;
        action1st?: BizFunction;
        reactionRates?: Array<BizFunction>;
        monetaryUnitValues?: Array<BizFunction>;
        existedAction1st?: BizFunction;
        cohortRateOfExistedAction1st?: BizFunction;
        monetaryUnitValueOfExistedAction1st?: BizFunction;
    }) {
        if (monetaryUnitValueOfExistedAction1st) {
            this.actionParam.set(
                term,
                CohortBizAction.MONETARY_UNIT_VALUE_OF_EXISTED_ACTION_1ST,
                monetaryUnitValueOfExistedAction1st
            );
        }
        if (cohortRateOfExistedAction1st) {
            this.actionParam.set(
                term,
                CohortBizAction.COHORT_RATE_OF_EXISTED_1ST,
                cohortRateOfExistedAction1st
            );
        }
        if (existedAction1st) {
            this.actionParam.set(
                term,
                CohortBizAction.EXISTED_ACTION_1ST,
                existedAction1st
            );
        }
        if (monetaryUnitValues) {
            this.actionParam.set(
                term,
                CohortBizAction.MONETARY_UNIT_VALUES,
                monetaryUnitValues
            );
        }
        if (reactionRates) {
            this.actionParam.set(
                term,
                CohortBizAction.REACTION_RATES,
                reactionRates
            );
        }
        if (action1st) {
            this.actionParam.set(term, CohortBizAction.ACTION_1ST, action1st);
        }

        // 一気に更新
        this.__updateSettingProcessorAt(term);
    }

    /**
     * Cohort 更新対象termの相対index
     */
    get termRelativeIndex(): number {
        return this.actionParam.getForAllTerm<number>(
            CohortBizAction.TERM_RELATIVE_INDEX
        )!;
    }

    /**
     *
     */
    get cohort(): CohortComponent {
        // 初期化するときまでに与える前提で、必ず存在する
        return this.actionParam.getForAllTerm<CohortComponent>(
            CohortBizAction.COHORT
        )!;
    }

    /**
     *
     * @param {CohortComponent} cohort
     * @param {number} termRelativeIndex
     */
    setCohort(cohort: CohortComponent, termRelativeIndex = 0): void {
        if (cohort) {
            this.actionParam.setForAllTerm(CohortBizAction.COHORT, cohort);
            this.actionParam.setForAllTerm(
                CohortBizAction.TERM_RELATIVE_INDEX,
                termRelativeIndex
            );
            this.__updateCohortProcessor();
            this.__updateSettingProcessorAt(this.timetable.currentDate);
        }
    }

    // overwrite

    /**
     * 新しい CohortBizActionProcessor を最後に追加する
     *
     * @param {Array<BizFunction>} orderedFunctions
     * @param {Array<BizProcOutput>} outputs
     * @return {CohortBizActionProcessor}
     */
    appendActionProcessor(
        orderedFunctions?: Array<BizFunction>,
        outputs?: Array<BizProcOutput>
    ): CohortBizActionProcessor {
        const processor = new CohortBizActionProcessor({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            orderedFunctions: orderedFunctions,
            outputs: outputs,
        });
        this.orderedProcessors.push(processor);
        return processor;
    }

    /**
     * [overwrite 専用]
     * BizAction の通常の初期化処理の最後に処理を行う
     */
    _initAction(): void {
        // 2プロセスの準備
        if (this.orderedProcessors.length > 2) {
            // 第1プロセスだけ残して削除
            for (let cnt = this.orderedProcessors.length - 1; cnt > 0; cnt--) {
                this.removeActionProcessorAt(cnt);
            }
        }
        if (this.orderedProcessors.length == 1) {
            this.appendActionProcessor();
        }
    }

    /**
     *
     */
    _prepareEachTermProcess(): void {
        this.__updateSettingProcessorAt(this.timetable.currentDate);
    }

    // 内部設定

    /**
     * 更新用 processor を設定する
     */
    __updateCohortProcessor(): void {
        if (this.cohort) {
            // 初期化
            this.orderedProcessors[1].clearProcessor();
            // 設定
            const func = new BizFunction({ code: 'update_cohort(bizid0)' });
            func.addBizIOInput(this.cohort.id, this.termRelativeIndex);
            this.orderedProcessors[1].addBizFunction(func);
        }
    }

    /**
     * 特定termにむけて設定用 processor を設定する
     *
     * @param {Date} term
     */
    __updateSettingProcessorAt(term: Date): void {
        if (this.cohort) {
            // 初期化
            this.processor1st.clearProcessor();

            // 設定：既存
            const action1st = this.action1st(term);
            if (action1st) {
                this.processor1st.addBizFunction(action1st);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        outputFuncId: action1st.funcId,
                        outputBizId: this.cohort.action1st.id,
                        parentId: this.cohort.id,
                    })
                );
            }
            const existedAction1st = this.existedAction1st(term);
            if (existedAction1st) {
                this.processor1st.addBizFunction(existedAction1st);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        outputFuncId: existedAction1st.funcId,
                        outputBizId: this.cohort.existedAction1st.id,
                        parentId: this.cohort.id,
                    })
                );
            }
            const cohortRateOfExistedAction1st =
                this.cohortRateOfExistedAction1st(term);
            if (cohortRateOfExistedAction1st) {
                this.processor1st.addBizFunction(cohortRateOfExistedAction1st);
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        outputFuncId: cohortRateOfExistedAction1st.funcId,
                        outputBizId:
                            this.cohort.cohortRateOfExistedAction1st.id,
                        parentId: this.cohort.id,
                    })
                );
            }
            const monetaryUnitValueOfExistedAction1st =
                this.monetaryUnitValueOfExistedAction1st(term);
            if (monetaryUnitValueOfExistedAction1st) {
                this.processor1st.addBizFunction(
                    monetaryUnitValueOfExistedAction1st
                );
                this.processor1st.addProcOutput(
                    new BizProcOutput({
                        outputFuncId:
                            monetaryUnitValueOfExistedAction1st.funcId,
                        outputBizId:
                            this.cohort.monetaryUnitValueOfExistedAction1st.id,
                        parentId: this.cohort.id,
                    })
                );
            }

            // 設定：将来
            const reactionRates = this.reactionRates(term);
            if (reactionRates) {
                reactionRates.forEach((reactionRate, index) => {
                    this.processor1st.addBizFunction(reactionRate);
                    this.processor1st.addProcOutput(
                        new BizProcOutput({
                            outputFuncId: reactionRate.funcId,
                            outputBizId:
                                this.cohort.reactionRateIndex(index)?.id,
                            parentId: this.cohort.id,
                        })
                    );
                });
            }

            const monetaryUnitValues = this.monetaryUnitValues(term);
            if (monetaryUnitValues) {
                monetaryUnitValues.forEach((monetaryUnitValue, index) => {
                    this.processor1st.addBizFunction(monetaryUnitValue);
                    this.processor1st.addProcOutput(
                        new BizProcOutput({
                            outputFuncId: monetaryUnitValue.funcId,
                            outputBizId:
                                this.cohort.monetaryUnitValueIndex(index)?.id,
                            parentId: this.cohort.id,
                        })
                    );
                });
            }
        }
    }
}
