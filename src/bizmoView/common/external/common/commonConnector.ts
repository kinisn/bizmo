import { LineConf } from 'bizmoView/common/canvas/LinesArrowShape';
import { IFBox } from 'bizmoView/component/bizmoCanvas/canvas/bizAction/BizRelationShape';
import { Vector2d } from 'konva/lib/types';

/**
 * 共通コネクタ
 *
 * 長方形領域の各辺に対して、 各辺の画面XY座標系で見たときの左上を開始点とした接続位置の割合で、接続位置を指定する。
 */
export const CommonConnectorType = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
} as const;
export type CommonConnectorType =
    (typeof CommonConnectorType)[keyof typeof CommonConnectorType];

export type CommonConnector = {
    edge: CommonConnectorType;
    ratioOfEdge: number; // 各辺の画面XY座標系で見たときの左上を開始点とした、接続位置の割合
};

/**
 * CommonConnectorDefault
 * 左辺の中央を接続位置とする
 */
export const CommonConnectorDefault: CommonConnector = {
    edge: 'left',
    ratioOfEdge: 0.5,
};

export type CommonConnectorForm = {
    ex_connector_edge?: CommonConnectorType;
    ex_connector_ratioOfEdge?: number;
};

export function initCommonConnectorForm(
    formData?: CommonConnectorForm
): CommonConnectorForm {
    const defaultValues: CommonConnectorForm = {
        ex_connector_edge:
            formData?.ex_connector_edge !== undefined
                ? formData.ex_connector_edge
                : CommonConnectorDefault.edge,
        ex_connector_ratioOfEdge:
            formData?.ex_connector_ratioOfEdge !== undefined
                ? formData.ex_connector_ratioOfEdge
                : CommonConnectorDefault.ratioOfEdge,
    };
    return defaultValues;
}

export function createCommonConnector(
    formData?: CommonConnectorForm
): CommonConnector {
    let makingData: CommonConnector = {
        edge: formData?.ex_connector_edge ?? CommonConnectorDefault.edge,
        ratioOfEdge:
            formData?.ex_connector_ratioOfEdge ??
            CommonConnectorDefault.ratioOfEdge,
    };
    return makingData;
}

// == Util ==

/**
 * 共通コネクタの接続位置を計算する
 * 同時に LinesArrowShape 用の lineConf も計算する
 *
 * @param connector
 * @param area 対象となる長方形の領域
 * @param offset 接続位置のオフセット。領域の中心から外側にむけて+で補正。 2段階のエッジ
 * @returns
 */
export function calculatePtOnArea(
    connector: CommonConnector,
    area: { point: Vector2d; box: IFBox },
    offset: number = 0,
    fromPt: Vector2d,
    toPt: Vector2d
): { point: Vector2d; withoutOffset: Vector2d; lineConfList: Array<LineConf> } {
    const isFromPt: number =
        area.point.x === fromPt.x && area.point.y === fromPt.y ? 1 : -1;
    const isTargetPtOnTheLeft: number =
        (isFromPt > 0 ? toPt.x : fromPt.x) <= area.point.x ? 1 : -1;
    const isTargetPtOnTheUpper: number =
        (isFromPt > 0 ? toPt.y : fromPt.y) <= area.point.y ? 1 : -1;
    const appliedV = area.point.x + area.box.width * connector.ratioOfEdge;
    const appliedH = area.point.y + area.box.height * connector.ratioOfEdge;

    let lineConfList: Array<LineConf> = [];
    switch (connector.edge) {
        case 'top':
            lineConfList = [
                {
                    direction: 'V',
                    length: -offset * isFromPt,
                },
                {
                    direction: 'H',
                    length: -offset * isTargetPtOnTheLeft * isFromPt,
                },
            ];
            if (isFromPt < 0) {
                lineConfList.reverse();
            }
            return {
                point: {
                    x: appliedV - offset * isTargetPtOnTheLeft,
                    y: area.point.y - offset,
                },
                withoutOffset: { x: appliedV, y: area.point.y },
                lineConfList,
            };
        case 'bottom':
            lineConfList = [
                {
                    direction: 'V',
                    length: offset * isFromPt,
                },
                {
                    direction: 'H',
                    length: -offset * isTargetPtOnTheLeft * isFromPt,
                },
            ];
            if (isFromPt < 0) {
                lineConfList.reverse();
            }
            return {
                point: {
                    x: appliedV - offset * isTargetPtOnTheLeft,
                    y: area.point.y + area.box.height + offset,
                },
                withoutOffset: {
                    x: appliedV,
                    y: area.point.y + area.box.height,
                },
                lineConfList,
            };
        case 'left':
            lineConfList = [
                {
                    direction: 'H',
                    length: -offset * isFromPt,
                },
                {
                    direction: 'V',
                    length: -offset * isTargetPtOnTheUpper * isFromPt,
                },
            ];
            if (isFromPt < 0) {
                lineConfList.reverse();
            }
            return {
                point: {
                    x: area.point.x - offset,
                    y: appliedH - offset * isTargetPtOnTheUpper,
                },
                withoutOffset: { x: area.point.x, y: appliedH },
                lineConfList,
            };
        case 'right':
            lineConfList = [
                {
                    direction: 'H',
                    length: offset * isFromPt,
                },
                {
                    direction: 'V',
                    length: -offset * isTargetPtOnTheUpper * isFromPt,
                },
            ];
            if (isFromPt < 0) {
                lineConfList.reverse();
            }
            return {
                point: {
                    x: area.point.x + area.box.width + offset,
                    y: appliedH - offset * isTargetPtOnTheUpper,
                },
                withoutOffset: {
                    x: area.point.x + area.box.width,
                    y: appliedH,
                },
                lineConfList,
            };
    }
}
