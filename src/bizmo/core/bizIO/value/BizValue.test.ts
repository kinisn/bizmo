import Decimal from 'decimal.js';
import { BizValue } from './BizValue';

describe('BizValue のテスト', () => {
    describe('初期化', () => {
        test('dateのみ -> Decimal(0)', () => {
            const bizValue = new BizValue(new Date(2020, 0, 1));
            expect(bizValue.date).toEqual(new Date(2020, 0, 1));
            expect(bizValue.value).toEqual(new Decimal(0));
        });

        test('date + decimal  -> decimal', () => {
            const bizValue = new BizValue(
                new Date(2020, 0, 1),
                new Decimal('0.1').add('0.2')
            );
            expect(bizValue.date).toEqual(new Date(2020, 0, 1));
            expect(bizValue.value).toEqual(new Decimal('0.3'));
        });
    });
    describe('set/get', () => {
        test('Decimal 実態あり', () => {
            const bizValue = new BizValue(
                new Date(2020, 0, 1),
                new Decimal('0.3')
            );
            bizValue.value = new Decimal('123.45');
            expect(bizValue.date).toEqual(new Date(2020, 0, 1));
            expect(bizValue.value).toEqual(new Decimal('123.45'));
        });
    });
});
