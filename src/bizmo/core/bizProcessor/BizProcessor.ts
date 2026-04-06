import {
    JournalSlipParam,
    JournalSlipParamToObject,
} from 'bizmo/core/accounting/JournalSlipParam';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizIOId, BizIORequiredParam } from '../bizIO/single/BizIOs';
import { HyperParamManager } from '../hyperParam/HyperParamManager';
import { BizFunction, BizFunctionToObject } from './func/BizFunction';
import { BizFuncResult } from './func/input/BizFuncResult';
import { BizIOConf } from './func/input/BizIOConf';
import {
    BizProcOutput,
    BizProcOutputID,
    BizProcOutputMode,
    BizProcOutputToObject,
} from './output/BizProcOutput';

/**
 * 事業活動のシミュレーション処理を行う
 */
export interface Processable {
    /**
     * シミュレーション毎に process を実施する準備処理を行う
     */
    prepareProcess(): void;

    /**
     * 企業活動を実施する
     * 必要に応じてリソースを消費し、増加させる
     * @param {Array<Decimal>} sysInputs Bizmoから提供する計算情報
     *      sys0: 処理 term の index
     *      sys1: 処理 term の 西暦（YYYYMMDD形式）の数値
     *      sys2: 処理 term の 西暦の年
     *      sys3: 処理 term の 西暦の月
     *      sys4: 処理 term の 西暦の日
     */
    process(sysInputs: Array<Decimal>): void;
}

export type BizProcessorRequiredParam<
    T = any,
    S extends string = string,
> = BizIORequiredParam<T, S> & {
    hyperMG: HyperParamManager;
};

export type BizProcessorOptionalFuncParam = {
    validateBizFunctionIOConf?: (orderedBizIOConf: Array<BizIOConf>) => boolean;
    validateProcOutput?: (parentId?: BizIOId, targetId?: BizIOId) => boolean;
    inputParams?: (
        orderedBizIOConf: Array<BizIOConf>,
        targetIndex: number
    ) => [Array<Decimal>, Array<BizIOId>];
    outputResult?: (
        resInputs: BizFuncResult<Decimal>,
        targetIndex: number
    ) => void;
};

export type BizProcessorOptionalBaseParam = {
    orderedFunctions?: Array<BizFunction>;
    outputs?: Array<BizProcOutput>;
    debits?: JournalSlipParam;
    credits?: JournalSlipParam;
};

export type BizProcessorOptionalParam = BizProcessorOptionalBaseParam &
    BizProcessorOptionalFuncParam;

export type BizProcessorParam<
    T = any,
    S extends string = string,
> = BizProcessorRequiredParam<T, S> & BizProcessorOptionalParam;

/**
 * 事業活動のシミュレーション処理
 * BizIOを入出力として、事業活動をシミュレーションする
 */
