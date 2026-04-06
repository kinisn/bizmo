import { buildLexer, Lexer, Token } from 'typescript-parsec';
import { BasicArithmeticOpTokenizer } from './BasicArithmeticOpTokens';
import { BizFuncParamTokenizer } from './BizFuncParamToken';
import { GSFunctionTokenizer } from './GSFunctionTokens';
import { SpecialFunctionTokenizer } from './SpecialFunctionTokens';
import { TokenKind } from './TokenKind';

/**
 * BizFuncTokenizer
 *
 * 文字列を解析して計算（EXP系）および特殊処理（SPECIAL_FUNC系）を行う。
 * Note: 解析文法の詳細は setupBNF の内部構造を確認すること。
 */

export class BizFuncTokenizer {
    // BizFuncParser独自
    private lexer: Lexer<TokenKind> | undefined;
    private __token: Token<TokenKind> | undefined;
    private __text: string | undefined;

    constructor() {
        this.__token = undefined;
        this.__text = undefined;
        this.setupTokenizer();
    }

    /**
     * Tokenizerを初期化する
     */
    private setupTokenizer(): void {
        this.lexer = buildLexer([
            ...BasicArithmeticOpTokenizer,
            ...GSFunctionTokenizer,
            ...BizFuncParamTokenizer,
            ...SpecialFunctionTokenizer,
        ]);
    }

    /**
     * 生成されたToken
     */
    get token(): Token<TokenKind> | undefined {
        return this.__token;
    }

    /**
     * 解析文言
     */
    get text(): string | undefined {
        return this.__text;
    }

    /**
     * 解析文言からTokenを生成する
     * @param {string} text
     * @return {BizFuncTokenizer}
     */
    public parse(text: string): BizFuncTokenizer {
        try {
            this.__text = text;
            this.__token = this.lexer!.parse(text);
        } catch (e) {
            console.log(`Fail to parse: ${text}  error: ${e}`);
            this.__text = undefined;
            this.__token = undefined;
        }
        return this;
    }
}
