// import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import Decimal from 'decimal.js';
import { Token } from 'typescript-parsec';
import { BizFuncParserCombinatorParam } from './BizFuncParserCombinator';
import { TokenKind } from './TokenKind';

export type BizIdDictElemId = BizIOId | undefined;
export type BizIdDictElem<T> = [BizIOId, T] | undefined;
export type BizIdDict<T> = Map<BizIOId, T> | undefined;

/**
 * CohortFucProtocol
 */
export type CohortFucProtocol = {
    updateCohort: () => void;
};

/**
 * CohortFucProtocol 型ガード
 * @param {any} arg
 * @return {boolean}
 */
export function isCohortFucProtocol(arg: any): arg is CohortFucProtocol {
    return (
        arg && typeof arg === 'object' && typeof arg.updateCohort === 'function'
    );
}

/**
 * [Static Class]
 * BizFunctionの処理の終了を待たず、ユーザーの指示により、特殊な処理を行う必要がある場合に利用する関数
 *
 * Cohort更新処理： １つのCohortは大きなデータになるため、どのタイミングでCohort用の設定が終わったのかを、ユーザーがトリガーしないと無駄が大きいため。
 * 会計処理： Bizmoのデフォルトとは違う会計処理を行う場合には、ユーザー自身が会計処理のトリガーを管理する必要がある
 */
export const SpecialFunctionTokenizer: Array<[boolean, RegExp, TokenKind]> = [
    [true, /^\{/g, TokenKind.LBrace],
    [true, /^\}/g, TokenKind.RBrace],
    [true, /^:/g, TokenKind.Colon],
    [true, /^bizid\d+/g, TokenKind.BizId], //  特殊関数用 string を扱う
    [true, /^update_cohort/g, TokenKind.SPUpdateCohort],
    [true, /^journal_entry/g, TokenKind.SPJournalEntry],
];

export type SpecialFunctionTokensIF<T> = {
    parseBizIdDictElem(value: [BizIdDictElemId, {}, T]): BizIdDictElem<T>;
    parseUpdateCohort(
        value: [Token<TokenKind>, {}, BizIOId | undefined, {}],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    parseJournalEntry(
        value: [Token<TokenKind>, {}, BizIdDict<T>, {}, BizIdDict<T>, {}],
        param?: BizFuncParserCombinatorParam<T>
    ): T;
};

export class SpecialFunctionTokens<T> {
    protected _impl: SpecialFunctionTokensIF<T>;
    constructor(impl: SpecialFunctionTokensIF<T>) {
        this._impl = impl;
    }

    /**
     *
     * @param {Token<TokenKind>} token
     * @param {BizFuncParserCombinatorParam} param
     * @return {BizIdDictElemId}
     */
    parseBizId(
        token: Token<TokenKind>,
        param?: BizFuncParserCombinatorParam<T>
    ): BizIdDictElemId {
        const result = undefined;
        if (param) {
            const index = Number(token.text.replaceAll('bizid', ''));
            return param.bizIdInputs[index];
        }
        return result;
    }

    /**
     *
     * @param {[{}, BizIdDictElem, Array<[{}, BizIdDictElem]>, {}]} values
     * @return {BizIdDict}
     */
    parseBizIdDict(
        values: [{}, BizIdDictElem<T>, Array<[{}, BizIdDictElem<T>]>, {}]
    ): BizIdDict<T> {
        let result: BizIdDict<T> = undefined;
        if (values[1]) {
            result = new Map<BizIOId, T>();
            result.set(values[1][0], values[1][1]);
            if (values[2].length > 0) {
                for (let i = 0; i < values[2].length; i++) {
                    const elem = values[2][i];
                    if (elem[1]) {
                        result?.set(elem[1][0], elem[1][1]);
                    } else {
                        result = undefined;
                        break;
                    }
                }
            }
        }
        return result;
    }

    // Implementations

    /**
     *
     * @param {[BizIdDictElemId, {}, T]} value
     * @return {BizIdDictElem<T>}
     */
    parseBizIdDictElem(value: [BizIdDictElemId, {}, T]): BizIdDictElem<T> {
        return this._impl.parseBizIdDictElem(value);
    }

    /**
     * update_cohort
     * @param {[Token<TokenKind>, {}, string, {}]} value
     * @param {BizFuncParserCombinatorParam} param
     * @return {Decimal}
     */
    parseUpdateCohort(
        value: [Token<TokenKind>, {}, BizIOId | undefined, {}],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        param?: BizFuncParserCombinatorParam<T>
    ): T {
        return this._impl.parseUpdateCohort(value, param);
    }

    /**
     * journal_entry
     * @param {[Token<TokenKind>, {}, BizIdDict, {}, BizIdDict, {}]} value
     * @param {BizFuncParserCombinatorParam} param
     * @return {Decimal}
     */
    parseJournalEntry(
        value: [Token<TokenKind>, {}, BizIdDict<T>, {}, BizIdDict<T>, {}],
        param?: BizFuncParserCombinatorParam<T>
    ): T {
        return this._impl.parseJournalEntry(value, param);
    }
}
