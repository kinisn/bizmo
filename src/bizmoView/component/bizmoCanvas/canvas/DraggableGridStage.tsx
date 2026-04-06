import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { ReactNode, useEffect, useRef } from 'react';
import { Layer, Rect, Stage } from 'react-konva';

/**
 * DraggableGridStageDecorator
 *
 * note
 * https://longviewcoder.com/2021/12/08/konva-a-better-grid/
 * https://codepen.io/JEE42/pen/rNGLayR?editors=0010
 */

const SCALES: Array<number> = [
    5, 4, 3, 2.5, 2, 1.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2,
];

export const DraggableGridStage = (props: {
    gridStepSize: number;
    minStageHalfSize: number; // 最小スケール（もっとも俯瞰した状態）での Window表示stage の半分のpxサイズ
    bgColor?: string;
    children?: ReactNode;
}) => {
    const {
        gridStepSize,
        minStageHalfSize,
        children,
        bgColor = 'rgba(242, 242, 242, 1)',
    } = props;

    const stageRef = useRef<Konva.Stage>(null);
    const gridLayerRef = useRef<Konva.Layer>(null);
    const bgRectRef = useRef<Konva.Rect>(null);
    // Konva 内部でRerenderされる想定で setStateしていない
    let currentScaleIndex = 6; // scale 1

    /**
     * 最小スケール（もっとも俯瞰した状態）での Window表示stage の半分のpxサイズ
     */
    const minHalfSize = (): number => {
        return Math.max(
            minStageHalfSize,
            window.innerWidth / 2,
            window.innerHeight / 2
        );
    };

    const currentScale = (): number => {
        return SCALES[currentScaleIndex];
    };

    const minScale = (): number => {
        return SCALES[SCALES.length - 1];
    };

    const normHalfSize = (): number => {
        return minHalfSize() / minScale();
    };

    // ============= Render Methods =================

    const drawGrid = () => {
        if (!stageRef.current || !gridLayerRef.current || !bgRectRef.current)
            return;
        const halfSize = normHalfSize();

        // draw background
        bgRectRef.current.width(halfSize * 2);
        bgRectRef.current.height(halfSize * 2);
        bgRectRef.current.x(-halfSize);
        bgRectRef.current.y(-halfSize);

        // draw grid
        const gridLayer = gridLayerRef.current;
        gridLayer.destroyChildren();

        const xSteps = Math.round((halfSize * 2) / gridStepSize);
        const ySteps = Math.round((halfSize * 2) / gridStepSize);

        // draw vertical lines
        for (let i = 0; i <= xSteps; i++) {
            gridLayer.add(
                new Konva.Line({
                    x: -halfSize + i * gridStepSize,
                    y: -halfSize,
                    points: [0, 0, 0, halfSize * 2],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }

        //draw Horizontal lines
        for (let i = 0; i <= ySteps; i++) {
            gridLayer.add(
                new Konva.Line({
                    x: -halfSize,
                    y: -halfSize + i * gridStepSize,
                    points: [0, 0, halfSize * 2, 0],
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 1,
                })
            );
        }

        gridLayer.batchDraw();

        // position
        stageRef.current.position(
            handleDragBound({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
            })
        );
    };

    // ============= Handlers =================

    /**
     * Scaleを考慮したDrag位置
     *
     * Scale を変更してもStage中央は、常に (window.innerWidth/2, window.innerHeight/2) となる
     * また左上は常に normHalfSize に scale計算した後の値となる。
     * これらから右下の座標を計算し、Drag限界とする。
     * @param pos stageの絶対座標
     * @returns
     */
    const handleDragBound = (pos: Vector2d): Vector2d => {
        const scaledHalfSize = normHalfSize() * currentScale();
        const [maxX, maxY] = [scaledHalfSize, scaledHalfSize]; // 右下へのDrag限界
        const [minX, minY] = [
            -scaledHalfSize + window.innerWidth,
            -scaledHalfSize + window.innerHeight,
        ]; // 左上へのDrag限界

        const bound = (value: number, min: number, max: number) =>
            Math.min(Math.max(value, min), max);

        return {
            x: bound(pos.x, minX, maxX),
            y: bound(pos.y, minY, maxY),
        };
    };

    const handleWheel = (e: any) => {
        e.cancelBubble = true;
        const stage = stageRef.current;
        if (!stage || !gridLayerRef.current) return;

        const pointer = stage.getPointerPosition();
        if (pointer === null) return;

        const oldScale = stage.scaleX();

        const mousePointTo: Vector2d = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const lastScaleIndex = currentScaleIndex;
        if (direction > 0) {
            currentScaleIndex =
                currentScaleIndex > 0
                    ? currentScaleIndex - 1
                    : currentScaleIndex;
        } else {
            currentScaleIndex =
                currentScaleIndex < SCALES.length - 1
                    ? currentScaleIndex + 1
                    : currentScaleIndex;
        }
        if (lastScaleIndex === currentScaleIndex) return;

        const newScale = currentScale();
        stage.scale({ x: newScale, y: newScale });

        var newPos: Vector2d = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(handleDragBound(newPos));
    };

    // initialize stage
    useEffect(drawGrid, [stageRef, gridLayerRef]);

    // window resize
    useEffect(() => {
        window.addEventListener('resize', () => {
            const stage = stageRef.current?.getStage();
            if (!stage || !gridLayerRef.current) return;
            stage.width(window.innerWidth);
            stage.height(window.innerHeight);
            drawGrid();
        });
        return () => {
            window.removeEventListener('resize', () => {});
        };
    }, []);

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            draggable={true}
            dragBoundFunc={handleDragBound}
            onWheel={handleWheel}
            onDragMove={(e) => {
                if (stageRef.current) {
                    stageRef.current.container().style.cursor = 'grabbing';
                }
            }}
            onDragEnd={(e) => {
                if (stageRef.current) {
                    stageRef.current.container().style.cursor = 'default';
                }
            }}
        >
            <Layer key={'bgLayer'}>
                <Rect ref={bgRectRef} fill={bgColor}></Rect>
            </Layer>
            <Layer key={'gridLayer'} ref={gridLayerRef}></Layer>
            {children}
        </Stage>
    );
};
