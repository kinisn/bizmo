import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { SnappingDrag } from 'bizmoView/common/canvas/SnappingDrag';
import {
    BizIOExtData,
    createBizIOExtData,
} from 'bizmoView/common/external/bizIOExtData';
import { CommonExtViewDefault } from 'bizmoView/common/external/common/commonExtView';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { BizIOComponentIcon } from 'bizmoView/component/bizIOComponent/icon/IconUtil';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';

/**
 * BizIOを表現する Konvaシェイブ
 *
 * 画像を表示するために、変更された場合には再描画する必要があるかも
 * @returns
 */

export const BizIONodeShape = (props: {
    bizIO:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    snappedDrag: SnappingDrag;
    handleDialogOpen: (targetID: string) => void;
    handleDragEnd: (
        bizIO:
            | BizIO<BizIOExtData, BizComponentGroupType>
            | CollectionBizIO<BizIOExtData, BizComponentGroupType>,
        draggedPosition: any
    ) => void;
    handleDragMove: (
        bizIO:
            | BizIO<BizIOExtData, BizComponentGroupType>
            | CollectionBizIO<BizIOExtData, BizComponentGroupType>,
        draggedPosition: any
    ) => void;
}) => {
    const { bizIO, snappedDrag, handleDialogOpen } = props;
    //console.log('BizIONodeShape', bizIO.externalData?.view);

    const shapeRef = useRef<Konva.Group>(null);
    const stage = shapeRef.current?.getStage();

    const avatarWidth =
        bizIO.externalData?.view.avatarConf.size.width ??
        CommonExtViewDefault.avatarConf.size.width;
    const avatarHeight =
        bizIO.externalData?.view.avatarConf.size.height ??
        CommonExtViewDefault.avatarConf.size.height;

    // handler
    const handleOpenDialogClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (bizIO) handleDialogOpen(bizIO.id);
    };
    const handleMouseEnter = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'pointer';
            setIsHover(true);
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
    const handleMouseLeave = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setIsDraggable(false);
        if (stage) {
            stage.container().style.cursor = 'default';
            setIsHover(false);
        }
    };
    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'grabbing';
            const draggedPosition = snappedDrag.onSnappingDragMove(e);

            // update bizIO position
            if (!bizIO.externalData) {
                bizIO.externalData = createBizIOExtData();
            }
            bizIO.externalData.view.position = draggedPosition.relative;

            // escalate event
            props.handleDragMove(bizIO, draggedPosition);
        }
    };
    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'pointer';
            const draggedPosition = snappedDrag.onSnappingDragEnd(e);

            // update bizIO position
            if (!bizIO.externalData) {
                bizIO.externalData = createBizIOExtData();
            }
            bizIO.externalData.view.position = draggedPosition.relative;

            // escalate event
            props.handleDragEnd(bizIO, draggedPosition);
        }
    };

    useEffect(() => {
        stage?.batchDraw();
    }, [avatarHeight, avatarWidth, bizIO.externalData?.view.avatarImage]);

    // overlay on mouse hover
    const overlayRef = useRef<Konva.Group>(null);
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

    // draggable
    const [isDraggable, setIsDraggable] = useState(false);

    return (
        <Group
            ref={shapeRef}
            id={bizIO.id}
            name={snappedDrag.TARGET_NAME}
            x={bizIO?.externalData?.view.position?.x ?? 0}
            y={bizIO?.externalData?.view.position?.y ?? 0}
            draggable={isDraggable}
            // event
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
        >
            <BizIOComponentIcon
                isShape={true}
                bizIO={bizIO}
            ></BizIOComponentIcon>
            <Text
                y={avatarHeight + 14}
                align="center"
                width={avatarWidth}
                fontSize={14}
                text={bizIO.name}
            ></Text>
            <Group ref={overlayRef} opacity={0}>
                <Group
                    onMouseEnter={handleDragHandleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Rect
                        width={avatarWidth}
                        height={avatarHeight / 5}
                        fill="rgba(0, 0, 0, 0.35)"
                    ></Rect>
                    <MaterialIcon
                        isShape={true}
                        codePoint={IconType.DragHandle}
                        konva={{
                            x: avatarWidth / 2 - avatarHeight / 10,
                            y: 0,
                            size: avatarHeight / 5,
                            color: 'white',
                        }}
                    ></MaterialIcon>
                </Group>
                <Rect
                    y={avatarHeight / 5}
                    width={avatarWidth}
                    height={(avatarHeight * 3) / 5}
                    onClick={handleOpenDialogClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                ></Rect>
                <Group
                    y={(avatarHeight / 5) * 4}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Rect
                        width={avatarWidth}
                        height={avatarHeight / 5}
                        fill="rgba(0, 0, 0, 0.35)"
                    ></Rect>
                    <MaterialIcon
                        isShape={true}
                        codePoint={IconType.Fullscreen}
                        konva={{
                            x: avatarWidth / 2 - avatarHeight / 10,
                            y: 0,
                            size: avatarHeight / 5,
                            color: 'white',
                        }}
                    ></MaterialIcon>
                </Group>
            </Group>
        </Group>
    );
};
