import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import {
    alt,
    apply,
    expectEOF,
    expectSingleResult,
    lrec_sc,
    rep_sc,
    Rule,
    rule,
    seq,
    str,
    tok,
    Token,
} from 'typescript-parsec';
import { BizFuncResult } from '../../input/BizFuncResult';
import {
    BasicArithmeticOpTokens,
    BasicArithmeticOpTokensIF,
} from './BasicArithmeticOpTokens';
import { BizFuncParamTokens, BizFuncParamTokensIF } from './BizFuncParamToken';
import { BizFuncTokenizer } from './BizFuncTokenizer';
import { GSFunctionToken, GSFunctionTokensIF } from './GSFunctionTokens';
import {
    BizIdDict,
    BizIdDictElem,
    BizIdDictElemId,
    SpecialFunctionTokens,
    SpecialFunctionTokensIF,
} from './SpecialFunctionTokens';
import { TokenKind } from './TokenKind';

export type BizFuncParserCombinatorParam<T> = {
    bizIOInputs: Array<T>;
    resInputs: BizFuncResult<T>;
    sysInputs: Array<T>;
    initValues: Array<T>;
    hyperParams: Array<T>;
    bizIdInputs: Array<BizIOId>;
    db: BizDatabase;
    timetable: Timetable;
};

