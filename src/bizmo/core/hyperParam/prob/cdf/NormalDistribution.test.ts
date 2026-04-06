import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { NormalDistribution } from './NormalDistribution';

type CDFParam = {
    unit: Decimal;
    lowerLimit: Decimal;
    upperLimit: Decimal;
};

describe('NormalDistribution のテスト', () => {
    let param1: CDFParam;
    let param1C: CDFParam;
    let orderedBins1: Array<ProbBin>;
    let orderedBins1C: Array<ProbBin>;

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
    });

    test('nomal 1', () => {
        const cdf = new NormalDistribution(new Decimal(5), new Decimal(1));
        cdf.updateProb(
            orderedBins1,
            param1.unit,
            param1.lowerLimit,
            param1.upperLimit
        );
        const expected = [
            new ProbBin({
                prob: new Decimal('0.00003139893105102986335'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.00131828124525046332'),
                lowerValue: new Decimal('1.0'),
                upperValue: new Decimal('2.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.02140009560594163825'),
                lowerValue: new Decimal('2.0'),
                upperValue: new Decimal('3.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.135905200945107275'),
                lowerValue: new Decimal('3.0'),
                upperValue: new Decimal('4.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.34134473666763633'),
                lowerValue: new Decimal('4.0'),
                upperValue: new Decimal('5.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.3413447356676363'),
                lowerValue: new Decimal('5.0'),
                upperValue: new Decimal('6.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.13590520094510735'),
                lowerValue: new Decimal('6.0'),
                upperValue: new Decimal('7.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.0214000956059416'),
                lowerValue: new Decimal('7.0'),
                upperValue: new Decimal('8.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.00131828124525045'),
                lowerValue: new Decimal('8.0'),
                upperValue: new Decimal('9.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.000031398931051'),
                lowerValue: new Decimal('9.0'),
                upperValue: new Decimal('10.0'),
            }),
        ];
        expect(orderedBins1).toEqual(expected);

        // 1 sigma
        let totalProb = new Decimal(0);
        orderedBins1.slice(4, 6).map((x) => {
            totalProb = totalProb.plus(x.prob);
        });
        expect(totalProb).toEqual(new Decimal('0.68268947233527263'));

        // 2 sigma
        totalProb = new Decimal(0);
        orderedBins1.slice(3, 7).map((x) => {
            totalProb = totalProb.plus(x.prob);
        });
        expect(totalProb).toEqual(new Decimal('0.954499874225487255'));

        // 3 sigma
        totalProb = new Decimal(0);
        orderedBins1.slice(2, 8).map((x) => {
            totalProb = totalProb.plus(x.prob);
        });
        expect(totalProb).toEqual(new Decimal('0.99730006543737049325'));
    });

    test('nomal c', () => {
        const cdf = new NormalDistribution(new Decimal(5), new Decimal(1));
        expect(cdf.mean).toEqual(new Decimal(5));
        expect(cdf.sd).toEqual(new Decimal(1));

        cdf.updateProbAs80PctClosure(
            orderedBins1C,
            param1C.unit,
            param1C.lowerLimit,
            param1C.upperLimit
        );
        expect(cdf.mean).toEqual(new Decimal(5000));
        expect(cdf.sd).toEqual(new Decimal(3902));

        let totalProb = new Decimal(0);
        orderedBins1C.map((x) => {
            totalProb = totalProb.plus(x.prob);
        });
        expect(totalProb).toEqual(new Decimal('0.79994460729757'));

        const expected = [
            new ProbBin({
                prob: new Decimal('0.0526267106130925'),
                lowerValue: new Decimal('0.0'),
                upperValue: new Decimal('1000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.06834071800543655'),
                lowerValue: new Decimal('1000.0'),
                upperValue: new Decimal('2000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.08313525435322885'),
                lowerValue: new Decimal('2000.0'),
                upperValue: new Decimal('3000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.0947374491421251'),
                lowerValue: new Decimal('3000.0'),
                upperValue: new Decimal('4000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.101132172034902'),
                lowerValue: new Decimal('4000.0'),
                upperValue: new Decimal('5000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.10113217103490205'),
                lowerValue: new Decimal('5000.0'),
                upperValue: new Decimal('6000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.09473744914212515'),
                lowerValue: new Decimal('6000.0'),
                upperValue: new Decimal('7000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.0831352543532288'),
                lowerValue: new Decimal('7000.0'),
                upperValue: new Decimal('8000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.06834071800543655'),
                lowerValue: new Decimal('8000.0'),
                upperValue: new Decimal('9000.0'),
            }),
            new ProbBin({
                prob: new Decimal('0.05262671061309245'),
                lowerValue: new Decimal('9000.0'),
                upperValue: new Decimal('10000.0'),
            }),
        ];
        expect(orderedBins1C).toEqual(expected);
    });

    describe('serialize', () => {
        test('serializeできる', () => {
            const cdf = new NormalDistribution(
                new Decimal('456'),
                new Decimal('123')
            );
            expect(cdf.serialize()).toEqual(
                '{"name":"NormalDistribution","mean":"456","sd":"123"}'
            );
        });

        test('deserializeできる', () => {
            const cdf = new NormalDistribution(
                new Decimal('456'),
                new Decimal('123')
            );
            const json = cdf.serialize();
            const cdf2 = NormalDistribution.deserialize(json);
            expect(cdf2 instanceof NormalDistribution).toBeTruthy();
            expect(cdf2.mean).toEqual(new Decimal('456'));
            expect(cdf2.sd).toEqual(new Decimal('123'));
        });
    });
});
