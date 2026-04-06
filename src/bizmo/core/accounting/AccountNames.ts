/**
 * 勘定科目
 *
 * Bizmoで標準的にサポートする勘定科目。
 * EDINETを参考にするも完全に準拠するわけではないので注意。
 *
 * 参考
 * 金融庁 2020年版 EDINET タクソノミの公表について
 * https://www.fsa.go.jp/search/20191101.html
 *
 * = 実装 =
 * Unionと型エイリアスを利用した疑似Enumを利用している。
 * 本来は、素となるファイルからジェネレートされるべき。。
 */
export const BS_ASSETS = {
    // B/S debit 資産
    BS_ASSETS: 10000, // 'Assets', '資産',
    BS_CURRENT_ASSETS: 11000, // 'Current assets', '流動資産'],
    BS_CASH_AND_DEPOSITS: 11100, // 'Cash and deposits', '現金及び預金'],
    BS_ACCOUNTS_RECEIVABLE: 11200, // 'Accounts receivable -trade', '売掛金'],
    BS_INVENTORIES: 11300, // 'Inventories', 'たな卸資産'],
    BS_MERCHANDISE: 11310, // 'Merchandise and finished goods','たな卸資産：商品及び製品'],
    BS_MATERIALS: 11320, // 'Raw materials and materials','たな卸資産：原料及び材料',],
    BS_WIP_WORK: 11330, // 'Work in process and partly-finished work','たな卸資産：仕掛品及び半成工事',],
    BS_NON_CURRENT_ASSETS: 12000, // 'Non-current assets', '固定資産'],
    BS_TANGIBLE_ASSETS: 12100, // 'Property, plant and equipment','有形固定資産',],
    BS_BUILDINGS: 12110, // 'Buildings and other facilities', '建物及び附属設備'],
    BS_INTANGIBLE_ASSETS: 12200, // 'Intangible assets', '無形固定資産'], // 事業に利用する各種権利等
    BS_SOFTWARE: 12210, // 'Software', 'ソフトウエア'],
    BS_SOFTWARE_WIP: 12220, // 'Software in progress', 'ソフトウエア仮勘定'],
    BS_OTHER_ASSETS: 13000, // 'Investments and other assets','投資その他の資産',],
};
export const BS_LIABILITIES = {
    // B/S credit 負債
    BS_LIABILITIES: 20000, // 'Liabilities', '負債'],
    BS_CURRENT_LIABILITIES: 21000, // 'Current liabilities', '流動負債'],
    BS_ACCOUNTS_PAYABLE_TRADE: 21100, // 'Accounts payable -trade', '買掛金'],
    BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE: 21200, // 'Accounts payable -other, and accrued expenses','未払金及び未払費用',],
    BS_NON_CURRENT_LIABILITIES: 22000, // 'Non-current liabilities', '固定負債'],
    BS_BONDS_PAYABLE: 22100, // 'Bonds payable', '社債'],
    BS_LONG_TERM_BORROWINGS: 22200, // 'Long-term borrowings', '長期借入金'],
};
export const BS_NET_ASSETS = {
    // B/S credit 純資産
    BS_NET_ASSETS: 30000, // 'Net assets', '純資産'],
    BS_SHAREHOLDERS_EQUITY: 31000, // 'Shareholders equity', '株主資本'],
    BS_SHARE_CAPITAL: 31100, // 'Share capital', '資本金'],
    BS_CAPITAL_SURPLUS: 31200, // 'Capital surplus', '資本剰余金'],
    BS_RETAINED_EARNINGS: 31300, // 'Retained earnings', '利益剰余金'],
};
export const PL_REVENUE = {
    // P/L credit 収益
    PL_REVENUE: 40000, // 'Revenue', '収益'],
    PL_OPERATING_REVENUE: 41000, // 'Operating revenue', '売上高'],
    PL_NON_OPERATING_INCOME: 42000, // 'Non-operating income', '営業外収益'],
    PL_EXTRAORDINARY_INCOME: 43000, // 'Extraordinary income', '特別利益'],
};
export const PL_EXPENSES = {
    // P/L debit 費用・売上原価
    PL_EXPENSES: 50000, // 'expenses', '費用'],
    PL_OPERATING_EXPENSES: 51000, // 'Operating expenses','営業活動による費用・売上原価',],
    PL_COST_OF_SALES: 51100, // 'Cost of sales', '売上原価'],
    PL_SG_AND_A: 51200, // 'Selling, general and administrative expenses','販売費及び一般管理費',],
    PL_SALES_COMMISSION: 51201, // 'Sales commission', '販売手数料'],
    PL_ADVERTISING_EXPENSES: 51202, // 'Advertising expenses', '広告宣伝費'],
    PL_REMUNERATION_FOR_DIRECTORS: 51203, // 'Remuneration for directors','役員報酬',],
    PL_SALARIES: 51204, // 'Salaries', '給料'],
    PL_TAXES_DUES: 51205, // 'Taxes and dues', '租税公課'],
    PL_DEPRECATION: 51206, // 'Depreciation', '減価償却費'],
    PL_R_D_EXPENSE: 51207, // 'Research and development expenses', '研究開発費'],
    PL_LEGAL_WELFARE_EXPENSES: 51208, // 'Legal welfare expenses', '法定福利費'],
    PL_FEE_EXPENSES: 51209, // 'Fee expenses', '支払報酬'],
    PL_COMMISSION_EXPENSE: 51210, // 'Commission expenses', '支払手数料'],
    PL_OUTSOURCING_EXPENSES: 51211, // 'Outsourcing expenses', '業務委託費'],
    PL_RENT_EXPENSES_ON_LAND_AND_BUILDING: 51212, // 'Rent expenses on land and buildings','地代家賃',],
    PL_AGENT_FEE: 51213, // 'Agent fee', '代理店手数料'],
    PL_TRANSPORTATION_AND_STORAGE_COSTS: 51214, // 'Transportation and storage costs','運送費及び保管費',],
    PL_NON_OPERATING_EXPENSES: 52000, // 'Non-operating expenses', '営業外費用'],
    PL_EXTRAORDINARY_EXPENSES: 53000, // 'Extraordinary losses', '特別損失'],
};
export const AccountNames = {
    INHERITANCE: 0, // 'Same account of parent', '親グループと同じ科目',
    ...BS_ASSETS,
    ...BS_LIABILITIES,
    ...BS_NET_ASSETS,
    ...PL_REVENUE,
    ...PL_EXPENSES,
} as const;
export type AccountNames = typeof AccountNames[keyof typeof AccountNames];

