import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';

/**
 * Konva snapping drag utility
 *
 * - 同一レイヤーにある対象オブジェクトのエッジ同士でスナップする。
 * - 対象オブジェクトは name で区別される。
 *   そのため、このクラスを利用したオブジェクトを一意に識別したい場合は id を利用すること。
 *
 * https://zenn.dev/kanasugi/articles/5d91007efd31de
 * https://konvajs.org/docs/sandbox/Objects_Snapping.html
 */

type Snap = 'start' | 'center' | 'end';
type SnappingEdges = {
    vertical: Array<{
        guide: number;
        offset: number;
        snap: Snap;
    }>;
    horizontal: Array<{
        guide: number;
        offset: number;
        snap: Snap;
    }>;
};

type LineGuideStop = { vertical: Array<number>; horizontal: Array<number> };

type GuideOrientation = 'V' | 'H';
type Guide = {
    lineGuide: number;
    offset: number;
    orientation: GuideOrientation;
    snap: Snap;
};

export type SnappedPosition = {
    relative: Vector2d;
    absolute: Vector2d;
};

export class SnappingDrag {
    private __guidelineOffset: number;
    private __targetName: string;
    private __guideLineName: string;

    constructor(props?: {
        guidelineOffset?: number;
        targetName?: string;
        guideLineName?: string;
    }) {
        this.__guidelineOffset = props?.guidelineOffset ?? 5;
        this.__targetName = props?.targetName ?? 'object';
        this.__guideLineName = props?.guideLineName ?? 'guid-line';
    }

    get GUIDELINE_OFFSET(): number {
        return this.__guidelineOffset;
    }

    get TARGET_NAME(): string {
        return this.__targetName;
    }

    get GUIDELINE_NAME(): string {
        return this.__guideLineName;
    }

    /**
     * what points of the object will trigger to snapping?
     * it can be just center of the object
     * but we will enable all edges and center
     *
     * @param node
     * @returns
     */
    private getObjectSnappingEdges(node: Konva.Shape): SnappingEdges {
        const box = node.getClientRect();
        const absPos = node.absolutePosition();

        return {
            vertical: [
                {
                    guide: Math.round(box.x),
                    offset: Math.round(absPos.x - box.x),
                    snap: 'start',
                },
                {
                    guide: Math.round(box.x + box.width / 2),
                    offset: Math.round(absPos.x - box.x - box.width / 2),
                    snap: 'center',
                },
                {
                    guide: Math.round(box.x + box.width),
                    offset: Math.round(absPos.x - box.x - box.width),
                    snap: 'end',
                },
            ],
            horizontal: [
                {
                    guide: Math.round(box.y),
                    offset: Math.round(absPos.y - box.y),
                    snap: 'start',
                },
                {
                    guide: Math.round(box.y + box.height / 2),
                    offset: Math.round(absPos.y - box.y - box.height / 2),
                    snap: 'center',
                },
                {
                    guide: Math.round(box.y + box.height),
                    offset: Math.round(absPos.y - box.y - box.height),
                    snap: 'end',
                },
            ],
        };
    }

    /**
     * were can we snap our objects?
     *
     * @param skipShape
     * @returns
     */
    private getLineGuideStops(skipShape: Konva.Shape): LineGuideStop {
        const stage = skipShape.getStage();
        if (!stage) return { vertical: [], horizontal: [] };

        // Stageの境界や中央にスナップ
        const vertical = [0, stage.width() / 2, stage.width()];
        const horizontal = [0, stage.height() / 2, stage.height()];

        // Canvas上の各オブジェクトのエッジや中央にスナップ
        stage.find(`.${this.TARGET_NAME}`).forEach((guideItem) => {
            if (guideItem === skipShape) {
                return;
            }
            const box = guideItem.getClientRect({});
            vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
            horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
        });
        return {
            vertical,
            horizontal,
        };
    }

