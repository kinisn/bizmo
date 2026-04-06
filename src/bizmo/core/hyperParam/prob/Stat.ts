import Decimal from 'decimal.js';
import { ProbBin } from './ProbBin';

/**
 * 統計情報：初期化オプションパラメータ
 */
export type StatOptionalParam = {
    expectedValue?: Decimal; // 期待値（平均）
    variance?: Decimal; // 分散（標準偏差の二乗）
};

/**
 * 統計情報
 *
 * 確率分布のHistogramから生成された統計情報
 *
 * 前提: 確率分布のHistogramには「全ての確率要素が含まれている」
 *
 * ＜課題＞
 * CDFの計算に誤差が含まれる場合、統計指標がずれることが避けられない。（例：正規分布）
 * 統計指標ごとに、定義上決まっている値を、上書き init で渡せることとする
 */
export class Stat {
    static PERCENTILE_KEYS: Array<Decimal> = [
        new Decimal('0.1'),
        new Decimal('0.2'),
        new Decimal('0.25'),
        new Decimal('0.3'),
        new Decimal('0.4'),
        new Decimal('0.5'),
        new Decimal('0.6'),
        new Decimal('0.7'),
        new Decimal('0.75'),
        new Decimal('0.8'),
        new Decimal('0.9'),
        new Decimal('1'),
    ];

    private __mode: ProbBin | undefined;
    private __expectedValue: Decimal | undefined;
    private __variance: Decimal | undefined;
    private __percentileMap: Map<string, ProbBin | undefined>;

    /**
     *
     * @param {Array<ProbBin>} orderedBins 下限側から適切に並べられたBin。
     * @param {StatOptionalParam} param1
     */
    constructor(
        orderedBins: Array<ProbBin>,
        { expectedValue, variance }: StatOptionalParam = {}
    ) {
        this.__mode = undefined;
        this.__expectedValue = undefined;
        this.__variance = undefined;
        this.__percentileMap = new Map<string, ProbBin | undefined>();
        Stat.PERCENTILE_KEYS.forEach((keyDecimal) => {
            this.__percentileMap.set(keyDecimal.toString(), undefined);
        });

        if (orderedBins.length > 0) {
            this.__expectedValue = new Decimal(0);
            let accumulatedProb = new Decimal(0);
            for (const bin of orderedBins) {
                // 期待値（平均）
                if (expectedValue == undefined) {
                    this.__expectedValue = this.__expectedValue!.add(
                        bin.prob.mul(bin.lowerValue)
                    );
                }
                // 最頻値
                if (
                    this.mode == undefined ||
                    (this.mode != undefined &&
                        this.mode.prob.lessThanOrEqualTo(bin.prob))
                ) {
                    this.__mode = bin;
                }
                // パーセンタイル
                accumulatedProb = accumulatedProb.add(bin.prob);
                Stat.PERCENTILE_KEYS.forEach((lowerKey) => {
                    if (
                        lowerKey.lessThanOrEqualTo(accumulatedProb) &&
                        this.__percentileMap.get(lowerKey.toString()) ==
                            undefined
                    ) {
                        this.__percentileMap.set(lowerKey.toString(), bin);
                    }
                });
            }
            // 分散
            if (variance != undefined) {
                this.__variance = variance;
            } else {
                let result = new Decimal(0);
                for (const elem of orderedBins) {
                    result = result.add(
                        elem.value
                            .minus(this.expectedValue!) // orderedBinsの要素があるので、必ず存在する
                            .pow(2)
                            .mul(elem.prob)
                    );
                }
                this.__variance = result;
            }

            if (expectedValue != undefined) {
                this.__expectedValue = expectedValue;
            }
        }
    }

    /**
     * 期待値（平均）
     */
    get expectedValue(): Decimal | undefined {
        return this.__expectedValue;
    }

    /**
     * 平均（期待値）
     */
    get mean(): Decimal | undefined {
        return this.expectedValue;
    }

    /**
     * 中央値：累積確率50%を含む値
     */
    get median(): ProbBin | undefined {
        return this.percentile_50;
    }

    /**
     * 最頻値：最高確率を含む値（複数ある場合は値の大きい方）
     */
    get mode(): ProbBin | undefined {
        return this.__mode;
    }

    /**
     * 10 パーセンタイルを含む値
     */
    get percentile_10(): ProbBin | undefined {
        return this.__percentileMap.get('0.1');
    }

    /**
     * 20 パーセンタイルを含む値
     */
    get percentile_20(): ProbBin | undefined {
        return this.__percentileMap.get('0.2');
    }

    /**
     * 25 パーセンタイルを含む値
     */
    get percentile_25(): ProbBin | undefined {
        return this.__percentileMap.get('0.25');
    }

    /**
     * 30 パーセンタイルを含む値
     */
    get percentile_30(): ProbBin | undefined {
        return this.__percentileMap.get('0.3');
    }

    /**
     * 40 パーセンタイルを含む値
     */
    get percentile_40(): ProbBin | undefined {
        return this.__percentileMap.get('0.4');
    }

    /**
     * 50 パーセンタイルを含む値
     */
    get percentile_50(): ProbBin | undefined {
        return this.__percentileMap.get('0.5');
    }

    /**
     * 60 パーセンタイルを含む値
     */
    get percentile_60(): ProbBin | undefined {
        return this.__percentileMap.get('0.6');
    }

    /**
     * 70 パーセンタイルを含む値
     */
    get percentile_70(): ProbBin | undefined {
        return this.__percentileMap.get('0.7');
    }

    /**
     * 75 パーセンタイルを含む値
     */
    get percentile_75(): ProbBin | undefined {
        return this.__percentileMap.get('0.75');
    }

    /**
     * 80 パーセンタイルを含む値
     */
    get percentile_80(): ProbBin | undefined {
        return this.__percentileMap.get('0.8');
    }

    /**
     * 90 パーセンタイルを含む値
     */
    get percentile_90(): ProbBin | undefined {
        return this.__percentileMap.get('0.9');
    }

    /**
     * 100 パーセンタイルを含む値
     */
    get percentile_100(): ProbBin | undefined {
        return this.__percentileMap.get('1');
    }

    /**
     * 分散
     */
    get variance(): Decimal | undefined {
        return this.__variance;
    }

    /**
     * 標準偏差 standard deviation
     * 分散 の 正の平方根
     */
    get sd(): Decimal | undefined {
        return this.variance != undefined ? this.variance.sqrt() : undefined;
    }
}