export abstract class BizFuncParserCombinatorBase<T>
    implements
        BasicArithmeticOpTokensIF<T>,
        GSFunctionTokensIF<T>,
        BizFuncParamTokensIF<T>,
        SpecialFunctionTokensIF<T>
{
    protected _basicArithmeticOpTokens: BasicArithmeticOpTokens<T>;
    protected _gSFunctionToken: GSFunctionToken<T>;
    protected _bizFuncParamTokens: BizFuncParamTokens<T>;
    protected _specialFunctionTokens: SpecialFunctionTokens<T>;

    protected _GRAMMAR: Rule<TokenKind, T>;
    protected _param: BizFuncParserCombinatorParam<T> | undefined;

    constructor() {
        // partial rules
        this._basicArithmeticOpTokens = new BasicArithmeticOpTokens<T>(this);
        this._gSFunctionToken = new GSFunctionToken<T>(this);
        this._bizFuncParamTokens = new BizFuncParamTokens<T>(this);
        this._specialFunctionTokens = new SpecialFunctionTokens<T>(this);

        this._GRAMMAR = rule<TokenKind, T>();
        this.__setupParserCombinator();
    }

    public calculate(
        tokenizer: BizFuncTokenizer,
        param?: BizFuncParserCombinatorParam<T>
    ): T {
        switch (tokenizer.text) {
            case '0':
            case '0.0':
                return this.caseCodeZero();
            case '':
                return this.caseCodeEmpty();
            default:
                let result = this.caseCodeDefault();
                if (tokenizer.token) {
                    try {
                        this._param = param;
                        result = expectSingleResult(
                            expectEOF(this._GRAMMAR.parse(tokenizer.token))
                        );
                    } catch (e) {
                        console.log(
                            `Fail to calculate: ${tokenizer.text}  error: ${e}`
                        );
                    }
                }
                return result;
        }
    }

    // BizFuncParserCombinatorBase

    private __setupParserCombinator(): void {
        // roles
        const GS_FUNC = rule<TokenKind, T>();
        const FUNC_PARAMS = rule<TokenKind, T>();
        const NUMERIC = rule<TokenKind, T>();
        const TERM = rule<TokenKind, T>();
        const FACTOR = rule<TokenKind, T>();
        const EXP = rule<TokenKind, T>();
        const SPECIAL_FUNC = rule<TokenKind, T>();
        const BIZ_ID = rule<TokenKind, BizIdDictElemId>();
        const BIZ_ID_DICT_ELEM = rule<TokenKind, BizIdDictElem<T>>();
        const BIZ_ID_DICT = rule<TokenKind, BizIdDict<T>>();

        // 特殊関数
        BIZ_ID.setPattern(
            apply(tok(TokenKind.BizId), (value) =>
                this._specialFunctionTokens.parseBizId(value, this._param)
            )
        );
        // BIZ_ID_DICT_ELEM = BizID : 式
        BIZ_ID_DICT_ELEM.setPattern(
            apply(seq(BIZ_ID, str(':'), EXP), (value) =>
                this._specialFunctionTokens.parseBizIdDictElem(value)
            )
        );
        // BIZ_ID_DICT = { BizID : 式 (, BizID : 式)? }
        BIZ_ID_DICT.setPattern(
            apply(
                seq(
                    str('{'),
                    BIZ_ID_DICT_ELEM,
                    rep_sc(seq(str(','), BIZ_ID_DICT_ELEM)),
                    str('}')
                ),
                (value) => this._specialFunctionTokens.parseBizIdDict(value)
            )
        );
        // SPECIAL_FUNC = update_cohort(BizId) | journal_entry(BIZ_ID_DICT, BIZ_ID_DICT)
        SPECIAL_FUNC.setPattern(
            alt(
                apply(
                    seq(
                        tok(TokenKind.SPUpdateCohort),
                        str('('),
                        BIZ_ID,
                        str(')')
                    ),
                    (value) =>
                        this._specialFunctionTokens.parseUpdateCohort(
                            value,
                            this._param
                        )
                ),
                apply(
                    seq(
                        tok(TokenKind.SPJournalEntry),
                        str('('),
                        BIZ_ID_DICT,
                        str(','),
                        BIZ_ID_DICT,
                        str(')')
                    ),
                    (value) =>
                        this._specialFunctionTokens.parseJournalEntry(
                            value,
                            this._param
                        )
                )
            )
        );

        // BizFunction Parameter
        FUNC_PARAMS.setPattern(
            apply(
                alt(
                    tok(TokenKind.BizIO),
                    tok(TokenKind.Res),
                    tok(TokenKind.Init),
                    tok(TokenKind.Hyper),
                    tok(TokenKind.Sys)
                ),
                (value) =>
                    this._bizFuncParamTokens.parseToken(
                        value,
                        this.caseCodeDefault(),
                        this._param
                    )
            )
        );

        // GS関数
        GS_FUNC.setPattern(
            alt(
                apply(
                    seq(tok(TokenKind.GSFunc0), str('('), str(')')),
                    (value) => this._gSFunctionToken.applyFuncParam0(value)
                ), // パラメータ０の関数
                apply(
                    seq(tok(TokenKind.GSFunc1), str('('), EXP, str(')')),
                    (value) => this._gSFunctionToken.applyFuncParam1(value)
                ), // パラメータ1の関数
                apply(
                    seq(
                        tok(TokenKind.GSFunc2),
                        str('('),
                        EXP,
                        str(','),
                        EXP,
                        str(')')
                    ),
                    (value) => this._gSFunctionToken.applyFuncParam2(value)
                ), // パラメータ2の関数
                apply(
                    seq(
                        tok(TokenKind.GSFunc3),
                        str('('),
                        EXP,
                        str(','),
                        EXP,
                        str(','),
                        EXP,
                        str(')')
                    ),
                    (value) => this._gSFunctionToken.applyFuncParam3(value)
                ) // パラメータ3の関数
            )
        );

        // 数値 = 数字 | GS関数 | BizFuncParam
        NUMERIC.setPattern(
            alt(
                apply(tok(TokenKind.Number), (value) =>
                    this._basicArithmeticOpTokens.applyNumber(value)
                ),
                GS_FUNC,
                FUNC_PARAMS
            )
        );

        // 項 = 数値 | 符号付き数値 | カッコに囲まれた式
        TERM.setPattern(
            alt(
                NUMERIC,
                apply(seq(alt(str('+'), str('-')), TERM), (value) =>
                    this._basicArithmeticOpTokens.applyUnary(value)
                ),
                apply(seq(str('('), EXP, str(')')), (value) =>
                    this._basicArithmeticOpTokens.applyParen(value)
                )
            )
        );

        // 因子 = 項 (*|/) 項
        FACTOR.setPattern(
            lrec_sc(
                TERM,
                seq(alt(str('*'), str('/')), TERM),
                (value0, value1) =>
                    this._basicArithmeticOpTokens.applyBinary(value0, value1)
            )
        );

        // 式 = 因子 (+|-) 因子
        EXP.setPattern(
            lrec_sc(
                FACTOR,
                seq(alt(str('+'), str('-')), FACTOR),
                (value0, value1) =>
                    this._basicArithmeticOpTokens.applyBinary(value0, value1)
            )
        );

        // 文法 = 式 | 特殊関数
        this._GRAMMAR.setPattern(alt(EXP, SPECIAL_FUNC));
    }

    abstract caseCodeZero(): T;
    abstract caseCodeEmpty(): T;
    abstract caseCodeDefault(): T;

    // BasicArithmeticOpTokensIF
    // 本当は protected にしたいが、type で定義しているのでTypeScriptの制約でpublicにしている
    abstract applyNumber(value: Token<TokenKind>): T;
    abstract applyUnaryPlus(value: [Token<TokenKind>, T]): T;
    abstract applyUnaryMinus(value: [Token<TokenKind>, T]): T;
    abstract applyBinaryPlus(first: T, second: [Token<TokenKind>, T]): T;
    abstract applyBinaryMinus(first: T, second: [Token<TokenKind>, T]): T;
    abstract applyBinaryMultiple(first: T, second: [Token<TokenKind>, T]): T;
    abstract applyBinaryDivide(first: T, second: [Token<TokenKind>, T]): T;
    abstract applyParen(value: [{}, T, {}]): T;

    // GSFunctionTokensIF
    abstract isTruthy(value: T): boolean;
    // no parameter
    abstract applyNA(value: [Token<TokenKind>, {}, {}]): T;
    abstract applyPi(value: [Token<TokenKind>, {}, {}]): T;
    // single parameter
    abstract applyAbs(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyLog10(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyLn(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applySin(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyCos(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyTan(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyRadians(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyDegrees(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyExp(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyFact(value: [Token<TokenKind>, {}, T, {}]): T;
    abstract applyNot(value: [Token<TokenKind>, {}, T, {}]): T;
    // double parameter
    abstract applyPower(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyLog(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyMod(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyRound(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyEq(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyNe(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyLt(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyLte(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyGt(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyGte(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyAnd(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyOr(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    abstract applyIfna(value: [Token<TokenKind>, {}, T, {}, T, {}]): T;
    // triple parameter
    abstract applyIf(value: [Token<TokenKind>, {}, T, {}, T, {}, T, {}]): T;

    // BizFuncParamTokensIF
    abstract applyBizFuncResultValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    abstract applyBizIOValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    abstract applyInitialValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    abstract applyHyperValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    abstract applySystemValue(
        index: number,
        param?: BizFuncParserCombinatorParam<T>
    ): T;

    // SpecialFunctionTokensIF
    abstract parseBizIdDictElem(
        value: [BizIdDictElemId, {}, T]
    ): BizIdDictElem<T>;
    abstract parseUpdateCohort(
        value: [Token<TokenKind>, {}, BizIOId | undefined, {}],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        param?: BizFuncParserCombinatorParam<T>
    ): T;
    abstract parseJournalEntry(
        value: [Token<TokenKind>, {}, BizIdDict<T>, {}, BizIdDict<T>, {}],
        param?: BizFuncParserCombinatorParam<T>
    ): T;
}
