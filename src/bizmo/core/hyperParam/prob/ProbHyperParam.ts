import { PublisherTriggerEventParam, Subscriber } from 'bizmo/core/util/Pubsub';
import Decimal from 'decimal.js';
import { ProbBin } from './ProbBin';
import { Stat } from './Stat';
import { CDF } from './cdf/CDF';
import { deserializeCDF } from './cdf/CDFDeserializer';
import { UniformDistribution } from './cdf/UniformDistribution';

export type ProbHyperParamProps = {
    unit?: Decimal;
    upperLimit?: Decimal;
    lowerLimit?: Decimal;
    cdf?: CDF;
};

/**
 * 確率分布つきのHyperParameter
 *
 * BizAction にユーザがデータを設定するために利用する。
 *
 * = 利用法 =
 * 1. unit（単位）を設定する
 * 2. 上限値・下限値を設定する
 * 3. 分布を設定する
 *  ⇒ Unitの縛りに沿って設定される。場合により最終要素の幅は「等間隔」ではなくする
 *  3.2  区間を80％とする分布で設定する
 * 4. select して値を選出する
 *
 * = 各Binの確率総和 と  =
 * 各CDFによって計算された確率は、正規分布などでは性質上 orderedBins 確率総和が 1 にならない。
 * そのため選出時には、各Binの確率を「比率」とみなして計算する。
 * ユーザーには、補正前の「比率」の分布とみなすことを伝える。
 */
export class ProbHyperParam extends Subscriber {
    private __orderedBins: Array<ProbBin>;
    private __unit: Decimal;
    private __upperLimit: Decimal;
    private __lowerLimit: Decimal;
    private __cdf: CDF;
    private __stat: Stat;
    private __selectedValue: Decimal | undefined;

    /**
     *
     * @param {ProbHyperParamProps} param0
     */
    constructor({
        unit,
        upperLimit,
        lowerLimit,
        cdf,
    }: ProbHyperParamProps = {}) {
        super();

        this.__orderedBins = []; // __updateSetting 経由で設定
        this.__unit = unit ?? new Decimal(1);
        this.__upperLimit = upperLimit ?? new Decimal(1);
        this.__lowerLimit = lowerLimit ?? new Decimal(0);
        this.__selectedValue = undefined;

        // cdf設定 および 初期パラメータ設定
        this.__stat = new Stat([]); // dummy
        this.__cdf = cdf ?? new UniformDistribution(); // 初期化のためのdummy
        this.cdf = this.__cdf;
    }

    /**
     *
     * @param {string} eventName
     * @param {PublisherTriggerEventParam} keyParams
     */
    handleEvent(
        eventName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        keyParams?: PublisherTriggerEventParam
    ): void {
        if (eventName == CDF.EVENT_PROPS_UPDATED) {
            this.__updateSetting();
        }
    }

    // == input props ==

    /**
     * 値の単位となる数
     * 上限値と下限値の間を、この数毎に分割して Bin を生成する。デフォルト：1
     */
    get unit(): Decimal {
        return this.__unit;
    }

    /**
     * 値の単位となる数を設定する
     * 上限値と下限値の間を、この数毎に分割して Bin を生成する
     * @param {Decimal} unit 0より大きい正の数
     */
    set unit(unit: Decimal) {
        if (unit.greaterThan(new Decimal(0))) {
            this.__unit = unit;
            this.__updateSetting();
        }
    }

    /**
     * 上限値
     * 設定者がこれ以上の値は、まずおこらないだろうと考える値。確率ではない
     */
    get upperLimit(): Decimal {
        return this.__upperLimit;
    }

    /**
     * 上限値を設定する
     *
     * ＝注意＝
     * 初期値が上限１，下限０で設定されているので、どちらを先に設定すべきか状況に応じて検討すること
     * @param {Decimal} limit
     */
    set upperLimit(limit: Decimal) {
        if (this.lowerLimit.lessThanOrEqualTo(limit)) {
            this.__upperLimit = limit;
            this.__updateSetting();
        }
    }

    /**
     * 下限値
     * 設定者がこれ以下の値は、まずおこらないだろうと考える値。確率ではない
     */
    get lowerLimit(): Decimal {
        return this.__lowerLimit;
    }

    /**
     * 下限値 を設定する
     *
     * ＝注意＝
     * 初期値が上限１，下限０で設定されているので、どちらを先に設定すべきか状況に応じて検討すること
     * @param {Decimal} limit
     */
    set lowerLimit(limit: Decimal) {
        if (this.upperLimit.greaterThanOrEqualTo(limit)) {
            this.__lowerLimit = limit;
            this.__updateSetting();
        }
    }

