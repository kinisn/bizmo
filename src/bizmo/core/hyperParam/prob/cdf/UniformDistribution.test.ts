import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { UniformDistribution } from './UniformDistribution';

type CDFParams = {
    unit: Decimal;
    lowerLimit: Decimal;
    upperLimit: Decimal;
};

describe('UniformDistribution のテスト', () => {
    let param1: CDFParams;
    let param2: CDFParams;
    let param0: CDFParams;
    let orderedBins0: Array<ProbBin>;
    let orderedBins1: Array<ProbBin>;
    let orderedBins2: Array<ProbBin>;

    beforeEach(() => {
        param1 = {
            unit: new Decimal(1),
            upperLimit: new Decimal(10),
            lowerLimit: new Decimal(0),
        };
        param2 = {
            unit: new Decimal(1),
            upperLimit: new Decimal('1.5'),
            lowerLimit: new Decimal(0),
        };
        param0 = {
            unit: new Decimal(1),
            upperLimit: new Decimal(0),
            lowerLimit: new Decimal(0),
        };

        orderedBins0 = [];
        orderedBins1 = [
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];

        orderedBins2 = [
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('1.5'),
            }),
        ];
    });

    test(`等間隔`, () => {
        // 等間隔
        let cdf = new UniformDistribution();
        let stat = cdf.updateProb(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        let expected = [
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);

        expect(stat.expectedValue).toEqual(new Decimal('5.0'));
        expect(stat.mode?.value).toEqual(new Decimal('9.0'));
        expect(stat.median?.value).toEqual(new Decimal('4.0'));

        expect(stat.percentile_10?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_20?.value).toEqual(new Decimal('1.0'));
        expect(stat.percentile_25?.value).toEqual(new Decimal('2.0'));
        expect(stat.percentile_30?.value).toEqual(new Decimal('2.0'));
        expect(stat.percentile_40?.value).toEqual(new Decimal('3.0'));
        expect(stat.percentile_50?.value).toEqual(new Decimal('4.0'));
        expect(stat.percentile_60?.value).toEqual(new Decimal('5.0'));
        expect(stat.percentile_70?.value).toEqual(new Decimal('6.0'));
        expect(stat.percentile_75?.value).toEqual(new Decimal('7.0'));
        expect(stat.percentile_80?.value).toEqual(new Decimal('7.0'));
        expect(stat.percentile_90?.value).toEqual(new Decimal('8.0'));
        expect(stat.percentile_100?.value).toEqual(new Decimal('9.0'));
    });

    test('データ無し', () => {
        let cdf = new UniformDistribution();
        let stat = cdf.updateProb(
            orderedBins0,
            param0.unit,
            param0.lowerLimit,
            param0.upperLimit
        );
        let expected: ProbBin[] = [];
        expect(orderedBins0).toEqual(expected);
    });

    test('updateProbAs80PctClosure は updateProb と同じ', () => {
        // out of edge 両端 10 %
        let cdf = new UniformDistribution();
        let stat = cdf.updateProbAs80PctClosure(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );

        // 等間隔
        let expected = [
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);
    });

    test('不等間隔', () => {
        let cdf = new UniformDistribution();
        let stat = cdf.updateProb(
            orderedBins2,
            param2.unit,
            param2.lowerLimit,
            param2.upperLimit
        );
        let expected = [
            new ProbBin({
                prob: new Decimal('0.66666666666666666667'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.33333333333333333333'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('1.5'),
            }),
        ];
        expect(orderedBins2).toEqual(expected);

        expect(stat.expectedValue).toEqual(new Decimal('0.75'));

        expect(stat.percentile_10?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_20?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_25?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_30?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_40?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_50?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_60?.value).toEqual(new Decimal('0.0'));
        expect(stat.percentile_70?.value).toEqual(new Decimal('1.0'));
        expect(stat.percentile_75?.value).toEqual(new Decimal('1.0'));
        expect(stat.percentile_80?.value).toEqual(new Decimal('1.0'));
        expect(stat.percentile_90?.value).toEqual(new Decimal('1.0'));
        expect(stat.percentile_100?.value).toEqual(new Decimal('1.0'));
    });

    describe('serialize', () => {
        test('serializeできる', () => {
            const cdf = new UniformDistribution();
            expect(cdf.serialize()).toEqual('{"name":"UniformDistribution"}');
        });

        test('deserializeできる', () => {
            const cdf = new UniformDistribution();
            const json = cdf.serialize();
            const cdf2 = UniformDistribution.deserialize(json);
            expect(cdf2 instanceof UniformDistribution).toBeTruthy();
        });
    });
});
