import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { TriangleDistribution } from './TriangleDistribution';

type CDFParams = {
    unit: Decimal;
    lowerLimit: Decimal;
    upperLimit: Decimal;
};
describe('TriangleDistribution のテスト', () => {
    let param1: CDFParams;
    let param1C: CDFParams;
    let param2: CDFParams;
    let orderedBins0: Array<ProbBin>;
    let orderedBins1: Array<ProbBin>;
    let orderedBins1C: Array<ProbBin>;
    let orderedBins2: Array<ProbBin>;

    beforeEach(() => {
        param1 = {
            unit: new Decimal(1),
            upperLimit: new Decimal(10),
            lowerLimit: new Decimal(0),
        };
        param1C = {
            unit: new Decimal(1000),
            upperLimit: new Decimal(10000),
            lowerLimit: new Decimal(0),
        };
        param2 = {
            unit: new Decimal(1),
            upperLimit: new Decimal('1.5'),
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

        orderedBins1C = [
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('1000.0'),
                upperValue: new Decimal('2000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('2000.0'),
                upperValue: new Decimal('3000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('3000.0'),
                upperValue: new Decimal('4000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('4000.0'),
                upperValue: new Decimal('5000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('5000.0'),
                upperValue: new Decimal('6000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('6000.0'),
                upperValue: new Decimal('7000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('7000.0'),
                upperValue: new Decimal('8000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('8000.0'),
                upperValue: new Decimal('9000.0'),
            }),
            new ProbBin({
                prob: new Decimal(0),
                lowerValue: new Decimal('9000.0'),
                upperValue: new Decimal('10000.0'),
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

    describe('without out of edge', () => {
        test('等間隔', () => {
            // 等間隔
            const cdf = new TriangleDistribution(new Decimal('5'));
            const stat = cdf.updateProb(
                orderedBins1,
                param1.unit,
                param1.lowerLimit,
                param1.upperLimit
            );
            const expected = [
                new ProbBin({
                    prob: new Decimal('0.02'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.14'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.18'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.18'),
                    lowerValue: new Decimal('5.0'),
                    upperValue: new Decimal('6.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.14'),
                    lowerValue: new Decimal('6.0'),
                    upperValue: new Decimal('7.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10'),
                    lowerValue: new Decimal('7.0'),
                    upperValue: new Decimal('8.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06'),
                    lowerValue: new Decimal('8.0'),
                    upperValue: new Decimal('9.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.02'),
                    lowerValue: new Decimal('9.0'),
                    upperValue: new Decimal('10.0'),
                }),
            ];
            expect(orderedBins1).toEqual(expected);

            expect(stat.expectedValue).toEqual(new Decimal('5.0'));
            expect(stat.mode?.value).toEqual(new Decimal('5.0'));
            expect(stat.median?.value).toEqual(new Decimal('4.0'));

            expect(stat.percentile_10?.value).toEqual(new Decimal('2.0'));
            expect(stat.percentile_20?.value).toEqual(new Decimal('3.0'));
            expect(stat.percentile_25?.value).toEqual(new Decimal('3.0'));
            expect(stat.percentile_30?.value).toEqual(new Decimal('3.0'));
            expect(stat.percentile_40?.value).toEqual(new Decimal('4.0'));
            expect(stat.percentile_50?.value).toEqual(new Decimal('4.0'));
            expect(stat.percentile_60?.value).toEqual(new Decimal('5.0'));
            expect(stat.percentile_70?.value).toEqual(new Decimal('6.0'));
            expect(stat.percentile_75?.value).toEqual(new Decimal('6.0'));
            expect(stat.percentile_80?.value).toEqual(new Decimal('6.0'));
            expect(stat.percentile_90?.value).toEqual(new Decimal('7.0'));
            expect(stat.percentile_100?.value).toEqual(new Decimal('9.0'));
        });

        test('不等間隔', () => {
            const cdf = new TriangleDistribution(new Decimal('1.0'));
            const stat = cdf.updateProb(
                orderedBins2,
                param2.unit,
                param2.lowerLimit,
                param2.upperLimit
            );

            const expected = [
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

            expect(stat.expectedValue).toEqual(
                new Decimal('0.83333333333333333333')
            );
            expect(stat.mode?.value).toEqual(new Decimal('0.0'));
            expect(stat.median?.value).toEqual(new Decimal('0.0'));

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

        test('データ無し', () => {
            // データ無し
            const cdf = new TriangleDistribution(new Decimal('1.0'));
            cdf.updateProb(
                orderedBins0,
                param2.unit,
                param2.lowerLimit,
                param2.upperLimit
            );
            expect(orderedBins0).toEqual([]);
        });

        test('Edge Left', () => {
            // Edge Left
            const cdf = new TriangleDistribution(new Decimal('0.0'));
            cdf.updateProb(
                orderedBins1,
                param1.unit,
                param1.lowerLimit,
                param1.upperLimit
            );
            const expected = [
                new ProbBin({
                    prob: new Decimal('0.19'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.17'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.15'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.13'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.11'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.09'),
                    lowerValue: new Decimal('5.0'),
                    upperValue: new Decimal('6.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07'),
                    lowerValue: new Decimal('6.0'),
                    upperValue: new Decimal('7.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('7.0'),
                    upperValue: new Decimal('8.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.03'),
                    lowerValue: new Decimal('8.0'),
                    upperValue: new Decimal('9.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.01'),
                    lowerValue: new Decimal('9.0'),
                    upperValue: new Decimal('10.0'),
                }),
            ];
            expect(orderedBins1).toEqual(expected);
        });

        test('Edge Right', () => {
            const cdf = new TriangleDistribution(new Decimal('10.0'));
            cdf.updateProb(
                orderedBins1,
                param1.unit,
                param1.lowerLimit,
                param1.upperLimit
            );
            const expected = [
                new ProbBin({
                    prob: new Decimal('0.01'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.03'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.09'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.11'),
                    lowerValue: new Decimal('5.0'),
                    upperValue: new Decimal('6.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.13'),
                    lowerValue: new Decimal('6.0'),
                    upperValue: new Decimal('7.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.15'),
                    lowerValue: new Decimal('7.0'),
                    upperValue: new Decimal('8.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.17'),
                    lowerValue: new Decimal('8.0'),
                    upperValue: new Decimal('9.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.19'),
                    lowerValue: new Decimal('9.0'),
                    upperValue: new Decimal('10.0'),
                }),
            ];
            expect(orderedBins1).toEqual(expected);
        });
    });

    describe('with out of edge', () => {
        test('等間隔', () => {
            const cdf = new TriangleDistribution(new Decimal('5'));
            cdf.updateProbAs80PctClosure(
                orderedBins1,
                param1.unit,
                param1.lowerLimit,
                param1.upperLimit
            );
            const expected = [
                new ProbBin({
                    prob: new Decimal('0.05555411897497493465'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06777455869670281294'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07999499841843069121'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.0922154381401585695'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10443587786188644777'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10443587786188644776'),
                    lowerValue: new Decimal('5.0'),
                    upperValue: new Decimal('6.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.09221543814015856949'),
                    lowerValue: new Decimal('6.0'),
                    upperValue: new Decimal('7.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07999499841843069122'),
                    lowerValue: new Decimal('7.0'),
                    upperValue: new Decimal('8.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06777455869670281293'),
                    lowerValue: new Decimal('8.0'),
                    upperValue: new Decimal('9.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05555411897497493466'),
                    lowerValue: new Decimal('9.0'),
                    upperValue: new Decimal('10.0'),
                }),
            ];
            expect(orderedBins1).toEqual(expected);
        });

        test('mode 移動', () => {
            const cdf = new TriangleDistribution(new Decimal('0'));
            cdf.updateProb(
                orderedBins1,
                param1.unit,
                param1.lowerLimit,
                param1.upperLimit
            );

            const expected = [
                new ProbBin({
                    prob: new Decimal('0.19'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.17'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.15'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.13'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.11'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.09'),
                    lowerValue: new Decimal('5.0'),
                    upperValue: new Decimal('6.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07'),
                    lowerValue: new Decimal('6.0'),
                    upperValue: new Decimal('7.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('7.0'),
                    upperValue: new Decimal('8.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.03'),
                    lowerValue: new Decimal('8.0'),
                    upperValue: new Decimal('9.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.01'),
                    lowerValue: new Decimal('9.0'),
                    upperValue: new Decimal('10.0'),
                }),
            ];
            expect(orderedBins1).toEqual(expected);
        });

        test('unit デカイ場合', () => {
            const cdf = new TriangleDistribution(new Decimal('5000'));
            cdf.updateProbAs80PctClosure(
                orderedBins1C,
                param1C.unit,
                param1C.lowerLimit,
                param1C.upperLimit
            );

            const expected = [
                new ProbBin({
                    prob: new Decimal('0.05555411897497493465'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06777455869670281294'),
                    lowerValue: new Decimal('1000.0'),
                    upperValue: new Decimal('2000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07999499841843069121'),
                    lowerValue: new Decimal('2000.0'),
                    upperValue: new Decimal('3000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.0922154381401585695'),
                    lowerValue: new Decimal('3000.0'),
                    upperValue: new Decimal('4000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10443587786188644777'),
                    lowerValue: new Decimal('4000.0'),
                    upperValue: new Decimal('5000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.10443587786188644776'),
                    lowerValue: new Decimal('5000.0'),
                    upperValue: new Decimal('6000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.09221543814015856949'),
                    lowerValue: new Decimal('6000.0'),
                    upperValue: new Decimal('7000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.07999499841843069122'),
                    lowerValue: new Decimal('7000.0'),
                    upperValue: new Decimal('8000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.06777455869670281293'),
                    lowerValue: new Decimal('8000.0'),
                    upperValue: new Decimal('9000.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05555411897497493466'),
                    lowerValue: new Decimal('9000.0'),
                    upperValue: new Decimal('10000.0'),
                }),
            ];
            expect(orderedBins1C).toEqual(expected);
        });
    });

    describe('serialize', () => {
        test('serializeできる', () => {
            const cdf = new TriangleDistribution(new Decimal('123'));
            expect(cdf.serialize()).toEqual(
                '{"name":"TriangleDistribution","mode":"123"}'
            );
        });

        test('deserializeできる', () => {
            const cdf = new TriangleDistribution(new Decimal('123'));
            const json = cdf.serialize();
            const cdf2 = TriangleDistribution.deserialize(json);
            expect(cdf2 instanceof TriangleDistribution).toBeTruthy();
            expect(cdf2.mode).toEqual(new Decimal('123'));
        });
    });
});