    /**
     * 適用される確率分布関数
     */
    get cdf(): CDF {
        return this.__cdf;
    }

    /**
     * 確率分布関数を設定する
     * @param {CDF} cdf
     */
    set cdf(cdf: CDF) {
        this.__cdf = cdf;
        this.__cdf.addEventListener(CDF.EVENT_PROPS_UPDATED, this);
        this.__updateSetting();
    }

    /**
     * 順番に並べられたHistogramの各柱
     * 最終要素は unit 次第で、値に含まれる範囲が減少するため、確率が減少する可能性がある。
     */
    get orderedBins(): Array<ProbBin> {
        return this.__orderedBins;
    }

    /**
     * 設定に合わせて OrderedBins を再構築する。
     * 内部の確率も初期化される。
     */
    private __remakeOrderedBins(): void {
        const numerator: Decimal = this.upperLimit.minus(this.lowerLimit);
        const divI: Decimal = numerator.div(this.unit).floor();
        const divMod: Decimal = numerator.modulo(this.unit);

        let binRanges = [];
        for (let i: number = 0; i < divI.toNumber(); i++) {
            binRanges.push(
                new ProbBin({
                    lowerValue: new Decimal(i)
                        .mul(this.unit)
                        .plus(this.lowerLimit),
                    upperValue: new Decimal(i)
                        .plus(1)
                        .mul(this.unit)
                        .plus(this.lowerLimit),
                })
            );
        }

        // limitの間がunitで割り切れず、最後のBin要素が等間隔にならない場合
        if (!divMod.isZero()) {
            binRanges.push(
                new ProbBin({
                    lowerValue: divI.mul(this.unit).plus(this.lowerLimit),
                    upperValue: divI
                        .mul(this.unit)
                        .plus(divMod)
                        .plus(this.lowerLimit),
                })
            );
        }

        this.__orderedBins = binRanges;
    }

    /**
     * 確率は初期化した上で Histogram の柱の数と領域を更新する
     * 最終要素は unit 次第で、値に含まれる範囲が減少するため、確率が減少する可能性がある。
     */
    private __updateSetting(): void {
        this.__remakeOrderedBins();
        this.__updateProb();
    }

    /**
     * Histogram の柱の数と区間を更新せず、内部の確率および確率設定（SDなど）と統計だけ再構築する
     * 限界値内側の確率を 80% と見なした専用設定を行う
     *
     * updateProbAs80PctClosure に対応していない CDF の場合は、自動的に通常の updateProb が呼ばれる。
     *
     * - CDF内部設定は自動的に更新するが、HyperParamの内部は変更しない
     */
    updateProbAs80PctClosure(): void {
        this.__stat = this.cdf.updateProbAs80PctClosure(
            this.orderedBins,
            this.unit,
            this.lowerLimit,
            this.upperLimit
        );
    }

    /**
     * Histogram の柱の数と区間を更新せず、内部の確率と統計だけ再構築する
     * CustomDistributionの場合に、各区域の確率はProbBinに含まれる
     */
    private __updateProb(): void {
        this.__stat = this.cdf.updateProb(
            this.orderedBins,
            this.unit,
            this.lowerLimit,
            this.upperLimit
        );
    }

    // == input / output ==

    /**
     * 確率分布上の期待値（平均値）
     */
    get meanValue(): Decimal | undefined {
        return this.__stat.mean;
    }

    /**
     * 50パーセンタイル
     */
    get meanProbBin(): ProbBin | undefined {
        return this.__stat.percentile_50;
    }

    /**
     * 最頻値
     */
    get modeProbBin(): ProbBin | undefined {
        return this.__stat.mode;
    }

    /**
     * 確率分布から選択された値
     *  = 最後に select された結果
     */
    get selectedValue(): Decimal | undefined {
        return this.__selectedValue;
    }

