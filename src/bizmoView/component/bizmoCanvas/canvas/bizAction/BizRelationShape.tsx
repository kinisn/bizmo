import {
    BizRelationToDraw,
    ExpandedProcData,
} from 'bizmo/action/core/BizAction';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import {
    ConnectedPoints,
    LinesArrowMode,
    LinesArrowShape,
    RepresentativePosition,
    Representatives,
    buildConnectedPoints,
} from 'bizmoView/common/canvas/LinesArrowShape';
import {
    BizIOExtData,
    BizIOExtViewDefault,
} from 'bizmoView/common/external/bizIOExtData';
import {
    CommonConnectorDefault,
    calculatePtOnArea,
} from 'bizmoView/common/external/common/commonConnector';
import { CommonExtViewDefault } from 'bizmoView/common/external/common/commonExtView';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { BizIOComponentBaseIcon } from 'bizmoView/component/bizIOComponent/icon/IconUtil';
import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { Dispatch, useEffect, useReducer, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { BizActionChipShape, countFullHalfLetters } from './BizActionChipShape';

export type BizRelationMode = 'view' | 'edit';
export type ChipPosition = 'center' | 'nearOfStart' | 'nearOfEnd';

export type IFBox = { width: number; height: number };
type BizRelationShapeAction =
    | {
          type: 'setRepresentatives';
          payload: Representatives;
      }
    | {
          type: 'setMode';
          payload: BizRelationMode;
      }
    | { type: 'changeChipSize'; payload: IFBox; target: ChipPosition };

type BizRelationShapeState = {
    mode: BizRelationMode;
    representatives: Representatives;
    centerChipSize: { width: number; height: number };
    fromChipSize: { width: number; height: number };
    toChipSize: { width: number; height: number };
};

// ===  Default Size  ===
const RelationSideShapeFontSize = 12;
const RelationSideShapeIconSize = 32;

/**
 * procOutputs から nearSide の表示に必要なサイズを計算する
 * @param procOutputs
 * @returns
 */
function calculateBox(procOutputs: Array<ExpandedProcData>): {
    width: number;
    height: number;
} {
    const fontSize = RelationSideShapeFontSize;
    const iconSize = RelationSideShapeIconSize;
    let maxWidth = 0;
    procOutputs.forEach((procOutput) => {
        const { ext, bizIO } = procOutput;
        let width = 0;
        let target;
        if (ext && ext.view && ext.name) {
            target = ext.name;
        } else if (bizIO) {
            target = bizIO.name;
        }
        if (target) {
            const fullHalfLt = countFullHalfLetters(target);
            const fullLt = fullHalfLt - target.length;
            const halfLt = target.length - fullLt;
            width =
                fullLt * fontSize +
                halfLt * fontSize * 0.8 + // FIXME　観測的に半角は全角の 0.8 幅が適切だったが、Font次第で変わる可能性がある
                iconSize +
                fontSize / 3;
        }
        if (width > maxWidth) {
            maxWidth = width;
        }
    });
    return {
        width: maxWidth,
        height: iconSize * 1.25 * procOutputs.length,
    };
}

function calculateConnectorPt(
    fromActor: BizIO<BizIOExtData, BizComponentGroupType>,
    toActor: BizIO<BizIOExtData, BizComponentGroupType>,
    relationToDraw: BizRelationToDraw<BizIOExtData, RelationExtData>,
    limitLength: number,
    connectLength: number
): ConnectedPoints {
    const fromConnector = calculatePtOnArea(
        relationToDraw.relation.externalData?.fromConnector ??
            CommonConnectorDefault,
        {
            point:
                fromActor.externalData?.view.position ??
                BizIOExtViewDefault.position,
            box:
                fromActor.externalData?.view.avatarConf.size ??
                CommonExtViewDefault.avatarConf.size,
        },
        connectLength,
        fromActor.externalData?.view.position ?? BizIOExtViewDefault.position,
        toActor.externalData?.view.position ?? BizIOExtViewDefault.position
    );
    const toConnector = calculatePtOnArea(
        relationToDraw.relation.externalData?.toConnector ??
            CommonConnectorDefault,
        {
            point:
                toActor.externalData?.view.position ??
                BizIOExtViewDefault.position,
            box:
                toActor.externalData?.view.avatarConf.size ??
                CommonExtViewDefault.avatarConf.size,
        },
        connectLength,
        fromActor.externalData?.view.position ?? BizIOExtViewDefault.position,
        toActor.externalData?.view.position ?? BizIOExtViewDefault.position
    );

    // offset を考慮した点において線を引く
    const offsetConnectedPoints = buildConnectedPoints(
        fromConnector.point,
        toConnector.point,
        [],
        limitLength
    );

    return {
        points: [fromConnector.withoutOffset, toConnector.withoutOffset],
        complementedLines: [
            ...fromConnector.lineConfList,
            ...offsetConnectedPoints.complementedLines,
            ...toConnector.lineConfList,
        ],
    };
}

export const BizRelationShape = ({
    fromActor,
    toActor,
    label,
    order,
    relationToDraw,
    handleBizRelationOpen,
}: {
    label: string;
    order?: number | string;
    fromActor: BizIO<BizIOExtData, BizComponentGroupType>;
    toActor: BizIO<BizIOExtData, BizComponentGroupType>;
    relationToDraw: BizRelationToDraw<BizIOExtData, RelationExtData>;
    handleBizRelationOpen: (targetId: string) => void;
}) => {
    const limitLength = 10;
    const connectLength = 30;
    const connectorPt = calculateConnectorPt(
        fromActor,
        toActor,
        relationToDraw,
        limitLength,
        connectLength
    );
    /*
    console.log(
        `BizRelationShape[${fromActor.name} -> ${toActor.name}]`,
        connectorPt
    );
    */
    const start = connectorPt.points[0];
    const end = connectorPt.points[1];
    const lines = connectorPt.complementedLines;

    const hasFromSide = relationToDraw.fromSide.length > 0;

    let arrowMode: LinesArrowMode = 'end'; // to は必ず矢印を表示する
    // さらにProcOutput の有無によって矢印の表示を変える
    if (hasFromSide) {
        arrowMode = 'both';
    }

    const initialState: BizRelationShapeState = {
        mode: 'view',
        representatives: {
            center: { at: start, direction: 'H' },
            nearOfStart: { at: start, direction: 'H' },
            nearOfEnd: { at: end, direction: 'H' },
        },
        centerChipSize: { width: 0, height: 60 }, // CenterChipShape で計算し設定する
        fromChipSize: calculateBox(relationToDraw.fromSide),
        toChipSize: calculateBox(relationToDraw.toSide),
    };

    const [state, dispatcher] = useReducer(
        (state: BizRelationShapeState, action: BizRelationShapeAction) => {
            switch (action.type) {
                case 'setRepresentatives':
                    return {
                        ...state,
                        representatives: action.payload,
                    };
                case 'setMode':
                    return {
                        ...state,
                        mode: action.payload,
                    };
                case 'changeChipSize':
                    switch (action.target) {
                        case 'center':
                            return {
                                ...state,
                                centerChipSize: action.payload,
                            };
                        case 'nearOfStart':
                            return {
                                ...state,
                                fromChipSize: action.payload,
                            };
                        case 'nearOfEnd':
                            return {
                                ...state,
                                toChipSize: action.payload,
                            };
                    }
            }
        },
        initialState
    );

    const handleRepresentativePosition = (positions: Representatives) => {
        dispatcher({ type: 'setRepresentatives', payload: positions });
    };

    const handleBizRelationOpenBind = () => {
        handleBizRelationOpen(relationToDraw.relation.relationId);
    };

    return (
        <LinesArrowShape
            start={start}
            end={end}
            lines={lines}
            nearLength={30}
            limitLength={limitLength}
            edit={state.mode == 'edit' ? true : false}
            arrowMode={arrowMode}
            representativePositionHandler={handleRepresentativePosition}
            lineClickHandler={() => {}}
            onLineCenterShape={
                <CenterChipShape
                    state={state}
                    dispatcher={dispatcher}
                    label={label}
                    order={order}
                    handleBizRelationOpen={handleBizRelationOpenBind}
                />
            }
            onLineNearEndShape={
                <NearSideShape
                    state={state}
                    dispatcher={dispatcher}
                    position={state.representatives.nearOfEnd}
                    procOutputs={relationToDraw.toSide}
                    relation={relationToDraw.relation}
                    targetBizIO={toActor}
                    chipPosition="nearOfEnd"
                />
            }
            onLineNearStartShape={
                <NearSideShape
                    state={state}
                    dispatcher={dispatcher}
                    position={state.representatives.nearOfStart}
                    procOutputs={relationToDraw.fromSide}
                    relation={relationToDraw.relation}
                    targetBizIO={fromActor}
                    chipPosition="nearOfStart"
                />
            }
        ></LinesArrowShape>
    );
};

function getBizIONodeCenterPosition(
    bizIO?: BizIO<BizIOExtData, BizComponentGroupType>
): Vector2d {
    const view = bizIO?.externalData?.view;
    if (view) {
        return {
            x: view.position.x + view.avatarConf.size.width / 2,
            y: view.position.y + view.avatarConf.size.height / 2,
        };
    } else {
        return {
            x: 0,
            y: 0,
        };
    }
}

const NearSideShape = ({
    state,
    dispatcher,
    position,
    sideOffset = 10,
    procOutputs,
    relation,
    chipPosition,
    targetBizIO,
}: {
    state: BizRelationShapeState;
    dispatcher: Dispatch<BizRelationShapeAction>;
    position: RepresentativePosition;
    sideOffset?: number;

    procOutputs: Array<ExpandedProcData>;
    relation: BizRelation;
    chipPosition: ChipPosition;
    targetBizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | undefined;
}) => {
    const bizIOCenterPt = getBizIONodeCenterPosition(targetBizIO);

    const hasCurrentSide = procOutputs.length > 0;
    let [x, y] = [0, 0];
    if (hasCurrentSide) {
        if (position.at.x < bizIOCenterPt.x) {
            x =
                position.at.x -
                sideOffset -
                (chipPosition == 'nearOfEnd'
                    ? state.toChipSize
                    : state.fromChipSize
                ).width;
        } else {
            x = position.at.x + sideOffset;
        }

        if (position.at.y < bizIOCenterPt.y) {
            y =
                position.at.y -
                sideOffset -
                (chipPosition == 'nearOfEnd'
                    ? state.toChipSize
                    : state.fromChipSize
                ).height;
        } else {
            y = position.at.y + sideOffset;
        }
    }

    return hasCurrentSide ? (
        <RepresentativeChipShape
            state={state}
            dispatcher={dispatcher}
            position={{ x: x, y: y }}
            chipShape={
                <ProcOutputOnRelationShape
                    procOutputs={procOutputs}
                    relation={relation}
                />
            }
            overlayBeCentered={false}
            chipPosition={chipPosition}
        ></RepresentativeChipShape>
    ) : (
        <></>
    );
};

const CenterChipShape = (props: {
    state: BizRelationShapeState;
    dispatcher: Dispatch<BizRelationShapeAction>;
    label: string;
    order?: number | string;
    handleBizRelationOpen: () => void;
}) => {
    const { state, dispatcher, label, order, handleBizRelationOpen } = props;
    const handleChangeChipSize = (size: { width: number; height: number }) => {
        dispatcher({
            type: 'changeChipSize',
            target: 'center',
            payload: size,
        });
    };

    return (
        <RepresentativeChipShape
            state={state}
            dispatcher={dispatcher}
            position={state.representatives.center.at}
            chipShape={
                <BizActionChipShape
                    label={label}
                    maxLength={15}
                    order={order}
                    toBeCentered={true}
                    sizeHandler={handleChangeChipSize}
                    opacity={state.mode == 'view' ? 1 : 0.5}
                />
            }
            chipPosition="center"
            handleBizRelationOpen={handleBizRelationOpen}
        ></RepresentativeChipShape>
    );
};

const RepresentativeChipShape = ({
    state,
    dispatcher,
    chipShape,
    position,
    overlayBeCentered = true,
    chipPosition,
    handleBizRelationOpen,
}: {
    state: BizRelationShapeState;
    dispatcher: Dispatch<BizRelationShapeAction>;
    chipShape: JSX.Element;
    position: Vector2d;
    overlayBeCentered?: boolean;
    chipPosition: ChipPosition;
    handleBizRelationOpen?: () => void;
}) => {
    // draggable
    const [isDraggable, setIsDraggable] = useState(false);

    const handleOpenDialogClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
    };

    // overlay on mouse hover
    const overlayRef = useRef<Konva.Group>(null);
    const stage = overlayRef.current?.getStage();
    const [isHover, setIsHover] = useState(false);
    useEffect(() => {
        if (isHover) {
            overlayRef.current?.to({
                duration: 0.1,
                opacity: 1,
            });
        } else {
            overlayRef.current?.to({
                duration: 0.1,
                opacity: 0,
            });
        }
    }, [isHover]);

    const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'pointer';
            setIsHover(true);
        }
    };
    const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setIsDraggable(false);
        if (stage) {
            stage.container().style.cursor = 'default';
            setIsHover(false);
        }
    };
    const handleDragHandleMouseEnter = (
        e: Konva.KonvaEventObject<MouseEvent>
    ) => {
        e.cancelBubble = true;
        setIsDraggable(true);
        if (stage) {
            stage.container().style.cursor = 'move';
            setIsHover(true);
        }
    };
    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'grabbing';
        }
    };

    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'pointer';
            setOffset({
                x: e.target.x() - position.x,
                y: e.target.y() - position.y,
            });
        }
    };

    // click edit
    const handleEditClick = (e: any) => {
        dispatcher({
            type: 'setMode',
            payload: state.mode == 'view' ? 'edit' : 'view',
        });
    };

    // click open BizRelation/BizAction dialog
    const handleOpenBizRelationDialogClick = (e: any) => {
        if (handleBizRelationOpen) handleBizRelationOpen();
    };

    let overlayWidth;
    let overlayHeight;
    switch (chipPosition) {
        case 'center':
            overlayWidth = state.centerChipSize.width;
            overlayHeight = state.centerChipSize.height;
            break;
        case 'nearOfStart':
            overlayWidth = state.fromChipSize.width;
            overlayHeight = state.fromChipSize.height;
            break;
        case 'nearOfEnd':
            overlayWidth = state.toChipSize.width;
            overlayHeight = state.toChipSize.height;
            break;
    }
    let overlayX = overlayBeCentered ? -overlayWidth / 2 : 0;
    let overlayY = overlayBeCentered ? -overlayHeight / 2 : 0;

    return (
        <Group
            x={position.x + offset.x}
            y={position.y + offset.y}
            draggable={isDraggable}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
        >
            <Group opacity={state.mode == 'view' ? 1 : 0.5}>{chipShape}</Group>
            {/* overlay */}
            <Group ref={overlayRef} x={overlayX} y={overlayY} opacity={0}>
                <Group
                    onMouseEnter={handleDragHandleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Rect
                        width={overlayWidth}
                        height={overlayHeight / 4}
                        fill="rgba(0, 0, 0, 0.35)"
                    ></Rect>
                    <MaterialIcon
                        isShape={true}
                        codePoint={IconType.DragHandle}
                        konva={{
                            x: overlayWidth / 2 - overlayHeight / 8,
                            y: 0,
                            size: overlayHeight / 4,
                            color: 'white',
                        }}
                    ></MaterialIcon>
                </Group>
                <Rect
                    y={overlayHeight / 4}
                    width={overlayWidth}
                    height={overlayHeight / 2}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleOpenBizRelationDialogClick}
                ></Rect>
                <Group
                    y={(overlayHeight / 4) * 3}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleEditClick}
                >
                    <Rect
                        width={overlayWidth}
                        height={overlayHeight / 4}
                        fill="rgba(0, 0, 0, 0.35)"
                    ></Rect>
                    <MaterialIcon
                        isShape={true}
                        codePoint={
                            state.mode == 'view'
                                ? IconType.Edit
                                : IconType.Close
                        }
                        konva={{
                            x: overlayWidth / 2 - overlayHeight / 8,
                            y: 0,
                            size: overlayHeight / 4,
                            color: 'white',
                        }}
                    ></MaterialIcon>
                </Group>
            </Group>
        </Group>
    );
};

