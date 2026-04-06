import Decimal from 'decimal.js';

/**
 * ProbBinの初期化パラメータ
 */
export type ProbBinParam = {
    prob?: Decimal;
    lowerValue?: Decimal;
    upperValue?: Decimal;
};

/**
 * 確率分布上の1区間と確率
 *
 * ＝ 前提 ＝
 * ・区間は半開区間（左閉右開） a < x <= b として取り扱う
 *   ⇒ 区間を示す値は左側の値となる
 * 例) 0.0 ~ 0.1の区間 ⇒ 代表値は 0.0
 */
export class ProbBin {
    /**
     * 代表値が示す区間の確率
     */
    public prob: Decimal;
    /**
     * 値区間の下限（含める）= 代表値
     */
    public lowerValue: Decimal;
    /**
     * 値区間の上限（含めない）
     */
    public upperValue: Decimal;

    /**
     *
     * @param {ProbBinParam} [object={}]
     * @param {Decimal} [object.prob] 代表値が示す区間の確率
     * @param {Decimal} [object.lowerValue] 値区間の下限（含める）= 代表値
     * @param {Decimal} [object.upperValue] 値区間の上限（含めない）
     */
    constructor({ prob, lowerValue, upperValue }: ProbBinParam = {}) {
        this.prob = prob ?? new Decimal(0);
        this.lowerValue = lowerValue ?? new Decimal(0);
        this.upperValue = upperValue ?? new Decimal(0);
    }

    /**
     * 当該区間の代表値（区間左側）
     */
    get value(): Decimal {
        return this.lowerValue;
    }
}
