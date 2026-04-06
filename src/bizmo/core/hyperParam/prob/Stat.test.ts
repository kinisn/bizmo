import Decimal from 'decimal.js';
import { ProbBin } from './ProbBin';
import { Stat } from './Stat';

describe('Stat のテスト', () => {
    let noBins: Array<ProbBin>;
    let uniformBins: Array<ProbBin>;
    let normalLikeBins: Array<ProbBin>;
    let normalLikeBins2: Array<ProbBin>;

    beforeEach(() => {
        noBins = [];
        uniformBins = [
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
        ];
        normalLikeBins = [
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.4'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.2'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.1'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
        ];

        normalLikeBins2 = [];
        for (let x: number = 1; x < 7; x++) {
            normalLikeBins2.push(
                new ProbBin({
                    prob: new Decimal(1).div(new Decimal(6)),
                    lowerValue: new Decimal(x),
                    upperValue: new Decimal(x + 1),
                })
            );
        }
    });

    describe('初期化', () => {
        test('init with param', () => {
            const stat = new Stat(normalLikeBins, {
                expectedValue: new Decimal(200),
                variance: new Decimal(40000),
            });
            expect(stat.expectedValue).toEqual(new Decimal(200));
            expect(stat.mean).toEqual(new Decimal(200));
            expect(stat.variance).toEqual(new Decimal('40000'));
            expect(stat.sd).toEqual(new Decimal('200'));
            expect(stat.mode).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.median).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );

            expect(stat.percentile_10).toEqual(
                new ProbBin({
                    prob: new Decimal('0.1'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                })
            );
            expect(stat.percentile_20).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_25).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_30).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_40).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_50).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_60).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_70).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_75).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_80).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_90).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_100).toEqual(
                new ProbBin({
                    prob: new Decimal('0.1'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                })
            );
        });

        test('init with no bins', () => {
            const stat = new Stat(noBins);
            expect(stat.expectedValue).toBeUndefined();
            expect(stat.mean).toBeUndefined();
            expect(stat.mode).toBeUndefined();
            expect(stat.median).toBeUndefined();
            expect(stat.percentile_10).toBeUndefined();
            expect(stat.percentile_20).toBeUndefined();
            expect(stat.percentile_25).toBeUndefined();
            expect(stat.percentile_30).toBeUndefined();
            expect(stat.percentile_40).toBeUndefined();
            expect(stat.percentile_50).toBeUndefined();
            expect(stat.percentile_60).toBeUndefined();
            expect(stat.percentile_70).toBeUndefined();
            expect(stat.percentile_75).toBeUndefined();
            expect(stat.percentile_80).toBeUndefined();
            expect(stat.percentile_90).toBeUndefined();
            expect(stat.percentile_90).toBeUndefined();
            expect(stat.percentile_100).toBeUndefined();
            expect(stat.variance).toBeUndefined();
            expect(stat.sd).toBeUndefined();
        });

        test('init with uniform', () => {
            const stat = new Stat(uniformBins);
            expect(stat.expectedValue).toEqual(new Decimal(2));
            expect(stat.mean).toEqual(new Decimal(2));
            expect(stat.mode).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                })
            );
            expect(stat.median).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.variance).toEqual(new Decimal('2.0'));
            expect(stat.sd).toEqual(new Decimal('1.4142135623730950488'));

            expect(stat.percentile_10).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                })
            );
            expect(stat.percentile_20).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                })
            );
            expect(stat.percentile_25).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_30).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_40).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_50).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_60).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_70).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_75).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_80).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_90).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                })
            );
            expect(stat.percentile_100).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                })
            );
        });

        test('with normal like bins', () => {
            const stat = new Stat(normalLikeBins);
            expect(stat.expectedValue).toEqual(new Decimal(2));
            expect(stat.mean).toEqual(new Decimal(2));
            expect(stat.mode).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.median).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.variance).toEqual(new Decimal('1.20000'));
            expect(stat.sd).toEqual(new Decimal('1.0954451150103322269'));

            expect(stat.percentile_10).toEqual(
                new ProbBin({
                    prob: new Decimal('0.1'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('1.0'),
                })
            );
            expect(stat.percentile_20).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_25).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_30).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('1.0'),
                    upperValue: new Decimal('2.0'),
                })
            );
            expect(stat.percentile_40).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_50).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_60).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_70).toEqual(
                new ProbBin({
                    prob: new Decimal('0.4'),
                    lowerValue: new Decimal('2.0'),
                    upperValue: new Decimal('3.0'),
                })
            );
            expect(stat.percentile_75).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_80).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_90).toEqual(
                new ProbBin({
                    prob: new Decimal('0.2'),
                    lowerValue: new Decimal('3.0'),
                    upperValue: new Decimal('4.0'),
                })
            );
            expect(stat.percentile_100).toEqual(
                new ProbBin({
                    prob: new Decimal('0.1'),
                    lowerValue: new Decimal('4.0'),
                    upperValue: new Decimal('5.0'),
                })
            );
        });

        test('init with uniform ', () => {
            const stat = new Stat(normalLikeBins2);
            expect(stat.expectedValue).toEqual(
                new Decimal('3.5000000000000000001')
            );
            expect(stat.mean).toEqual(new Decimal('3.5000000000000000001'));
            expect(stat.median).toEqual(
                new ProbBin({
                    prob: new Decimal('0.16666666666666666667'),
                    lowerValue: new Decimal('3'),
                    upperValue: new Decimal('4'),
                })
            );
            expect(stat.mode).toEqual(
                new ProbBin({
                    prob: new Decimal('0.16666666666666666667'),
                    lowerValue: new Decimal('6'),
                    upperValue: new Decimal('7'),
                })
            );
            expect(stat.variance).toEqual(new Decimal('2.9166666666666666669'));
            expect(stat.sd).toEqual(new Decimal('1.7078251276599330639'));
        });
    });
});
