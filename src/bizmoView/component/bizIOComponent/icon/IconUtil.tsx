import { Avatar, Chip, Tooltip } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { fitImageToObject } from 'bizmoView/common/canvas/ObjectFit';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { CommonExtView } from 'bizmoView/common/external/common/commonExtView';
import {
    IconType,
    MaterialIcon,
    MaterialIconDefault,
    StackedMaterialIcon,
    StackedMaterialIconKonvaDefault,
} from 'bizmoView/common/materialIcon';
import { BizmoAvatarShape } from 'bizmoView/component/bizmoCanvas/canvas/BizmoAvatarShape';
import { useTranslation } from 'react-i18next';
import { Group, Rect } from 'react-konva';
import { BizIOType, detectGeneralBizIOType } from '../form/BizIOComponentForm';
import { SummarizeModeLabel } from '../form/CommonCollectionBizIOForm';

export type KonvaStackedIconProps = {
    x?: number;
    y?: number;
    bgColor?: string;
    stackedColor?: string;
};

const BizIOTypeBaseIcon = (props: {
    mode: 'folder' | 'file';
    icon?: IconType;
    stackedStyle?: string;
    stackedPosition?: string;
    isShape?: boolean;
    konva?: KonvaStackedIconProps;
    bizmoDataView?: CommonExtView;
}) => {
    const {
        mode,
        icon,
        stackedStyle = 'text-ms text-black',
        stackedPosition = mode === 'file'
            ? 'left-0 right-0 top-1 bottom-0'
            : 'left-0 right-0 top-2 bottom-0',
        isShape = false,
        konva,
        bizmoDataView,
    } = props;

    let newKonva = {
        base: {
            ...StackedMaterialIconKonvaDefault.base,
        },
        stacked: {
            ...StackedMaterialIconKonvaDefault.stacked,
        },
    };
    if (mode === 'file') {
        newKonva.stacked.y = 11;
    }

    const avatarWidth =
        bizmoDataView?.avatarConf.size.width ?? MaterialIconDefault.size!;
    const avatarHeight =
        bizmoDataView?.avatarConf.size.height ?? MaterialIconDefault.size!;

    const iconCrop = fitImageToObject(
        'contain',
        {
            width: MaterialIconDefault.size!,
            height: MaterialIconDefault.size!,
        },
        { width: avatarWidth, height: avatarHeight }
    );

    // 中央を起点に縮小
    const resizeRate = 0.6;
    const resizedCrop = {
        x: iconCrop.x + iconCrop.width * ((1 - resizeRate) / 2),
        y: iconCrop.y + iconCrop.height * ((1 - resizeRate) / 2),
        scale: iconCrop.scale * resizeRate,
    };

    // colorの設定
    if (konva?.bgColor) {
        newKonva.base.color =
            konva.bgColor ?? StackedMaterialIconKonvaDefault.base.color;
    }
    if (konva?.stackedColor) {
        newKonva.stacked.color =
            konva.stackedColor ?? StackedMaterialIconKonvaDefault.stacked.color;
    }

    const folderIcon = icon ? (
        <StackedMaterialIcon
            base={mode === 'file' ? IconType.InsertDriveFile : IconType.Folder}
            baseStyle="text-3xl"
            stacked={icon}
            stackedStyle={stackedStyle}
            stackedPosition={stackedPosition}
            isShape={isShape}
            konva={newKonva}
        ></StackedMaterialIcon>
    ) : (
        <MaterialIcon
            codePoint={
                mode === 'file' ? IconType.InsertDriveFile : IconType.Folder
            }
            className="text-3xl"
            isShape={isShape}
            konva={newKonva.base}
        />
    );

    return isShape ? (
        <Group x={konva?.x} y={konva?.y}>
            <Rect
                fill={newKonva.stacked.color} // あえてstackedColorを使う
                width={avatarWidth}
                height={avatarHeight}
                cornerRadius={5}
                shadowEnabled={bizmoDataView?.avatarConf.hasShadow ?? true}
                shadowColor="#00000020"
                shadowBlur={5}
                shadowOffset={{ x: 0, y: 5 }}
            />
            <Group
                width={avatarWidth}
                height={avatarHeight}
                x={resizedCrop.x}
                y={resizedCrop.y}
                scale={{ x: resizedCrop.scale, y: resizedCrop.scale }}
            >
                {folderIcon}
            </Group>
        </Group>
    ) : (
        <>{folderIcon}</>
    );
};

