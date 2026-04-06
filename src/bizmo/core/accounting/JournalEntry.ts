import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { AccountNames, AccountNamesUtil } from './AccountNames';
import { JournalSlip } from './JournalSlip';

/**
 * BizFunction用 JournalEntry対象を示すプロトコル型
 */
export type JournalEntrySupported = {
    get accountName(): AccountNames;
    addAccountValue(value: Decimal): void;
    subAccountValue(value: Decimal): void;
};

/**
 * 仕訳記入
 */
export class JournalEntry {
    /**
     * JournalEntrySupported を判定する
     * @param {any} obj
     * @return {boolean}
     */
    static isJournalEntrySupported(obj: any): obj is JournalEntrySupported {
        if (
            obj.addAccountValue !== undefined &&
            obj.subAccountValue !== undefined &&
            obj.accountName !== undefined
        ) {
            return true;
        }
        return false;
    }

    /**
     * 勘定仕分けを行う
     *
     * 仕分け対象BizIOが全てAccountedBizIOであり、かつ、貸方・借方のバランスが取れているときにだけ実行される
     * @param {Timetable} timetable
     * @param {BizDatabase} db
     * @param {Map<BizIOId, Decimal>} debitRelatedDict 借方 { accounted_biz_io_id: Decimal, ... }
     * @param {Map<BizIOId, Decimal>} creditRelatedDict 貸方 { accounted_biz_io_id: Decimal, ... }
     */
    static journalEntry(
        timetable: Timetable,
        db: BizDatabase,
        debitRelatedDict: Map<BizIOId, Decimal>,
        creditRelatedDict: Map<BizIOId, Decimal>
    ): void {
        // eslint-disable-next-line require-jsdoc
        function __validateDict(
            accountRelatedDict: Map<BizIOId, Decimal>
        ): [boolean, Decimal, Array<[BizIO & JournalEntrySupported, Decimal]>] {
            let isInnerValidated: boolean = true;
            let total = new Decimal(0);
            const data: Array<[BizIO & JournalEntrySupported, Decimal]> = [];
            for (const bizIOId of accountRelatedDict.keys()) {
                const candidateIO = db.selectById(bizIOId);
                if (
                    candidateIO &&
                    JournalEntry.isJournalEntrySupported(candidateIO)
                ) {
                    const elem =
                        accountRelatedDict.get(bizIOId) ?? new Decimal('NaN');
                    total = total.plus(elem);
                    data.push([candidateIO, elem]);
                } else {
                    isInnerValidated = false;
                    break;
                }
            }
            return [isInnerValidated, total, data];
        }

        // eslint-disable-next-line require-jsdoc
        function __updateAccount(
            accountData: Array<[BizIO & JournalEntrySupported, Decimal]>,
            dataIsDebit: boolean
        ): void {
            // 対象となる勘定科目のデフォルトが debit 側か credit 側かで、同じ側にいれば加算、反対にいれば減算となる
            // 注意： Account はPL科目についても【常に合算】されていき、試算表のように term 毎に分解されていない。
            for (const account of accountData) {
                const accountIO = account[0];
                if (AccountNamesUtil.isDebitAccount(accountIO.accountName)) {
                    if (dataIsDebit) {
                        accountIO.addAccountValue(account[1]);
                    } else {
                        accountIO.subAccountValue(account[1]);
                    }
                } else if (
                    AccountNamesUtil.isCreditAccount(accountIO.accountName)
                ) {
                    if (dataIsDebit) {
                        accountIO.subAccountValue(account[1]);
                    } else {
                        accountIO.addAccountValue(account[1]);
                    }
                }
            }
        }

        const [isDebitValidated, totalDebit, debitData] =
            __validateDict(debitRelatedDict);
        if (isDebitValidated) {
            const [isCreditValidated, totalCredit, creditData] =
                __validateDict(creditRelatedDict);

            if (isCreditValidated && totalCredit.eq(totalDebit)) {
                __updateAccount(debitData, true);
                __updateAccount(creditData, false);
                // journal 更新
                db.journal.add(
                    new JournalSlip({
                        termIndex: timetable.currentIndex,
                        debit: debitRelatedDict,
                        credit: creditRelatedDict,
                    })
                );
            }
        }
    }
}
