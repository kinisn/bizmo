import { Tooltip } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizIOExtData,
    BizIOExtDataForm,
    initBizIOExtViewForm,
    initBizmoDataStructureForm,
} from 'bizmoView/common/external/bizIOExtData';
import { initCommonExtViewForm } from 'bizmoView/common/external/common/commonExtView';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { BizIOComponentState } from '../BizIOComponent';
import {
    BizIOType,
    FilterableBizIOType,
    detectGeneralBizIOType,
} from './BizIOComponentForm';

export type CommonFormName = {
    name: string;
};

export type CommonFormBizIOType<T extends FilterableBizIOType = BizIOType> = {
    // type
    type: T;
};

/**
 * 全BizIO 共通Form
 */
export type CommonForm = CommonFormName &
    CommonFormBizIOType &
    BizIOExtDataForm;

export function initializeCommonForm(
    treeState: BizIOComponentState,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): CommonForm {
    const defaultValues = {
        type: treeState.formData?.type
            ? treeState.formData?.type
            : detectGeneralBizIOType(bizIO) ?? 'BizIO',

        // data
        name: treeState.formData?.name
            ? treeState.formData.name
            : bizIO?.name ?? '',

        // external data
        ...initBizmoDataStructureForm(treeState.formData, bizIO),
        ...initBizIOExtViewForm(treeState.formData, bizIO),
        ...initCommonExtViewForm(treeState.formData, bizIO?.externalData?.view),
    };
    return defaultValues;
}

export const MemoDescription = (props: { memo?: string }) => {
    const { memo, ...rest } = props;
    if (memo) {
        return (
            <Tooltip title={memo} {...rest}>
                <span className="flex items-center">
                    <MaterialIcon codePoint={IconType.Description} />
                </span>
            </Tooltip>
        );
    } else {
        return <></>;
    }
};
