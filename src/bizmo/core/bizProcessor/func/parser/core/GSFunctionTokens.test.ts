import Decimal from 'decimal.js';
import { DecimalBizFuncParserCombinator } from '../DecimalBizFuncParserCombinator';
import { BizFuncTokenizer } from './BizFuncTokenizer';
import { GSFunctionToken } from './GSFunctionTokens';

describe('GSFunctionToken のテスト', () => {
    let tokenizer: BizFuncTokenizer;
    let parser: DecimalBizFuncParserCombinator;

    beforeEach(() => {
        tokenizer = new BizFuncTokenizer();
        parser = new DecimalBizFuncParserCombinator();
    });

    describe('算術関数', () => {
        test('pi', () => {
            expect(parser.calculate(tokenizer.parse('pi()'))).toEqual(
                new Decimal('3.1415926535897932384626')
            );
            expect(parser.calculate(tokenizer.parse('pi(0)'))).toEqual(
                new Decimal('NaN')
            );
        });

        test('abs', () => {
            expect(parser.calculate(tokenizer.parse('abs(-1.2)'))).toEqual(
                new Decimal('1.2')
            );
            expect(parser.calculate(tokenizer.parse('abs(2.3)'))).toEqual(
                new Decimal('2.3')
            );
        });

        test('log10', () => {
            expect(parser.calculate(tokenizer.parse('log10(100)'))).toEqual(
                new Decimal('2')
            );
            expect(parser.calculate(tokenizer.parse('log10(50)'))).toEqual(
                new Decimal('1.6989700043360188048')
            );
        });

        test('log', () => {
            expect(parser.calculate(tokenizer.parse('log(8, 2)'))).toEqual(
                new Decimal('3')
            );
            expect(parser.calculate(tokenizer.parse('log(100, 10)'))).toEqual(
                new Decimal('2')
            );
            expect(parser.calculate(tokenizer.parse('log(50, 10)'))).toEqual(
                new Decimal('1.6989700043360188048')
            );
        });

        test('ln', () => {
            expect(parser.calculate(tokenizer.parse('ln(100)'))).toEqual(
                new Decimal('4.605170185988091368')
            );
            expect(parser.calculate(tokenizer.parse('ln(50)'))).toEqual(
                new Decimal('3.9120230054281460586')
            );
        });

        test('power', () => {
            expect(parser.calculate(tokenizer.parse('power(2, 3)'))).toEqual(
                new Decimal('8')
            );
            expect(parser.calculate(tokenizer.parse('power(4, 1/2)'))).toEqual(
                new Decimal('2')
            );
            expect(parser.calculate(tokenizer.parse('power(-2, 3)'))).toEqual(
                new Decimal('-8')
            );
            expect(parser.calculate(tokenizer.parse('power(2, 0)'))).toEqual(
                new Decimal('1')
            );
            expect(parser.calculate(tokenizer.parse('power(2, -2)'))).toEqual(
                new Decimal('0.25')
            );
        });

        test('exp', () => {
            expect(parser.calculate(tokenizer.parse('exp(5.1)'))).toEqual(
                new Decimal('164.02190729990174395')
            );
            expect(parser.calculate(tokenizer.parse('exp(-2)'))).toEqual(
                new Decimal('0.13533528323661269189')
            );
            expect(parser.calculate(tokenizer.parse('exp(0)'))).toEqual(
                new Decimal('1')
            );
        });

        test('fact', () => {
            expect(parser.calculate(tokenizer.parse('fact(5)'))).toEqual(
                new Decimal('120')
            );
            expect(parser.calculate(tokenizer.parse('fact(5.0)'))).toEqual(
                new Decimal('120')
            );
            expect(parser.calculate(tokenizer.parse('fact(6.2)'))).toEqual(
                new Decimal('720')
            );
            expect(parser.calculate(tokenizer.parse('fact(170)'))).toEqual(
                new Decimal('7.2574156153079989694e+306')
            );
        });

        test('round', () => {
            expect(
                parser.calculate(tokenizer.parse('round(1234.56789, 2)'))
            ).toEqual(new Decimal('1234.57'));
            expect(
                parser.calculate(tokenizer.parse('round(1234.56499, 2)'))
            ).toEqual(new Decimal('1234.56'));
            expect(
                parser.calculate(tokenizer.parse('round(1234.56789, 0)'))
            ).toEqual(new Decimal('1235'));
            expect(
                parser.calculate(tokenizer.parse('round(1234.56789, -1)'))
            ).toEqual(new Decimal('1230'));
        });
    });

    describe('三角関数', () => {
        test('sin', () => {
            expect(parser.calculate(tokenizer.parse('sin(0)'))).toEqual(
                new Decimal('0')
            );
            expect(
                parser.calculate(tokenizer.parse('round(sin(pi()), 20)'))
            ).toEqual(new Decimal('0'));
            expect(parser.calculate(tokenizer.parse('sin(pi()/2)'))).toEqual(
                new Decimal('1')
            );
        });

        test('cos', () => {
            expect(parser.calculate(tokenizer.parse('cos(0)'))).toEqual(
                new Decimal('1')
            );
            expect(
                parser.calculate(tokenizer.parse('cos(-pi())')).toNumber()
            ).toBeCloseTo(-1);
            expect(
                parser.calculate(tokenizer.parse('round(cos(pi()/2), 19)'))
            ).toEqual(new Decimal('0'));

            expect(parser.calculate(tokenizer.parse('cos(2*pi())'))).toEqual(
                new Decimal('1')
            );
        });

        test('tan', () => {
            expect(parser.calculate(tokenizer.parse('tan(0)'))).toEqual(
                new Decimal('0')
            );
            expect(parser.calculate(tokenizer.parse('tan(pi()/4)'))).toEqual(
                new Decimal('1')
            );
            expect(
                parser.calculate(tokenizer.parse('round(tan(pi()), 19)'))
            ).toEqual(new Decimal('-0'));
            expect(
                parser.calculate(tokenizer.parse('round(tan(3*pi()/4), 18)'))
            ).toEqual(new Decimal('-1'));
        });

        test('radians', () => {
            expect(parser.calculate(tokenizer.parse('radians(0)'))).toEqual(
                new Decimal('0')
            );
            expect(parser.calculate(tokenizer.parse('radians(90)'))).toEqual(
                GSFunctionToken.PI.div(2)
            );
            expect(parser.calculate(tokenizer.parse('radians(180)'))).toEqual(
                new Decimal('3.1415926535897932384')
            );
            expect(parser.calculate(tokenizer.parse('radians(270)'))).toEqual(
                GSFunctionToken.PI.mul(3).div(2)
            );
        });

        test('degrees', () => {
            expect(parser.calculate(tokenizer.parse('degrees(0)'))).toEqual(
                new Decimal('0')
            );
            expect(
                parser.calculate(tokenizer.parse('round(degrees(pi()/2),17)'))
            ).toEqual(new Decimal('90'));
            expect(parser.calculate(tokenizer.parse('degrees(pi())'))).toEqual(
                new Decimal('180')
            );
            expect(
                parser.calculate(tokenizer.parse('degrees(pi()*3/2)'))
            ).toEqual(new Decimal('270'));
        });
    });

    describe('論理演算', () => {
        test('eq', () => {
            expect(parser.calculate(tokenizer.parse('eq(0.00, 0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('eq(1.00, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('eq(1.00, 1.1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('eq((1/0), 1)'))).toEqual(
                new Decimal(0)
            );
        });

        test('ne', () => {
            expect(parser.calculate(tokenizer.parse('ne(0.00, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('ne(1.00, 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('ne(1.00, 1.1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('ne((1/0), 1)'))).toEqual(
                new Decimal(1)
            );
        });

        test('lt', () => {
            expect(parser.calculate(tokenizer.parse('lt(0.0, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('lt(1.0, 1.1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('lt(1.0, 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('lt(1.1, 1.0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('lt((1/0), 1)'))).toEqual(
                new Decimal(0)
            );
        });

        test('lte', () => {
            expect(parser.calculate(tokenizer.parse('lte(1.0, 1.1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('lte(1.0, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('lte(1.1, 1.0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('lte((1/0), 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('lte(0.0, 0)'))).toEqual(
                new Decimal(1)
            );
        });

        test('gt', () => {
            expect(parser.calculate(tokenizer.parse('gt(0.0, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('gt(1.0, 1.1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('gt(1.0, 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('gt(1.1, 1.0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('gt((1/0), 1)'))).toEqual(
                new Decimal(0)
            );
        });

        test('gte', () => {
            expect(parser.calculate(tokenizer.parse('gte(0.0, 0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('gte(1.0, 1.1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('gte(1.0, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('gte(1.1, 1.0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('gte((1/0), 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('gte(0.0, 0)'))).toEqual(
                new Decimal(1)
            );
        });

        test('not', () => {
            expect(parser.calculate(tokenizer.parse('not(0.0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('not(1/0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('not(1)'))).toEqual(
                new Decimal(0)
            );
        });

        test('and', () => {
            expect(parser.calculate(tokenizer.parse('and(1, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('and(0, 1)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('and(1, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('and(0, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('and(1/0, 1)'))).toEqual(
                new Decimal(0)
            );
        });

        test('or', () => {
            expect(parser.calculate(tokenizer.parse('or(1, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('or(0, 1)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('or(1, 0)'))).toEqual(
                new Decimal(1)
            );
            expect(parser.calculate(tokenizer.parse('or(0, 0)'))).toEqual(
                new Decimal(0)
            );
            expect(parser.calculate(tokenizer.parse('or(1/0, 1)'))).toEqual(
                new Decimal(1)
            );
        });

        test('if', () => {
            // not false
            expect(
                parser.calculate(tokenizer.parse('if(5.1, 10, 20)'))
            ).toEqual(new Decimal(10));

            // 0 は False
            expect(parser.calculate(tokenizer.parse('if(0, 10, 20)'))).toEqual(
                new Decimal(20)
            );

            // NaN は False
            expect(parser.calculate(tokenizer.parse('1/0'))).toEqual(
                new Decimal('NaN')
            );
            expect(
                parser.calculate(tokenizer.parse('if(1/0, 10, 20)'))
            ).toEqual(new Decimal('20'));
        });

        test('ifna', () => {
            expect(parser.calculate(tokenizer.parse('ifna(na(), 10)'))).toEqual(
                new Decimal(10)
            );
            expect(parser.calculate(tokenizer.parse('ifna(1, 10)'))).toEqual(
                new Decimal(1)
            );
        });

        test('na', () => {
            expect(parser.calculate(tokenizer.parse('na()'))).toEqual(
                new Decimal('NaN')
            );
        });
    });
});
