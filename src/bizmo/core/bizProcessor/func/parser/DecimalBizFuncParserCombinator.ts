import { JournalEntry } from 'bizmo/core/accounting/JournalEntry';
import { BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import Decimal from 'decimal.js';
import { Token } from 'typescript-parsec';
import {
    BizFuncParserCombinatorBase,
    BizFuncParserCombinatorParam,
} from './core/BizFuncParserCombinator';
import { GSFunctionToken } from './core/GSFunctionTokens';
import {
    BizIdDict,
    BizIdDictElem,
    BizIdDictElemId,
    isCohortFucProtocol,
} from './core/SpecialFunctionTokens';
import { TokenKind } from './core/TokenKind';

export class DecimalBizFuncParserCombinator extends BizFuncParserCombinatorBase<Decimal> {
    static TRUE = new Decimal(1);
    static FALSE = new Decimal(0);
    static NAN = new Decimal('NaN');
    static ZERO = new Decimal(0);

    // BizFuncParserCombinatorBase
    caseCodeZero(): Decimal {
        return DecimalBizFuncParserCombinator.ZERO;
    }

    caseCodeDefault(): Decimal {
        return DecimalBizFuncParserCombinator.NAN;
    }

    caseCodeEmpty(): Decimal {
        return this.caseCodeDefault();
    }

    // == BasicArithmeticOpTokensIF ==
    applyNumber(value: Token<TokenKind>): Decimal {
        return new Decimal(value.text);
    }
    applyUnaryPlus(value: [Token<TokenKind>, Decimal]): Decimal {
        return value[1].mul(1);
    }
    applyUnaryMinus(value: [Token<TokenKind>, Decimal]): Decimal {
        return value[1].mul(-1);
    }
    applyBinaryPlus(
        first: Decimal,
        second: [Token<TokenKind>, Decimal]
    ): Decimal {
        return first.plus(second[1]);
    }
    applyBinaryMinus(
        first: Decimal,
        second: [Token<TokenKind>, Decimal]
    ): Decimal {
        return first.minus(second[1]);
    }
    applyBinaryMultiple(
        first: Decimal,
        second: [Token<TokenKind>, Decimal]
    ): Decimal {
        return first.mul(second[1]);
    }
    applyBinaryDivide(
        first: Decimal,
        second: [Token<TokenKind>, Decimal]
    ): Decimal {
        return !second[1].isNaN() && !second[1].isZero()
            ? first.div(second[1])
            : DecimalBizFuncParserCombinator.NAN;
    }
    applyParen(value: [{}, Decimal, {}]): Decimal {
        return value[1];
    }

    // == GSFunctionTokensIF ==
    isTruthy(value: Decimal): boolean {
        return !(value.isZero() || value.isNaN());
    }

    // no parameter
    applyNA(value: [Token<TokenKind>, {}, {}]): Decimal {
        return DecimalBizFuncParserCombinator.NAN;
    }
    applyPi(value: [Token<TokenKind>, {}, {}]): Decimal {
        return GSFunctionToken.PI;
    }
    // single parameter
    applyAbs(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].abs();
    }
    applyLog10(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].log(10);
    }
    applyLn(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].ln();
    }
    applySin(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].sin();
    }
    applyCos(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].cos();
    }
    applyTan(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].tan();
    }
    applyRadians(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].mul(GSFunctionToken.PI).div(180);
    }
    applyDegrees(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].mul(180).div(GSFunctionToken.PI);
    }
    applyExp(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return value[2].exp();
    }
    applyFact(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        let seed = new Decimal(1);
        for (let i: number = 1; i <= value[2].trunc().toNumber(); i++) {
            seed = seed.mul(i);
        }
        return seed;
    }
    applyNot(value: [Token<TokenKind>, {}, Decimal, {}]): Decimal {
        return this.isTruthy(value[2])
            ? DecimalBizFuncParserCombinator.FALSE
            : DecimalBizFuncParserCombinator.TRUE;
    }
    // double parameter
    applyPower(
        value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]
    ): Decimal {
        return value[2].pow(value[4]);
    }
    applyLog(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].log(value[4]);
    }
    applyMod(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].mod(value[4]);
    }
    applyRound(
        value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]
    ): Decimal {
        const s = new Decimal(10).pow(value[4]);
        return value[2].mul(s).round().div(s);
    }
    applyEq(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].eq(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyNe(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].eq(value[4])
            ? DecimalBizFuncParserCombinator.FALSE
            : DecimalBizFuncParserCombinator.TRUE;
    }
    applyLt(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].lt(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyLte(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].lte(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyGt(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].gt(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyGte(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return value[2].gte(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyAnd(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return this.isTruthy(value[2]) && this.isTruthy(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyOr(value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]): Decimal {
        return this.isTruthy(value[2]) || this.isTruthy(value[4])
            ? DecimalBizFuncParserCombinator.TRUE
            : DecimalBizFuncParserCombinator.FALSE;
    }
    applyIfna(
        value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}]
    ): Decimal {
        return value[2].isNaN() ? value[4] : value[2];
    }

    // triple parameter
    applyIf(
        value: [Token<TokenKind>, {}, Decimal, {}, Decimal, {}, Decimal, {}]
    ): Decimal {
        return this.isTruthy(value[2]) ? value[4] : value[6];
    }

    // == BizFuncParamTokensIF ==
    applyBizIOValue(
        index: number,
        param?: BizFuncParserCombinatorParam<Decimal> | undefined
    ): Decimal {
        return param?.bizIOInputs[index] ?? DecimalBizFuncParserCombinator.NAN;
    }
    applyBizFuncResultValue(
        index: number,
        param?: BizFuncParserCombinatorParam<Decimal> | undefined
    ): Decimal {
        return param?.resInputs[index] ?? DecimalBizFuncParserCombinator.NAN;
    }
    applyInitialValue(
        index: number,
        param?: BizFuncParserCombinatorParam<Decimal> | undefined
    ): Decimal {
        return param?.initValues[index] ?? DecimalBizFuncParserCombinator.NAN;
    }
    applyHyperValue(
        index: number,
        param?: BizFuncParserCombinatorParam<Decimal> | undefined
    ): Decimal {
        return param?.hyperParams[index] ?? DecimalBizFuncParserCombinator.NAN;
    }
    applySystemValue(
        index: number,
        param?: BizFuncParserCombinatorParam<Decimal> | undefined
    ): Decimal {
        return param?.sysInputs[index] ?? DecimalBizFuncParserCombinator.NAN;
    }

    // == SpecialFunctionTokensIF ==

    parseBizIdDictElem(
        value: [BizIdDictElemId, {}, Decimal]
    ): BizIdDictElem<Decimal> {
        return value[0] && !value[2].isNaN() ? [value[0], value[2]] : undefined;
    }

    parseUpdateCohort(
        value: [Token<TokenKind>, {}, BizIOId | undefined, {}],
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        param?: BizFuncParserCombinatorParam<Decimal>
    ): Decimal {
        const cohort = value[2] ? param?.db.selectById(value[2]) : undefined;
        if (cohort && isCohortFucProtocol(cohort)) {
            cohort.updateCohort();
        } else {
            console.log(`Target bizID[${value[2]}] is not CohortComponent.`);
        }
        return DecimalBizFuncParserCombinator.NAN;
    }

    parseJournalEntry(
        value: [
            Token<TokenKind>,
            {},
            BizIdDict<Decimal>,
            {},
            BizIdDict<Decimal>,
            {},
        ],
        param?: BizFuncParserCombinatorParam<Decimal>
    ): Decimal {
        if (param && value[2] && value[4]) {
            JournalEntry.journalEntry(
                param.timetable,
                param.db,
                value[2],
                value[4]
            );
        }
        return DecimalBizFuncParserCombinator.NAN;
    }
}
