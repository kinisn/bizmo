import Decimal from 'decimal.js';
import { Token } from 'typescript-parsec';
import { TokenKind } from './TokenKind';

/**
 * [Static Class]
 * Googleスプレッドシートでサポートされる関数 Token
 *
 *   ・計算関数： GSSの一部関数： https://support.google.com/docs/table/25273?hl=ja
 *       MOD(被除数, 除数)    モジュロ演算の結果、すなわち除算の剰余を返します。
 *           https://support.google.com/docs/answer/3093497
 *       ABS(値)  数値の絶対値を返します
 *           https://support.google.com/docs/answer/3093459
 *       POWER(底, 指数)   指数でべき乗した数値を返します。
 *           https://support.google.com/docs/answer/3093433
 *       FACT(値) 数値の階乗を返します。
 *           https://support.google.com/docs/answer/3093412
 *       LOG(値, 底)   指定した数を底とする数値の対数を返します。
 *           https://support.google.com/docs/answer/3093495
 *       LN(値)   オイラー数 e を底とする数値の対数を返します。
 *           https://support.google.com/docs/answer/3093422
 *       LOG10(値)   10 を底とする数値の対数を返します。
 *           https://support.google.com/docs/answer/3093423
 *       ROUND(値, 桁数)    少数桁を四捨五入した値を返します。第２引数の少数桁になるように四捨五入します。マイナスにすると整数の桁まで四捨五入します。
 *           https://support.google.com/docs/answer/3093440
 *       EXP(指数) オイラー数 e（～2.718）を底とする数値のべき乗を返します。
 *           https://support.google.com/docs/answer/3093411
 *
 *   ・三角関数
 *       COS(角度) ラジアンで指定した角度のコサインを返します。
 *           https://support.google.com/docs/answer/3093476
 *       SIN(角度) ラジアンで指定した角度のサインを返します。
 *           https://support.google.com/docs/answer/3093447
 *       TAN(角度) ラジアンで指定した角度のタンジェントを返します。
 *           https://support.google.com/docs/answer/3093586
 *       RADIANS(角度)	角度を度数からラジアンに変換します。
 *           https://support.google.com/docs/answer/3093437
 *       DEGREES(角度)	角度の値をラジアンから度数に変換します
 *           https://support.google.com/docs/answer/3093481
 *
 *   ・論理計算関数
 *       IF(論理式, TRUE値, FALSE値)  論理式が TRUE の場合はある値を返し、FALSE の場合は別の値を返します。ZeroかNaN：false, それ以外：true
 *           https://support.google.com/docs/answer/3093364
 *       EQ(値1, 値2)  指定した 2 つの値が等しい場合は TRUE、等しくない場合は FALSE を返します。
 *           https://support.google.com/docs/answer/3093593
 *       NE(値1, 値2)	    指定した 2 つの値が等しくない場合は TRUE、等しい場合は FALSE を返します。
 *           https://support.google.com/docs/answer/3093981
 *       GT(値1, 値2)	    1 つ目の引数が 2 つ目の引数より真に大きい場合は TRUE、そうでない場合は FALSE を返します
 *           https://support.google.com/docs/answer/3098240
 *       GTE(値1, 値2)	1 つ目の引数が 2 つ目の引数より大きいか等しい場合は TRUE、そうでない場合は FALSE を返します。
 *           https://support.google.com/docs/answer/3093975
 *       LT(値1, 値2)	    1 つ目の引数が 2 つ目の引数より真に小さい場合は TRUE、そうでない場合は FALSE を返します。
 *           https://support.google.com/docs/answer/3093596
 *       LTE(値1, 値2)	1 つ目の引数が 2 つ目の引数より小さいか等しい場合は TRUE、そうでない場合は FALSE を返します。
 *           https://support.google.com/docs/answer/3093976
 *       AND(論理式1, 論理式2) すべての引数が論理的に TRUE の場合は TRUE を返します。
 *           https://support.google.com/docs/answer/3093301
 *       OR(論理式1, 論理式2)	いずれかの引数が論理的に TRUE の場合は TRUE を返します。
 *           https://support.google.com/docs/answer/3093306
 *       NOT(論理式)    論理値の逆を返します。TRUE のとき NOT は FALSE を、FALSE のとき NOT は TRUE を返します。
 *           https://support.google.com/docs/answer/3093305
 *
 *   ・特殊
 *       NA()    「値がない」ことを意味するエラー値「#N/A」を返します。#N/Aエラーは不明な情報があることを示し、使用中の関数に計算を停止させます
 *           https://support.google.com/docs/answer/3093359
 *       PI()    円周率の値を小数点以下 22 桁で返します。
 *           https://support.google.com/docs/answer/3093432
 *
 */
export const GSFunctionTokenizer: Array<[boolean, RegExp, TokenKind]> = [
    [true, /^na|^pi/g, TokenKind.GSFunc0],
    [
        true,
        /^abs|^log10|^ln|^cos|^sin|^tan|^radians|^degrees|^exp|^fact|^not/g,
        TokenKind.GSFunc1,
    ],
    [
        true,
        /^power|^log|^mod|^round|^eq|^ne|^gte|^gt|^lte|^lt|^and|^or|^ifna/g, // HACK. gteとgtの正規表現の定義順に注意。
        TokenKind.GSFunc2,
    ],
    [true, /^if/g, TokenKind.GSFunc3],
];

