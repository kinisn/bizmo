import Decimal from 'decimal.js';
import { ProbBin } from '../ProbBin';
import { Stat } from '../Stat';
import { CDF, CDFObjectProps } from './CDF';

/**
 * カスタム CDF
 *
 * ProbHyperParam の orderedBin の各Binに対する確率を、Userが「比率」で設定することで自ら設定する確率分布。
 *  ⇒ 最大・最小・Unitは事前定義されている前提
 *
 * 設定時には、比率を割合として正規化する。
 *
 * 事前設定した確率数がBin数より多い： 超過分は削除される
 * 事前設定した確率数がBin数より少ない： 不足分は０とみなされる
 *
 * ＝使い方＝
 * 1. 初期化時に customProbs としてBinに設定する割合を渡す
 * 2. 初期化後は customProbs プロパティにBin配列を設定することで更新される
 * 　⇒　setではなく、配列を直接操作した場合には、updateProb が必要なので注意。
 *
 */
export class CustomDistribution extends CDF {
    private __customProbs: Array<Decimal>;

    /**
     * @param {Array<Decimal>} [customProbs] ユーザーが定義したBinに対応する確率
     */
    constructor(customProbs?: Array<Decimal>) {
        super();
        this._support80PctClosure = false;
        this.__customProbs = customProbs ?? [];
    }

    get customProbs(): Array<Decimal> {
        return this.__customProbs;
    }

    set customProbs(customProbs: Array<Decimal>) {
        this.__customProbs = customProbs;
        this.triggerEvent(
            CDF.EVENT_PROPS_UPDATED,
            new Map<string, any>([
                ['original', this],
                ['prop', 'customProbs'],
                ['param', customProbs],
            ])
        );
    }

    /**
     *
     * @param orderedBins
     * @param unit
     * @param lowerLimit
     * @param upperLimit
     * @returns
     */
    protected override _updateProb(
        orderedBins: ProbBin[],
        unit: Decimal,
        lowerLimit: Decimal,
        upperLimit: Decimal
    ): Stat {
        if (orderedBins.length > 0) {
            let sumCustom = this.customProbs.reduce(
                (pre, current) => pre.add(current),
                CDF.PROBABILITY_ZERO
            );
            let index = 0;
            // orderedBins の内部を変更するため map を利用していない
            for (const elem of orderedBins) {
                // 次の条件でゼロで割らないために最初に確認が必要
                if (sumCustom.isZero() || sumCustom.isNaN()) {
                    elem.prob = CDF.PROBABILITY_ZERO;
                } else if (0 <= index && index < this.customProbs.length) {
                    elem.prob = this.customProbs[index].div(sumCustom);
                } else {
                    elem.prob = CDF.PROBABILITY_ZERO;
                }
                index = index + 1;
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
     * CDFを計算する
     * Userが手動でBinの確率分布を設定するため、本メソッドは呼ばない
     * @param {Decimal} x
     * @return {Decimal}
     */
    cdf(x: Decimal): Decimal {
        return x;
    }

    // ==  serialize ==

    /**
     * [overwrite対象]
     * @returns
     */
    override toObject(): CDFObjectProps & { customProbs: string[] } {
        return {
            ...super.toObject(),
            customProbs: this.customProbs.map((elem) => elem.toString()),
        };
    }

    static deserialize(serialized: string): CustomDistribution {
        const obj: ReturnType<CustomDistribution['toObject']> =
            JSON.parse(serialized);
        return new CustomDistribution(
            obj.customProbs.map((elem) => new Decimal(elem))
        );
    }
}
