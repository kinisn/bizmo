import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { useRef, useState } from 'react';
import { Circle, Group, Line, Shape } from 'react-konva';
import { ArrowHeadShape } from './ArrowHeadShape';

export const SplineArrowShape = ({
    start,
    end,
    controls1,
    controls2,
    color = 'black',
    lineWidth = 2,
    arrowSize = 20,
    arrowMode = 'end',
    mode = 'view',
}: {
    start: Vector2d;
    end: Vector2d;
    controls1?: Vector2d;
    controls2?: Vector2d;
    color?: string;
    lineWidth?: number;
    arrowSize?: number;
    arrowMode?: 'end' | 'start' | 'both';
    mode?: 'edit' | 'view';
}) => {
    const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(
        mode ?? 'view'
    );

    const shapeRef = useRef<Konva.Group>(null);
    const stage = shapeRef.current?.getStage();

    const quarter: Vector2d = {
        x: (end.x - start.x) / 4 + start.x,
        y: (end.y - start.y) / 4 + start.y,
    };
    const quarter3rd: Vector2d = {
        x: ((end.x - start.x) / 4) * 3 + start.x,
        y: ((end.y - start.y) / 4) * 3 + start.y,
    };

    const [controls1Pt, setControls1Pt] = useState({
        x: controls1 ? controls1.x : quarter.x,
        y: controls1 ? controls1.y : quarter.y,
    });
    const [controls2Pt, setControls2Pt] = useState({
        x: controls2 ? controls2.x : quarter3rd.x,
        y: controls2 ? controls2.y : quarter3rd.y,
    });

    // ベジェ曲線Shape 実体
    const sceneFunc = (ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(
            controls1Pt.x,
            controls1Pt.y,
            controls2Pt.x,
            controls2Pt.y,
            end.x,
            end.y
        );
        ctx.stroke();
        ctx.fillStrokeShape(shape);
    };

    // コントロールポイントのドラッグ処理
    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        if (stage && e.currentTarget instanceof Konva.Circle) {
            e.cancelBubble = true;
            stage.container().style.cursor = 'move';
            if (e.currentTarget.id() === 'anchorControls1') {
                setControls1Pt(e.currentTarget.position());
            } else if (e.currentTarget.id() === 'anchorControls2') {
                setControls2Pt(e.currentTarget.position());
            }
        }
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        if (stage && e.currentTarget instanceof Konva.Circle) {
            e.cancelBubble = true;
            stage.container().style.cursor = 'default';
        }
    };

    const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (stage && e.currentTarget instanceof Konva.Circle) {
            e.cancelBubble = true;
            stage.container().style.cursor = 'move';
        }
    };

    const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (stage && e.currentTarget instanceof Konva.Circle) {
            e.cancelBubble = true;
            stage.container().style.cursor = 'default';
        }
    };

    const handleLineClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        setCurrentMode(currentMode === 'view' ? 'edit' : 'view');
    };

    return (
        <Group ref={shapeRef}>
            <Shape
                sceneFunc={sceneFunc}
                stroke={color}
                strokeWidth={lineWidth}
                onClick={handleLineClick}
            ></Shape>
            {/* arrow */}
            {arrowMode !== 'start' && (
                <ArrowHeadShape
                    x={end.x}
                    y={end.y}
                    radian={Math.atan2(
                        end.y - controls2Pt.y,
                        end.x - controls2Pt.x
                    )}
                    size={arrowSize}
                    radianMargin={lineWidth}
                    fillStyle={color}
                    onClick={handleLineClick}
                />
            )}
            {arrowMode !== 'end' && (
                <ArrowHeadShape
                    x={start.x}
                    y={start.y}
                    radian={Math.atan2(
                        start.y - controls1Pt.y,
                        start.x - controls1Pt.x
                    )}
                    size={arrowSize}
                    radianMargin={lineWidth}
                    fillStyle={color}
                    onClick={handleLineClick}
                />
            )}
            {/* Edit mode */}
            {currentMode === 'edit' && (
                <>
                    <Line
                        id="pathControls1"
                        dash={[5, 5, 5, 5]}
                        strokeWidth={1}
                        stroke={color}
                        lineCap="round"
                        opacity={0.5}
                        points={[
                            start.x,
                            start.y,
                            controls1Pt.x,
                            controls1Pt.y,
                        ]}
                        onClick={handleLineClick}
                    />
                    <Line
                        id="pathControls2"
                        dash={[5, 5, 5, 5]}
                        strokeWidth={1}
                        stroke={color}
                        lineCap="round"
                        opacity={0.5}
                        points={[end.x, end.y, controls2Pt.x, controls2Pt.y]}
                        onClick={handleLineClick}
                    />
                    <Circle
                        id="anchorControls1"
                        x={controls1Pt.x}
                        y={controls1Pt.y}
                        radius={6}
                        stroke="rgb(14 165 233)"
                        fill="#ffffff"
                        strokeWidth={2}
                        draggable={true}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    />
                    <Circle
                        id="anchorControls2"
                        x={controls2Pt.x}
                        y={controls2Pt.y}
                        radius={6}
                        stroke="rgb(14 165 233)"
                        fill="#ffffff"
                        strokeWidth={2}
                        draggable={true}
                        onDragMove={handleDragMove}
                        onDragEnd={handleDragEnd}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    />
                </>
            )}
        </Group>
    );
};
