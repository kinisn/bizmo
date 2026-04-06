import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { FunnelComponent } from 'bizmo/core/bizIO/component/FunnelComponent';
import { RateComponent } from 'bizmo/core/bizIO/component/RateComponent';
import { UnitComponent } from 'bizmo/core/bizIO/component/UnitComponent';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import SelectInput from 'bizmoView/common/form/SelectInput';
import { t } from 'i18next';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BizIOComponentState } from '../BizIOComponent';
import { BizIOTypeIcon } from '../icon/IconUtil';
import {
    CommonCollectionBizIOForm,
    initializeCommonCollectionBizIOForm,
} from './CommonCollectionBizIOForm';
import { CommonForm, CommonFormBizIOType } from './CommonForm';

/**
 * 汎用BizIO Type
 */
export type GeneralSingleBizIOType = 'BizIO';
export type GeneralCollectionBizIOType =
    | 'CollectionBizIO' // Folder モード
    | 'CollectionBizIO:TOTAL_AMOUNT' // 総和 モード
    | 'CollectionBizIO:TOTAL_MULTIPLE' // 総乗 モード
    | 'CollectionBizIO:ACCUMULATE' // 累積 モード
    | 'CollectionBizIO:Calculate'; // Calculate 汎用モード

export type GeneralComponentBizIOType =
    | 'UnitComponent'
    | 'RateComponent'
    | 'CohortComponent'
    | 'FunnelComponent';
export type GeneralBizActorType = 'BizActors';

export type GeneralBizIOType =
    | GeneralSingleBizIOType
    | GeneralCollectionBizIOType
    | GeneralComponentBizIOType
    | GeneralBizActorType;

export type AccountingBizIOType =
    | 'AccountingComponent'
    | 'AccountedMonetaryBizIO';

export type BizIOType = GeneralBizIOType;

// フィルター対応版の全BizIOType
export type FilterableBizIOType = BizIOType | 'All';

// == Specific Type ==

export type UnitComponentAutoComplementSelector = {
    unitComponent_amountComplement: number;
};

export type RateComponentSpecific = {
    rateComponent_denominator_id: BizIOId;
    rateComponent_numerator_id: BizIOId;
};

export type FunnelComponentSpecific = {
    funnelComponent_biz_io_order: Array<{ bizId: BizIOId }>;
};

// == BizIOComponent AddChild  ==
export type BizIOComponentAddChildrenForm = {
    addChildren: Array<{ bizId: BizIOId }>;
};

/**
 * BizIOComponent Form
 *
 * 全BizIO のFormをFlattenしたもの
 */
export type BizIOComponentForm = CommonCollectionBizIOForm &
    BizIOComponentAddChildrenForm &
    UnitComponentAutoComplementSelector &
    RateComponentSpecific &
    FunnelComponentSpecific;

export function initializeBizIOComponentForm(
    treeState: BizIOComponentState,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): BizIOComponentForm {
    // == Specific ==
    // UnitComponent
    let unitComponent_amountComplement = 1;
    if (treeState.formData?.unitComponent_amountComplement) {
        unitComponent_amountComplement =
            treeState.formData.unitComponent_amountComplement;
    } else if (bizIO instanceof UnitComponent) {
        unitComponent_amountComplement = bizIO.amountComplement ? 1 : 0;
    }

    // RateComponent
    let rateComponent_denominator_id = '';
    if (treeState.formData?.rateComponent_denominator_id) {
        rateComponent_denominator_id =
            treeState.formData.rateComponent_numerator_id;
    } else if (bizIO instanceof RateComponent) {
        rateComponent_denominator_id = bizIO.denominator.id;
    }

    let rateComponent_numerator_id = '';
    if (treeState.formData?.rateComponent_numerator_id) {
        rateComponent_numerator_id =
            treeState.formData.rateComponent_numerator_id;
    } else if (bizIO instanceof RateComponent) {
        rateComponent_numerator_id = bizIO.numerator.id;
    }

    // FunnelComponent
    let funnelComponent_biz_io_order: Array<{ bizId: BizIOId }> = [];
    if (treeState.formData?.funnelComponent_biz_io_order) {
        funnelComponent_biz_io_order =
            treeState.formData.funnelComponent_biz_io_order;
    } else if (bizIO instanceof FunnelComponent) {
        funnelComponent_biz_io_order = bizIO.orderedBizIds.map((value) => {
            return { bizId: value };
        });
    }

    const defaultValues = {
        ...initializeCommonCollectionBizIOForm(treeState, bizIO),
        // == BizIOComponentAddChildrenForm ==
        addChildren: treeState.formData?.addChildren ?? [],

        // == Specific ==
        // UnitComponent
        unitComponent_amountComplement: unitComponent_amountComplement,

        // RateComponent
        rateComponent_denominator_id: rateComponent_denominator_id,
        rateComponent_numerator_id: rateComponent_numerator_id,

        // FunnelComponent
        funnelComponent_biz_io_order: funnelComponent_biz_io_order,
    };
    //console.log('initializeBizIOComponentForm', defaultValues, treeState);
    return defaultValues;
}

