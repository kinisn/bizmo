import Decimal from 'decimal.js';

/**
 * 優先度生成器
 * BizActionTimelineで自動的に優先度を採番する
 */
export class PriorityGenerator {
    private __priorityCounter: Decimal;

    /**
     *
     * @param {Decimal} priorityCounter
     */
    constructor(priorityCounter?: Decimal) {
        this.__priorityCounter = priorityCounter ?? new Decimal(0);
    }

    /**
     * [Serialize / Deserialize 用]
     * 最新の優先度のシードを取得する
     */
    getCurrentPriorityCounter(): Decimal {
        return this.__priorityCounter;
    }

    /**
     * 優先度を自動生成する
     *
     * @return {Decimal}
     */
    generate(): Decimal {
        this.__priorityCounter = this.__priorityCounter.plus(1);
        return this.__priorityCounter.mul(100);
    }
}
