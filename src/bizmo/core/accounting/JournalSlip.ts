import Decimal from 'decimal.js';
import { BizIOId } from '../bizIO/single/BizIOs';
import { Serializable } from '../db/BizGraphNode';

export type JournalSlipParam = {
    termIndex: number;
    debit: Map<BizIOId, Decimal>;
    credit: Map<BizIOId, Decimal>;
    description?: string;
};

/**
 * 仕訳伝票
 *
 * 仕分けは高速シミュレーションの多次元配列モードはサポートしない。
 */
export class JournalSlip implements Serializable {
    public termIndex: number;
    public debit: Map<BizIOId, Decimal> = new Map<BizIOId, Decimal>();
    public credit: Map<BizIOId, Decimal> = new Map<BizIOId, Decimal>();
    public description: string | undefined;

    /**
     *
     * @param {number} termIndex 対象termのIndex
     * @param {Map<BizIOId, V>} debit 借方
     * @param {Map<BizIOId, V>} credit 貸方
     * @param {string} description 備考
     */
    constructor({ termIndex, debit, credit, description }: JournalSlipParam) {
        this.termIndex = termIndex ?? 0;
        this.debit = debit ?? new Map<BizIOId, Decimal>();
        this.credit = credit ?? new Map<BizIOId, Decimal>();
        this.description = description;
    }

    // serialize / deserialize

    toObject(): JournalSlipToObject {
        return {
            termIndex: this.termIndex,
            debit: Array.from(this.debit.entries()).map(([key, value]) => [
                key,
                value.toString(),
            ]),
            credit: Array.from(this.credit.entries()).map(([key, value]) => [
                key,
                value.toString(),
            ]),
            description: this.description,
        };
    }

    static fromObject(obj: JournalSlipToObject): JournalSlip {
        return new JournalSlip({
            termIndex: obj.termIndex,
            debit: new Map(
                obj.debit.map(([key, value]) => [key, new Decimal(value)])
            ),
            credit: new Map(
                obj.credit.map(([key, value]) => [key, new Decimal(value)])
            ),
            description: obj.description,
        });
    }
}

export type JournalSlipToObject = {
    termIndex: number;
    debit: Array<[BizIOId, string]>;
    credit: Array<[BizIOId, string]>;
    description?: string;
};
