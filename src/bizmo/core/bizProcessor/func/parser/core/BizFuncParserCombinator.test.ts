import Decimal from 'decimal.js';
import { DecimalBizFuncParserCombinator } from '../DecimalBizFuncParserCombinator';
import { BizFuncTokenizer } from './BizFuncTokenizer';

describe('BizFuncParser & BasicArithmeticOpTokens のテスト', () => {
    let tokenizer: BizFuncTokenizer;
    let parser: DecimalBizFuncParserCombinator;

    beforeEach(() => {
        tokenizer = new BizFuncTokenizer();
        parser = new DecimalBizFuncParserCombinator();
    });

    test('四則演算', () => {
        expect(parser.calculate(tokenizer.parse('1'))).toEqual(new Decimal(1));
        expect(parser.calculate(tokenizer.parse('+1.5'))).toEqual(
            new Decimal('1.5')
        );
        expect(parser.calculate(tokenizer.parse('-0.5'))).toEqual(
            new Decimal('-0.5')
        );
        expect(parser.calculate(tokenizer.parse('1 + 2'))).toEqual(
            new Decimal(3)
        );
        expect(parser.calculate(tokenizer.parse('1 - 2'))).toEqual(
            new Decimal(-1)
        );
        expect(parser.calculate(tokenizer.parse('1 * 2'))).toEqual(
            new Decimal(2)
        );
        expect(parser.calculate(tokenizer.parse('1 / 2'))).toEqual(
            new Decimal('0.5')
        );
        expect(parser.calculate(tokenizer.parse('1 + 2 * 3 + 4'))).toEqual(
            new Decimal(11)
        );
        expect(parser.calculate(tokenizer.parse('(1 + 2) * (3 + 4)'))).toEqual(
            new Decimal(21)
        );
        expect(parser.calculate(tokenizer.parse('1.2--3.4'))).toEqual(
            new Decimal('4.6')
        );
        expect(
            parser.calculate(tokenizer.parse('1 + -1 + 0.2 - 0.2 + 3'))
        ).toEqual(new Decimal(3));

        expect(parser.calculate(tokenizer.parse('0.1 * -0.1 * 3 / 3'))).toEqual(
            new Decimal('-0.01')
        );

        expect(parser.calculate(tokenizer.parse('3 / 0'))).toEqual(
            new Decimal('NaN')
        );

        expect(
            parser.calculate(tokenizer.parse('1 + ((0.1 + -0.1 + 2) * 5 / 10)'))
        ).toEqual(new Decimal('2.0'));
    });

    describe('テキストの形式', () => {
        test('通常', () => {
            expect(parser.calculate(tokenizer.parse('1+1-1'))).toEqual(
                new Decimal('1')
            );
        });

        test('EOF error', () => {
            expect(parser.calculate(tokenizer.parse('1+1-'))).toEqual(
                new Decimal('NaN')
            );
        });

        test('non-supported function error', () => {
            expect(parser.calculate(tokenizer.parse('1-eval(1)'))).toEqual(
                new Decimal('NaN')
            );
        });

        test('func param error', () => {
            expect(parser.calculate(tokenizer.parse('ln(1,1)'))).toEqual(
                new Decimal('NaN')
            );
        });
    });
});
