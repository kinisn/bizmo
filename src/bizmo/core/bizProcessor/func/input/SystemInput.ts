import Decimal from 'decimal.js';

/**
 * 処理時にシステムから提供される入力パラメータ
 */
export class SystemInput {
    private __termIndex: number;
    private __termDate: Date;
    private __inputs: Array<Decimal>;

    /**
     *
     * @param {number} termIndex 対象term の index
     * @param {Date} termDate 対象term の 日付
     */
    constructor(termIndex: number, termDate: Date) {
        this.__termIndex = termIndex;
        this.__termDate = termDate;
        // construct data
        this.__inputs = [
            new Decimal(this.__termIndex),
            new Decimal(
                this.__termDate.getFullYear() * 10000 +
                    (this.__termDate.getMonth() + 1) * 100 +
                    this.__termDate.getDate()
            ),
            new Decimal(this.__termDate.getFullYear()),
            new Decimal(this.__termDate.getMonth() + 1),
            new Decimal(this.__termDate.getDate()),
        ];
    }

    /**
     * 入力用パラメータ
     *
     * sys0: 処理 term の index
     * sys1: 処理 term の 西暦（YYYYMMDD形式）の数値
     * sys2: 処理 term の 西暦の年
     * sys3: 処理 term の 西暦の月
     * sys4: 処理 term の 西暦の日
     */
    get inputs(): Array<Decimal> {
        return this.__inputs;
    }
}
