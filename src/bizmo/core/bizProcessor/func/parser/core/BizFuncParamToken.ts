import { Token } from 'typescript-parsec';
import { BizFuncParserCombinatorParam } from './BizFuncParserCombinator';
import { TokenKind } from './TokenKind';

/**
 * [Static Class]
 * BizFunction にパラメータとして与えられる値に対応したTokenのグループ
 */

export const BizFuncParamTokenizer: Array<[boolean, RegExp, TokenKind]> = [
    [true, /^bizio\d+/g, TokenKind.BizIO],
    [true, /^res\d+/g, TokenKind.Res],
    [true, /^init\d+/g, TokenKind.Init],
    [true, /^hyper\d+/g, TokenKind.Hyper],
    [true, /^sys\d+/g, TokenKind.Sys],
];

export type BizFuncParamTokensIF<T> = {
    applyBizIOValue(index: number, param?: BizFuncParserCombinatorParam<T>): T;
    applyBizFuncResultValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    applyInitialValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    applyHyperValue(index: number, param?: BizFuncParserCombinatorParam<T>): T;
    applySystemValue(index: number, param?: BizFuncParserCombinatorParam<T>): T;
};

export class BizFuncParamTokens<T> {
    protected _impl: BizFuncParamTokensIF<T>;

    constructor(impl: BizFuncParamTokensIF<T>) {
        this._impl = impl;
    }

    /**
     *
     * @param {Token<TokenKind>} token
     * @param {BizFuncParserCombinatorParam} param
     * @return {T}
     */
    parseToken(
        token: Token<TokenKind>,
        defaultValue: T,
        param?: BizFuncParserCombinatorParam<T>
    ): T {
        let index = 0;
        if (param) {
            switch (token.kind) {
                case TokenKind.BizIO:
                    index = Number(token.text.replaceAll('bizio', ''));
                    return this._impl.applyBizIOValue(index, param);
                case TokenKind.Res:
                    index = Number(token.text.replaceAll('res', ''));
                    return this._impl.applyBizFuncResultValue(index, param);
                case TokenKind.Init:
                    index = Number(token.text.replaceAll('init', ''));
                    return this._impl.applyInitialValue(index, param);
                case TokenKind.Hyper:
                    index = Number(token.text.replaceAll('hyper', ''));
                    return this._impl.applyHyperValue(index, param);
                case TokenKind.Sys:
                    index = Number(token.text.replaceAll('sys', ''));
                    return this._impl.applySystemValue(index, param);
            }
        }
        return defaultValue;
    }
}
