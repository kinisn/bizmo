import Decimal from 'decimal.js';
import { ProbBin } from './ProbBin';
import { FixedWidthBinResult, ProbHyperParam } from './ProbHyperParam';
import { CustomDistribution } from './cdf/CustomDistribution';
import { NormalDistribution } from './cdf/NormalDistribution';
import { TriangleDistribution } from './cdf/TriangleDistribution';
import { UniformDistribution } from './cdf/UniformDistribution';

type CDFParams = {
    unit: Decimal;
    lowerLimit: Decimal;
    upperLimit: Decimal;
};

describe('ProbHyperParam のテスト', () => {
    let probInput1: ProbHyperParam;
    let probInput2: ProbHyperParam;
    let probInput3: ProbHyperParam;
    let probInput4: ProbHyperParam;

    beforeEach(() => {
        probInput1 = new ProbHyperParam();
        probInput2 = new ProbHyperParam({
            unit: new Decimal('0.1'),
            lowerLimit: new Decimal('-1.0'),
            upperLimit: new Decimal('1.0'),
        });

        // for u
        probInput3 = new ProbHyperParam();
        probInput4 = new ProbHyperParam({
            unit: new Decimal('0.1'),
            lowerLimit: new Decimal('-1.0'),
            upperLimit: new Decimal('1.0'),
        });
    });

    describe('初期化', () => {
        test('with default', () => {
            expect(probInput1.unit).toEqual(new Decimal(1));
            expect(probInput1.lowerLimit).toEqual(new Decimal(0));
            expect(probInput1.upperLimit).toEqual(new Decimal(1));
            expect(probInput1.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('1.0'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                }),
            ]);
            expect(probInput1.meanValue).toEqual(new Decimal('0.5'));
            expect(probInput1.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('1'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                })
            );
            expect(probInput1.selectedValue).toBeUndefined();
        });

        test('with default with zero', () => {
            probInput3.updateProbAs80PctClosure();
            expect(probInput3.unit).toEqual(new Decimal(1));
            expect(probInput3.lowerLimit).toEqual(new Decimal(0));
            expect(probInput3.upperLimit).toEqual(new Decimal(1));
            expect(probInput3.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('1'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                }),
            ]);
            expect(probInput3.meanValue).toEqual(new Decimal('0.5'));
            expect(probInput3.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('1'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                })
            );
            expect(probInput3.selectedValue).toBeUndefined();
        });

        test('with param', () => {
            expect(probInput2.unit).toEqual(new Decimal('0.1'));
            expect(probInput2.lowerLimit).toEqual(new Decimal('-1.0'));
            expect(probInput2.upperLimit).toEqual(new Decimal('1.0'));

            expect(probInput2.selectedValue).toBeUndefined();
            expect(probInput2.meanValue).toEqual(new Decimal(0));
            expect(probInput2.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                })
            );

            expect(probInput2.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-1.0'),
                    upperValue: new Decimal('-0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.9'),
                    upperValue: new Decimal('-0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.8'),
                    upperValue: new Decimal('-0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.7'),
                    upperValue: new Decimal('-0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.6'),
                    upperValue: new Decimal('-0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.5'),
                    upperValue: new Decimal('-0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.4'),
                    upperValue: new Decimal('-0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.3'),
                    upperValue: new Decimal('-0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.2'),
                    upperValue: new Decimal('-0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.1'),
                    upperValue: new Decimal('0.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.1'),
                    upperValue: new Decimal('0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.2'),
                    upperValue: new Decimal('0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.3'),
                    upperValue: new Decimal('0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.4'),
                    upperValue: new Decimal('0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.5'),
                    upperValue: new Decimal('0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.6'),
                    upperValue: new Decimal('0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.7'),
                    upperValue: new Decimal('0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.8'),
                    upperValue: new Decimal('0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                }),
            ]);
        });

        test('with param with zero', () => {
            probInput4.updateProbAs80PctClosure();
            expect(probInput4.unit).toEqual(new Decimal('0.1'));
            expect(probInput4.lowerLimit).toEqual(new Decimal('-1.0'));
            expect(probInput4.upperLimit).toEqual(new Decimal('1.0'));

            expect(probInput4.selectedValue).toBeUndefined();
            expect(probInput4.meanValue).toEqual(new Decimal('0'));
            expect(probInput4.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                })
            );

            expect(probInput4.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-1.0'),
                    upperValue: new Decimal('-0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.9'),
                    upperValue: new Decimal('-0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.8'),
                    upperValue: new Decimal('-0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.7'),
                    upperValue: new Decimal('-0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.6'),
                    upperValue: new Decimal('-0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.5'),
                    upperValue: new Decimal('-0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.4'),
                    upperValue: new Decimal('-0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.3'),
                    upperValue: new Decimal('-0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.2'),
                    upperValue: new Decimal('-0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.1'),
                    upperValue: new Decimal('0.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.1'),
                    upperValue: new Decimal('0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.2'),
                    upperValue: new Decimal('0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.3'),
                    upperValue: new Decimal('0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.4'),
                    upperValue: new Decimal('0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.5'),
                    upperValue: new Decimal('0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.6'),
                    upperValue: new Decimal('0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.7'),
                    upperValue: new Decimal('0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.8'),
                    upperValue: new Decimal('0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                }),
            ]);
        });
    });

    describe('change', () => {
        describe('unit', () => {
            test('割り切れる場合', () => {
                probInput2.unit = new Decimal('0.5');
                expect(probInput2.unit).toEqual(new Decimal('0.5'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.25'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.25'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('0.0'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.25'),
                        lowerValue: new Decimal('0.0'),
                        upperValue: new Decimal('0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.25'),
                        lowerValue: new Decimal('0.5'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });

            test('割り切れない場合: 最終unitの範囲が縮小される', () => {
                probInput2.unit = new Decimal('0.6');
                expect(probInput2.unit).toEqual(new Decimal('0.6'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.3'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.3'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.3'),
                        lowerValue: new Decimal('0.2'),
                        upperValue: new Decimal('0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.8'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });
        });

        describe('lowerLimit', () => {
            test('upper を超える場合: 変更されない', () => {
                probInput2.lowerLimit = new Decimal('1.1');
                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.lowerLimit).toEqual(new Decimal('-1.0'));
                expect(probInput2.upperLimit).toEqual(new Decimal('1.0'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.9'),
                        upperValue: new Decimal('-0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.8'),
                        upperValue: new Decimal('-0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.7'),
                        upperValue: new Decimal('-0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.6'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('-0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.3'),
                        upperValue: new Decimal('-0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.2'),
                        upperValue: new Decimal('-0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.1'),
                        upperValue: new Decimal('0.0'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.0'),
                        upperValue: new Decimal('0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.1'),
                        upperValue: new Decimal('0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.2'),
                        upperValue: new Decimal('0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.3'),
                        upperValue: new Decimal('0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.4'),
                        upperValue: new Decimal('0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.5'),
                        upperValue: new Decimal('0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.6'),
                        upperValue: new Decimal('0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.7'),
                        upperValue: new Decimal('0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.8'),
                        upperValue: new Decimal('0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.9'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });

            test('upper と同じ: 適用されるがBinなし', () => {
                probInput2.lowerLimit = new Decimal(1);
                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.lowerLimit).toEqual(new Decimal('1.0'));
                expect(probInput2.upperLimit).toEqual(new Decimal('1.0'));
                expect(probInput2.orderedBins).toEqual([]);
            });

            test('unitで割り切れる場合', () => {
                probInput2.lowerLimit = new Decimal(0);
                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.0'),
                        upperValue: new Decimal('0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.1'),
                        upperValue: new Decimal('0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.2'),
                        upperValue: new Decimal('0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.3'),
                        upperValue: new Decimal('0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.4'),
                        upperValue: new Decimal('0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.5'),
                        upperValue: new Decimal('0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.6'),
                        upperValue: new Decimal('0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.7'),
                        upperValue: new Decimal('0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.8'),
                        upperValue: new Decimal('0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('0.9'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });

            test('unitで割り切れない場合', () => {
                probInput2.lowerLimit = new Decimal('0.01');
                expect(probInput2.unit).toEqual(new Decimal('0.1'));

                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.01'),
                        upperValue: new Decimal('0.11'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.11'),
                        upperValue: new Decimal('0.21'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.21'),
                        upperValue: new Decimal('0.31'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.31'),
                        upperValue: new Decimal('0.41'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.10101010101010101011'),
                        lowerValue: new Decimal('0.41'),
                        upperValue: new Decimal('0.51'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.51'),
                        upperValue: new Decimal('0.61'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.61'),
                        upperValue: new Decimal('0.71'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.71'),
                        upperValue: new Decimal('0.81'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('0.81'),
                        upperValue: new Decimal('0.91'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.09090909090909090909'),
                        lowerValue: new Decimal('0.91'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });
        });

        describe('upperLimit', () => {
            test('lower を超える場合: 変更されない', () => {
                probInput2.upperLimit = new Decimal('-1.1');

                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.lowerLimit).toEqual(new Decimal('-1.0'));
                expect(probInput2.upperLimit).toEqual(new Decimal('1.0'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.9'),
                        upperValue: new Decimal('-0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.8'),
                        upperValue: new Decimal('-0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.7'),
                        upperValue: new Decimal('-0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.6'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('-0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.3'),
                        upperValue: new Decimal('-0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.2'),
                        upperValue: new Decimal('-0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('-0.1'),
                        upperValue: new Decimal('0.0'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.0'),
                        upperValue: new Decimal('0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.1'),
                        upperValue: new Decimal('0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.2'),
                        upperValue: new Decimal('0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.3'),
                        upperValue: new Decimal('0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.4'),
                        upperValue: new Decimal('0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.5'),
                        upperValue: new Decimal('0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.6'),
                        upperValue: new Decimal('0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.7'),
                        upperValue: new Decimal('0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.8'),
                        upperValue: new Decimal('0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.05'),
                        lowerValue: new Decimal('0.9'),
                        upperValue: new Decimal('1.0'),
                    }),
                ]);
            });

            test('lower と同じ: 適用されるが Binなし', () => {
                probInput2.upperLimit = new Decimal('-1.0');
                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.lowerLimit).toEqual(new Decimal('-1.0'));
                expect(probInput2.upperLimit).toEqual(new Decimal('-1.0'));

                expect(probInput2.orderedBins).toEqual([]);
            });

            test('unitで割り切れる場合', () => {
                probInput2.upperLimit = new Decimal(0);
                expect(probInput2.unit).toEqual(new Decimal('0.1'));
                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.9'),
                        upperValue: new Decimal('-0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.8'),
                        upperValue: new Decimal('-0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.7'),
                        upperValue: new Decimal('-0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.6'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('-0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.3'),
                        upperValue: new Decimal('-0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.2'),
                        upperValue: new Decimal('-0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1'),
                        lowerValue: new Decimal('-0.1'),
                        upperValue: new Decimal('0.0'),
                    }),
                ]);
            });

            test('unitで割り切れない場合', () => {
                probInput2.upperLimit = new Decimal('-0.01');
                expect(probInput2.unit).toEqual(new Decimal('0.1'));

                expect(probInput2.orderedBins).toEqual([
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.9'),
                        upperValue: new Decimal('-0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.8'),
                        upperValue: new Decimal('-0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.7'),
                        upperValue: new Decimal('-0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.10101010101010101011'),
                        lowerValue: new Decimal('-0.6'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('-0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.3'),
                        upperValue: new Decimal('-0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.1010101010101010101'),
                        lowerValue: new Decimal('-0.2'),
                        upperValue: new Decimal('-0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.09090909090909090909'),
                        lowerValue: new Decimal('-0.1'),
                        upperValue: new Decimal('-0.01'),
                    }),
                ]);
            });
        });

        describe('CDF', () => {
            test('triangle', () => {
                probInput2.cdf = new TriangleDistribution(new Decimal(0));

                const expected = [
                    new ProbBin({
                        prob: new Decimal('0.005'),
                        lowerValue: new Decimal('-1.0'),
                        upperValue: new Decimal('-0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.015'),
                        lowerValue: new Decimal('-0.9'),
                        upperValue: new Decimal('-0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.025'),
                        lowerValue: new Decimal('-0.8'),
                        upperValue: new Decimal('-0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.035'),
                        lowerValue: new Decimal('-0.7'),
                        upperValue: new Decimal('-0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.045'),
                        lowerValue: new Decimal('-0.6'),
                        upperValue: new Decimal('-0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.055'),
                        lowerValue: new Decimal('-0.5'),
                        upperValue: new Decimal('-0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.065'),
                        lowerValue: new Decimal('-0.4'),
                        upperValue: new Decimal('-0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.075'),
                        lowerValue: new Decimal('-0.3'),
                        upperValue: new Decimal('-0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.085'),
                        lowerValue: new Decimal('-0.2'),
                        upperValue: new Decimal('-0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.095'),
                        lowerValue: new Decimal('-0.1'),
                        upperValue: new Decimal('0.0'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.095'),
                        lowerValue: new Decimal('0.0'),
                        upperValue: new Decimal('0.1'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.085'),
                        lowerValue: new Decimal('0.1'),
                        upperValue: new Decimal('0.2'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.075'),
                        lowerValue: new Decimal('0.2'),
                        upperValue: new Decimal('0.3'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.065'),
                        lowerValue: new Decimal('0.3'),
                        upperValue: new Decimal('0.4'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.055'),
                        lowerValue: new Decimal('0.4'),
                        upperValue: new Decimal('0.5'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.045'),
                        lowerValue: new Decimal('0.5'),
                        upperValue: new Decimal('0.6'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.035'),
                        lowerValue: new Decimal('0.6'),
                        upperValue: new Decimal('0.7'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.025'),
                        lowerValue: new Decimal('0.7'),
                        upperValue: new Decimal('0.8'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.015'),
                        lowerValue: new Decimal('0.8'),
                        upperValue: new Decimal('0.9'),
                    }),
                    new ProbBin({
                        prob: new Decimal('0.005'),
                        lowerValue: new Decimal('0.9'),
                        upperValue: new Decimal('1.0'),
                    }),
                ];
                expect(probInput2.orderedBins).toEqual(expected);

                let result = new Decimal(0);
                expected.forEach((v) => (result = result.plus(v.prob)));
                expect(result).toEqual(new Decimal(1));
            });

            describe('normal', () => {
                test('updateProbAs80PctClosure', () => {
                    probInput2.cdf = new NormalDistribution(
                        new Decimal(0),
                        new Decimal(1)
                    );
                    probInput2.updateProbAs80PctClosure();
                    expect((probInput2.cdf as NormalDistribution).sd).toEqual(
                        new Decimal('0.7804')
                    );
                    expect((probInput2.cdf as NormalDistribution).mean).toEqual(
                        new Decimal('0')
                    );

                    const expected = [
                        new ProbBin({
                            prob: new Decimal('0.024375281336253165'),
                            lowerValue: new Decimal('-1.0'),
                            upperValue: new Decimal('-0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.028251429276839335'),
                            lowerValue: new Decimal('-0.9'),
                            upperValue: new Decimal('-0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0322114486270359'),
                            lowerValue: new Decimal('-0.8'),
                            upperValue: new Decimal('-0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.03612926937840065'),
                            lowerValue: new Decimal('-0.7'),
                            upperValue: new Decimal('-0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.03986457118320665'),
                            lowerValue: new Decimal('-0.6'),
                            upperValue: new Decimal('-0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0432706831700222'),
                            lowerValue: new Decimal('-0.5'),
                            upperValue: new Decimal('-0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0462039151868979'),
                            lowerValue: new Decimal('-0.4'),
                            upperValue: new Decimal('-0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0485335339552272'),
                            lowerValue: new Decimal('-0.3'),
                            upperValue: new Decimal('-0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0501514573062539'),
                            lowerValue: new Decimal('-0.2'),
                            upperValue: new Decimal('-0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0509807147286481'),
                            lowerValue: new Decimal('-0.1'),
                            upperValue: new Decimal('0.0'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.050980713728648'),
                            lowerValue: new Decimal('0.0'),
                            upperValue: new Decimal('0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.05015145730625405'),
                            lowerValue: new Decimal('0.1'),
                            upperValue: new Decimal('0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0485335339552271'),
                            lowerValue: new Decimal('0.2'),
                            upperValue: new Decimal('0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.04620391518689805'),
                            lowerValue: new Decimal('0.3'),
                            upperValue: new Decimal('0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0432706831700221'),
                            lowerValue: new Decimal('0.4'),
                            upperValue: new Decimal('0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0398645711832067'),
                            lowerValue: new Decimal('0.5'),
                            upperValue: new Decimal('0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0361292693784006'),
                            lowerValue: new Decimal('0.6'),
                            upperValue: new Decimal('0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.03221144862703595'),
                            lowerValue: new Decimal('0.7'),
                            upperValue: new Decimal('0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.02825142927683925'),
                            lowerValue: new Decimal('0.8'),
                            upperValue: new Decimal('0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.0243752813362532'),
                            lowerValue: new Decimal('0.9'),
                            upperValue: new Decimal('1.0'),
                        }),
                    ];
                    expect(probInput2.orderedBins).toEqual(expected);

                    expect(probInput2.modeProbBin).toEqual(
                        new ProbBin({
                            prob: new Decimal('0.0509807147286481'),
                            lowerValue: new Decimal('-0.1'),
                            upperValue: new Decimal('0.0'),
                        })
                    );
                });
            });

            describe('custom', () => {
                test('custom on init', () => {
                    const customSetting = [
                        new Decimal('1'),
                        new Decimal('2'),
                        new Decimal('3'),
                        new Decimal('4'),
                        new Decimal('5'),
                        new Decimal('6'),
                        new Decimal('7'),
                        new Decimal('8'),
                        new Decimal('9'),
                        new Decimal('55'),
                    ];
                    probInput2.cdf = new CustomDistribution(customSetting);
                    const expected = [
                        new ProbBin({
                            prob: new Decimal('0.01'),
                            lowerValue: new Decimal('-1.0'),
                            upperValue: new Decimal('-0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.02'),
                            lowerValue: new Decimal('-0.9'),
                            upperValue: new Decimal('-0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.03'),
                            lowerValue: new Decimal('-0.8'),
                            upperValue: new Decimal('-0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.04'),
                            lowerValue: new Decimal('-0.7'),
                            upperValue: new Decimal('-0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.05'),
                            lowerValue: new Decimal('-0.6'),
                            upperValue: new Decimal('-0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.06'),
                            lowerValue: new Decimal('-0.5'),
                            upperValue: new Decimal('-0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.07'),
                            lowerValue: new Decimal('-0.4'),
                            upperValue: new Decimal('-0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.08'),
                            lowerValue: new Decimal('-0.3'),
                            upperValue: new Decimal('-0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.09'),
                            lowerValue: new Decimal('-0.2'),
                            upperValue: new Decimal('-0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.55'),
                            lowerValue: new Decimal('-0.1'),
                            upperValue: new Decimal('0.0'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.0'),
                            upperValue: new Decimal('0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.1'),
                            upperValue: new Decimal('0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.2'),
                            upperValue: new Decimal('0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.3'),
                            upperValue: new Decimal('0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.4'),
                            upperValue: new Decimal('0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.5'),
                            upperValue: new Decimal('0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.6'),
                            upperValue: new Decimal('0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.7'),
                            upperValue: new Decimal('0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.8'),
                            upperValue: new Decimal('0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.9'),
                            upperValue: new Decimal('1.0'),
                        }),
                    ];
                    expect(probInput2.orderedBins).toEqual(expected);
                });

                test('custom on set', () => {
                    const customSetting = [
                        new Decimal('1'),
                        new Decimal('2'),
                        new Decimal('3'),
                        new Decimal('4'),
                        new Decimal('5'),
                        new Decimal('6'),
                        new Decimal('7'),
                        new Decimal('8'),
                        new Decimal('9'),
                        new Decimal('55'),
                    ];
                    const customSetting2 = [
                        new Decimal('1'),
                        new Decimal('2'),
                        new Decimal('3'),
                        new Decimal('4'),
                        new Decimal('5'),
                        new Decimal('6'),
                        new Decimal('7'),
                        new Decimal('8'),
                        new Decimal('9'),
                        new Decimal('10'),
                        new Decimal('45'),
                    ];
                    probInput2.cdf = new CustomDistribution(customSetting);
                    // 更新テスト
                    (probInput2.cdf as CustomDistribution).customProbs =
                        customSetting2;
                    const expected = [
                        new ProbBin({
                            prob: new Decimal('0.01'),
                            lowerValue: new Decimal('-1.0'),
                            upperValue: new Decimal('-0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.02'),
                            lowerValue: new Decimal('-0.9'),
                            upperValue: new Decimal('-0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.03'),
                            lowerValue: new Decimal('-0.8'),
                            upperValue: new Decimal('-0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.04'),
                            lowerValue: new Decimal('-0.7'),
                            upperValue: new Decimal('-0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.05'),
                            lowerValue: new Decimal('-0.6'),
                            upperValue: new Decimal('-0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.06'),
                            lowerValue: new Decimal('-0.5'),
                            upperValue: new Decimal('-0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.07'),
                            lowerValue: new Decimal('-0.4'),
                            upperValue: new Decimal('-0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.08'),
                            lowerValue: new Decimal('-0.3'),
                            upperValue: new Decimal('-0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.09'),
                            lowerValue: new Decimal('-0.2'),
                            upperValue: new Decimal('-0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.1'),
                            lowerValue: new Decimal('-0.1'),
                            upperValue: new Decimal('0.0'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0.45'),
                            lowerValue: new Decimal('0.0'),
                            upperValue: new Decimal('0.1'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.1'),
                            upperValue: new Decimal('0.2'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.2'),
                            upperValue: new Decimal('0.3'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.3'),
                            upperValue: new Decimal('0.4'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.4'),
                            upperValue: new Decimal('0.5'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.5'),
                            upperValue: new Decimal('0.6'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.6'),
                            upperValue: new Decimal('0.7'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.7'),
                            upperValue: new Decimal('0.8'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.8'),
                            upperValue: new Decimal('0.9'),
                        }),
                        new ProbBin({
                            prob: new Decimal('0'),
                            lowerValue: new Decimal('0.9'),
                            upperValue: new Decimal('1.0'),
                        }),
                    ];
                    expect(probInput2.orderedBins).toEqual(expected);
                });
            });
        });
    });

    test('selected and value(Error時には再実行)', () => {
        probInput4.cdf = new TriangleDistribution(new Decimal(0));

        const expected = [
            new ProbBin({
                prob: new Decimal('0.005'),
                lowerValue: new Decimal('-1.0'),
                upperValue: new Decimal('-0.9'),
            }),
            new ProbBin({
                prob: new Decimal('0.015'),
                lowerValue: new Decimal('-0.9'),
                upperValue: new Decimal('-0.8'),
            }),
            new ProbBin({
                prob: new Decimal('0.025'),
                lowerValue: new Decimal('-0.8'),
                upperValue: new Decimal('-0.7'),
            }),
            new ProbBin({
                prob: new Decimal('0.035'),
                lowerValue: new Decimal('-0.7'),
                upperValue: new Decimal('-0.6'),
            }),
            new ProbBin({
                prob: new Decimal('0.045'),
                lowerValue: new Decimal('-0.6'),
                upperValue: new Decimal('-0.5'),
            }),
            new ProbBin({
                prob: new Decimal('0.055'),
                lowerValue: new Decimal('-0.5'),
                upperValue: new Decimal('-0.4'),
            }),
            new ProbBin({
                prob: new Decimal('0.065'),
                lowerValue: new Decimal('-0.4'),
                upperValue: new Decimal('-0.3'),
            }),
            new ProbBin({
                prob: new Decimal('0.075'),
                lowerValue: new Decimal('-0.3'),
                upperValue: new Decimal('-0.2'),
            }),
            new ProbBin({
                prob: new Decimal('0.085'),
                lowerValue: new Decimal('-0.2'),
                upperValue: new Decimal('-0.1'),
            }),
            new ProbBin({
                prob: new Decimal('0.095'),
                lowerValue: new Decimal('-0.1'),
                upperValue: new Decimal('0.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.095'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('0.1'),
            }),
            new ProbBin({
                prob: new Decimal('0.085'),
                lowerValue: new Decimal('0.1'),
                upperValue: new Decimal('0.2'),
            }),
            new ProbBin({
                prob: new Decimal('0.075'),
                lowerValue: new Decimal('0.2'),
                upperValue: new Decimal('0.3'),
            }),
            new ProbBin({
                prob: new Decimal('0.065'),
                lowerValue: new Decimal('0.3'),
                upperValue: new Decimal('0.4'),
            }),
            new ProbBin({
                prob: new Decimal('0.055'),
                lowerValue: new Decimal('0.4'),
                upperValue: new Decimal('0.5'),
            }),
            new ProbBin({
                prob: new Decimal('0.045'),
                lowerValue: new Decimal('0.5'),
                upperValue: new Decimal('0.6'),
            }),
            new ProbBin({
                prob: new Decimal('0.035'),
                lowerValue: new Decimal('0.6'),
                upperValue: new Decimal('0.7'),
            }),
            new ProbBin({
                prob: new Decimal('0.025'),
                lowerValue: new Decimal('0.7'),
                upperValue: new Decimal('0.8'),
            }),
            new ProbBin({
                prob: new Decimal('0.015'),
                lowerValue: new Decimal('0.8'),
                upperValue: new Decimal('0.9'),
            }),
            new ProbBin({
                prob: new Decimal('0.005'),
                lowerValue: new Decimal('0.9'),
                upperValue: new Decimal('1.0'),
            }),
        ];
        expect(probInput4.orderedBins).toEqual(expected);
        let result = new Decimal(0);
        expected.forEach((v) => {
            result = result.plus(v.prob);
        });
        expect(result).toEqual(new Decimal(1));

        // 分布を確認
        const data: Map<string, number> = new Map();
        const count = 100000;
        for (let x = 0; x < count; x++) {
            probInput4.select();
            if (data.has(probInput4.selectedValue!.toString())) {
                data.set(
                    probInput4.selectedValue!.toString(),
                    data.get(probInput4.selectedValue!.toString())! + 1
                );
            } else {
                data.set(probInput4.selectedValue!.toString(), 1);
            }
        }

        const error = new Decimal('0.15');
        for (const prob of expected) {
            const value = data.get(prob.value.toString())! / count;
            expect(value).toBeGreaterThan(
                prob.prob.mul(new Decimal(1).minus(error)).toNumber()
            );
            expect(value).toBeLessThan(
                prob.prob.mul(new Decimal(1).plus(error)).toNumber()
            );
        }
    });

    describe('setFixedWidthBin', () => {
        test('Max内で割り切れる間隔数ならUnitが変更', () => {
            expect(
                probInput1.setFixedWidthBin(new Decimal(10), new Decimal(10))
            ).toBe(FixedWidthBinResult.SUCCESS);
            expect(probInput1.orderedBins.length).toBe(10);
            expect(probInput1.unit).toEqual(new Decimal('0.1'));

            expect(probInput1.setFixedWidthBin(new Decimal(100))).toBe(
                FixedWidthBinResult.SUCCESS
            );
            expect(probInput1.orderedBins.length).toBe(100);
            expect(probInput1.unit).toEqual(new Decimal('0.01'));
        });
        test('Max内でも割り切れない間隔数なら変更されず専用Error', () => {
            probInput1.setFixedWidthBin(new Decimal(3));
            expect(probInput1.setFixedWidthBin(new Decimal(3))).toBe(
                FixedWidthBinResult.ERR_INDIVISIBLE
            );
            // orderedBin length is not changed
            expect(probInput1.orderedBins.length).toBe(1);
        });
        test('Max外なら専用Error', () => {
            expect(
                probInput1.setFixedWidthBin(new Decimal(10), new Decimal(1))
            ).toBe(FixedWidthBinResult.ERR_EXCEED_MAX);
            // orderedBin length is not changed
            expect(probInput1.orderedBins.length).toBe(1);
        });

        test('自然数外なら専用Error', () => {
            expect(probInput1.setFixedWidthBin(new Decimal(0))).toBe(
                FixedWidthBinResult.ERR_NOT_NATURAL_NUMBER
            );
            expect(probInput1.setFixedWidthBin(new Decimal('0.1'))).toBe(
                FixedWidthBinResult.ERR_NOT_NATURAL_NUMBER
            );
            expect(probInput1.setFixedWidthBin(new Decimal(-1))).toBe(
                FixedWidthBinResult.ERR_NOT_NATURAL_NUMBER
            );
            // orderedBin length is not changed
            expect(probInput1.orderedBins.length).toBe(1);
        });
    });

    describe('serialize & fromSerialized', () => {
        test('without param', () => {
            const json = probInput1.serialize();
            const hyper = ProbHyperParam.fromSerialized(json);

            expect(hyper.unit).toEqual(new Decimal(1));
            expect(hyper.lowerLimit).toEqual(new Decimal(0));
            expect(hyper.upperLimit).toEqual(new Decimal(1));
            expect(hyper.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('1.0'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                }),
            ]);
            expect(hyper.meanValue).toEqual(new Decimal('0.5'));
            expect(hyper.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('1'),
                    lowerValue: new Decimal('0'),
                    upperValue: new Decimal('1'),
                })
            );
            expect(hyper.selectedValue).toBeUndefined();
            expect(hyper.cdf instanceof UniformDistribution).toBeTruthy();
        });

        test('with param', () => {
            const json = probInput2.serialize();
            const hyper = ProbHyperParam.fromSerialized(json);

            expect(hyper.unit).toEqual(new Decimal('0.1'));
            expect(hyper.lowerLimit).toEqual(new Decimal('-1.0'));
            expect(hyper.upperLimit).toEqual(new Decimal('1.0'));

            expect(hyper.selectedValue).toBeUndefined();
            expect(hyper.meanValue).toEqual(new Decimal(0));
            expect(hyper.modeProbBin).toEqual(
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                })
            );

            expect(hyper.orderedBins).toEqual([
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-1.0'),
                    upperValue: new Decimal('-0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.9'),
                    upperValue: new Decimal('-0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.8'),
                    upperValue: new Decimal('-0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.7'),
                    upperValue: new Decimal('-0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.6'),
                    upperValue: new Decimal('-0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.5'),
                    upperValue: new Decimal('-0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.4'),
                    upperValue: new Decimal('-0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.3'),
                    upperValue: new Decimal('-0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.2'),
                    upperValue: new Decimal('-0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('-0.1'),
                    upperValue: new Decimal('0.0'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.0'),
                    upperValue: new Decimal('0.1'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.1'),
                    upperValue: new Decimal('0.2'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.2'),
                    upperValue: new Decimal('0.3'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.3'),
                    upperValue: new Decimal('0.4'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.4'),
                    upperValue: new Decimal('0.5'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.5'),
                    upperValue: new Decimal('0.6'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.6'),
                    upperValue: new Decimal('0.7'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.7'),
                    upperValue: new Decimal('0.8'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.8'),
                    upperValue: new Decimal('0.9'),
                }),
                new ProbBin({
                    prob: new Decimal('0.05'),
                    lowerValue: new Decimal('0.9'),
                    upperValue: new Decimal('1.0'),
                }),
            ]);

            expect(hyper.cdf instanceof UniformDistribution).toBeTruthy();
        });
    });
});
