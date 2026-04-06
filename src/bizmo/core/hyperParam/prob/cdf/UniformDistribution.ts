import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { Stat } from '../Stat';
import { CDF } from './CDF';

/**
 * 連続一様分布CDF
 *
 * https://ja.wikipedia.org/wiki/%E9%80%A3%E7%B6%9A%E4%B8%80%E6%A7%98%E5%88%86%E5%B8%83
 */
export class UniformDistribution extends CDF {
    constructor() {
        super();
        this._support80PctClosure = false;
    }

    /**
     *
     * @param {Decimal} x
     * @return {Decimal}
     */
    cdf(
        x: Decimal,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Decimal {
        let prob: Decimal;
        if (x.lessThanOrEqualTo(lowerLimit)) {
            prob = new Decimal(0);
        } else if (lowerLimit.lessThan(x) && x.lessThan(upperLimit)) {
            prob = x.minus(lowerLimit).div(upperLimit.minus(lowerLimit));
        } else {
            prob = new Decimal(1);
        }
        return prob;
    }

    /**
     *
     * @param orderedBins
     * @param unit
     * @param lowerLimit
     * @param upperLimit
     * @returns
     */
    protected override _setStatForUpdateProb(
        orderedBins: ProbBin[],
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        return new Stat(orderedBins, {
            expectedValue: upperLimit.plus(lowerLimit).div(new Decimal(2)),
        });
    }

    // ==  serialize ==
    static deserialize(serialized: string): UniformDistribution {
        return new UniformDistribution();
    }
}
