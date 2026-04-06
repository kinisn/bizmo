import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { Vector2d } from 'konva/lib/types';
import {
    CommonExtView,
    CommonExtViewDefault,
    CommonExtViewForm,
    createCommonExtView,
} from './common/commonExtView';

// ======  BizIOExtData  ====== //

/**
 * BizmoIOの外部データ
 */
export type BizIOExtData = {
    // structure
    structure: BizIOExtDataStructure;
    // view
    view: CommonExtView & BizIOExtView;
};

export type BizIOExtDataForm = BizIOExtDataStructureForm &
    CommonExtViewForm &
    BizIOExtViewForm;

export function createBizIOExtData(formData?: BizIOExtDataForm): BizIOExtData {
    const makingData = {
        structure: BizIOExtDataStructureDefault,
        view: { ...CommonExtViewDefault, ...BizIOExtViewDefault },
    };
    makingData.structure = createBizIOExtDataStructure(formData);
    makingData.view = {
        ...createCommonExtView(formData),
        ...createBizIOExtView(formData),
    };
    return makingData;
}

// ======  BizIO View extension  ====== //

type BizIOExtView = {
    // Canvas上の表示位置
    position: Vector2d;
};

type BizIOExtViewForm = {
    ex_view_position_X?: number;
    ex_view_position_y?: number;
};

export const BizIOExtViewDefault: BizIOExtView = {
    position: {
        x: 0,
        y: 0,
    },
};

export function initBizIOExtViewForm(
    formData?: BizIOExtViewForm,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): BizIOExtViewForm {
    const defaultValues: BizIOExtViewForm = {
        // position
        ex_view_position_X:
            formData?.ex_view_position_X !== undefined
                ? formData.ex_view_position_X
                : bizIO?.externalData?.view.position?.x ??
                  BizIOExtViewDefault.position.x,
        ex_view_position_y:
            formData?.ex_view_position_y !== undefined
                ? formData.ex_view_position_y
                : bizIO?.externalData?.view.position?.y ??
                  BizIOExtViewDefault.position.y,
    };
    return defaultValues;
}

export function createBizIOExtView(
    formViewData?: BizIOExtViewForm
): BizIOExtView {
    let makingData: BizIOExtView = {
        position: {
            x: Number(
                formViewData?.ex_view_position_X ??
                    BizIOExtViewDefault.position.x
            ),
            y: Number(
                formViewData?.ex_view_position_y ??
                    BizIOExtViewDefault.position.y
            ),
        },
    };
    return makingData;
}

// ======  BizmoDataStructure  ====== //

/**
 * BizmoIOの外部データ：　構造補助データ
 */
export type BizIOExtDataStructure = {
    memo: string;
};

export const BizIOExtDataStructureDefault: BizIOExtDataStructure = {
    memo: '',
};

export type BizIOExtDataStructureForm = {
    structure_memo: string;
};

export function initBizmoDataStructureForm(
    formData?: BizIOExtDataStructureForm,
    bizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
): BizIOExtDataStructureForm {
    const defaultValues = {
        structure_memo: formData?.structure_memo
            ? formData.structure_memo
            : bizIO?.externalData?.structure?.memo ??
              BizIOExtDataStructureDefault.memo,
    };
    return defaultValues;
}

export function createBizIOExtDataStructure(
    formStructureData?: BizIOExtDataStructureForm
): BizIOExtDataStructure {
    const makingData = {
        memo:
            formStructureData?.structure_memo ??
            BizIOExtDataStructureDefault.memo,
    };
    return makingData;
}

/**
 * Canvas表示情報を含むBizIOを再帰的に探索する
 *
 * @param targetBizIO
 * @param storedBizIOs
 * @returns
 */

export function traverseBizIOExtDataView(
    targetBizIO: BizIO<BizIOExtData, BizComponentGroupType>,
    storedBizIOs: Array<BizIO<BizIOExtData, BizComponentGroupType>>
): Array<BizIO<BizIOExtData, BizComponentGroupType>> {
    if (targetBizIO.externalData?.view.visibleOnCanvas) {
        storedBizIOs.push(targetBizIO);
    }
    if (targetBizIO instanceof CollectionBizIO) {
        for (const child of targetBizIO.exposedChildren) {
            traverseBizIOExtDataView(child, storedBizIOs);
        }
    }
    return storedBizIOs;
}
