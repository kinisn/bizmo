import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import SelectInput from 'bizmoView/common/form/SelectInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useTranslation } from 'react-i18next';
import account from '../../../../i18n/account/ja.json';
import { BizIOComponentState } from '../BizIOComponent';
import { CommonForm, initializeCommonForm } from './CommonForm';

export type CommonBizIOFormAccountName = {
    accountName: AccountNames;
};
export type CommonBizIOFormComplement = {
    complement: number;
};
export type CommonBizIOFormIsMonetary = {
    isMonetary: number;
};

/**
 * 汎用BizIOフォームの共通部分
 */
export type CommonBizIOForm = CommonForm &
    CommonBizIOFormAccountName &
    CommonBizIOFormComplement &
    CommonBizIOFormIsMonetary;

export function initializeCommonBizIOForm(
    treeState: BizIOComponentState,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): CommonBizIOForm {
    const defaultValues = {
        ...initializeCommonForm(treeState, bizIO),
        accountName: treeState.formData?.accountName
            ? treeState.formData.accountName
            : bizIO?.accountName ?? AccountNames.INHERITANCE,

        complement:
            treeState.formData?.complement !== undefined
                ? treeState.formData.complement
                : bizIO
                ? bizIO.complement
                    ? 1
                    : 0
                : 1,
        isMonetary:
            treeState.formData?.isMonetary !== undefined
                ? treeState.formData.isMonetary
                : bizIO
                ? bizIO.isMonetary
                    ? 1
                    : 0
                : 0,
    };
    return defaultValues;
}

export const IsMonetarySelector = <
    T extends CommonBizIOFormIsMonetary = CommonBizIOForm
>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="isMonetary"
            label={t('CommonBizIOForm.isMonetary')}
            items={[
                {
                    value: 0,
                    label: (
                        <span className="flex items-center">
                            <span className="pr-4 inline-block items-center">
                                {t('CommonBizIOForm.amount')}
                            </span>
                            <MaterialIcon codePoint={IconType.OneTwoThree} />
                        </span>
                    ),
                },
                {
                    value: 1,
                    label: (
                        <span className="flex items-center">
                            <span className="pr-4">
                                {t('CommonBizIOForm.monetary')}
                            </span>
                            <MaterialIcon codePoint={IconType.Paid} />
                        </span>
                    ),
                },
            ]}
            {...props}
        />
    );
};

export const IsMonetaryDescription = (props: { isMonetary: boolean }) => {
    const { isMonetary } = props;
    const { t } = useTranslation();
    let desc;
    if (isMonetary) {
        desc = (
            <span className="flex items-center">
                <span className="pr-4">{t('CommonBizIOForm.monetary')}</span>
                <MaterialIcon codePoint={IconType.Paid} />
            </span>
        );
    } else {
        desc = (
            <span className="flex items-center">
                <span className="pr-4 inline-block items-center">
                    {t('CommonBizIOForm.amount')}
                </span>
                <MaterialIcon codePoint={IconType.OneTwoThree} />
            </span>
        );
    }

    return (
        <DescriptionParts label={t('CommonBizIOForm.isMonetary')}>
            {desc}
        </DescriptionParts>
    );
};

export const ComplementSelector = <
    T extends CommonBizIOFormComplement = CommonBizIOForm
>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="complement"
            label={t('CommonBizIOForm.complement')}
            items={[
                {
                    value: 1,
                    label: t('CommonBizIOForm.useLast'),
                },
                {
                    value: 0,
                    label: t('CommonBizIOForm.useZero'),
                },
            ]}
            {...props}
        />
    );
};

export const ComplementDescription = (props: { complement: boolean }) => {
    const { complement } = props;
    const { t } = useTranslation();
    let desc;
    if (complement) {
        desc = t('CommonBizIOForm.useLast');
    } else {
        desc = t('CommonBizIOForm.useZero');
    }

    return (
        <DescriptionParts label={t('CommonBizIOForm.complement')}>
            {desc}
        </DescriptionParts>
    );
};

export const AccountNameSelector = <
    T extends CommonBizIOFormAccountName = CommonBizIOForm
>(
    props: any
) => {
    const { t } = useTranslation();
    const tAccount = useTranslation<'account'>();
    const items = [];
    for (const key in AccountNames) {
        const value = AccountNames[key as keyof typeof AccountNames];
        items.push({
            value: value,
            label: tAccount.t(value.toString() as keyof typeof account),
        });
    }

    return (
        <SelectInput<T>
            name="accountName"
            label={t('CommonBizIOForm.accountName')}
            items={items}
            {...props}
        />
    );
};

export const AccountNameDescription = (props: {
    accountName: AccountNames;
}) => {
    const { accountName } = props;
    const { t } = useTranslation();
    const tAccount = useTranslation<'account'>();
    const desc = tAccount.t(accountName.toString() as keyof typeof account);

    return (
        <DescriptionParts label={t('CommonBizIOForm.accountName')}>
            {desc}
        </DescriptionParts>
    );
};
