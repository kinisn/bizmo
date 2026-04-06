import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { BizDatabase } from '../../db/BizDatabase';
import { BizValue } from '../value/BizValue';
import { AccountedMonetaryBizIO } from './AccountedMonetaryBizIO';

describe('AccountedMonetaryBizIO のテスト', () => {
    let timetable: Timetable;
    let db: BizDatabase;
    let bizIO1: AccountedMonetaryBizIO;

    beforeEach(() => {
        timetable = new Timetable({
            startDate: new Date(2020, 1, 1),
            length: 3,
        });
        db = new BizDatabase();
        bizIO1 = new AccountedMonetaryBizIO({ timetable: timetable, db: db });
    });

    test('デフォルトでは set系 が無効', () => {
        expect(timetable).toBe(bizIO1.timetable);
        expect(bizIO1.id).not.toBeUndefined();
        expect(bizIO1.name).toBe('AccountedMonetaryBizIO');
        expect(bizIO1.timetableHistory).toEqual([
            new BizValue(new Date(2020, 1, 1), new Decimal('0')),
            new BizValue(new Date(2020, 2, 1), new Decimal('0')),
            new BizValue(new Date(2020, 3, 1), new Decimal('0')),
        ]);

        bizIO1.setValue(new Date(2020, 1, 1), new Decimal('10'));
        expect(bizIO1.at(new Date(2020, 1, 1))?.value).toEqual(
            new Decimal('0')
        );
    });

    test('addAccountValue', () => {
        timetable.currentIndex = 1;
        bizIO1.addAccountValue(new Decimal('10'));
        expect(bizIO1.exportAsTable()).toEqual([
            [
                'AccountedMonetaryBizIO',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('10'),
            ],
        ]);
    });

    test('subAccountValue', () => {
        timetable.currentIndex = 1;
        bizIO1.addAccountValue(new Decimal('10'));
        timetable.currentIndex = 2;
        bizIO1.subAccountValue(new Decimal('10'));
        expect(bizIO1.exportAsTable()).toEqual([
            [
                'AccountedMonetaryBizIO',
                new Decimal('0'),
                new Decimal('10'),
                new Decimal('0'),
            ],
        ]);
    });

    test('addAccountValue & subAccountValue at the same time', () => {
        timetable.currentIndex = 1;
        bizIO1.addAccountValue(new Decimal('10'));
        bizIO1.subAccountValue(new Decimal('20'));
        expect(bizIO1.exportAsTable()).toEqual([
            [
                'AccountedMonetaryBizIO',
                new Decimal('0'),
                new Decimal('-10'),
                new Decimal('-10'),
            ],
        ]);
    });
});
