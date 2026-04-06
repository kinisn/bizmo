import Decimal from 'decimal.js';
import { PriorityGenerator } from './PriorityGenerator';

describe('PriorityGenerator のテスト', () => {
    describe('generate', () => {
        test('init default', () => {
            expect(new PriorityGenerator().generate()).toEqual(
                new Decimal(100)
            );
        });

        test('init with seed', () => {
            expect(new PriorityGenerator(new Decimal(123)).generate()).toEqual(
                new Decimal(12400)
            );
        });
    });
});
