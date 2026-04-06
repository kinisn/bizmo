import Decimal from 'decimal.js';
import { SystemInput } from './SystemInput';

describe('SystemInput のテスト', () => {
    let sys1: SystemInput;
    let sys2: SystemInput;
    let sys3: SystemInput;

    beforeEach(() => {
        sys1 = new SystemInput(0, new Date(2020, 0, 1));
        sys2 = new SystemInput(1, new Date(2021, 11, 31));
        sys3 = new SystemInput(2, new Date(2020, 1, 29));
    });

    test('年始', () => {
        const expected = [
            new Decimal('0'),
            new Decimal('20200101'),
            new Decimal('2020'),
            new Decimal('1'),
            new Decimal('1'),
        ];
        expect(sys1.inputs).toEqual(expected);
    });

    test('年末', () => {
        const expected = [
            new Decimal('1'),
            new Decimal('20211231'),
            new Decimal('2021'),
            new Decimal('12'),
            new Decimal('31'),
        ];
        expect(sys2.inputs).toEqual(expected);
    });

    test('閏年', () => {
        const expected = [
            new Decimal('2'),
            new Decimal('20200229'),
            new Decimal('2020'),
            new Decimal('2'),
            new Decimal('29'),
        ];
        expect(sys3.inputs).toEqual(expected);
    });
});