export type GSFunctionTokensIF<T> = {
    isTruthy(value: T): boolean;
    // no parameter
    applyNA(value: [Token<TokenKind>, {}, {}]): T;
    applyPi(value: [Token<TokenKind>, {}, {}]): T;
    // single parameter
    applyAbs(value: [Token<TokenKind>, {}, T, {}]): T;
    applyLog10(value: [Token<TokenKind>, {}, T, {}]): T;
    applyLn(value: [Token<TokenKind>, {}, T, {}]): T;
    applySin(value: [Token<TokenKind>, {}, T, {}]): T;
    applyCos(value: [Token<TokenKind>, {}, T, {}]): T;
    applyTan(value: [Token<TokenKind>, {}, T, {}]): T;
    applyRadians(value: [Token<TokenKind>, {}, T, {}]): T;
    applyDegrees(value: [Token<TokenKind>, {}, T, {}]): T;
    applyExp(value: [Token<TokenKind>, {}, T, {}]): T;
    applyFact(value: [Token<TokenKind>, {}, T, {}]): T;
    applyNot(value: [Token<TokenKind>, {}, T, {}]): T;
    // double parameter
    applyPower(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyLog(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyMod(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyRound(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyEq(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyNe(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyLt(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyLte(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyGt(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyGte(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyAnd(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyOr(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    applyIfna(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    // triple parameter
    applyIf(value: [Token<TokenKind>, {}, T, {}, T, {}, T, {}]): T;
};

export class GSFunctionToken<T> {
    static PI = new Decimal('3.1415926535897932384626');

    protected _impl: GSFunctionTokensIF<T>;
    constructor(impl: GSFunctionTokensIF<T>) {
        this._impl = impl;
    }

    /**
     * 論理判定を行う
     * ・ZeroかNaN：false
     * ・それ以外：true
     * @param {T} target 対象数値
     * @return {boolean}
     */
    isTruthy(target: T): boolean {
        return this._impl.isTruthy(target);
    }

    /**
     * パラメータを持たない関数を解決する
     * @param {[Token<TokenKind>, {}, {}]} value
     * @return {T}
     */
    applyFuncParam0(value: [Token<TokenKind>, {}, {}]): T {
        switch (value[0].text) {
            case 'na':
                return this._impl.applyNA(value);
            case 'pi':
                return this._impl.applyPi(value);
            default:
                throw new Error(`Not supported function: ${value[0].text}`);
        }
    }

    /**
     * パラメータを１つ持つ関数を解決する
     * @param {[Token<TokenKind>, {}, T, {}]} value
     * @return {T}
     */
    applyFuncParam1(value: [Token<TokenKind>, {}, T, {}]): T {
        switch (value[0].text) {
            case 'abs':
                return this._impl.applyAbs(value);
            case 'log10':
                return this._impl.applyLog10(value);
            case 'ln':
                return this._impl.applyLn(value);
            case 'sin':
                return this._impl.applySin(value);
            case 'cos':
                return this._impl.applyCos(value);
            case 'tan':
                return this._impl.applyTan(value);
            case 'radians':
                return this._impl.applyRadians(value);
            case 'degrees':
                return this._impl.applyDegrees(value);
            case 'exp':
                return this._impl.applyExp(value);
            case 'fact':
                return this._impl.applyFact(value);
            case 'not':
                return this._impl.applyNot(value);
            default:
                throw new Error(`Not supported function: ${value[0].text}`);
        }
    }

    /**
     * パラメータを2つ持つ関数を解決する
     * @param {[Token<TokenKind>, {}, T, {}, T, {}]} value
     * @return {T}
     */
    applyFuncParam2(value: [Token<TokenKind>, {}, T, {}, T, {}]): T {
        switch (value[0].text) {
            case 'power':
                return this._impl.applyPower(value);
            case 'log':
                return this._impl.applyLog(value);
            case 'mod':
                return this._impl.applyMod(value);
            case 'round':
                return this._impl.applyRound(value);
            case 'eq':
                return this._impl.applyEq(value);
            case 'ne':
                return this._impl.applyNe(value);
            case 'lt':
                return this._impl.applyLt(value);
            case 'lte':
                return this._impl.applyLte(value);
            case 'gt':
                return this._impl.applyGt(value);
            case 'gte':
                return this._impl.applyGte(value);
            case 'and':
                return this._impl.applyAnd(value);
            case 'or':
                return this._impl.applyOr(value);
            case 'ifna':
                return this._impl.applyIfna(value);
            default:
                throw new Error(`Not supported function: ${value[0].text}`);
        }
    }

    /**
     * パラメータを3つ持つ関数を解決する
     * @param {Array<Token<TokenKind.Func0>>} value
     * @return {T}
     */
    applyFuncParam3(value: [Token<TokenKind>, {}, T, {}, T, {}, T, {}]): T {
        switch (value[0].text) {
            case 'if':
                return this._impl.applyIf(value);
            default:
                throw new Error(`Not supported function: ${value[0].text}`);
        }
    }
}