    /**
     * 確率分布から 値 を抽出する
     * 合計の発生確率が「１以下」でも、発生確率を割合とみなし、自動的に調整する。
     *
     * BizFunction の Preprocessにて抽選される
     *
     * 課題
     * ・上限下限の値が、N％の場合にどうするか？
     *  ⇒ 全体にして、算出時点に変換しないとStatがおかしくなる
     *   ⇐ Statが目的ではないので、本末転倒！気にしないでいい。
     * @return {Decimal}
     */
    select(): Decimal {
        const targetProbs: Array<{
            population: Decimal;
            accWeights: Decimal;
        }> = [];

        let totalWeight: Decimal = new Decimal(0);
        this.orderedBins.forEach((probBin) => {
            totalWeight = totalWeight.plus(probBin.prob);
            targetProbs.push({
                population: probBin.value,
                accWeights: totalWeight,
            });
        });
        const threshold = Decimal.random().mul(totalWeight);
        let population = targetProbs[targetProbs.length - 1].population;
        for (const prob of targetProbs) {
            if (prob.accWeights.greaterThanOrEqualTo(threshold)) {
                population = prob.population;
                break;
            }
        }

        this.__selectedValue = population;
        return population;
    }

    // == util ==
    /**
     * 指定した自然数の等幅Binを設定する。
     * 事前定義されたLLとULの間を「誤差なく割り切れる場合のみ」設定が可能
     *
     * @param {Decimal} binsCount
     * @param {Decimal} maxCount
     * @return {FixedWidthBinResult}
     */
    setFixedWidthBin(
        binsCount: Decimal,
        maxCount: Decimal = new Decimal(100)
    ): FixedWidthBinResult {
        const validated = validateFixedWidthBin(
            binsCount,
            this.lowerLimit,
            this.upperLimit,
            maxCount
        );
        if (validated.result == FixedWidthBinResult.SUCCESS) {
            this.unit = new Decimal(validated.value);
            return validated.result;
        } else {
            return validated.result;
        }
    }

    // ==  serialize ==

    private toObject(): Required<Omit<ProbHyperParamProps, 'cdf'>> & {
        cdf: string;
    } {
        return {
            unit: this.unit,
            upperLimit: this.upperLimit,
            lowerLimit: this.lowerLimit,
            cdf: this.cdf.serialize(),
        };
    }

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    static fromSerialized(serialized: string): ProbHyperParam {
        const obj: ReturnType<ProbHyperParam['toObject']> =
            JSON.parse(serialized);
        const cdf = deserializeCDF(obj.cdf);
        const result = new ProbHyperParam({
            unit: new Decimal(obj.unit),
            upperLimit: new Decimal(obj.upperLimit),
            lowerLimit: new Decimal(obj.lowerLimit),
            cdf: cdf,
        });
        return result;
    }
}

/**
 * 指定した自然数の等幅Binを設定する。
 * 事前定義されたLLとULの間を「誤差なく割り切れる場合のみ」設定が可能
 *
 * @param {Decimal} binsCount
 * @param {Decimal} lowerLimit
 * @param {Decimal} upperLimit
 * @param {Decimal} maxCount
 * @returns
 */
export function validateFixedWidthBin(
    binsCount: Decimal,
    lowerLimit: Decimal,
    upperLimit: Decimal,
    maxCount: Decimal = new Decimal(100)
):
    | {
          result: Exclude<FixedWidthBinResult, 'SUCCESS'>;
      }
    | {
          result: Extract<FixedWidthBinResult, 'SUCCESS'>;
          value: Decimal;
      } {
    if (
        binsCount &&
        binsCount.isInteger() &&
        binsCount.isPositive() &&
        binsCount.greaterThan(0)
    ) {
        if (binsCount.lessThanOrEqualTo(maxCount)) {
            const candidate = upperLimit.minus(lowerLimit).div(binsCount);
            const divMod: Decimal = upperLimit
                .minus(lowerLimit)
                .modulo(candidate);
            if (divMod.isZero()) {
                return {
                    result: FixedWidthBinResult.SUCCESS,
                    value: candidate,
                };
            } else {
                return {
                    result: FixedWidthBinResult.ERR_INDIVISIBLE,
                };
            }
        } else {
            return {
                result: FixedWidthBinResult.ERR_EXCEED_MAX,
            };
        }
    } else {
        return {
            result: FixedWidthBinResult.ERR_NOT_NATURAL_NUMBER,
        };
    }
}

export const FixedWidthBinResult = {
    SUCCESS: 'SUCCESS',
    ERR_NOT_NATURAL_NUMBER: 'ERR_NOT_NATURAL_NUMBER',
    ERR_EXCEED_MAX: 'ERR_EXCEED_MAX',
    ERR_INDIVISIBLE: 'ERR_INDIVISIBLE',
} as const;
export type FixedWidthBinResult =
    typeof FixedWidthBinResult[keyof typeof FixedWidthBinResult];
