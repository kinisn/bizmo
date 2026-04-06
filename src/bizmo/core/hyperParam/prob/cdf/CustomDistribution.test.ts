import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { CustomDistribution } from './CustomDistribution';

type CDFParams = {
    unit: Decimal;
    lowerLimit: Decimal;
    upperLimit: Decimal;
};

describe('CustomDistribution のテスト', () => {
    let param1: CDFParams;
    let orderedBins1: Array<ProbBin>;
    let customSetting: Array<Decimal>;

    beforeEach(() => {
        param1 = {
            unit: new Decimal(1),
            upperLimit: new Decimal(10),
            lowerLimit: new Decimal(0),
        };

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

        customSetting = [
            new Decimal('0.01'),
            new Decimal('0.02'),
            new Decimal('0.03'),
            new Decimal('0.04'),
            new Decimal('0.05'),
            new Decimal('0.06'),
            new Decimal('0.07'),
            new Decimal('0.08'),
            new Decimal('0.09'),
            new Decimal('0.55'),
        ];
    });

    test('カスタム情報なし', () => {
        const cdf = new CustomDistribution();

        // 変化無し
        let stat = cdf.updateProb(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        let expected = [
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
        expect(orderedBins1).toEqual(expected);
    });

    test('カスタム情報で初期化', () => {
        const cdf = new CustomDistribution(customSetting);
        let stat = cdf.updateProb(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        let expected = [
            new ProbBin({
                prob: new Decimal('0.01'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.02'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.03'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.04'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.05'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.06'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.07'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.08'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.09'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.55'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);

        expect(stat.expectedValue).toEqual(new Decimal('7.350'));
        expect(stat.mode?.value).toEqual(new Decimal('9.0'));
        expect(stat.median?.value).toEqual(new Decimal('9.0'));

        expect(stat.percentile_10?.value).toEqual(new Decimal('3.0'));
        expect(stat.percentile_20?.value).toEqual(new Decimal('5.0'));
        expect(stat.percentile_25?.value).toEqual(new Decimal('6.0'));
        expect(stat.percentile_30?.value).toEqual(new Decimal('7.0'));
        expect(stat.percentile_40?.value).toEqual(new Decimal('8.0'));
        expect(stat.percentile_50?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_60?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_70?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_75?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_80?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_90?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_100?.value).toEqual(new Decimal('9.0'));
    });

    test('カスタム情報で更新', () => {
        const cdf = new CustomDistribution();
        cdf.customProbs = customSetting;
        let stat = cdf.updateProb(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        let expected = [
            new ProbBin({
                prob: new Decimal('0.01'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.02'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.03'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.04'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.05'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.06'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.07'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.08'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.09'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.55'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);

        expect(stat.expectedValue).toEqual(new Decimal('7.350'));
        expect(stat.mode?.value).toEqual(new Decimal('9.0'));
        expect(stat.median?.value).toEqual(new Decimal('9.0'));

        expect(stat.percentile_10?.value).toEqual(new Decimal('3.0'));
        expect(stat.percentile_20?.value).toEqual(new Decimal('5.0'));
        expect(stat.percentile_25?.value).toEqual(new Decimal('6.0'));
        expect(stat.percentile_30?.value).toEqual(new Decimal('7.0'));
        expect(stat.percentile_40?.value).toEqual(new Decimal('8.0'));
        expect(stat.percentile_50?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_60?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_70?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_75?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_80?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_90?.value).toEqual(new Decimal('9.0'));
        expect(stat.percentile_100?.value).toEqual(new Decimal('9.0'));
    });

    test('updateProbAs80PctClosure は updateProb と同じ', () => {
        const cdf = new CustomDistribution(customSetting);
        cdf.customProbs = customSetting;
        let stat = cdf.updateProbAs80PctClosure(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        let expected = [
            new ProbBin({
                prob: new Decimal('0.01'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.02'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.03'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.04'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.05'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.06'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.07'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.08'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.09'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.55'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);
    });

    describe('serialize', () => {
        test('serializeできる', () => {
            const cdf = new CustomDistribution([
                new Decimal('123'),
                new Decimal('456'),
            ]);
            expect(cdf.serialize()).toEqual(
                '{"name":"CustomDistribution","customProbs":["123","456"]}'
            );
        });

        test('deserializeできる', () => {
            const cdf = new CustomDistribution([
                new Decimal('123'),
                new Decimal('456'),
            ]);
            const json = cdf.serialize();
            const cdf2 = CustomDistribution.deserialize(json);
            expect(cdf2 instanceof CustomDistribution).toBeTruthy();
            expect(cdf2.customProbs).toEqual([
                new Decimal('123'),
                new Decimal('456'),
            ]);
        });
    });
});
