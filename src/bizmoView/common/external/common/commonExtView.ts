import { IconType } from '../../materialIcon';
import { convertBoolToNumber, convertNumberToBool } from './util';

// ======  CommonExtView  ====== //
/**
 * 表示補助データ
 *
 * BizmoIO や BizRelation などのCanvas表示補助データ
 */

export type CommonExtView = {
    // canvas上に表示するか
    visibleOnCanvas: boolean;

    // Canvas上の表示位置
    //position: Vector2d;

    // Canvas上の表示設定
    avatarConf: {
        size: {
            height: number;
            width: number;
        };
        hasShadow: boolean;
    };

    // avatar Image
    avatarImage: string;
    avatarIcon?: {
        // Icon を設定されたら、avatarImage は無視する
        icon: IconType;
        bgColor?: string;
        stackedColor?: string;
    };
};

export const CommonExtViewDefault: CommonExtView = {
    visibleOnCanvas: false,
    //position: { x: 0, y: 0 },
    avatarConf: {
        size: {
            height: 100,
            width: 100,
        },
        hasShadow: true,
    },
    avatarImage: '',
};

export type CommonExtViewForm = {
    ex_view_visible_on_canvas?: number; // 0: false, 1: true
    // image
    ex_view_avatar_image?: string;
    // avatarConf
    ex_view_avatar_conf_size_height?: number;
    ex_view_avatar_conf_size_width?: number;
    ex_view_avatar_conf_hasShadow?: number; // 0: false, 1: true
    // position
    //ex_view_position_X?: number;
    //ex_view_position_y?: number;
    // icon
    ex_view_avatar_icon_icon?: IconType;
    ex_view_avatar_icon_bgColor?: string;
    ex_view_avatar_icon_stackedColor?: string;
};

export function initCommonExtViewForm(
    formData?: CommonExtViewForm,
    commonExtView?: CommonExtView
): CommonExtViewForm {
    const defaultValues: CommonExtViewForm = {
        // image
        ex_view_avatar_image:
            formData?.ex_view_avatar_image !== undefined
                ? formData.ex_view_avatar_image
                : commonExtView?.avatarImage ??
                  CommonExtViewDefault.avatarImage,

        // visibleOnCanvas
        ex_view_visible_on_canvas:
            formData?.ex_view_visible_on_canvas !== undefined
                ? formData.ex_view_visible_on_canvas
                : convertBoolToNumber(
                      commonExtView?.visibleOnCanvas,
                      CommonExtViewDefault.visibleOnCanvas
                  ),

        // avatarConf size
        ex_view_avatar_conf_size_height:
            formData?.ex_view_avatar_conf_size_height !== undefined
                ? formData.ex_view_avatar_conf_size_height
                : commonExtView?.avatarConf?.size.height ??
                  CommonExtViewDefault.avatarConf.size.height,
        ex_view_avatar_conf_size_width: formData?.ex_view_avatar_conf_size_width
            ? formData.ex_view_avatar_conf_size_width
            : commonExtView?.avatarConf?.size.width ??
              CommonExtViewDefault.avatarConf.size.width,

        // avatarConf hasShadow
        ex_view_avatar_conf_hasShadow:
            formData?.ex_view_avatar_conf_hasShadow !== undefined
                ? formData.ex_view_avatar_conf_hasShadow
                : convertBoolToNumber(
                      commonExtView?.avatarConf?.hasShadow,
                      CommonExtViewDefault.avatarConf.hasShadow
                  ),

        /*
        // position
        ex_view_position_X:
            formData?.ex_view_position_X !== undefined
                ? formData.ex_view_position_X
                : commonExtView?.position?.x ?? CommonExtViewDefault.position.x,
        ex_view_position_y:
            formData?.ex_view_position_y !== undefined
                ? formData.ex_view_position_y
                : commonExtView?.position?.y ?? CommonExtViewDefault.position.y,
                */

        // icon
        ex_view_avatar_icon_icon:
            formData?.ex_view_avatar_icon_icon !== undefined
                ? formData.ex_view_avatar_icon_icon
                : commonExtView?.avatarIcon?.icon ??
                  CommonExtViewDefault.avatarIcon?.icon,
        ex_view_avatar_icon_bgColor:
            formData?.ex_view_avatar_icon_bgColor !== undefined
                ? formData.ex_view_avatar_icon_bgColor
                : commonExtView?.avatarIcon?.bgColor ??
                  CommonExtViewDefault.avatarIcon?.bgColor,
        ex_view_avatar_icon_stackedColor:
            formData?.ex_view_avatar_icon_stackedColor !== undefined
                ? formData.ex_view_avatar_icon_stackedColor
                : commonExtView?.avatarIcon?.stackedColor ??
                  CommonExtViewDefault.avatarIcon?.stackedColor,
    };
    return defaultValues;
}

export function createCommonExtView(
    formViewData?: CommonExtViewForm
): CommonExtView {
    let makingData: CommonExtView = {
        visibleOnCanvas: convertNumberToBool(
            formViewData?.ex_view_visible_on_canvas,
            CommonExtViewDefault.visibleOnCanvas
        ),
        avatarImage:
            formViewData?.ex_view_avatar_image ??
            CommonExtViewDefault.avatarImage,
        avatarConf: {
            size: {
                height: Number(
                    formViewData?.ex_view_avatar_conf_size_height ??
                        CommonExtViewDefault.avatarConf.size.height
                ),
                width: Number(
                    formViewData?.ex_view_avatar_conf_size_width ??
                        CommonExtViewDefault.avatarConf.size.width
                ),
            },
            hasShadow: convertNumberToBool(
                formViewData?.ex_view_avatar_conf_hasShadow,
                CommonExtViewDefault.avatarConf.hasShadow
            ),
        },
        /*
        position: {
            x: Number(
                formViewData?.ex_view_position_X ??
                    CommonExtViewDefault.position.x
            ),
            y: Number(
                formViewData?.ex_view_position_y ??
                    CommonExtViewDefault.position.y
            ),
        },
        */
    };

    // icon
    if (formViewData?.ex_view_avatar_icon_icon) {
        makingData.avatarIcon = {
            icon: formViewData?.ex_view_avatar_icon_icon,
            bgColor: formViewData?.ex_view_avatar_icon_bgColor,
            stackedColor: formViewData?.ex_view_avatar_icon_stackedColor,
        };
    }
    return makingData;
}
