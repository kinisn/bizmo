import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { AccountedMonetaryBizIO } from 'bizmo/core/bizIO/single/AccountedMonetaryBizIO';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import { AccountedCollectionBizIO } from '../bizIO/collection/AccountedCollectionBizIO';
import { CollectionBizIO } from '../bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId, MonetaryBizIO } from '../bizIO/single/BizIOs';
import { HyperParamManager } from '../hyperParam/HyperParamManager';
import { JournalEntry } from './JournalEntry';

describe('JournalEntry のテスト', () => {
    let db: BizDatabase;
    let hyperMG: HyperParamManager;
    let timetable: Timetable;

    beforeEach(() => {
        db = new BizDatabase();
        hyperMG = new HyperParamManager();
        timetable = new Timetable({
            startDate: new Date(2021, 1, 1),
            length: 3,
        });

        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'BS_ASSETS',
                accountName: AccountNames.BS_ASSETS,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'BS_CASH_AND_DEPOSITS',
                accountName: AccountNames.BS_CASH_AND_DEPOSITS,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'BS_ACCOUNTS_RECEIVABLE',
                accountName: AccountNames.BS_ACCOUNTS_RECEIVABLE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'BS_LIABILITIES',
                accountName: AccountNames.BS_LIABILITIES,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'BS_NET_ASSETS',
                accountName: AccountNames.BS_NET_ASSETS,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'PL_REVENUE',
                accountName: AccountNames.PL_REVENUE,
            })
        );
        db.insert(
            new AccountedMonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'PL_EXPENSES',
                accountName: AccountNames.PL_EXPENSES,
            })
        );
        db.insert(
            new MonetaryBizIO({
                db: db,
                timetable: timetable,
                bizIOId: 'MonetaryBizIO:PL_EXPENSES',
                accountName: AccountNames.PL_EXPENSES,
            })
        );
    });

    describe('isJournalEntrySupported', () => {
        test('just objet', () => {
            expect(JournalEntry.isJournalEntrySupported({})).toBeFalsy();
        });

        test('simple BizIO', () => {
            expect(
                JournalEntry.isJournalEntrySupported(
                    new BizIO({ timetable, db })
                )
            ).toBeFalsy();
        });

        test('simple CollectionBizIO', () => {
            expect(
                JournalEntry.isJournalEntrySupported(
                    new CollectionBizIO({ timetable, db, hyperMG })
                )
            ).toBeFalsy();
        });

        test('AccountedCollectionBizIO は 独自の会計値を持てないので False', () => {
            expect(
                JournalEntry.isJournalEntrySupported(
                    new AccountedCollectionBizIO({ timetable, db, hyperMG })
                )
            ).toBeFalsy();
        });

        test('AccountedMonetaryBizIO だけが True', () => {
            expect(
                JournalEntry.isJournalEntrySupported(
                    new AccountedMonetaryBizIO({ timetable, db })
                )
            ).toBeTruthy();
        });
    });

    describe('journalEntry', () => {
        describe('正常： 全部 AccountedBizIO & 貸方・借方ともに複数 & total 同じ', () => {
            test('勘定科目と貸方・借方による自動加算・減算', () => {
                // step1 設定
                timetable.currentIndex = 1;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['BS_CASH_AND_DEPOSITS', new Decimal('800')],
                        ['BS_ACCOUNTS_RECEIVABLE', new Decimal('200')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['BS_LIABILITIES', new Decimal('600')],
                        ['BS_NET_ASSETS', new Decimal('400')],
                    ])
                );
                expect(
                    db.selectById('BS_CASH_AND_DEPOSITS')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('800'),
                        new Decimal('800'),
                    ],
                ]);
                expect(
                    db.selectById('BS_ACCOUNTS_RECEIVABLE')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('200'),
                        new Decimal('200'),
                    ],
                ]);
                expect(
                    db.selectById('BS_LIABILITIES')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('600'),
                        new Decimal('600'),
                    ],
                ]);
                expect(db.selectById('BS_NET_ASSETS')?.exportAsTable()).toEqual(
                    [
                        [
                            'AccountedMonetaryBizIO',
                            new Decimal('0'),
                            new Decimal('400'),
                            new Decimal('400'),
                        ],
                    ]
                );

                // step２ 反対設定
                timetable.currentIndex = 2;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['BS_LIABILITIES', new Decimal('600')],
                        ['BS_NET_ASSETS', new Decimal('400')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['BS_CASH_AND_DEPOSITS', new Decimal('800')],
                        ['BS_ACCOUNTS_RECEIVABLE', new Decimal('200')],
                    ])
                );
                expect(
                    db.selectById('BS_CASH_AND_DEPOSITS')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('800'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('BS_ACCOUNTS_RECEIVABLE')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('200'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('BS_LIABILITIES')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('600'),
                        new Decimal('0'),
                    ],
                ]);
                expect(db.selectById('BS_NET_ASSETS')?.exportAsTable()).toEqual(
                    [
                        [
                            'AccountedMonetaryBizIO',
                            new Decimal('0'),
                            new Decimal('400'),
                            new Decimal('0'),
                        ],
                    ]
                );
            });

            test('勘定科目と貸方・借方による自動加算・減算　逆順', () => {
                // step1 設定
                timetable.currentIndex = 1;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['BS_LIABILITIES', new Decimal('600')],
                        ['BS_NET_ASSETS', new Decimal('400')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['BS_CASH_AND_DEPOSITS', new Decimal('800')],
                        ['BS_ACCOUNTS_RECEIVABLE', new Decimal('200')],
                    ])
                );
                expect(
                    db.selectById('BS_CASH_AND_DEPOSITS')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-800'),
                        new Decimal('-800'),
                    ],
                ]);
                expect(
                    db.selectById('BS_ACCOUNTS_RECEIVABLE')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-200'),
                        new Decimal('-200'),
                    ],
                ]);
                expect(
                    db.selectById('BS_LIABILITIES')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-600'),
                        new Decimal('-600'),
                    ],
                ]);
                expect(db.selectById('BS_NET_ASSETS')?.exportAsTable()).toEqual(
                    [
                        [
                            'AccountedMonetaryBizIO',
                            new Decimal('0'),
                            new Decimal('-400'),
                            new Decimal('-400'),
                        ],
                    ]
                );

                // step２ 反対設定
                timetable.currentIndex = 2;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['BS_CASH_AND_DEPOSITS', new Decimal('800')],
                        ['BS_ACCOUNTS_RECEIVABLE', new Decimal('200')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['BS_LIABILITIES', new Decimal('600')],
                        ['BS_NET_ASSETS', new Decimal('400')],
                    ])
                );
                expect(
                    db.selectById('BS_CASH_AND_DEPOSITS')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-800'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('BS_ACCOUNTS_RECEIVABLE')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-200'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('BS_LIABILITIES')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('-600'),
                        new Decimal('0'),
                    ],
                ]);
                expect(db.selectById('BS_NET_ASSETS')?.exportAsTable()).toEqual(
                    [
                        [
                            'AccountedMonetaryBizIO',
                            new Decimal('0'),
                            new Decimal('-400'),
                            new Decimal('0'),
                        ],
                    ]
                );
            });
        });

        describe('異常系', () => {
            test('一部 AccountedBizIO ではない', () => {
                timetable.currentIndex = 1;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['MonetaryBizIO:PL_EXPENSES', new Decimal('1000')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['PL_REVENUE', new Decimal('1000')],
                    ])
                );
                expect(db.selectById('PL_REVENUE')?.exportAsTable()).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('MonetaryBizIO:PL_EXPENSES')?.exportAsTable()
                ).toEqual([
                    [
                        'MonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                ]);
            });

            test('全部 AccountedBizIO だが 貸方・借方 の合計が異なる', () => {
                timetable.currentIndex = 1;
                JournalEntry.journalEntry(
                    timetable,
                    db,
                    new Map<BizIOId, Decimal>([
                        ['BS_CASH_AND_DEPOSITS', new Decimal('800')],
                    ]),
                    new Map<BizIOId, Decimal>([
                        ['BS_LIABILITIES', new Decimal('600')],
                    ])
                );
                expect(
                    db.selectById('BS_CASH_AND_DEPOSITS')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                ]);
                expect(
                    db.selectById('BS_LIABILITIES')?.exportAsTable()
                ).toEqual([
                    [
                        'AccountedMonetaryBizIO',
                        new Decimal('0'),
                        new Decimal('0'),
                        new Decimal('0'),
                    ],
                ]);
            });
        });
    });
});