export const BizIOTypeIcon = (props: {
    bizIOType?: BizIOType;
    isShape?: boolean;
    konva?: KonvaStackedIconProps;
    bizmoDataView?: CommonExtView;
}) => {
    const { bizIOType, isShape = false, konva, bizmoDataView } = props;
    let stackedStyle = 'text-lg text-black';
    let stackedPosition = 'left-0 right-0 top-1 bottom-0';

    let isFolderBase = true;
    let codePoint = undefined;
    switch (bizIOType) {
        case 'CollectionBizIO':
            break;
        case 'CollectionBizIO:TOTAL_AMOUNT':
        case 'CollectionBizIO:TOTAL_MULTIPLE':
        case 'CollectionBizIO:ACCUMULATE':
        case 'RateComponent': // TOTAL_DIVIDEとほぼ同義
        case 'CollectionBizIO:Calculate':
            codePoint = IconType.Calculate;
            isFolderBase = false;
            stackedStyle = 'text-lg text-black';
            stackedPosition = 'left-0 right-0 top-2 bottom-0';
            break;
        case 'BizActors':
            codePoint = IconType.Person;
            break;
        case 'UnitComponent':
            codePoint = IconType.Apps;
            break;
        case 'CohortComponent':
            codePoint = IconType.Update;
            break;
        case 'FunnelComponent':
            codePoint = IconType.FilterAlt;
            break;
        default: // BizIO
            isFolderBase = false;
    }
    return (
        <BizIOTypeBaseIcon
            mode={isFolderBase ? 'folder' : 'file'}
            icon={codePoint}
            stackedStyle={stackedStyle}
            stackedPosition={stackedPosition}
            isShape={isShape}
            konva={konva}
            bizmoDataView={bizmoDataView}
        />
    );
};

export const BizmoAvatarIcon = (props: {
    id: string;
    name: string;
    viewExtData?: CommonExtView;
    codePoint?: IconType;
    isShape?: boolean;
    konva?: KonvaStackedIconProps;
}) => {
    const {
        id,
        name,
        viewExtData,
        //avatarCSS,
        codePoint,
        isShape = false,
        konva,
    } = props;
    if (isShape) {
        return (
            <BizmoAvatarShape
                id={id}
                viewExtData={viewExtData}
                konva={konva}
                codePoint={codePoint}
            />
        );
    } else {
        return (
            <Avatar
                variant="rounded"
                src={viewExtData?.avatarImage}
                className={viewExtData?.avatarIcon?.bgColor ?? 'bg-white'}
                alt={name}
            >
                {codePoint && <MaterialIcon codePoint={codePoint} />}
            </Avatar>
        );
    }
};

export const BizIOComponentIcon = (props: {
    bizIO:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    isShape?: boolean;
    konva?: KonvaStackedIconProps;
    overwriteBizIOType?: BizIOType; // プレビュー作成BizIO向け
}) => {
    const { bizIO, isShape = false, konva, overwriteBizIOType } = props;

    return (
        <BizIOComponentBaseIcon<BizComponentGroupType>
            id={bizIO.id}
            name={bizIO.name}
            externalGroupName={bizIO.externalGroupName}
            viewExtData={bizIO.externalData?.view}
            isShape={isShape}
            konva={konva}
            bizIOType={overwriteBizIOType ?? detectGeneralBizIOType(bizIO)}
        />
    );
};