export function detectGeneralBizIOType(
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): GeneralBizIOType | undefined {
    if (bizIO instanceof BizActors) {
        return 'BizActors';
    } else if (bizIO instanceof UnitComponent) {
        return 'UnitComponent';
    } else if (bizIO instanceof RateComponent) {
        return 'RateComponent';
    } else if (bizIO instanceof CohortComponent) {
        return 'CohortComponent';
    } else if (bizIO instanceof FunnelComponent) {
        return 'FunnelComponent';
    }

    if (bizIO instanceof CollectionBizIO) {
        switch (bizIO.summarizeMode) {
            case 'TOTAL_AMOUNT':
                return 'CollectionBizIO:TOTAL_AMOUNT';
            case 'TOTAL_MULTIPLE':
                return 'CollectionBizIO:TOTAL_MULTIPLE';
            case 'ACCUMULATE':
                return 'CollectionBizIO:ACCUMULATE';
            case 'TOTAL_DIVIDE':
            case 'LINEAR':
            case 'CUSTOM':
                return 'CollectionBizIO:Calculate'; // 汎用モード
            default: // folderモード
                return 'CollectionBizIO';
        }
    } else if (bizIO instanceof BizIO) {
        return 'BizIO';
    }
}

export const BizIOSelectorLabel = (props: {
    label: string;
    bizIOType: BizIOType;
}) => {
    const { label, bizIOType } = props;
    return (
        <span className="flex items-center">
            <span className="pr-4">{label}</span>
            <BizIOTypeIcon bizIOType={bizIOType} />
        </span>
    );
};

export function detectBizIOTypeDocs(type?: BizIOType): {
    label: string;
    desc: string;
} {
    switch (type) {
        case 'BizIO':
            return {
                label: t('CommonForm.BizIO.label'),
                desc: t('CommonForm.BizIO.desc'),
            };
        case 'CollectionBizIO:TOTAL_AMOUNT':
            return {
                label: t('CommonForm.CollectionBizIO_TOTAL_AMOUNT.label'),
                desc: t('CommonForm.CollectionBizIO_TOTAL_AMOUNT.desc'),
            };
        case 'CollectionBizIO:TOTAL_MULTIPLE':
            return {
                label: t('CommonForm.CollectionBizIO_TOTAL_MULTIPLE.label'),
                desc: t('CommonForm.CollectionBizIO_TOTAL_MULTIPLE.desc'),
            };
        case 'RateComponent':
            return {
                label: t('CommonForm.RateComponent.label'),
                desc: t('CommonForm.RateComponent.desc'),
            };
        case 'CollectionBizIO:Calculate':
            return {
                label: t('CommonForm.CollectionBizIO_Calculate.label'),
                desc: t('CommonForm.CollectionBizIO_Calculate.desc'),
            };
        case 'CollectionBizIO:ACCUMULATE':
            return {
                label: t('CommonForm.CollectionBizIO_ACCUMULATE.label'),
                desc: t('CommonForm.CollectionBizIO_ACCUMULATE.desc'),
            };
        case 'CollectionBizIO':
            return {
                label: t('CommonForm.CollectionBizIO.label'),
                desc: t('CommonForm.CollectionBizIO.desc'),
            };
        case 'FunnelComponent':
            return {
                label: t('CommonForm.FunnelComponent.label'),
                desc: t('CommonForm.FunnelComponent.desc'),
            };
        case 'CohortComponent':
            return {
                label: t('CommonForm.CohortComponent.label'),
                desc: t('CommonForm.CohortComponent.desc'),
            };
        case 'UnitComponent':
            return {
                label: t('CommonForm.UnitComponent.label'),
                desc: t('CommonForm.UnitComponent.desc'),
            };
        case 'BizActors':
            return {
                label: t('CommonForm.BizActors.label'),
                desc: t('CommonForm.BizActors.desc'),
            };
        default:
            return { label: '', desc: '' };
    }
}

export function makeBizIOSelectorLabel(type?: BizIOType): ReactNode {
    const data = detectBizIOTypeDocs(type);
    return type !== undefined ? (
        <BizIOSelectorLabel label={data.label} bizIOType={type} />
    ) : (
        <></>
    );
}