export class BizProcessor<T = any, S extends string = string, R = any>
    implements Processable
{
    static JOURNAL_BIZ_FUNC_ID: string = 'JOURNAL_BIZ_FUNC_ID';

    private __timetable: Timetable;
    private __db: BizDatabase<T, S>;
    private __hyperMG: HyperParamManager;
    private __orderedFunctions: Array<BizFunction>;
    private __debits: JournalSlipParam;
    private __credits: JournalSlipParam;
    private __outputs: Array<BizProcOutput>;

    private __validateProcOutput: (
        parentId?: BizIOId,
        targetId?: BizIOId
    ) => boolean;
    private __inputParams: (
        orderedBizIOConf: Array<BizIOConf>,
        targetIndex: number
    ) => [Array<Decimal>, Array<BizIOId>];
    private __outputResult: (
        resInputs: BizFuncResult<Decimal>,
        targetIndex: number
    ) => void;

    protected _validateBizFunctionIOConf: (
        orderedBizIOConf: Array<BizIOConf>
    ) => boolean;

    /**
     *
     */
    constructor(prop: BizProcessorParam<T, S>) {
        const {
            timetable,
            db,
            hyperMG,
            orderedFunctions,
            outputs,
            debits,
            credits,
            validateBizFunctionIOConf,
            validateProcOutput,
            inputParams,
            outputResult,
        } = prop;
        this.__timetable = timetable;
        this.__db = db;
        this.__hyperMG = hyperMG;

        // FIXME 初期値が validate されずに入力されてしまう。そもそも初期値が dict などでまとめて渡されないのはどうなのか？
        this.__orderedFunctions = orderedFunctions ?? [];
        // journal処理 専用BizFunc
        this.__debits = debits ?? new JournalSlipParam();
        this.__credits = credits ?? new JournalSlipParam();
        this.__outputs = outputs ?? [];

        // function設定
        this.__validateProcOutput =
            validateProcOutput ?? this.validateProcOutputFuncTemplate;
        this.__inputParams = inputParams ?? this.inputParamsTemplate;
        this.__outputResult = outputResult ?? this.outputResultTemplate;

        this._validateBizFunctionIOConf =
            validateBizFunctionIOConf ?? this.validateBizFunctionIOConfTemplate;
    }

    // ==== property ====

    /**
     * Timetable
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     * DB
     */
    get db(): BizDatabase<T, S> {
        return this.__db;
    }

    /**
     * HyperParamManager
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    /**
     * 処理順に並べられたBizFunction
     */
    get orderedBizFunctions(): Array<BizFunction> {
        return this.__orderedFunctions;
    }

    /**
     * 出力順に並べられたBizProcOutput
     */
    get procOutputs(): Array<BizProcOutput<R>> {
        return this.__outputs;
    }

    /**
     * 借方科目のJournal設定用パラメータ
     */
    get debits(): JournalSlipParam {
        return this.__debits;
    }

    /**
     * 貸方科目のJournal設定用パラメータ
     */
    get credits(): JournalSlipParam {
        return this.__credits;
    }

    // ==== BizFunctions ====

    /**
     * BizProcOutput の形式を確認する
     *
     * @param {BizIOId} parentId
     * @param {BizIOId} targetId
     * @return {boolean}
     */
    validateProcOutput(parentId?: BizIOId, targetId?: BizIOId): boolean {
        return this.__validateProcOutput(parentId, targetId);
    }

    /**
     * [overwrite対象]
     * BizIOConf の形式を確認する
     *
     * @param {Array<BizIOConf>} orderedBizIOConf
     * @return {boolean}
     */
    validateBizFunctionIOConfTemplate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        orderedBizIOConf: Array<BizIOConf>
    ): boolean {
        // Implement on inherited class
        return true;
    }

    /**
     * BizFunction の形式を確認する
     *
     * _validate_biz_function_io_conf の結果を確認した後、BizFunction.tree が供給されるならOK
     *
     * ＝注意＝
     * ・ソースコードが grammar に準じているかについては BizFunction.coed setter で確認されているため確認不要
     *
     * @param {BizFunction} bizFunc
     * @return {boolean}
     */
    validateBizFunction(bizFunc: BizFunction): boolean {
        let result = false;
        if (bizFunc) {
            // check existed target id
            result = this._validateBizFunctionIOConf(bizFunc.orderedBizIOConf);
            // 文法確認。ただし文法上は問題なくても計算出来ない場合が多々あるので、計算時にわかる場合もある
            if (result) {
                result = bizFunc.isTokenReady() ? true : false;
            }
        }
        return result;
    }

    /**
     * BizFunction を最終順位に追加する
     * @param {BizFunction} bizFunc
     */
    addBizFunction(bizFunc: BizFunction): void {
        if (this.validateBizFunction(bizFunc)) {
            this.orderedBizFunctions.push(bizFunc);
        }
    }

    /**
     * 指定した BizFunction を置き換える
     * @param {number} orderIndex
     * @param {BizFunction} bizFunc
     */
    replaceBizFunctionAt(orderIndex: number, bizFunc: BizFunction): void {
        if (
            this.validateBizFunction(bizFunc) &&
            0 <= orderIndex &&
            orderIndex < this.orderedBizFunctions.length
        ) {
            this.orderedBizFunctions[orderIndex] = bizFunc;
        }
    }

    /**
     * 2つの BizFunction の順序を入れ替える
     * @param {number} orderIndex1
     * @param {number} orderIndex2
     */
    swapBizFunctionsOrderAt(orderIndex1: number, orderIndex2: number): void {
        if (
            0 <= orderIndex1 &&
            orderIndex1 < this.orderedBizFunctions.length &&
            0 <= orderIndex2 &&
            orderIndex2 < this.orderedBizFunctions.length
        ) {
            const temp1 = this.orderedBizFunctions[orderIndex1];
            const temp2 = this.orderedBizFunctions[orderIndex2];
            this.orderedBizFunctions[orderIndex1] = temp2;
            this.orderedBizFunctions[orderIndex2] = temp1;
        }
    }

    /**
     * BizFunction を削除する
     * @param {number} orderIndex
     * @return {BizFunction | undefined}
     */
    removeBizFunctionAt(orderIndex: number): BizFunction | undefined {
        if (0 <= orderIndex && orderIndex < this.orderedBizFunctions.length) {
            const result = this.orderedBizFunctions.splice(orderIndex, 1)[0];
            return result;
        }
    }

    /**
     * すべての BizFunction を削除して初期化する
     */
    clearBizFunctions(): void {
        this.__orderedFunctions = [];
    }

    // ==== BizOutput ====

    /**
     * [overwrite対象]
     * BizProcOutput として適切か判断する
     *
     * ・親BizIO が保持するリソースかどうか
     * ・対象が、更新可能なBizIOかどうか
     * @param {BizIOId} parentId
     * @param {BizIOId} targetId
     * @return {boolean}
     */
    validateProcOutputFuncTemplate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        parentId?: BizIOId,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        targetId?: BizIOId
    ): boolean {
        // Implement on inherited classes
        return true;
    }

    /**
     * 計算結果の出力条件を取得する
     * @param {BizProcOutputID} outputId
     * @return {BizProcOutput | undefined}
     */
    getProcOutput(outputId: BizProcOutputID): BizProcOutput | undefined {
        for (const output of this.procOutputs) {
            if (output.outputId === outputId) {
                return output;
            }
        }
    }

    /**
     * 計算結果の出力条件を更新・追加する
     * outputsに
     *  存在しているID： 順位を変更しないまま更新
     *  存在していないID： 最終順位に追加
     * @param {BizProcOutput} output
     * @return {boolean}
     */
    addProcOutput(output: BizProcOutput): boolean {
        if (this.__validateProcOutput(output.parentId, output.outputBizId)) {
            let replaced = false;
            this.procOutputs.entries;
            for (let i = 0; i < this.procOutputs.length; i++) {
                if (this.procOutputs[i].outputId === output.outputId) {
                    this.procOutputs[i] = output;
                    replaced = true;
                    break;
                }
            }
            if (!replaced) {
                this.procOutputs.push(output);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * 計算結果の出力条件の順位を入れ替える
     * @param {number} orderIndex1
     * @param {number} orderIndex2
     */
    swapProcOutputOrderAt(orderIndex1: number, orderIndex2: number): void {
        if (
            0 <= orderIndex1 &&
            orderIndex1 < this.procOutputs.length &&
            0 <= orderIndex2 &&
            orderIndex2 < this.procOutputs.length
        ) {
            const temp1 = this.procOutputs[orderIndex1];
            const temp2 = this.procOutputs[orderIndex2];
            this.procOutputs[orderIndex1] = temp2;
            this.procOutputs[orderIndex2] = temp1;
        }
    }

    /**
     * 指定した順位の出力条件を削除する
     * @param {number} orderIndex
     * @return {BizProcOutput | undefined}
     */
    removeProcOutputAt(orderIndex: number): BizProcOutput | undefined {
        if (0 <= orderIndex && orderIndex < this.procOutputs.length) {
            const result = this.procOutputs.splice(orderIndex, 1)[0];
            return result;
        }
    }

    /**
     * すべての出力条件を削除して初期化する
     */
    clearProcOutputs(): void {
        this.__outputs = [];
    }

    /**
     * すべての BizFunction と 出力条件 を削除して初期化する
     */
    clearProcessor(prop?: {
        bizFunctions: boolean;
        procOutputs: boolean;
    }): void {
        const { bizFunctions, procOutputs } = prop ?? {
            bizFunctions: true,
            procOutputs: true,
        };
        if (bizFunctions) this.clearBizFunctions();
        if (procOutputs) this.clearProcOutputs();
    }

    // ==== process ====

    /**
     * [process内部 overwrite専用]
     * 計算パラメータの BizIO をインプットする
     *
     * @param {Array<BizIOConf>} orderedBizIOConf 順序付きBizIOパラメータのリスト
     * @param {number} targetIndex 処理中の timetable における 処理対象index。デフォルトでは現在Index
     * @return {[Array<Decimal>, Array<BizIOId>]}
     */
    inputParamsTemplate(
        orderedBizIOConf: Array<BizIOConf>,
        targetIndex: number
    ): [Array<Decimal>, Array<BizIOId>] {
        const inputValueParams = [];
        const inputIdParams = [];
        for (const ioInputConf of orderedBizIOConf) {
            let result = new Decimal('0');
            const bizIO = this.db.selectById(ioInputConf.targetId);
            if (
                bizIO &&
                0 <= targetIndex &&
                targetIndex < this.timetable.length
            ) {
                inputIdParams.push(bizIO.id);
                const target = targetIndex - ioInputConf.relativeTermIndex;
                const bizValue =
                    0 <= target && target < bizIO.timetableHistory.length
                        ? bizIO.timetableHistory[target]
                        : undefined;
                if (bizValue) {
                    result = bizValue.value.isZero()
                        ? new Decimal('0')
                        : bizValue.value;
                }
            }
            inputValueParams.push(result);
        }
        return [inputValueParams, inputIdParams];
    }

    /**
     * [process内部 overwrite専用]
     * 計算結果を BizIO にアウトプットする
     * @param {BizFuncResult} resInputs ordered_functions の計算結果
     * @param {number} targetIndex 処理中の timetable における 出力対象index。デフォルトでは現在Index
     */
    protected outputResultTemplate(
        resInputs: BizFuncResult<Decimal>,
        targetIndex: number
    ): void {
        const targetDate = this.timetable.terms[targetIndex];
        for (const output of this.procOutputs) {
            let targetIO;
            const targetFuncIndex = [];
            if (output.outputBizId) {
                targetIO = this.db.selectById(output.outputBizId);
                for (let i = 0; i < this.orderedBizFunctions.length; i++) {
                    if (
                        this.orderedBizFunctions[i].funcId ===
                        output.outputFuncId
                    ) {
                        targetFuncIndex.push(i);
                    }
                }
            }
            if (targetIO && targetIO.editable && targetFuncIndex.length === 1) {
                let newValue = resInputs[targetFuncIndex[0]];
                let currentValue = targetIO.at(targetDate)?.value;
                currentValue =
                    currentValue && !currentValue.isNaN()
                        ? currentValue
                        : new Decimal('0');

                switch (output.outputMode) {
                    case BizProcOutputMode.ADD:
                        newValue = currentValue.plus(newValue);
                        break;
                    case BizProcOutputMode.SUB:
                        newValue = currentValue.minus(newValue);
                        break;
                }
                targetIO.set(new BizValue(targetDate, newValue));
            } else {
                console.log(
                    `output[${output.outputId}] target[${output.outputBizId}] is not existed.`
                );
            }
        }
    }

    // ==== implement Processable ====

    /**
     * シミュレーション毎に process を実施する準備処理を行う
     */
    prepareProcess(): void {
        this.orderedBizFunctions.forEach((func) => func.prepareProcess());
    }

    /**
     * 企業活動を実施する
     * 必要に応じてリソースを消費し、増加させる
     *
     * = 前提 =
     * ・BizProcOutput などの情報の完全性は、set 時に考慮され、process 時まで条件が継続する想定
     *
     * @param {Array<Decimal>} sysInputs Bizmoから提供する計算情報
     * sys0: 処理 term の index
     * sys1: 処理 term の 西暦（YYYYMMDD形式）の数値
     * sys2: 処理 term の 西暦の年
     * sys3: 処理 term の 西暦の月
     * sys4: 処理 term の 西暦の日
     */
    process(sysInputs: Array<Decimal>): void {
        // calculate
        const resInputs = new BizFuncResult<Decimal>();
        // 通常BizFunction
        for (const func of this.orderedBizFunctions) {
            // input param
            const inputParams = this.__inputParams(
                func.orderedBizIOConf,
                this.timetable.currentIndex
            );
            const result = func.process<Decimal>({
                bizIOInputs: inputParams[0],
                bizIdInputs: inputParams[1],
                resInputs: resInputs,
                sysInputs: sysInputs,
                initValues: func.orderedInitValues,
                hyperParams: this.hyperMG.fillSelectedHyperParams(
                    func.orderedHyperParamIDs
                ),
                db: this.db,
                timetable: this.timetable,
            });
            resInputs.push(result);
        }

        // Journal専用BizFunc
        // FIXME 毎回parseすると処理が重い。
        // 前提：
        //  journal_entry を BizFunction で呼ばせる必要があるのか？ユーザが利用することはないのだから。
        //   => 必要あり: 対象としてDecimalだけでなく、BizIOやResを利用する場合があるので、process の仕組みの中で変更する必要がある。
        if (this.debits.hasElement() && this.credits.hasElement()) {
            const [debitFunc, debitCode] =
                this.debits.makePartialCodeAndSetupFunc(
                    new BizFunction({
                        code: '',
                        funcId: BizProcessor.JOURNAL_BIZ_FUNC_ID,
                    })
                );
            const [bothFunc, creditCode] =
                this.credits.makePartialCodeAndSetupFunc(debitFunc);
            bothFunc.code = `journal_entry({${debitCode}}, {${creditCode}})`;

            const inputParams = this.__inputParams(
                bothFunc.orderedBizIOConf,
                this.timetable.currentIndex
            );
            bothFunc.process({
                bizIOInputs: inputParams[0],
                bizIdInputs: inputParams[1],
                resInputs: resInputs,
                sysInputs: sysInputs,
                initValues: bothFunc.orderedInitValues,
                hyperParams: this.hyperMG.fillSelectedHyperParams(
                    bothFunc.orderedHyperParamIDs
                ),
                db: this.db,
                timetable: this.timetable,
            });
        }
        this.__outputResult(resInputs, this.timetable.currentIndex);
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizProcessorToObject<R> {
        return {
            orderedFunctions: this.orderedBizFunctions.map((func) =>
                func.toObject()
            ),
            outputs: this.procOutputs.map((output) => output.toObject()),
            debits: this.debits.toObject(),
            credits: this.credits.toObject(),
        };
    }

    static fromObject<T = any, S extends string = string, R = any>({
        obj,
        db,
        timetable,
        hyperMG,
    }: {
        obj: BizProcessorToObject<R>;
    } & BizProcessorRequiredParam<T, S>): BizProcessor<T, S, R> {
        return new BizProcessor({
            db,
            timetable,
            hyperMG,
            orderedFunctions: obj.orderedFunctions
                ? obj.orderedFunctions?.map((f) => BizFunction.fromObject(f))
                : undefined,
            outputs: obj.outputs?.map((o) => BizProcOutput.fromObject(o)),
            debits: obj.debits
                ? JournalSlipParam.fromObject(obj.debits)
                : undefined,
            credits: obj.credits
                ? JournalSlipParam.fromObject(obj.credits)
                : undefined,
        });
    }

    static fromSerialized<T = any, S extends string = string, R = any>({
        serialized,
        db,
        timetable,
        hyperMG,
    }: {
        serialized: string;
    } & BizProcessorRequiredParam<T, S>): BizProcessor<T, S, R> {
        const obj: BizProcessorToObject<R> = JSON.parse(serialized);
        return BizProcessor.fromObject<T, S, R>({
            obj,
            db,
            timetable,
            hyperMG,
        });
    }
}

// BizProcessorOptionalBaseParam の toObject版
export type BizProcessorToObject<R> = {
    orderedFunctions?: Array<BizFunctionToObject>;
    outputs?: Array<BizProcOutputToObject<R>>;
    debits?: JournalSlipParamToObject;
    credits?: JournalSlipParamToObject;
};