export const BizIOComponentBaseIcon = <S,>(props: {
    id: string;
    name: string;
    externalGroupName?: S;
    viewExtData?: CommonExtView;
    isShape?: boolean;
    konva?: KonvaStackedIconProps;
    bizIOType?: BizIOType; // プレビュー作成BizIO向け
}) => {
    const {
        id,
        name,
        externalGroupName,
        viewExtData,
        isShape = false,
        konva,
        bizIOType,
    } = props;
    let codePoint = undefined;

    // 設定データがある場合
    if (viewExtData) {
        // image がある場合には最優先
        if (viewExtData.avatarImage && viewExtData.avatarImage !== '') {
            return (
                <BizmoAvatarIcon
                    id={id}
                    name={name}
                    viewExtData={viewExtData}
                    isShape={isShape}
                    konva={konva}
                />
            );
        }

        // icon がある場合には次に優先
        if (viewExtData.avatarIcon) {
            return (
                <BizmoAvatarIcon
                    id={id}
                    name={name}
                    codePoint={viewExtData.avatarIcon.icon}
                    viewExtData={viewExtData}
                    isShape={isShape}
                    konva={konva}
                />
            );
        }
    }

    // 特定Category
    if (externalGroupName) {
        switch (externalGroupName) {
            case 'ENVIRONMENT':
                codePoint = IconType.Public;
                break;
            case 'COLLABORATORS':
                codePoint = IconType.Diversity3;
                break;
            case 'USERS':
                codePoint = IconType.Face;
                break;
            // CompanyBizActors
            case 'COMPANY':
                codePoint = IconType.Business;
                break;
            case 'COMPANY:ACCOUNTING':
                codePoint = IconType.AttachMoney;
                break;
            case 'COMPANY:STAFFS':
                codePoint = IconType.SupportAgent;
                break;
            case 'COMPANY:PRODUCTS':
                codePoint = IconType.Star;
                break;
            case 'COMPANY:MATERIALS':
                codePoint = IconType.ShoppingCart;
                break;
            case 'COMPANY:ASSET_EXPENSES_LIST':
                codePoint = IconType.Build;
                break;
            // BizAction
            case 'BIZ_ACTION_PARAMS':
            case 'BIZ_ACTION_PARAMS:GLOBAL_PARAM':
            case 'BIZ_ACTION_PARAMS:LOCAL_PARAM':
                codePoint = IconType.Save;
                break;
            // BizComponent
            case 'BIZ_COMPONENT':
                codePoint = IconType.Business;
                break;
            default:
                break;
        }
    }

    if (codePoint) {
        return (
            <BizmoAvatarIcon
                id={id}
                name={name}
                viewExtData={viewExtData}
                codePoint={codePoint}
                isShape={isShape}
                konva={konva}
            />
        );
    }

    // 汎用設定
    return (
        <BizIOTypeIcon
            bizIOType={bizIOType}
            isShape={isShape}
            konva={konva}
            bizmoDataView={viewExtData}
        />
    );
};

export const BizIOIndicatorIcon = (props: {
    bizIO:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    systemLabeled: boolean;
}) => {
    const { bizIO, systemLabeled } = props;
    const { t } = useTranslation();

    // type icon
    let indicatorIcon = <></>;
    let codePoint: IconType | undefined = undefined;
    let tooltip: string | undefined = undefined;
    if (bizIO instanceof BizActors) {
        indicatorIcon = (
            <Tooltip title={t('CommonForm.BizActors.label')} className="mr-2">
                <span className="flex items-center rounded-full bg-zinc-600">
                    <MaterialIcon codePoint={IconType.Person} />
                </span>
            </Tooltip>
        );
    } else if (bizIO instanceof CollectionBizIO) {
        if (bizIO.hasOwnValue) {
            if (bizIO.isMonetary) {
                codePoint = IconType.Paid;
                tooltip = t('CollectionTree.calculatedMoney');
            } else {
                codePoint = IconType.OneTwoThree;
                tooltip = t('CollectionTree.calculatedAmount');
            }
            indicatorIcon = (
                <Tooltip title={tooltip} className="mr-2">
                    <Chip
                        icon={<MaterialIcon codePoint={codePoint} />}
                        size="small"
                        label={
                            <SummarizeModeLabel mode={bizIO.summarizeMode} />
                        }
                    />
                </Tooltip>
            );
        }
    } else {
        if (bizIO.isMonetary) {
            codePoint = IconType.Paid;
            tooltip = t('CommonBizIOForm.monetary');
        } else {
            codePoint = IconType.OneTwoThree;
            tooltip = t('CommonBizIOForm.amount');
        }
        indicatorIcon = (
            <Tooltip title={tooltip} className="mr-2">
                <span className="flex items-center rounded-full bg-zinc-600">
                    <MaterialIcon codePoint={codePoint} />
                </span>
            </Tooltip>
        );
    }

    return (
        <span className="flex">
            {indicatorIcon}
            {systemLabeled && (
                <Tooltip
                    title={t('CollectionTree.systemProvided')}
                    className="mr-2"
                >
                    <span className="flex items-center">
                        <MaterialIcon
                            codePoint={IconType.Lock}
                            className="text_white opacity-40 text-base"
                        />
                    </span>
                </Tooltip>
            )}
        </span>
    );
};
