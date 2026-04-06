import { Serializable } from '../db/BizGraphNode';
import { JournalSlip, JournalSlipToObject } from './JournalSlip';

/**
 * 仕訳帳
 */
export class Journal implements Serializable {
    private __orderedSlips: Array<JournalSlip>;

    /**
     *
     */
    constructor(initData?: { orderedSlips: Array<JournalSlip> }) {
        this.__orderedSlips = initData?.orderedSlips ?? [];
    }

    /**
     * 順序付けられた仕訳データ
     * @return {Array<JournalSlip>}
     */
    get orderedSlips(): Array<JournalSlip> {
        return this.__orderedSlips;
    }

    /**
     * 仕訳帳を初期化する
     */
    initialize(): void {
        this.__orderedSlips = [];
    }

    /**
     * 仕訳を追加する
     * @param {JournalSlip} slip
     */
    add(slip: JournalSlip): void {
        this.__orderedSlips.push(slip);
    }

    // serialize / deserialize

    toObject(): JournalToObject {
        return {
            orderedSlips: this.__orderedSlips.map((slip) => slip.toObject()),
        };
    }

    static fromObject(obj: JournalToObject): Journal {
        const orderedSlips: Array<JournalSlip> = [];
        obj.orderedSlips.forEach((slipData) => {
            orderedSlips.push(JournalSlip.fromObject(slipData));
        });
        return new Journal({ orderedSlips });
    }
}

export type JournalToObject = {
    orderedSlips: Array<JournalSlipToObject>;
};
