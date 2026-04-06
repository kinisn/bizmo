import { BizIOParam, MonetaryBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import Decimal from 'decimal.js';
import { JournalEntrySupported } from '../../accounting/JournalEntry';

/**
 * 会計管理下の MonetaryBizIO
 * 設定用 method は account からしか呼べないように制御する
 */
export class AccountedMonetaryBizIO<T = any, S extends string = string>
    extends MonetaryBizIO<T, S>
    implements JournalEntrySupported
{
    constructor(props: BizIOParam<T, S>) {
        super(props);
        this.setEditable(false);
    }

    /**
     * アカウントの値を操作します
     * @param {value} value
     * @param {boolean} isPlus
     */
    private modifyAccountValue(value: Decimal, isPlus: boolean): void {
        this.setEditable(true);
        const current = this.atCurrent();
        const currentValue =
            current && !current.value.isNaN() ? current.value : new Decimal(0);
        // TODO valueが NaNの場合は？
        this.setValue(
            this.timetable.currentDate,
            isPlus ? currentValue.plus(value) : currentValue.minus(value)
        );
        this.setEditable(false);
    }

    /**
     * 現在の値に加算する
     * 現在の値が存在しない場合は 0 とみなす
     *
     * @param {Decimal} value
     */
    addAccountValue(value: Decimal): void {
        this.modifyAccountValue(value, true);
    }

    /**
     * 現在の値から減算する
     * 現在の値が存在しない場合は 0 とみなす
     *
     * @param {Decimal} value
     */
    subAccountValue(value: Decimal): void {
        this.modifyAccountValue(value, false);
    }
}
