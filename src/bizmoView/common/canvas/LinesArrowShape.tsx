import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import React, { useEffect, useRef, useState } from 'react';
import { Circle, Group, Shape } from 'react-konva';
import { ArrowHeadShape } from './ArrowHeadShape';

export type LineDirection = 'H' | 'V';

export type LineConf = {
    direction: LineDirection;
    length: number; // マイナスは軸と逆方向の長さ
};

export type RepresentativePosition = {
    at: Vector2d;
    direction: LineDirection;
};

export type Representatives = {
    center: RepresentativePosition;
    nearOfStart: RepresentativePosition;
    nearOfEnd: RepresentativePosition;
};

export type ConnectedPoints = {
    points: Array<Vector2d>;
    complementedLines: Array<LineConf>;
};

/**
 * 始点・終点と線分定義から、連続する点の配列を返す。
 * lines を指定しても、end に至らない場合は自動的に補完される。
 * @param start
 * @param end
 * @param lines
 * @param limitLength
 * @returns
 */
export function buildConnectedPoints(
    start: Vector2d,
    end: Vector2d,
    lines: LineConf[],
    limitLength: number
): ConnectedPoints {
    // 同一方向の線分を１つにまとめ、長さが不十分なら前後の線分の長さを伸ばす
    const cpLines: Array<LineConf> = [...lines];
    const newLines: Array<LineConf> = [];
    cpLines.map((lineConf, index) => {
        const newLineConf: LineConf = { ...lineConf };
        // 同一方向の線分を１つにまとめる
        if (
            newLines.length > 0 &&
            newLineConf.direction == newLines[newLines.length - 1].direction
        ) {
            newLines[newLines.length - 1].length += newLineConf.length;
        } else {
            // 長さが不十分なら後の線分の長さを伸ばす
            if (
                newLineConf.length > limitLength ||
                newLineConf.length < -limitLength
            ) {
                newLines.push(newLineConf);
            } else {
                // 後の線分の長さを伸ばす
                if (cpLines.length > index + 2) {
                    cpLines[index + 2].length += newLineConf.length;
                }
            }
        }
    });

    const points: Array<Vector2d> = [{ ...start }];
    newLines.map((lineConf) => {
        const lastPt: Vector2d = points[points.length - 1];
        points.push(
            lineConf.direction === 'H'
                ? {
                      x: lastPt.x + lineConf.length,
                      y: lastPt.y,
                  }
                : {
                      x: lastPt.x,
                      y: lastPt.y + lineConf.length,
                  }
        );
    });

    // 補正１軸目
    if (
        points[points.length - 1].x !== end.x ||
        points[points.length - 1].y !== end.y
    ) {
        if (
            newLines.length > 0 &&
            newLines[newLines.length - 1].direction === 'H'
        ) {
            newLines.push({
                direction: 'V',
                length: end.y - points[points.length - 1].y,
            });
            points.push({
                x: points[points.length - 1].x,
                y: end.y,
            });
        } else {
            newLines.push({
                direction: 'H',
                length: end.x - points[points.length - 1].x,
            });
            points.push({
                x: end.x,
                y: points[points.length - 1].y,
            });
        }
    }

    // 補正2軸目：　１回目の補正で end に至らない場合
    if (
        points[points.length - 1].x !== end.x ||
        points[points.length - 1].y !== end.y
    ) {
        if (
            newLines.length > 0 &&
            newLines[newLines.length - 1].direction === 'H'
        ) {
            newLines.push({
                direction: 'V',
                length: end.y - points[points.length - 1].y,
            });
        } else {
            newLines.push({
                direction: 'H',
                length: end.x - points[points.length - 1].x,
            });
        }
        points.push({
            x: end.x,
            y: end.y,
        });
    }

    // 追加用の線分を追加
    // start 前
    points.unshift({ ...start });
    if (newLines.length > 0 && newLines[0].direction === 'H') {
        newLines.unshift({
            direction: 'V',
            length: 0,
        });
    } else {
        newLines.unshift({
            direction: 'H',
            length: 0,
        });
    }

    // end 後
    points.push({ ...end });
    if (
        newLines.length > 0 &&
        newLines[newLines.length - 1].direction === 'H'
    ) {
        newLines.push({
            direction: 'V',
            length: 0,
        });
    } else {
        newLines.push({
            direction: 'H',
            length: 0,
        });
    }

    return {
        points: points,
        complementedLines: newLines,
    };
}

/**
 * Center, nearOfStart, nearOfEnd の位置を計算する。
 * @param start
 * @param end
 * @param connectedPoints
 * @param nearLength start と end からの近さ。これ以上近いと、Start と End が設定される。
 * @returns
 */
