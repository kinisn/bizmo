import { Chip } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import SelectInput from 'bizmoView/common/form/SelectInput';
import { useTranslation } from 'react-i18next';
import { BizIOComponentState } from '../BizIOComponent';
import { CommonBizIOForm, initializeCommonBizIOForm } from './CommonBizIOForm';

export type CommonCollectionBizIOFormSummarizeMode = {
    summarizeMode: CollectionSummarizeMode;
};

/**
 * 汎用CollectionBizIOフォームの共通部分
 */
export type CommonCollectionBizIOForm = CommonBizIOForm &
    CommonCollectionBizIOFormSummarizeMode & {
        //systemLabeledOnly: boolean; // form で管理せず dispatcher で管理する
        //exportWithChildren: boolean; // form で管理せず dispatcher で管理する
    };

export function initializeCommonCollectionBizIOForm(
    treeState: BizIOComponentState,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): CommonCollectionBizIOForm {
    let summarizeMode: CollectionSummarizeMode =
        CollectionSummarizeMode.TOTAL_AMOUNT;
    if (treeState.formData?.summarizeMode) {
        summarizeMode = treeState.formData.summarizeMode;
    } else if (bizIO instanceof CollectionBizIO) {
        summarizeMode = bizIO.summarizeMode;
    }

    const defaultValues = {
        ...initializeCommonBizIOForm(treeState, bizIO),
        summarizeMode: summarizeMode,
        /*
        systemLabeledOnly:
            bizIO instanceof CollectionBizIO ? bizIO.systemLabeledOnly : false,
        exportWithChildren:
            bizIO instanceof CollectionBizIO ? bizIO.exportWithChildren : true,
            */
    };
    return defaultValues;
}

const SummarizeModeTip = (props: { mode: CollectionSummarizeMode }) => {
    const { mode } = props;
    const { t } = useTranslation();
    return (
        <span className="flex items-center">
            <span className="pr-4">
                {t(`CommonCollectionBizIOForm.summarizeModeType.${mode}`)}
            </span>
            <Chip size="small" label={<SummarizeModeLabel mode={mode} />} />
        </span>
    );
};

export const SummarizeModeSelector = <
    T extends CommonCollectionBizIOFormSummarizeMode = CommonCollectionBizIOForm
>(
    props: any
) => {
    const { t } = useTranslation();
    return (
        <SelectInput<T>
            name="summarizeMode"
            label={t('CommonCollectionBizIOForm.summarizeMode')}
            items={[
                /* 
                // SummarizeModeSelectorは計算フォルダでのみ利用するため、表示しない
                {
                    value: CollectionSummarizeMode.NO_SUMMARIZE,
                    label: t(
                        'CommonCollectionBizIOForm.summarizeModeType.NO_SUMMARIZE'
                    ),
                },
                */
                {
                    value: CollectionSummarizeMode.TOTAL_AMOUNT,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.TOTAL_AMOUNT}
                        />
                    ),
                },
                {
                    value: CollectionSummarizeMode.TOTAL_MULTIPLE,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.TOTAL_MULTIPLE}
                        />
                    ),
                },
                {
                    value: CollectionSummarizeMode.ACCUMULATE,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.ACCUMULATE}
                        />
                    ),
                },
                /* 
                // Rateクラスを利用するため、表示しない
                {
                    value: CollectionSummarizeMode.TOTAL_DIVIDE,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.TOTAL_DIVIDE}
                        />
                    ),
                },
                */
                // GUIが複雑になるためシステムでしか利用しないものとする
                {
                    value: CollectionSummarizeMode.LINEAR,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.LINEAR}
                        />
                    ),
                    disabled: true,
                },
                {
                    value: CollectionSummarizeMode.CUSTOM,
                    label: (
                        <SummarizeModeTip
                            mode={CollectionSummarizeMode.CUSTOM}
                        />
                    ),
                    disabled: true,
                },
            ]}
            {...props}
        />
    );
};

export const SummarizeModeLabel = (props: {
    mode: CollectionSummarizeMode;
}) => {
    const { mode } = props;
    const { t } = useTranslation();
    let label = '';
    switch (mode) {
        case CollectionSummarizeMode.TOTAL_AMOUNT:
            label = 'a + b ... + n';
            break;
        case CollectionSummarizeMode.TOTAL_DIVIDE:
            label = 'a / b';
            break;
        case CollectionSummarizeMode.TOTAL_MULTIPLE:
            label = 'a x b ... x n';
            break;
        case CollectionSummarizeMode.LINEAR:
            label = 'a x b + c';
            break;
        case CollectionSummarizeMode.ACCUMULATE:
            label = 'Σ(a + b ... + n)';
            break;
        case CollectionSummarizeMode.CUSTOM:
            label = t(
                'CommonCollectionBizIOForm.summarizeModeTypeChipLabel.CUSTOM'
            );
            break;
    }
    return <>{label}</>;
};
