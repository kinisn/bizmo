import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamID } from 'bizmo/core/hyperParam/HyperParamManager';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizFuncResult } from './input/BizFuncResult';
import { BizIOConf, BizIOConfToObject } from './input/BizIOConf';
import { DecimalBizFuncParserCombinator } from './parser/DecimalBizFuncParserCombinator';
import { BizFuncParserCombinatorBase } from './parser/core/BizFuncParserCombinator';
import { BizFuncTokenizer } from './parser/core/BizFuncTokenizer';

export type FuncId = string;

/**
 * BizFunction コンストラクタ 引数型
 * @param {string | undefined} code 計算式のソースコード
 * @param {Array<BizIOConf>| undefined} orderedBizIOConf 入力BizIOの順序付きリスト
 * @param {Array<Decimal>| undefined} orderedInitValues BizIOにDecimal初期値を与えるための入力の順序付きリスト。
 * @param {Array<HyperParamID>| undefined} orderedHyperParams: BizIOにHyperParameterを与えるための入力の順序付きリスト。
 * @param {FuncId | undefined} funcId: ID
 */
export type BizFunctionParam = {
    code?: string;
    orderedBizIOConf?: Array<BizIOConf>;
    orderedInitValues?: Array<Decimal>;
    orderedHyperParamIDs?: Array<HyperParamID>;
    funcId?: FuncId;
};
/**
 * BizFunction process 引数型
 * @param {Array<Decimal>} bizIOInputs 事業コンポーネント から抽出されたBizValueの値
 * @param {BizFuncResult} resInputs 同一BizAction の上位順位の計算結果データ
 * @param {Array<Decimal>} sysInputs Bizmo から提供する計算情報
 * @param {Array<BizIOId>} bizIdInputs 事業コンポーネント から抽出されるBizIOのID
 * @param {Array<HyperParamID>} hyperParams HyperParameterのID
 * @param {BizDatabase} db
 * @param {Timetable} timetable
 */
export type BizFunctionProcessParam<P = any> = {
    bizIOInputs: Array<P>;
    resInputs: BizFuncResult<P>;
    sysInputs: Array<P>;
    bizIdInputs: Array<BizIOId>;
    initValues: Array<P>;
    hyperParams: Array<P>;
    db: BizDatabase;
    timetable: Timetable;
    parser?: BizFuncParserCombinatorBase<P>;
};

/**
 * 事業活動シミュレーションを構成する要素関数
 *
 * 要素関数について、以下を提供する
 * ・入力となるBizIO情報の保持
 * ・計算処理の実行
 */
export class BizFunction {
    private __tokenizer: BizFuncTokenizer;
    private __parserCombinator: BizFuncParserCombinatorBase<any>;
    private __code: string;
    private __orderedBizIOConf: Array<BizIOConf>;
    private __orderedInitValues: Array<Decimal>;
    private __orderedHyperParamIDs: Array<HyperParamID>;
    private __funcId: FuncId;
    protected _result: Decimal;

    /**
     *
     * @param {BizFunctionParam} param0
     *  {string | undefined} code 計算式のソースコード
     *  {Array<BizIOConf>| undefined} orderedBizIOConf 入力BizIOの順序付きリスト
     *  {Array<Decimal>| undefined} orderedInitValues BizIOにDecimal初期値を与えるための入力の順序付きリスト。
     *  {FuncId | undefined} funcId: ID
     *  {FuncName | undefined} name: 名称
     */
    constructor({
        code,
        orderedBizIOConf,
        orderedInitValues,
        orderedHyperParamIDs,
        funcId,
    }: BizFunctionParam = {}) {
        this.__tokenizer = new BizFuncTokenizer();
        this.__parserCombinator = new DecimalBizFuncParserCombinator(); // default parser
        this.__code = '';
        this.code = code ?? '';
        this.__funcId = funcId ?? IDGenerator.generateId();
        this.__orderedBizIOConf = orderedBizIOConf ?? [];
        this.__orderedInitValues = orderedInitValues ?? [];
        this.__orderedHyperParamIDs = orderedHyperParamIDs ?? [];
        this._result = new Decimal('NaN');
    }

    /**
     * Function のソースコード
     */
    get code(): string {
        return this.__code;
    }

    /**
     * @param {string} code
     */
    set code(code: string) {
        this.__code = code;
        this.__tokenizer.parse(this.__code);
    }

    /**
     * @return {FuncId}
     */
    get funcId(): FuncId {
        return this.__funcId;
    }

    /**
     * @return {Array<BizIOConf>}
     */
    get orderedBizIOConf(): Array<BizIOConf> {
        return this.__orderedBizIOConf;
    }

    /**
     * @return {Array<Decimal>}
     */
    get orderedInitValues(): Array<Decimal> {
        return this.__orderedInitValues;
    }

    /**
     * @return {Array<HyperParamID>}
     */
    get orderedHyperParamIDs(): Array<HyperParamID> {
        return this.__orderedHyperParamIDs;
    }

    /**
     * @return {Decimal}
     */
    /*
    get result(): Decimal {
        return this._result;
    }
    */

    /**
     * Code が calculate 可能かどうか
     * @return {boolean}
     */
    isTokenReady(): boolean {
        return this.__tokenizer.token ? true : false;
    }

    // BizIOConf methods

    /**
     * BizIOInput を最終順位に追加する
     * @param {BizIoId} targetId
     * @param {number} relativeTermIndex
     */
    addBizIOInput(targetId: BizIOId, relativeTermIndex: number = 1): void {
        this.__orderedBizIOConf.push(
            new BizIOConf(targetId, relativeTermIndex)
        );
    }