function getRepresentatives(
    start: Vector2d,
    end: Vector2d,
    connectedPoints: ConnectedPoints,
    nearLength: number
): Representatives {
    const { points, complementedLines } = connectedPoints;

    // init
    const representatives: Representatives = {
        center: {
            at: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
            direction: 'H',
        },
        nearOfStart: { at: start, direction: complementedLines[0].direction },
        nearOfEnd: {
            at: end,
            direction:
                complementedLines[complementedLines.length - 1].direction,
        },
    };

    // prepare
    const makeRepresentative = (
        i: number,
        remain: number
    ): RepresentativePosition => {
        return {
            at: {
                x:
                    points[i].x +
                    (complementedLines[i].direction == 'H'
                        ? complementedLines[i].length < 0
                            ? -remain
                            : remain
                        : 0),
                y:
                    points[i].y +
                    (complementedLines[i].direction == 'V'
                        ? complementedLines[i].length < 0
                            ? -remain
                            : remain
                        : 0),
            },
            direction: complementedLines[i].direction,
        };
    };

    // calc
    const totalLength = complementedLines
        .map((lineConf) => lineConf.length)
        .reduce((sum, current) => {
            return sum + Math.abs(current);
        });
    let currentLength = 0;
    for (let i = 0; i < complementedLines.length; i++) {
        const lastLength = currentLength;
        currentLength += Math.abs(complementedLines[i].length);
        if (lastLength < totalLength / 2 && totalLength / 2 <= currentLength) {
            // check center
            representatives.center = makeRepresentative(
                i,
                totalLength / 2 - lastLength
            );
        }
        if (lastLength < nearLength && nearLength <= currentLength) {
            // check nearOfStart
            representatives.nearOfStart = makeRepresentative(
                i,
                nearLength - lastLength
            );
        }
        if (
            lastLength < totalLength - nearLength &&
            totalLength - nearLength <= currentLength
        ) {
            // check nearOfEnd
            representatives.nearOfEnd = makeRepresentative(
                i,
                totalLength - nearLength - lastLength
            );
        }
    }
    return representatives;
}

