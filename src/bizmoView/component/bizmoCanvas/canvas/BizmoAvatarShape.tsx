import { fitImageToObject } from 'bizmoView/common/canvas/ObjectFit';
import { CommonExtView } from 'bizmoView/common/external/common/commonExtView';
import {
    IconType,
    MaterialIcon,
    MaterialIconDefault,
} from 'bizmoView/common/materialIcon';
import { KonvaStackedIconProps } from 'bizmoView/component/bizIOComponent/icon/IconUtil';
import { useEffect, useState } from 'react';
import { Group, Rect } from 'react-konva';
import useImage from 'use-image';

export const BizmoAvatarShape = (props: {
    viewExtData?: CommonExtView;
    id: string;
    codePoint?: IconType;
    konva?: KonvaStackedIconProps;
}) => {
    const { viewExtData, id, konva, codePoint } = props;
    const avatarWidth = viewExtData?.avatarConf?.size.width ?? 100;
    const avatarHeight = viewExtData?.avatarConf?.size.height ?? 100;
    const x = konva?.x ?? 0; // viewExtData.position.x は外部で設定済みなのでここでは使わない
    const y = konva?.y ?? 0; // viewExtData.position.x は外部で設定済みなのでここでは使わない
    // konva設定優先で viewExtData から設定
    const bgColor =
        konva?.bgColor ?? viewExtData?.avatarIcon?.bgColor ?? '#ffffff';
    const stackedColor =
        konva?.stackedColor ??
        viewExtData?.avatarIcon?.stackedColor ??
        '#000000';

    // 画像の読み込み
    const [image] = useImage(viewExtData?.avatarImage ?? ''); // Hack, FIXME ガードしてはいけないので、空文字を入れてるが、良くないな

    // 表示設定をstate管理
    const [fillData, setFillData] = useState<BizIONodeSetting>({
        fill: bgColor,
    });

    useEffect(() => {
        if (viewExtData?.avatarImage && image) {
            const crop = fitImageToObject('cover', image!, {
                width: avatarWidth,
                height: avatarHeight,
            });
            const imageSettings: ImageBGSetting = {
                fillPatternImage: image,
                fillPatternRepeat: 'no-repeat',
                fillPatternX: crop.x,
                fillPatternY: crop.y,
                fillPatternScaleX: crop.scale,
                fillPatternScaleY: crop.scale,
            };
            // redraw
            setFillData(imageSettings);
        }
    }, [image, avatarWidth, avatarHeight, viewExtData?.avatarImage]);

    const newShadow = viewExtData?.avatarConf?.hasShadow ?? true;

    return (
        <Group x={x} y={y} key={id}>
            <Rect
                width={avatarWidth}
                height={avatarHeight}
                cornerRadius={5}
                shadowEnabled={newShadow}
                shadowColor="#00000020"
                shadowBlur={5}
                shadowOffset={{ x: 0, y: 5 }}
                {...fillData}
            ></Rect>
            {codePoint && (
                <IconAvatarShape
                    codePoint={codePoint}
                    avatarHeight={avatarHeight}
                    avatarWidth={avatarWidth}
                    hasShadow={newShadow}
                    bgColor={bgColor}
                    stackedColor={stackedColor}
                />
            )}
        </Group>
    );
};

type ColorBGSetting = {
    fill: string;
};

type ImageBGSetting = {
    fillPatternImage: HTMLImageElement;
    fillPatternRepeat: 'no-repeat';
    fillPatternX: number;
    fillPatternY: number;
    fillPatternScaleX: number;
    fillPatternScaleY: number;
};

type BizIONodeSetting = ImageBGSetting | ColorBGSetting;

/**
 * 指定アイコンを使ったアバターShape
 * @param props
 * @returns
 */
export const IconAvatarShape = (props: {
    codePoint: IconType;
    avatarWidth: number;
    avatarHeight: number;
    hasShadow?: boolean;
    bgColor?: string;
    stackedColor?: string;
}) => {
    const {
        codePoint,
        avatarWidth,
        avatarHeight,
        hasShadow,
        bgColor,
        stackedColor,
    } = props;

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

    return (
        <Group>
            <Rect
                width={avatarWidth}
                height={avatarHeight}
                cornerRadius={5}
                shadowEnabled={hasShadow ?? true}
                shadowColor="#00000020"
                shadowBlur={5}
                shadowOffset={{ x: 0, y: 5 }}
                fill={bgColor ?? '#ffffff'}
            ></Rect>
            <MaterialIcon
                codePoint={codePoint}
                isShape={true}
                konva={{
                    x: resizedCrop.x,
                    y: resizedCrop.y,
                    scale: {
                        x: resizedCrop.scale,
                        y: resizedCrop.scale,
                    },
                    color: stackedColor,
                }}
            />
        </Group>
    );
};
