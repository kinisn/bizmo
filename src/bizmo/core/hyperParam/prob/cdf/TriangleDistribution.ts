import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { Stat } from '../Stat';
import { CDF, CDFObjectProps } from './CDF';

type Edges = {
    lowerEdge: Decimal;
    upperEdge: Decimal;
};

/**
 * 三角分布CDF
 *
 * https://ja.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%88%86%E5%B8%83
 */
export class TriangleDistribution extends CDF {
    static ERROR: Decimal = new Decimal('0.00000000001');

    private __mode: Decimal;
    private __edgeDict: Map<string, Edges>;

    /**
     *
     * @param {CDFParams} parentParam
     * @param {Decimal} mode 分布上、確率が最大となる値
     */
    constructor(mode: Decimal) {
        super();
        this.__mode = mode;
        this.__edgeDict = new Map<string, Edges>();
    }

    /**
     *
     * @param {Decimal} mode
     */
    get mode(): Decimal {
        return this.__mode;
    }

    /**
     * @param {Decimal} mode
     */
    set mode(mode: Decimal) {
        this.__mode = mode;
        this.triggerEvent(
            CDF.EVENT_PROPS_UPDATED,
            new Map<string, any>([
                ['original', this],
                ['prop', 'mode'],
                ['param', mode],
            ])
        );
    }

    /**
     * Edge生成条件からUniqueなKeyを生成する
     * @param {Decimal} prob
     * @param {Decimal} mode
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @return {string}
     */
    private keyOfEdgeCondition(
        prob: Decimal,
        mode: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): string {
        return `${prob.toString()}:${mode.toString()}:${lowerLimit.toString()}:${upperLimit.toString()}`;
    }

    /**
     * 上下両端より外側の edge を取得する
     * edge が計算されていない場合には、近似値を計算する
     *
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @param {Decimal} outOfEdgeProb
     * @param {number} splitStep 近似値を探査するステップの細かさ。Unitの分割数
     * @param {number} searchRange 近似値を探査する範囲。元になる上下限界値間のN倍
     * @return {Edges}
     */
    private getOutOfEdges(
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal,
        outOfEdgeProb: Decimal,
        splitStep: number = 1000,
        searchRange: number = 50
    ): Edges {
        const key = this.keyOfEdgeCondition(
            outOfEdgeProb,
            this.mode,
            lowerLimit,
            upperLimit
        );
        if (!this.__edgeDict.has(key)) {
            let candidate: Edges = {
                lowerEdge: new Decimal(0),
                upperEdge: new Decimal(0),
            };
            if (outOfEdgeProb.greaterThan(0)) {
                const step = unit.div(splitStep);
                let bestLoss: Decimal | undefined = undefined;

                const count = upperLimit
                    .minus(lowerLimit)
                    .mul(searchRange)
                    .div(step)
                    .floor()
                    .toNumber();
                for (let i = 1; i < count; i++) {
                    const y = upperLimit.plus(step.mul(i));
                    // y と同確率になる x の長さ
                    const temp = y
                        .minus(upperLimit)
                        .pow(2)
                        .div(y.minus(this.mode));
                    const x = lowerLimit
                        .mul(new Decimal(2))
                        .minus(temp)
                        .minus(
                            temp
                                .pow(2)
                                .plus(
                                    temp
                                        .mul(new Decimal(4))
                                        .mul(this.mode.minus(lowerLimit))
                                )
                                .sqrt()
                        )
                        .div(new Decimal(2));

                    const prob = this.primitiveCDF(upperLimit, x, y, this.mode);
                    const loss = outOfEdgeProb.minus(
                        new Decimal(1).minus(prob)
                    );
                    if (loss.lessThan(TriangleDistribution.ERROR)) {
                        candidate = { lowerEdge: x, upperEdge: y };
                        break;
                    } else if (
                        bestLoss == undefined ||
                        bestLoss?.greaterThan(loss)
                    ) {
                        bestLoss = loss;
                        candidate = { lowerEdge: x, upperEdge: y };
                    }
                }
            }
            this.__edgeDict.set(key, candidate);
        }
        // Hack: ここを通るまえに key が存在しない場合には、必ず何らかの value が設定されているので強制して良い。
        return this.__edgeDict.get(key)!;
    }

    /**
     * CDF の本体
     * https://ja.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%88%86%E5%B8%83
     * @param {Decimal} x
     * @param {Decimal} a
     * @param {Decimal} b
     * @param {Decimal} c
     * @return {Decimal}
     */
    private primitiveCDF(
        x: Decimal,
        a: Decimal,
        b: Decimal,
        c: Decimal
    ): Decimal {
        let prob: Decimal;
        if (x.lessThanOrEqualTo(a)) {
            prob = new Decimal(0);
        } else if (a.lessThan(x) && x.lessThanOrEqualTo(c)) {
            prob = x
                .minus(a)
                .pow(2)
                .div(b.minus(a).mul(c.minus(a)));
        } else if (this.mode.lessThan(x) && x.lessThan(b)) {
            prob = new Decimal(1).minus(
                b
                    .minus(x)
                    .pow(2)
                    .div(b.minus(a).mul(b.minus(c)))
            );
        } else {
            prob = new Decimal(1);
        }
        return prob;
    }

    /**
     * 上下端の確率を考慮したCDF
     * @param {Decimal} x
     * @return {Decimal}
     */
    cdf(
        x: Decimal,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Decimal {
        return this.primitiveCDF(x, lowerLimit, upperLimit, this.mode);
    }

    protected override _updateProbAs80PctClosure(
        orderedBins: ProbBin[],
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        const outOfEdge = this.getOutOfEdges(
            unit,
            lowerLimit,
            upperLimit,
            new Decimal('0.1')
        );
        if (orderedBins.length > 0) {
            // orderedBins の内部を変更する
            for (const elem of orderedBins) {
                elem.prob = this.primitiveCDF(
                    elem.upperValue,
                    outOfEdge.lowerEdge,
                    outOfEdge.upperEdge,
                    this.mode
                ).minus(
                    this.primitiveCDF(
                        elem.lowerValue,
                        outOfEdge.lowerEdge,
                        outOfEdge.upperEdge,
                        this.mode
                    )
                );
            }
        }
        return this._setStatForUpdateProb(
            orderedBins,
            unit,
            outOfEdge.lowerEdge,
            outOfEdge.upperEdge
        );
    }

    protected override _setStatForUpdateProb(
        orderedBins: ProbBin[],
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        const mean = upperLimit
            .plus(lowerLimit)
            .plus(this.mode)
            .div(new Decimal(3));
        return new Stat(orderedBins, { expectedValue: mean });
    }

    // ==  serialize ==

    /**
     * [overwrite対象]
     * @returns
     */
    override toObject(): CDFObjectProps & { mode: string } {
        return {
            ...super.toObject(),
            mode: this.mode.toString(),
        };
    }

    static deserialize(serialized: string): TriangleDistribution {
        const obj: ReturnType<TriangleDistribution['toObject']> =
            JSON.parse(serialized);
        return new TriangleDistribution(new Decimal(obj.mode));
    }
}