    /**
     * 指定した BizIOInput を更新する
     * @param {number} inputOrder 指定Index 最初の要素: 0
     * @param {BizIoId} targetId
     * @param {number} relativeTermIndex
     */
    updateBizIOInputAt(
        inputOrder: number,
        targetId: BizIOId,
        relativeTermIndex: number = 1
    ): void {
        if (0 <= inputOrder && inputOrder < this.__orderedBizIOConf.length) {
            const funcInput = new BizIOConf(targetId, relativeTermIndex);
            this.__orderedBizIOConf[inputOrder] = funcInput;
        }
    }

    /**
     * 指定した BizIOInput を削除する
     * @param {number} inputOrder
     * @return {BizIOConf | undefined}
     */
    removeBizIOInputAt(inputOrder: number): BizIOConf | undefined {
        if (0 <= inputOrder && inputOrder < this.__orderedBizIOConf.length) {
            return this.__orderedBizIOConf.splice(inputOrder, 1)[0];
        }
    }

    /**
     * 指定した BizIOID を target_id にもつ BizIOInput を削除する
     * @param {BizIOId} targetId
     */
    removeBizIOInputById(targetId: BizIOId): void {
        this.__orderedBizIOConf = this.__orderedBizIOConf.filter(
            (elem) => elem.targetId !== targetId
        );
    }

    // init value methods

    /**
     * init_value を最終順位に追加する
     * @param {Decimal} initValue
     */
    addInitValue(initValue: Decimal): void {
        this.__orderedInitValues.push(initValue);
    }

    /**
     * 指定した init_value を更新する
     * @param {number} inputOrder 指定Index 最初の要素: 0
     * @param {Decimal} initValue
     */
    updateInitValueAt(inputOrder: number, initValue: Decimal): void {
        if (0 <= inputOrder && inputOrder < this.__orderedInitValues.length) {
            this.__orderedInitValues[inputOrder] = initValue;
        }
    }

    /**
     * 指定した init_value を削除する
     * @param {number} inputOrder
     * @return {Decimal | undefined}
     */
    removeInitValueAt(inputOrder: number): Decimal | undefined {
        if (0 <= inputOrder && inputOrder < this.__orderedInitValues.length) {
            return this.__orderedInitValues.splice(inputOrder, 1)[0];
        }
    }

    // process

    /**
     * シミュレートの準備を行う
     */
    prepareProcess(): void {}

    /**
     * 現在の設定に従いシミュレートする
     * @param {BizFunctionProcessParam} param0
     * {Array<Decimal>} bizIOInputs 事業コンポーネント から抽出されたBizValueの値
     * {BizFuncResult} resInputs 同一BizAction の上位順位の計算結果データ
     * {Array<Decimal>} sysInputs Bizmo から提供する計算情報
     * {Array<BizIOId>} bizIdInputs 事業コンポーネント から抽出されるBizIOのID
     * {BizIOJournalDatabase} db
     * {Timetable} timetable
     * @return {Decimal}
     */
    process<P>({
        bizIOInputs,
        resInputs,
        sysInputs,
        bizIdInputs,
        initValues,
        hyperParams,
        db,
        timetable,
        parser,
    }: BizFunctionProcessParam<P>): P {
        const currentParser = parser ?? this.__parserCombinator;
        let result = currentParser.caseCodeDefault();
        if (this.isTokenReady()) {
            result = currentParser.calculate(
                this.__tokenizer, // isTokenReady でチェック済み
                {
                    bizIOInputs: bizIOInputs,
                    resInputs: resInputs,
                    sysInputs: sysInputs,
                    bizIdInputs: bizIdInputs,
                    initValues: initValues,
                    hyperParams: hyperParams,
                    db: db,
                    timetable: timetable,
                }
            );
        }
        return result;
    }

    // ==== Util =====

    /**
     * 数値を入力値とする BizFunction を生成する
     * @param {Decimal} number
     * @return {BizFunction}
     */
    public static makeInputDecimal(number: Decimal): BizFunction {
        return new BizFunction({ code: 'init0', orderedInitValues: [number] });
    }

    /**
     * BizIOを入力値とする BizFunction を生成する
     * @param {BizIOId} targetId
     * @param {number} relativeTermIndex
     * @return {BizFunction}
     */
    public static makeInputBizIO(
        targetId: BizIOId,
        relativeTermIndex: number = 1
    ): BizFunction {
        const func = new BizFunction({ code: 'bizio0' });
        func.addBizIOInput(
            (targetId = targetId),
            (relativeTermIndex = relativeTermIndex)
        );
        return func;
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): BizFunctionToObject {
        return {
            code: this.code,
            orderedBizIOConf: this.orderedBizIOConf.map((bizIOConf) =>
                bizIOConf.toObject()
            ),
            orderedInitValues: this.orderedInitValues.map((initValue) =>
                initValue.toString()
            ),
            orderedHyperParamIDs: this.orderedHyperParamIDs,
            funcId: this.funcId,
        };
    }

    static fromObject(obj: BizFunctionToObject): BizFunction {
        return new BizFunction({
            ...obj,
            orderedBizIOConf: obj.orderedBizIOConf.map((bizIOConf) =>
                BizIOConf.fromObject(bizIOConf)
            ),
            orderedInitValues: obj.orderedInitValues.map(
                (initValue) => new Decimal(initValue)
            ),
        });
    }

    static fromSerialized({ serialized }: { serialized: string }): BizFunction {
        const obj: ReturnType<BizFunction['toObject']> = JSON.parse(serialized);
        return BizFunction.fromObject(obj);
    }
}

export type BizFunctionToObject = Omit<
    BizFunctionParam,
    'orderedBizIOConf' | 'orderedInitValues'
> & {
    orderedBizIOConf: Array<BizIOConfToObject>;
    orderedInitValues: Array<string>;
};