const ProcOutputOnRelationShape = (props: {
    procOutputs: Array<ExpandedProcData>;
    relation: BizRelation;
}) => {
    const { procOutputs } = props;
    // ExternalData が設定されている場合には、その設定を表示する
    // BizIO IDが設定されている場合には、そのBizIOを表示する

    const fontSize = RelationSideShapeFontSize;
    const iconSize = RelationSideShapeIconSize;

    return procOutputs ? (
        <Group>
            {procOutputs.map((procOutput, index) => {
                const { bizIO, ext } = procOutput;
                if (ext && ext.view && ext.name) {
                    ext.view.avatarConf.size = {
                        width: iconSize,
                        height: iconSize,
                    };
                    return (
                        <Group key={`procOutput_${index}`} y={fontSize / 3}>
                            <BizIOComponentBaseIcon
                                isShape={true}
                                id={`procOutputIcon_${index}`}
                                name={ext.name}
                                viewExtData={ext.view}
                            />
                            <Text
                                x={iconSize + fontSize / 3}
                                y={fontSize}
                                fontSize={fontSize}
                                text={ext.name}
                            />
                        </Group>
                    );
                } else {
                    // externalData が設定されていない場合には、対象BizIOを表示する
                    return (
                        bizIO && (
                            <Group key={`procOutput_${index}`} y={fontSize / 3}>
                                <BizIOComponentBaseIcon
                                    isShape={true}
                                    id={`procOutputIcon_${index}`}
                                    name={bizIO.name}
                                    konva={{
                                        stackedColor: 'transparent',
                                    }}
                                />
                                <Text
                                    x={iconSize + fontSize / 3}
                                    y={fontSize}
                                    fontSize={fontSize}
                                    text={bizIO.name}
                                />
                            </Group>
                        )
                    );
                }
            })}
        </Group>
    ) : (
        <Group></Group>
    );
};
