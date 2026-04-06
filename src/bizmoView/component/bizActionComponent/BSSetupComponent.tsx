import { Button } from '@mui/material';
import { BalanceSheetSetupBizAction } from 'bizmo/action/template/FinancingActions';
import {
    AccountNames,
    AccountNamesUtil,
} from 'bizmo/core/accounting/AccountNames';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import Decimal from 'decimal.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BS_ACCOUNT_LIST: AccountNames[] = [
    AccountNames.BS_CASH_AND_DEPOSITS,
    AccountNames.BS_ACCOUNTS_RECEIVABLE,
    AccountNames.BS_INVENTORIES,
    AccountNames.BS_NON_CURRENT_ASSETS,
    AccountNames.BS_TANGIBLE_ASSETS,
    AccountNames.BS_INTANGIBLE_ASSETS,
    AccountNames.BS_SOFTWARE,
    AccountNames.BS_OTHER_ASSETS,
    AccountNames.BS_ACCOUNTS_PAYABLE_TRADE,
    AccountNames.BS_ACCOUNTS_PAYABLE_OTHER_ACCRUED_EXPENSE,
    AccountNames.BS_BONDS_PAYABLE,
    AccountNames.BS_LONG_TERM_BORROWINGS,
    AccountNames.BS_SHARE_CAPITAL,
    AccountNames.BS_CAPITAL_SURPLUS,
    AccountNames.BS_RETAINED_EARNINGS,
];

export const BSSetupComponent = (props: {
    targetBizAction: BalanceSheetSetupBizAction;
}) => {
    const { targetBizAction } = props;
    const { t } = useTranslation();
    const bizmo = useBizmo();
    const [version, setVersion] = useState(0);

    const bsDict = targetBizAction.getBSDict() ?? new Map<AccountNames, Decimal>();

    const handleChange = (accountName: AccountNames, value: string) => {
        try {
            const decimal = value.trim() === '' ? new Decimal(0) : new Decimal(value.trim());
            bsDict.set(accountName, decimal);
        } catch {
            // 無効な値は無視
        }
    };

    const handleSave = () => {
        bizmo.putBizAction(targetBizAction as any);
        setVersion((v) => v + 1);
    };

    void version;

    return (
        <div className="p-4">
            <div className="text-2xl mb-4">{targetBizAction.name}</div>
            <div className="text-sm text-zinc-400 mb-4">
                初期ターム（{targetBizAction.timetable.terms[0]?.toLocaleDateString('ja-JP') ?? ''}）のB/S初期値を設定します。
            </div>

            <DescriptionParts label="資産（借方）">
                <div className="space-y-2 p-2">
                    {BS_ACCOUNT_LIST.filter((a) =>
                        AccountNamesUtil.isDebitAccount(a)
                    ).map((accountName) => (
                        <BSRow
                            key={accountName}
                            accountName={accountName}
                            value={bsDict.get(accountName)}
                            onChange={(v) => handleChange(accountName, v)}
                        />
                    ))}
                </div>
            </DescriptionParts>

            <DescriptionParts label="負債（貸方）">
                <div className="space-y-2 p-2">
                    {BS_ACCOUNT_LIST.filter(
                        (a) =>
                            AccountNamesUtil.isCreditAccount(a) &&
                            a < 30000 // 負債は 20000-29999
                    ).map((accountName) => (
                        <BSRow
                            key={accountName}
                            accountName={accountName}
                            value={bsDict.get(accountName)}
                            onChange={(v) => handleChange(accountName, v)}
                        />
                    ))}
                </div>
            </DescriptionParts>

            <DescriptionParts label="純資産（貸方）">
                <div className="space-y-2 p-2">
                    {BS_ACCOUNT_LIST.filter(
                        (a) => a >= 30000 // 純資産は 30000以上
                    ).map((accountName) => (
                        <BSRow
                            key={accountName}
                            accountName={accountName}
                            value={bsDict.get(accountName)}
                            onChange={(v) => handleChange(accountName, v)}
                        />
                    ))}
                </div>
            </DescriptionParts>

            <Button
                variant="contained"
                fullWidth
                className="mt-4"
                onClick={handleSave}
            >
                <MaterialIcon codePoint={IconType.Save} className="mr-2" />
                {t('common.label.save')}
            </Button>
        </div>
    );
};

const BSRow = (props: {
    accountName: AccountNames;
    value: Decimal | undefined;
    onChange: (value: string) => void;
}) => {
    const { accountName, value, onChange } = props;
    const { t } = useTranslation();
    const label = t(`account:${accountName}`, { defaultValue: String(accountName) }) as string;

    return (
        <div className="flex items-center gap-3">
            <div className="w-48 text-sm">{label}</div>
            <input
                type="text"
                className="flex-1 bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-1.5 text-sm font-mono text-right"
                defaultValue={value?.toString() ?? '0'}
                onChange={(e) => onChange(e.target.value)}
                onFocus={(e) => e.target.select()}
            />
            <span className="text-xs text-zinc-400">円</span>
        </div>
    );
};
