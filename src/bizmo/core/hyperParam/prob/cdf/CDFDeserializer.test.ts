import Decimal from 'decimal.js';
import { deserializeCDF } from './CDFDeserializer';
import { CustomDistribution } from './CustomDistribution';
import { NormalDistribution } from './NormalDistribution';
import { TriangleDistribution } from './TriangleDistribution';
import { UniformDistribution } from './UniformDistribution';

describe('CDFDeserializer: deserializeCDFのテスト', () => {
    test('UniformDistribution', () => {
        const serialized = '{"name":"UniformDistribution"}';
        const result = deserializeCDF(serialized);
        expect(result instanceof UniformDistribution).toBeTruthy();
    });

    test('NormalDistribution', () => {
        const serialized =
            '{"name":"NormalDistribution","mean":"456","sd":"123"}';
        const result = deserializeCDF(serialized);
        expect(result instanceof NormalDistribution).toBeTruthy();
        expect((result as NormalDistribution).mean).toEqual(new Decimal(456));
        expect((result as NormalDistribution).sd).toEqual(new Decimal(123));
    });

    test('TriangleDistribution', () => {
        const serialized = '{"name":"TriangleDistribution","mode":"123"}';
        const result = deserializeCDF(serialized);
        expect(result instanceof TriangleDistribution).toBeTruthy();
        expect((result as TriangleDistribution).mode).toEqual(new Decimal(123));
    });

    test('CustomDistribution', () => {
        const serialized =
            '{"name":"CustomDistribution","customProbs":["123","456"]}';
        const result = deserializeCDF(serialized);
        expect(result instanceof CustomDistribution).toBeTruthy();
        expect((result as CustomDistribution).customProbs).toEqual([
            new Decimal(123),
            new Decimal(456),
        ]);
    });
});
