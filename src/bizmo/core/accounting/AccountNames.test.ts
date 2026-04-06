import {
    AccountNames,
    AccountNamesUtil,
    BS_ASSETS,
    BS_LIABILITIES,
    BS_NET_ASSETS,
    PL_EXPENSES,
    PL_REVENUE,
} from './AccountNames';

describe('AccountNamesUtil のテスト', () => {
    test('isAssets', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(BS_ASSETS);
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isAssets(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isAssets(accountName)).toBeFalsy();
            }
        });
    });

    test('isLiabilities', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(BS_LIABILITIES);
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(
                    AccountNamesUtil.isLiabilities(accountName)
                ).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isLiabilities(accountName)).toBeFalsy();
            }
        });
    });

    test('isNetAssets', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(BS_NET_ASSETS);
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isNetAssets(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isNetAssets(accountName)).toBeFalsy();
            }
        });
    });

    test('isRevenue', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(PL_REVENUE);
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isRevenue(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isRevenue(accountName)).toBeFalsy();
            }
        });
    });

    test('isExpenses', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(PL_EXPENSES);
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isExpenses(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isExpenses(accountName)).toBeFalsy();
            }
        });
    });

    test('isDebitAccount', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(PL_EXPENSES).concat(
            Object.values(BS_ASSETS)
        );
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(
                    AccountNamesUtil.isDebitAccount(accountName)
                ).toBeTruthy();
            } else {
                expect(
                    AccountNamesUtil.isDebitAccount(accountName)
                ).toBeFalsy();
            }
        });
    });

    test('isCreditAccount', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(BS_LIABILITIES)
            .concat(Object.values(BS_NET_ASSETS))
            .concat(Object.values(PL_REVENUE));
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(
                    AccountNamesUtil.isCreditAccount(accountName)
                ).toBeTruthy();
            } else {
                expect(
                    AccountNamesUtil.isCreditAccount(accountName)
                ).toBeFalsy();
            }
        });
    });

    test('isBSAccount', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(BS_ASSETS)
            .concat(Object.values(BS_LIABILITIES))
            .concat(Object.values(BS_NET_ASSETS));
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isBSAccount(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isBSAccount(accountName)).toBeFalsy();
            }
        });
    });

    test('isPLAccount', () => {
        const accountNameKeys = Object.values(AccountNames);
        const target = Object.values(PL_EXPENSES).concat(
            Object.values(PL_REVENUE)
        );
        accountNameKeys.forEach((accountName) => {
            if (target.includes(accountName)) {
                expect(AccountNamesUtil.isPLAccount(accountName)).toBeTruthy();
            } else {
                expect(AccountNamesUtil.isPLAccount(accountName)).toBeFalsy();
            }
        });
    });
});