export type LinesArrowMode = 'end' | 'start' | 'both' | 'none';
export const LinesArrowShape = ({
    start,
    end,
    lines,
    cornerRadius = 5,
    color = 'black',
    lineWidth = 2,
    arrowSize = 20,
    arrowMode = 'end',
    edit = false,
    limitLength = 4,
    nearLength = 10,
    representativePositionHandler,
    lineClickHandler,
    onLineCenterShape,
    onLineNearStartShape,
    onLineNearEndShape,
}: {
    start: Vector2d;
    end: Vector2d;
    lines?: Array<LineConf>; // 最終的に end に至らない場合には、自動的に補完される。
    cornerRadius?: number;
    color?: string;
    lineWidth?: number;
    arrowSize?: number;
    arrowMode?: LinesArrowMode;
    edit?: boolean;
    limitLength?: number; // これ以上近くに1つ飛びの同方向の線分を置くと、その間の線分が間引きされる
    nearLength?: number; // nearOfStart と nearOfEnd が設定される距離
    representativePositionHandler?: (positions: Representatives) => void;
    lineClickHandler?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
    onLineCenterShape?: React.ReactNode; // 必ず Konva.Shape であること
    onLineNearStartShape?: React.ReactNode; // 必ず Konva.Shape であること
    onLineNearEndShape?: React.ReactNode; // 必ず Konva.Shape であること
}) => {
    const [editMode, setEditMode] = useState<boolean>(edit ?? false);
    const [connectedPoints, setConnectedPoints] = useState<ConnectedPoints>(
        buildConnectedPoints(start, end, lines ?? [], limitLength)
    );
    useEffect(() => {
        // start, end が変更されたら、再計算
        // lines は start, end が変更されるときには、同時に変更されているはず
        setConnectedPoints(
            buildConnectedPoints(start, end, lines ?? [], limitLength)
        );
    }, [start.x, start.y, end.x, end.y, limitLength]);

    const { points, complementedLines } = connectedPoints;
    const shapeRef = useRef<Konva.Group>(null);
    const stage = shapeRef.current?.getStage();

    // 特殊Shape 実体
    const sceneFunc = (ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(points[0].x, points[0].y);
        points.map((point, index, points) => {
            if (index === points.length - 1) {
                ctx.lineTo(point.x, point.y);
            } else {
                ctx.arcTo(
                    points[index].x,
                    points[index].y,
                    points[index + 1].x,
                    points[index + 1].y,
                    cornerRadius
                );
            }
        });
        ctx.strokeStyle = color;
        ctx.stroke();
        // ctx.fillStrokeShape(shape); これをいれると、線分の上でのクリックが反応するが、PathClose上も被ってしまうため利用しない。
    };

    // === 編集モード ===
    useEffect(() => {
        setEditMode(edit);
    }, [edit]);

    // コントロールポイントのドラッグ処理
    const handleDragMove = (currentId: number) => {
        return (e: Konva.KonvaEventObject<DragEvent>) => {
            e.cancelBubble = true;
            if (stage && e.target instanceof Konva.Circle) {
                stage.container().style.cursor = 'move';

                // move with both edges
                const currentLineConf = complementedLines[currentId];
                if (currentLineConf.direction === 'H') {
                    // move
                    points[currentId].y = e.target.y();
                    points[currentId + 1].y = e.target.y();
                    // length
                    complementedLines[currentId - 1].length =
                        points[currentId].y - points[currentId - 1].y;
                    complementedLines[currentId + 1].length =
                        points[currentId + 2].y - points[currentId + 1].y;
                } else {
                    // move
                    points[currentId].x = e.target.x();
                    points[currentId + 1].x = e.target.x();
                    // length
                    complementedLines[currentId - 1].length =
                        points[currentId].x - points[currentId - 1].x;
                    complementedLines[currentId + 1].length =
                        points[currentId + 2].x - points[currentId + 1].x;
                }

                setConnectedPoints({
                    points: points,
                    complementedLines: complementedLines,
                });
            }
        };
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'default';
            setConnectedPoints(
                buildConnectedPoints(start, end, complementedLines, limitLength)
            );
        }
    };

    const handleMouseOver = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'move';
        }
    };

    const handleMouseOut = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        if (stage) {
            stage.container().style.cursor = 'default';
        }
    };

    const handleLineClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (lineClickHandler) {
            lineClickHandler(e);
        } else {
            setEditMode(!editMode);
        }
    };

    const dragBound = (index: number) => {
        return (pos: Vector2d) => {
            const result = { ...pos };
            if (complementedLines[index].direction === 'V') {
                result.y =
                    ((points[index].y + points[index + 1].y) / 2) *
                        stage!.scaleY() +
                    stage!.getAbsolutePosition().y;
            } else {
                result.x =
                    ((points[index].x + points[index + 1].x) / 2) *
                        stage!.scaleX() +
                    stage!.getAbsolutePosition().x;
            }
            return result;
        };
    };

    let editorCircles = <></>;
    points.map((point, index, points) => {
        if (0 < index && index < points.length - 2) {
            editorCircles = (
                <>
                    {editorCircles}
                    <Circle
                        id={`conf_${index}`}
                        x={(points[index].x + points[index + 1].x) / 2}
                        y={(points[index].y + points[index + 1].y) / 2}
                        radius={6}
                        stroke="rgb(14 165 233)"
                        fill={'white'}
                        strokeWidth={2}
                        draggable={true}
                        onDragMove={handleDragMove(index)}
                        onDragEnd={handleDragEnd}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                        dragBoundFunc={dragBound(index)}
                    />
                </>
            );
        }
    });

    useEffect(() => {
        if (representativePositionHandler) {
            representativePositionHandler(
                getRepresentatives(start, end, connectedPoints, nearLength)
            );
        }
    }, [connectedPoints]);

    return (
        <Group ref={shapeRef}>
            <Shape
                sceneFunc={sceneFunc}
                hitFunc={sceneFunc}
                stroke={color}
                strokeWidth={lineWidth}
            ></Shape>
            {/* arrow */}
            {(arrowMode == 'start' || arrowMode == 'both') && (
                <ArrowHeadShape
                    x={start.x}
                    y={start.y}
                    radian={Math.atan2(
                        points[1].y - points[2].y,
                        points[1].x - points[2].x
                    )}
                    size={arrowSize}
                    radianMargin={lineWidth}
                    fillStyle={color}
                    onClick={handleLineClick}
                />
            )}
            {(arrowMode == 'end' || arrowMode == 'both') && (
                <ArrowHeadShape
                    x={end.x}
                    y={end.y}
                    radian={Math.atan2(
                        points[points.length - 2].y -
                            points[points.length - 3].y,
                        points[points.length - 2].x -
                            points[points.length - 3].x
                    )}
                    size={arrowSize}
                    radianMargin={lineWidth}
                    fillStyle={color}
                    onClick={handleLineClick}
                />
            )}
            {/* on line shapes */}
            {onLineNearStartShape && onLineNearStartShape}
            {onLineNearEndShape && onLineNearEndShape}
            {onLineCenterShape && onLineCenterShape}
            {/* Edit mode */}
            {editMode && editorCircles}
        </Group>
    );
};
