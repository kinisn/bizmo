import Decimal from 'decimal.js';

/**
 * 単位期間に保持されたBizIOの値
 */
export class BizValue {
    public date: Date;
    public value: Decimal;

    /**
     *
     * @param {Date} date 当該IOの日付
     * @param {Decimal} value 当該IOの値
     */
    constructor(date: Date, value: Decimal = new Decimal(0)) {
        this.date = date;
        this.value = value;
    }
}