export const BizIOTypeSelector = <T extends CommonFormBizIOType = CommonForm>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="type"
            label={t('CommonForm.type')}
            items={[
                {
                    value: 'BizIO',
                    label: makeBizIOSelectorLabel('BizIO'),
                },
                {
                    value: 'CollectionBizIO:TOTAL_AMOUNT',
                    label: makeBizIOSelectorLabel(
                        'CollectionBizIO:TOTAL_AMOUNT'
                    ),
                },
                {
                    value: 'CollectionBizIO:TOTAL_MULTIPLE',
                    label: makeBizIOSelectorLabel(
                        'CollectionBizIO:TOTAL_MULTIPLE'
                    ),
                },
                {
                    value: 'RateComponent',
                    label: makeBizIOSelectorLabel('RateComponent'),
                    //disabled: true,
                },
                {
                    value: 'CollectionBizIO:Calculate',
                    label: makeBizIOSelectorLabel('CollectionBizIO:Calculate'),
                    disabled: true,
                },
                {
                    value: 'CollectionBizIO:ACCUMULATE',
                    label: makeBizIOSelectorLabel('CollectionBizIO:ACCUMULATE'),
                },
                {
                    value: 'CollectionBizIO',
                    label: makeBizIOSelectorLabel('CollectionBizIO'),
                },
                {
                    value: 'FunnelComponent',
                    label: makeBizIOSelectorLabel('FunnelComponent'),
                },
                {
                    value: 'CohortComponent',
                    label: makeBizIOSelectorLabel('CohortComponent'),
                    disabled: true,
                },
                {
                    value: 'UnitComponent',
                    label: makeBizIOSelectorLabel('UnitComponent'),
                },
                {
                    value: 'BizActors',
                    label: makeBizIOSelectorLabel('BizActors'),
                },
            ]}
            {...props}
        />
    );
};

export const BizIOSelectorForFilter = <
    T extends CommonFormBizIOType<FilterableBizIOType>
>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="type"
            label={t('CommonForm.type')}
            items={[
                {
                    value: 'All',
                    label: (
                        <span className="flex items-center">
                            <span className="pr-4">
                                {t('CommonForm.All.label')}
                            </span>
                        </span>
                    ),
                },
                {
                    value: 'BizIO',
                    label: makeBizIOSelectorLabel('BizIO'),
                },
                {
                    value: 'CollectionBizIO:TOTAL_AMOUNT',
                    label: makeBizIOSelectorLabel(
                        'CollectionBizIO:TOTAL_AMOUNT'
                    ),
                },
                {
                    value: 'CollectionBizIO:TOTAL_MULTIPLE',
                    label: makeBizIOSelectorLabel(
                        'CollectionBizIO:TOTAL_MULTIPLE'
                    ),
                },
                {
                    value: 'RateComponent',
                    label: makeBizIOSelectorLabel('RateComponent'),
                    //disabled: true,
                },
                {
                    value: 'CollectionBizIO:Calculate',
                    label: makeBizIOSelectorLabel('CollectionBizIO:Calculate'),
                    disabled: true,
                },
                {
                    value: 'CollectionBizIO:ACCUMULATE',
                    label: makeBizIOSelectorLabel('CollectionBizIO:ACCUMULATE'),
                },
                {
                    value: 'CollectionBizIO',
                    label: makeBizIOSelectorLabel('CollectionBizIO'),
                },
                {
                    value: 'FunnelComponent',
                    label: makeBizIOSelectorLabel('FunnelComponent'),
                },
                {
                    value: 'CohortComponent',
                    label: makeBizIOSelectorLabel('CohortComponent'),
                    disabled: true,
                },
                {
                    value: 'UnitComponent',
                    label: makeBizIOSelectorLabel('UnitComponent'),
                },
                {
                    value: 'BizActors',
                    label: makeBizIOSelectorLabel('BizActors'),
                },
            ]}
            {...props}
        />
    );
};

// ==== Specific ====

// UnitComponent
export const AutoComplementSelector = <
    T extends UnitComponentAutoComplementSelector = BizIOComponentForm
>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="unitComponent_amountComplement"
            label={t('BizIOComponentForm.unitComponent_amountComplement')}
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

export const AutoComplementDescription = (props: {
    autoComplement: boolean;
}) => {
    const { autoComplement } = props;
    const { t } = useTranslation();
    let desc;
    if (autoComplement) {
        desc = t('CommonBizIOForm.useLast');
    } else {
        desc = t('CommonBizIOForm.useZero');
    }
    return (
        <DescriptionParts
            label={t('BizIOComponentForm.unitComponent_amountComplement')}
        >
            {desc}
        </DescriptionParts>
    );
};

// RateComponent
