import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import {
    BizIOConf,
    BizIOConfToObject,
} from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import Decimal from 'decimal.js';
import { BizIOId } from '../bizIO/single/BizIOs';

type JournalSlipParamElem = BizIOConf | number | Decimal;
/**
 * Journalパラメータ設定クラス
 *
 * JournalEntry に対応した BizProcessor 設定項目を生成する。
 *
 * Hack
 * JournalSlip に入れたいが、Classの循環参照にあたるため、利用できない。
 */
export class JournalSlipParam {
    private __parm: Map<BizIOId, JournalSlipParamElem>;

    /**
     *
     */
    constructor() {
        this.__parm = new Map<BizIOId, JournalSlipParamElem>();
    }

    /**
     *
     * @param {BizIOId} accountLabel
     * @return {JournalSlipParamElem | undefined}
     */
    get(accountLabel: BizIOId): JournalSlipParamElem | undefined {
        if (this.__parm.has(accountLabel)) {
            return this.__parm.get(accountLabel);
        }
    }

    /**
     * 指定BizIOに 値 を設定する
     * @param {BizIOId} accountLabel
     * @param {Decimal} param
     */
    setInitValue(accountLabel: BizIOId, param: Decimal): void {
        this.__parm.set(accountLabel, param);
    }

    /**
     * 指定BizIOに 指定したBizIO値 を設定する
     * @param {BizIOId} accountLabel
     * @param {BizIOConf} param
     */
    setBizIOConf(accountLabel: BizIOId, param: BizIOConf): void {
        this.__parm.set(accountLabel, param);
    }

    /**
     * 指定BizIOに 指定したBizFunction結果 を設定する
     * @param {BizIOId} accountLabel
     * @param {number} targetIndex
     */
    setBizFuncResult(accountLabel: BizIOId, targetIndex: number): void {
        this.__parm.set(accountLabel, targetIndex);
    }

    /**
     * 指定BizIOのデータを削除する
     * @param {BizIOId} accountLabel
     * @return {boolean} 削除結果
     */
    remove(accountLabel: BizIOId): boolean {
        if (this.__parm.has(accountLabel)) {
            return this.__parm.delete(accountLabel);
        }
        return false;
    }

    /**
     * 初期化する
     */
    clear(): void {
        this.__parm = new Map<BizIOId, JournalSlipParamElem>();
    }

    /**
     * 要素を持つかどうか判断する
     * @return {boolean}
     */
    hasElement(): boolean {
        return this.__parm.size > 0 ? true : false;
    }

    /**
     * update_target を更新し、対応するcodeを生成する。
     * @param {BizFunction} updateTarget
     * @return {[BizFunction, string]}
     * updated_biz_function: code が未設定で、ほかの条件は設定済み
     * code: 対応する部分的なコード。組み込まないのは以下の理由。
     *   ・journal_update のように debit/credit の２種類のStripが必要になる場合がある
     *   ・set したタイミングで重い処理が走る
     */
    makePartialCodeAndSetupFunc(
        updateTarget: BizFunction
    ): [BizFunction, string] {
        const codeParts: Array<string> = [];
        this.__parm.forEach((value, key) => {
            if (typeof value === 'number') {
                updateTarget.addBizIOInput(key, 0);
                codeParts.push(
                    `bizid${
                        updateTarget.orderedBizIOConf.length - 1
                    }: res${value}`
                );
            } else if (value instanceof BizIOConf) {
                updateTarget.addBizIOInput(key, 0);
                updateTarget.addBizIOInput(
                    value.targetId,
                    value.relativeTermIndex
                );
                codeParts.push(
                    `bizid${updateTarget.orderedBizIOConf.length - 2}: bizio${
                        updateTarget.orderedBizIOConf.length - 1
                    }`
                );
            } else if (value instanceof Decimal) {
                updateTarget.addBizIOInput(key, 0);
                updateTarget.addInitValue(value);
                codeParts.push(
                    `bizid${updateTarget.orderedBizIOConf.length - 1}: init${
                        updateTarget.orderedInitValues.length - 1
                    }`
                );
            }
        });
        const code = codeParts.join(',');
        return [updateTarget, code];
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): JournalSlipParamToObject {
        const newObj: JournalSlipParamToObject = [];
        this.__parm.forEach((value, key) => {
            if (value instanceof Decimal) {
                newObj.push([key, value.toString()]);
            } else if (value instanceof BizIOConf) {
                newObj.push([key, value.toObject()]);
            } else {
                newObj.push([key, value]);
            }
        });
        return newObj;
    }

    static fromObject(obj: JournalSlipParamToObject): JournalSlipParam {
        const param = new JournalSlipParam();
        obj.forEach((elem) => {
            const [key, value] = elem;
            if (typeof value === 'number') {
                param.__parm.set(key, value);
            } else if (typeof value === 'string') {
                param.__parm.set(key, new Decimal(value));
            } else {
                param.__parm.set(key, BizIOConf.fromObject(value));
            }
        });
        return param;
    }

    static fromSerialized(serialized: string): JournalSlipParam {
        const obj = JSON.parse(serialized) as JournalSlipParamToObject;
        return JournalSlipParam.fromObject(obj);
    }
}

export type JournalSlipParamToObject = Array<
    [BizIOId, number | BizIOConfToObject | string]
>;
