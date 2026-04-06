import Konva from 'konva';
import { Shape } from 'react-konva';

const route3 = 1.7320508075688772;

export const ArrowHeadShape = ({
    x = 0,
    y = 0,
    size = 20,
    radius = 2,
    radian = 0,
    fillStyle = 'black',
    radianMargin = 2,
    onClick,
}: {
    x?: number;
    y?: number;
    size?: number;
    radius?: number;
    radian?: number;
    radianMargin?: number;
    fillStyle?: CanvasFillStrokeStyles['fillStyle'];
    onClick?(evt: Konva.KonvaEventObject<MouseEvent>): void;
}) => {
    const triangleHalf = size / 2;
    const top = { x: 0, y: triangleHalf * route3 };
    const left = { x: triangleHalf, y: 0 };
    const bottom = { x: 0, y: top.y / 5 };
    const right = { x: -triangleHalf, y: 0 };
    const sceneFunc = (ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.rotate(radian - Math.PI / 2); // 元の画像が 90度回転しているのを補正
        ctx.translate(0, -top.y + radius + radianMargin);

        ctx.beginPath();
        ctx.moveTo(bottom.x, bottom.y);
        ctx.arcTo(bottom.x, bottom.y, right.x, right.y, radius);
        ctx.arcTo(right.x, right.y, top.x, top.y, radius);
        ctx.arcTo(top.x, top.y, left.x, left.y, radius);
        ctx.arcTo(left.x, left.y, bottom.x, bottom.y, radius);
        ctx.closePath();

        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.fillStrokeShape(shape); // これがないと click が反応しない
    };
    return <Shape x={x} y={y} sceneFunc={sceneFunc} onClick={onClick}></Shape>;
};
