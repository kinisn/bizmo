import { Token } from 'typescript-parsec';
import { TokenKind } from './TokenKind';

export const BasicArithmeticOpTokenizer: Array<[boolean, RegExp, TokenKind]> = [
    [false, /^\s+/g, TokenKind.Space],
    [true, /^\(/g, TokenKind.LParen],
    [true, /^\)/g, TokenKind.RParen],
    [true, /^\d+(\.\d+)?/g, TokenKind.Number],
    [true, /^\+/g, TokenKind.Add],
    [true, /^\-/g, TokenKind.Sub],
    [true, /^\*/g, TokenKind.Mul],
    [true, /^\//g, TokenKind.Div],
    [true, /^\,/g, TokenKind.Comma],
];

/**
 * 四則演算に対応したTokenのグループ
 */
export type BasicArithmeticOpTokensIF<T> = {
    applyNumber(value: Token<TokenKind>): T;
    applyUnaryPlus(value: [Token<TokenKind>, T]): T;
    applyUnaryMinus(value: [Token<TokenKind>, T]): T;
    applyBinaryPlus(first: T, second: [Token<TokenKind>, T]): T;
    applyBinaryMinus(first: T, second: [Token<TokenKind>, T]): T;
    applyBinaryMultiple(first: T, second: [Token<TokenKind>, T]): T;
    applyBinaryDivide(first: T, second: [Token<TokenKind>, T]): T;
    applyParen(value: [{}, T, {}]): T;
};

/**
 * 括弧を含む四則演算に対応したTokenのグループ
 */
export class BasicArithmeticOpTokens<T> {
    protected _impl: BasicArithmeticOpTokensIF<T>;

    constructor(impl: BasicArithmeticOpTokensIF<T>) {
        this._impl = impl;
    }

    applyParen(value: [{}, T, {}]): T {
        return this._impl.applyParen(value);
    }

    /**
     *
     * @param {Token<TokenKind>} value
     * @return {T}
     */
    applyNumber(value: Token<TokenKind>): T {
        return this._impl.applyNumber(value);
    }

    /**
     *
     * @param {[Token<TokenKind>, T]} value
     * @return {T}
     */
    applyUnary(value: [Token<TokenKind>, T]): T {
        switch (value[0].text) {
            case '+':
                return this._impl.applyUnaryPlus(value);
            case '-':
                return this._impl.applyUnaryMinus(value);
            default:
                throw new Error(`Unknown unary operator: ${value[0].text}`);
        }
    }

    /**
     *
     * @param {T} first
     * @param {[Token<TokenKind>, T]} second
     * @return {T}
     */
    applyBinary(first: T, second: [Token<TokenKind>, T]): T {
        switch (second[0].text) {
            case '+':
                return this._impl.applyBinaryPlus(first, second);
            case '-':
                return this._impl.applyBinaryMinus(first, second);
            case '*':
                return this._impl.applyBinaryMultiple(first, second);
            case '/':
                return this._impl.applyBinaryDivide(first, second);
            default:
                throw new Error(`Unknown binary operator: ${second[0].text}`);
        }
    }
}
