import { Publisher } from 'bizmo/core/util/Pubsub';
import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { Stat } from '../Stat';

/**
 * [根底クラス]
 * 累積分布関数（cumulative distribution function）
 */
export abstract class CDF extends Publisher {
    public static PROBABILITY_ZERO: Decimal = new Decimal(0); // 確率 0
    public static EVENT_PROPS_UPDATED: string = 'EVENT_PROPS_UPDATED';

    /**
     * 当該CDFの updateProbAs80PctClosure 提供の有無
     */
    protected _support80PctClosure: boolean = true;

    /**
     *
     * ordered_bins の全要素の累積分布を計算して、ordered_binsを更新し、更新結果をもとに、統計情報を更新する
     *
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Stat}
     */
    updateProb(
        orderedBins: Array<ProbBin>,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        return this._updateProb(orderedBins, unit, lowerLimit, upperLimit);
    }

    /**
     * [override対象]
     * ordered_bins の全要素の累積分布を計算して、ordered_bins を更新する
     *
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Stat}
     */
    protected _updateProb(
        orderedBins: Array<ProbBin>,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        if (orderedBins.length > 0) {
            // orderedBins の内部を変更する
            for (const elem of orderedBins) {
                elem.prob = this.cdf(
                    elem.upperValue,
                    unit,
                    lowerLimit,
                    upperLimit
                ).minus(
                    this.cdf(elem.lowerValue, unit, lowerLimit, upperLimit)
                );
            }
        }
        return this._setStatForUpdateProb(
            orderedBins,
            unit,
            lowerLimit,
            upperLimit
        );
    }

    /**
     * [overwrite対象]
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Stat}
     */
    protected _setStatForUpdateProb(
        orderedBins: Array<ProbBin>,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        return new Stat(orderedBins);
    }

    /**
     * [overwrite対象]
     * orderedBinsの範囲を80%とするように、CDF設定も含めて調整してから、ordered_bins を更新する
     *
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Stat}
     */
    updateProbAs80PctClosure(
        orderedBins: Array<ProbBin>,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        if (this._support80PctClosure) {
            return this._updateProbAs80PctClosure(
                orderedBins,
                unit,
                lowerLimit,
                upperLimit
            );
        } else {
            return this.updateProb(orderedBins, unit, lowerLimit, upperLimit);
        }
    }

    /**
     * [overwrite対象]
     * orderedBinsの範囲を80%とするように、CDF設定も含めて調整してから、ordered_bins を更新する
     *
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Stat}
     */
    protected _updateProbAs80PctClosure(
        orderedBins: Array<ProbBin>,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        return this.updateProb(orderedBins, unit, lowerLimit, upperLimit);
    }

    /**
     * [overwrite対象]
     * CDF：累積確率密度を取得する
     *
     * @param {Array<ProbBin>} orderedBins CDFを求める全区域【内部を変更します】
     * @param {Decimal} unit
     * @param {Decimal} lowerLimit
     * @param {Decimal} upperLimit
     * @returns {Decimal} 確率
     */
    abstract cdf(
        x: Decimal,
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Decimal;

    // ==  serialize ==

    /**
     * [overwrite対象]
     * @returns
     */
    toObject(): CDFObjectProps {
        return {
            name: this.constructor.name,
        };
    }

    serialize(): string {
        return JSON.stringify(this.toObject());
    }
}
export type CDFObjectProps = { name: string };