/**
 * 勘定科目：多言語翻訳
 */
export type AccountNameMultilingual = {
    en: string;
    jp: string;
};

/**
 *AccountNames
 */
export class AccountHElem {
    /**
     *
     * @param {AccountNames} key
     * @param {Array<AccountHElem>} children
     */
    constructor(
        public key: AccountNames,
        public children?: Array<AccountHElem>
    ) {}
}

export const AccountHierarchy: Array<AccountHElem> = [
    new AccountHElem(AccountNames.BS_ASSETS, [
        new AccountHElem(AccountNames.BS_CURRENT_ASSETS, [
            new AccountHElem(AccountNames.BS_CASH_AND_DEPOSITS),
            new AccountHElem(AccountNames.BS_ACCOUNTS_RECEIVABLE),
            new AccountHElem(AccountNames.BS_INVENTORIES, [
                new AccountHElem(AccountNames.BS_MERCHANDISE),
                new AccountHElem(AccountNames.BS_MATERIALS),
                new AccountHElem(AccountNames.BS_WIP_WORK),
            ]),
        ]),
        new AccountHElem(AccountNames.BS_NON_CURRENT_ASSETS, [
            new AccountHElem(AccountNames.BS_TANGIBLE_ASSETS, [
                new AccountHElem(AccountNames.BS_BUILDINGS),
            ]),
            new AccountHElem(AccountNames.BS_INTANGIBLE_ASSETS, [
                new AccountHElem(AccountNames.BS_SOFTWARE),
                new AccountHElem(AccountNames.BS_SOFTWARE_WIP),
            ]),
        ]),
        new AccountHElem(AccountNames.BS_OTHER_ASSETS),
    ]),
    new AccountHElem(AccountNames.BS_LIABILITIES, [
        new AccountHElem(AccountNames.BS_CURRENT_LIABILITIES, [
            new AccountHElem(AccountNames.BS_ACCOUNTS_PAYABLE_TRADE),
            new AccountHElem(
                AccountNames.BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE
            ),
        ]),
        new AccountHElem(AccountNames.BS_NON_CURRENT_LIABILITIES, [
            new AccountHElem(AccountNames.BS_BONDS_PAYABLE),
            new AccountHElem(AccountNames.BS_LONG_TERM_BORROWINGS),
        ]),
    ]),
    new AccountHElem(AccountNames.BS_NET_ASSETS, [
        new AccountHElem(AccountNames.BS_SHAREHOLDERS_EQUITY, [
            new AccountHElem(AccountNames.BS_SHARE_CAPITAL),
            new AccountHElem(AccountNames.BS_CAPITAL_SURPLUS),
            new AccountHElem(AccountNames.BS_RETAINED_EARNINGS),
        ]),
    ]),
    new AccountHElem(AccountNames.PL_REVENUE, [
        new AccountHElem(AccountNames.PL_OPERATING_REVENUE),
        new AccountHElem(AccountNames.PL_NON_OPERATING_INCOME),
        new AccountHElem(AccountNames.PL_EXTRAORDINARY_INCOME),
    ]),
    new AccountHElem(AccountNames.PL_EXPENSES, [
        new AccountHElem(AccountNames.PL_OPERATING_EXPENSES, [
            new AccountHElem(AccountNames.PL_COST_OF_SALES),
            new AccountHElem(AccountNames.PL_SG_AND_A, [
                new AccountHElem(AccountNames.PL_SALES_COMMISSION),
                new AccountHElem(AccountNames.PL_ADVERTISING_EXPENSES),
                new AccountHElem(AccountNames.PL_REMUNERATION_FOR_DIRECTORS),
                new AccountHElem(AccountNames.PL_SALARIES),
                new AccountHElem(AccountNames.PL_TAXES_DUES),
                new AccountHElem(AccountNames.PL_DEPRECATION),
                new AccountHElem(AccountNames.PL_R_D_EXPENSE),
                new AccountHElem(AccountNames.PL_LEGAL_WELFARE_EXPENSES),
                new AccountHElem(AccountNames.PL_FEE_EXPENSES),
                new AccountHElem(AccountNames.PL_COMMISSION_EXPENSE),
                new AccountHElem(AccountNames.PL_OUTSOURCING_EXPENSES),
                new AccountHElem(
                    AccountNames.PL_RENT_EXPENSES_ON_LAND_AND_BUILDING
                ),
                new AccountHElem(AccountNames.PL_AGENT_FEE),
                new AccountHElem(
                    AccountNames.PL_TRANSPORTATION_AND_STORAGE_COSTS
                ),
            ]),
        ]),
        new AccountHElem(AccountNames.PL_NON_OPERATING_EXPENSES),
        new AccountHElem(AccountNames.PL_EXTRAORDINARY_EXPENSES),
    ]),
];

