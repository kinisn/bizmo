import erf from 'bizmo/core/util/ERF';
import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { Stat } from '../Stat';
import { CDF, CDFObjectProps } from './CDF';

/**
 * 正規分布CDF
 *
 * https://ja.wikipedia.org/wiki/%E6%AD%A3%E8%A6%8F%E5%88%86%E5%B8%83
 */
export class NormalDistribution extends CDF {
    ERROR: Decimal = new Decimal('0.00000000001');
    /**
     * 上限・下限の限界を示す標準偏差
     */
    LIMIT_SIGMA: Decimal = new Decimal(10);

    private __sdDict: Map<string, Decimal>;
    private __mean: Decimal;
    private __sd: Decimal;

    /**
     * 確率分布との関係
     *  ±1σ: 68.2689492 %
     *  ±2σ: 95.4499736 %
     *  ±3σ: 99.7300204 %
     *
     * @param {Decimal} mean 平均 正規分布の場合は mode と同じ
     * @param {Decimal} sd 標準偏差 standard deviation
     */
    constructor(mean: Decimal, sd: Decimal) {
        super();

        this.__sdDict = new Map<string, Decimal>();
        this.__mean = mean; // dummy
        this.__sd = sd; // dummy

        this.__setMean(mean, false);
        this.__setSD(sd, false);
    }

    /**
     *
     */
    get mean(): Decimal {
        return this.__mean;
    }

    /**
     * 平均（=最頻値）を設定する
     * 【注意】外側の確率が設定されている場合には、強制的に mean は強制的に上下限の中央になる
     * @param {Decimal} mean
     */
    set mean(mean: Decimal) {
        this.__setMean(mean, true);
    }

    /**
     *
     * @param {Decimal} mean
     * @param {boolean} triggerEventFlag
     */
    private __setMean(mean: Decimal, triggerEventFlag: boolean): void {
        this.__mean = mean;
        if (triggerEventFlag) {
            this.triggerEvent(
                CDF.EVENT_PROPS_UPDATED,
                new Map<string, any>([
                    ['original', this],
                    ['prop', 'mean'],
                    ['param', mean],
                ])
            );
        }
    }

    /**
     * @return {Decimal}
     */
    get sd(): Decimal {
        return this.__sd;
    }

    /**
     * @param {Decimal} sd
     */
    set sd(sd: Decimal) {
        this.__setSD(sd, true);
    }

    /**
     *
     * @param {Decimal} sd
     * @param {boolean} triggerEventFlag
     */
    private __setSD(sd: Decimal, triggerEventFlag: boolean): void {
        this.__sd = sd;
        if (triggerEventFlag) {
            this.triggerEvent(
                CDF.EVENT_PROPS_UPDATED,
                new Map<string, any>([
                    ['original', this],
                    ['prop', 'sd'],
                    ['param', sd],
                ])
            );
        }
    }

    /**
     * CDF の本体
     * @param {Decimal} x
     * @param {Decimal} sd
     * @param {Decimal} mean
     * @return {Decimal}
     */
    private __primitiveCDF(x: Decimal, sd: Decimal, mean: Decimal): Decimal {
        const target = x.minus(mean).div(sd.pow(2).mul(2).sqrt()).toNumber();
        return new Decimal('0.5').mul(new Decimal(1 + erf(target)));
    }

    /**
     *
     * @param x
     * @param unit
     * @param lowerLimit
     * @param upperLimit
     * @returns
     */
    cdf(
        x: Decimal,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Decimal {
        return this.__primitiveCDF(x, this.sd, this.mean);
    }

    /**
     * orderedBinsの範囲を80%とするように、CDF設定も含めて調整してから、ordered_bins を更新する
     * @param {Decimal} prob
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @return {string}
     */
    private __keyOfEdgeCondition(
        prob: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): string {
        return `${prob}:${lowerLimit}:${upperLimit}`;
    }

    /**
     *
     * @param { ProbBin[]} orderedBins
     * @returns {Stat}
     */
    protected override _setStatForUpdateProb(orderedBins: ProbBin[]): Stat {
        return new Stat(orderedBins, {
            expectedValue: this.mean,
            variance: this.sd,
        });
    }

    protected override _updateProbAs80PctClosure(
        orderedBins: ProbBin[],
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        // mean は上下限の中央
        this.__mean = upperLimit.plus(lowerLimit).div(2);

        // 両端の外側確率から自動的に sd を決定
        const outOfEdgeProb = new Decimal('0.1'); // 両端それぞれ 10%
        const key = this.__keyOfEdgeCondition(
            outOfEdgeProb,
            lowerLimit,
            upperLimit
        );
        if (!this.__sdDict.has(key)) {
            let candidate: Decimal | undefined = undefined;
            const count = 100000;
            const step = upperLimit
                .minus(lowerLimit)
                .div(new Decimal(count).div(this.LIMIT_SIGMA));
            let bestLoss: Decimal | undefined = undefined;
            for (let i = 1; i < count; i++) {
                const newSD = step.mul(i);
                const prob = this.__primitiveCDF(lowerLimit, newSD, this.mean);
                const loss = outOfEdgeProb.minus(prob);
                if (loss.lessThan(this.ERROR)) {
                    candidate = newSD;
                    break;
                } else if (
                    bestLoss == undefined ||
                    bestLoss.greaterThan(loss)
                ) {
                    bestLoss = loss;
                    candidate = newSD;
                }
            }
            this.__sdDict.set(key, candidate!); // 上記で必ず何かしらの newSD が設定されるから
        }
        this.__sd = this.__sdDict.get(key)!; // 必ず何かのSDが設定されているから

        // 更新
        this.updateProb(orderedBins, unit, lowerLimit, upperLimit);

        return this._setStatForUpdateProb(orderedBins);
    }

    // ==  serialize ==

    /**
     * [overwrite対象]
     * @returns
     */
    override toObject(): CDFObjectProps & {
        mean: string;
        sd: string;
    } {
        return {
            ...super.toObject(),
            mean: this.mean.toString(),
            sd: this.sd.toString(),
        };
    }

    static deserialize(serialized: string): NormalDistribution {
        const obj: ReturnType<NormalDistribution['toObject']> =
            JSON.parse(serialized);
        return new NormalDistribution(
            new Decimal(obj.mean),
            new Decimal(obj.sd)
        );
    }
}
