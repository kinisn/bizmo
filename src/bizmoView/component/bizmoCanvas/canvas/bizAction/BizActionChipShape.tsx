import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { useEffect, useReducer, useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';

type BizActionChipShapeState = {
    labelLength: number;
    currentPosition: Vector2d;
};

type BizActionChipShapeAction = {
    type: 'adjustToNewLabelLength';
    payload: {
        labelLength: number;
        currentPosition: Vector2d;
    };
};

export const BizActionChipShape = ({
    label = '',
    order,
    x = 0,
    y = 0,
    fontSize = 14,
    opacity = 1,
    maxLength = 10,
    toBeCentered = false,
    draggable = false,
    onClick,
    sizeHandler,
}: {
    label: string;
    order?: number | string;
    x?: number;
    y?: number;
    fontSize?: number;
    opacity?: number;
    maxLength?: number;
    toBeCentered?: boolean;
    draggable?: boolean;
    onClick?: (e: KonvaEventObject<MouseEvent>) => void;
    sizeHandler?: (size: { width: number; height: number }) => void;
}) => {
    const scale = fontSize / 12;
    const strokeWidth = 1.5;
    const currentLabel =
        label.length > maxLength ? label.slice(0, maxLength) + '...' : label;
    const hasOrder = order !== undefined && order !== null && order !== '';

    const [state, dispatch] = useReducer(
        (state: BizActionChipShapeState, action: BizActionChipShapeAction) => {
            switch (action.type) {
                case 'adjustToNewLabelLength':
                    return {
                        ...state,
                        labelLength: action.payload.labelLength,
                        currentPosition: action.payload.currentPosition,
                    };
            }
        },
        {
            labelLength: (countFullHalfLetters(currentLabel) * 12) / 2,
            currentPosition: {
                x: x,
                y: y,
            },
        }
    );

    const textRef = useRef<Konva.Text>(null);
    const rectRef = useRef<Konva.Rect>(null);

    // ラベルの長さを実測して設定
    // toBeCenteredがtrueの場合、x,yは左上の座標ではなく中心の座標として扱う
    useEffect(() => {
        if (rectRef.current && textRef.current) {
            dispatch({
                type: 'adjustToNewLabelLength',
                payload: {
                    labelLength: textRef.current.width(),
                    currentPosition: {
                        x:
                            x -
                            (toBeCentered
                                ? (rectRef.current.width() +
                                      strokeWidth * 2 +
                                      countFullHalfLetters(currentLabel)) / // Hack: 半角１文字あたり 0.5　程度右にずれているので強制的に補正
                                  2
                                : 0),
                        y:
                            y -
                            (toBeCentered
                                ? (rectRef.current.height() + strokeWidth * 2) /
                                  2
                                : 0),
                    },
                },
            });
        }
    }, [state.labelLength, toBeCentered, x, y]);

    useEffect(() => {
        if (sizeHandler && rectRef.current) {
            sizeHandler({
                width: (rectRef.current.width() + strokeWidth * 2) * scale,
                height: (rectRef.current.height() + strokeWidth * 2) * scale,
            });
        }
    }, [state.labelLength, scale]);

    return (
        <Group
            x={state.currentPosition.x}
            y={state.currentPosition.y}
            opacity={opacity}
            scale={{ x: scale, y: scale }}
            onClick={onClick}
            draggable={draggable}
        >
            <Rect
                ref={rectRef}
                width={state.labelLength + (hasOrder ? 42 : 26)}
                height={24}
                fill="rgba(255,255,255,1)"
                stroke="rgba(0,0,0,1)"
                strokeWidth={strokeWidth}
                cornerRadius={12}
            ></Rect>

            {hasOrder && (
                <Group x={2} y={2}>
                    <Rect
                        width={20}
                        height={20}
                        cornerRadius={10}
                        fill="rgba(128,128,128,1)"
                    ></Rect>
                    <Text
                        y={6}
                        width={20}
                        fontSize={10}
                        fontStyle="bold"
                        align="center"
                        text={`${order}`}
                        fill={'rgba(255,255,255,1)'}
                    ></Text>
                </Group>
            )}

            <Text
                ref={textRef}
                x={hasOrder ? 27 : 12}
                y={7}
                fontSize={12}
                text={currentLabel}
                fill={'rgba(0,0,0,1)'}
            ></Text>
        </Group>
    );
};

export function countFullHalfLetters(str: string): number {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        str[i].match(/[ -~]/) ? (len += 1) : (len += 2);
    }
    return len;
}