/**
 * 勘定科目に関するユーティリティクラス
 */
export class AccountNamesUtil {
    /**
     * 資産 科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isAssets(target: AccountNames): boolean {
        return (
            BS_ASSETS.BS_ASSETS <= target && target <= BS_ASSETS.BS_OTHER_ASSETS
        );
    }

    /**
     * 負債 科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isLiabilities(target: AccountNames): boolean {
        return (
            BS_LIABILITIES.BS_LIABILITIES <= target &&
            target <= BS_LIABILITIES.BS_LONG_TERM_BORROWINGS
        );
    }

    /**
     * 純資産 科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isNetAssets(target: AccountNames): boolean {
        return (
            BS_NET_ASSETS.BS_NET_ASSETS <= target &&
            target <= BS_NET_ASSETS.BS_RETAINED_EARNINGS
        );
    }

    /**
     * 収益 科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isRevenue(target: AccountNames): boolean {
        return (
            PL_REVENUE.PL_REVENUE <= target &&
            target <= PL_REVENUE.PL_EXTRAORDINARY_INCOME
        );
    }

    /**
     * 費用 科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isExpenses(target: AccountNames): boolean {
        return (
            PL_EXPENSES.PL_EXPENSES <= target &&
            target <= PL_EXPENSES.PL_EXTRAORDINARY_EXPENSES
        );
    }

    /**
     * 借方科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isDebitAccount(target: AccountNames): boolean {
        return (
            AccountNamesUtil.isAssets(target) ||
            AccountNamesUtil.isExpenses(target)
        );
    }

    /**
     * 貸方科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isCreditAccount(target: AccountNames): boolean {
        return (
            AccountNamesUtil.isLiabilities(target) ||
            AccountNamesUtil.isNetAssets(target) ||
            AccountNamesUtil.isRevenue(target)
        );
    }

    /**
     * BS科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isBSAccount(target: AccountNames): boolean {
        return (
            AccountNamesUtil.isAssets(target) ||
            AccountNamesUtil.isLiabilities(target) ||
            AccountNamesUtil.isNetAssets(target)
        );
    }

    /**
     * PL科目かどうかを判定する
     * @param {AccountNames} target
     * @return {boolean}
     */
    public static isPLAccount(target: AccountNames): boolean {
        return (
            AccountNamesUtil.isRevenue(target) ||
            AccountNamesUtil.isExpenses(target)
        );
    }
}