    /**
     * find all snapping possibilities
     *
     * @param lineGuideStops
     * @param itemBounds
     * @returns
     */
    private getGuides(
        lineGuideStops: LineGuideStop,
        itemBounds: SnappingEdges
    ): Array<Guide> {
        const resultV: Array<{
            lineGuide: number;
            diff: number;
            snap: Snap;
            offset: number;
        }> = [];

        const resultH: Array<{
            lineGuide: number;
            diff: number;
            snap: Snap;
            offset: number;
        }> = [];

        lineGuideStops.vertical.forEach((lineGuide) => {
            itemBounds.vertical.forEach((itemBound) => {
                const diff = Math.abs(lineGuide - itemBound.guide);
                if (diff < this.GUIDELINE_OFFSET) {
                    resultV.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                    });
                }
            });
        });

        lineGuideStops.horizontal.forEach((lineGuide) => {
            itemBounds.horizontal.forEach((itemBound) => {
                const diff = Math.abs(lineGuide - itemBound.guide);
                if (diff < this.GUIDELINE_OFFSET) {
                    resultH.push({
                        lineGuide: lineGuide,
                        diff: diff,
                        snap: itemBound.snap,
                        offset: itemBound.offset,
                    });
                }
            });
        });

        const guides: Array<Guide> = [];

        const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
        const minH = resultH.sort((a, b) => a.diff - b.diff)[0];

        if (minV) {
            guides.push({
                lineGuide: minV.lineGuide,
                offset: minV.offset,
                orientation: 'V',
                snap: minV.snap,
            });
        }

        if (minH) {
            guides.push({
                lineGuide: minH.lineGuide,
                offset: minH.offset,
                orientation: 'H',
                snap: minH.snap,
            });
        }

        return guides;
    }

    /**
     *
     * @param guides
     * @param layer
     */
    private drawGuides(guides: Array<Guide>, layer: Konva.Layer) {
        guides.forEach((guid) => {
            if (guid.orientation === 'H') {
                const line = new Konva.Line({
                    points: [-6000, 0, 6000, 0],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: this.GUIDELINE_NAME,
                    dash: [4, 6],
                });
                layer.add(line);
                line.absolutePosition({
                    x: 0,
                    y: guid.lineGuide,
                });
            } else if (guid.orientation === 'V') {
                const line = new Konva.Line({
                    points: [0, -6000, 0, 6000],
                    stroke: 'rgb(0, 161, 255)',
                    strokeWidth: 1,
                    name: this.GUIDELINE_NAME,
                    dash: [4, 6],
                });
                layer.add(line);
                line.absolutePosition({
                    x: guid.lineGuide,
                    y: 0,
                });
            }
        });
    }

    // === Public ===

    /**
     * スナップするドラッグを実行する
     * on dragmove で呼び出すこと
     *
     * @param e
     */
    onSnappingDragMove(e: Konva.KonvaEventObject<DragEvent>): SnappedPosition {
        e.cancelBubble = true;

        const layer = e.target.getLayer();

        // レイヤー上のすべてのガイドラインを削除する
        if (layer) {
            layer.find(`.${this.GUIDELINE_NAME}`).forEach((guideLine) => {
                guideLine.destroy();
            });
        }

        // スナップ可能なラインを探す
        const lineGuideStops = this.getLineGuideStops(e.target as Konva.Shape);

        // 現在のオブジェクトのスナップポイントを探す
        const itemBounds = this.getObjectSnappingEdges(e.target as Konva.Shape);

        // 現在のオブジェクトをスナップできる場所を探す
        const guides = this.getGuides(lineGuideStops, itemBounds);

        // スナップできなかったら、何もしない
        if (!guides.length) {
            return {
                relative: e.target.position(),
                absolute: e.target.absolutePosition(),
            };
        }

        if (layer) {
            this.drawGuides(guides, layer);

            // オブジェクトの位置を強制する
            const absPos = e.target.absolutePosition();
            guides.forEach((lg) => {
                switch (lg.snap) {
                    case 'start': {
                        switch (lg.orientation) {
                            case 'V': {
                                absPos.x = lg.lineGuide + lg.offset;
                                break;
                            }
                            case 'H': {
                                absPos.y = lg.lineGuide + lg.offset;
                                break;
                            }
                        }
                        break;
                    }
                    case 'center': {
                        switch (lg.orientation) {
                            case 'V': {
                                absPos.x = lg.lineGuide + lg.offset;
                                break;
                            }
                            case 'H': {
                                absPos.y = lg.lineGuide + lg.offset;
                                break;
                            }
                        }
                        break;
                    }
                    case 'end': {
                        switch (lg.orientation) {
                            case 'V': {
                                absPos.x = lg.lineGuide + lg.offset;
                                break;
                            }
                            case 'H': {
                                absPos.y = lg.lineGuide + lg.offset;
                                break;
                            }
                        }
                        break;
                    }
                }
            });
            e.target.absolutePosition(absPos);
        }

        return {
            relative: e.target.position(),
            absolute: e.target.absolutePosition(),
        };
    }

    /**
     * スナップするドラッグを終了する
     * on dragend で呼び出すこと
     * @param e
     */
    onSnappingDragEnd(e: Konva.KonvaEventObject<DragEvent>): SnappedPosition {
        e.cancelBubble = true;

        const layer = e.target.getLayer();
        // 画面上のすべてのガイドラインを削除する
        if (layer) {
            layer
                .find(`.${this.GUIDELINE_NAME}`)
                .forEach((guideLine) => guideLine.destroy());
        }
        return {
            relative: e.target.position(),
            absolute: e.target.absolutePosition(),
        };
    }
}
