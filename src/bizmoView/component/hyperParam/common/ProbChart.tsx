import { localPoint } from '@visx/event';
import { GradientOrangeRed, GradientTealBlue } from '@visx/gradient';
import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { ProbBin } from 'bizmo/core/hyperParam/prob/ProbBin';
import Decimal from 'decimal.js';
import { LegacyRef, memo, MouseEvent, useMemo } from 'react';

/**
 * 確率分布チャート（ツールチップ付き）
 *
 * 注意：ツールチップの表示位置判定時に再レンダリングされるので、複数同時に呼び出ささないようにすること
 *
 * @param param0
 * @returns
 */
export const ProbChartWithTooltip = ({
    orderedBins,
    lowerLimit,
    upperLimit,
    meanProbBin,
    width = 100,
    height = 100,
    margin = { top: 0, bottom: 0, left: 0, right: 0 },
    graphBGColor,
}: {
    orderedBins: Array<ProbBin>;
    lowerLimit: Decimal;
    upperLimit: Decimal;
    meanProbBin?: ProbBin;
    tooltip?: boolean;
    width?: number;
    height?: number;
    margin?: { top: number; bottom: number; left: number; right: number };
    graphBGColor?: string;
}) => {
    // Tooltip
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<ProbBin>();

    const { containerRef, TooltipInPortal } = useTooltipInPortal({
        detectBounds: true,
        scroll: true,
    });

    return (
        <div
            // For correct tooltip positioning, it is important to wrap your component in an element with relative positioning.
            className="relative"
        >
            <ProbChart
                orderedBins={orderedBins}
                lowerLimit={lowerLimit}
                upperLimit={upperLimit}
                meanProbBin={meanProbBin}
                showTooltip={showTooltip}
                hideTooltip={hideTooltip}
                width={width}
                height={height}
                margin={margin}
                graphBGColor={graphBGColor}
                containerRef={containerRef}
            />
            {/** ToolTip */}
            {tooltipOpen && (
                <TooltipInPortal
                    // set this to random so it correctly updates with parent bounds
                    key={Math.random()}
                    top={tooltipTop}
                    left={tooltipLeft}
                >
                    <div className="grid grid-cols-2">
                        <div className="text-xs mr-4">Value</div>
                        <div>{tooltipData?.value.toString()}</div>
                        <div className="text-xs mr-4">Probability</div>
                        <div>
                            {tooltipData?.prob.mul(new Decimal(100)).toString()}
                            %
                        </div>
                        <div className="text-xs mr-4">Range</div>
                        <div>
                            [{tooltipData?.lowerValue.toString()},
                            {tooltipData?.upperValue.toString()})
                        </div>
                    </div>
                </TooltipInPortal>
            )}
        </div>
    );
};

/**
 * 確率分布チャート
 */
export const ProbChart = memo(
    ({
        orderedBins,
        lowerLimit,
        upperLimit,
        meanProbBin,
        showTooltip = () => {},
        hideTooltip = () => {},
        width = 100,
        height = 100,
        margin = { top: 0, bottom: 0, left: 0, right: 0 },
        graphBGColor,
        containerRef,
    }: {
        orderedBins: Array<ProbBin>;
        lowerLimit: Decimal;
        upperLimit: Decimal;
        meanProbBin?: ProbBin;
        showTooltip?: (args: any) => void;
        hideTooltip?: () => void;
        width?: number;
        height?: number;
        margin?: { top: number; bottom: number; left: number; right: number };
        graphBGColor?: string;
        containerRef?: LegacyRef<SVGSVGElement>;
    }) => {
        // グラフ表示エリア
        const xMax = width - margin.left - margin.right;
        const yMax = height - margin.top - margin.bottom;
        const barWidth = xMax / orderedBins.length;

        // X・Y軸のスケール対応
        const compose =
            (scale: Function, accessor: Function) => (data: ProbBin) =>
                scale(accessor(data));
        const xPoint = compose(
            scaleLinear({
                range: [0, xMax],
                round: false,
                domain: [lowerLimit.toNumber(), upperLimit.toNumber()],
            }),
            (d: ProbBin) => d.lowerValue
        );
        const yPoint = compose(
            scaleLinear({
                range: [yMax, 0],
                round: false,
                domain: [
                    0,
                    Math.max(...orderedBins.map((d) => d.prob.toNumber())),
                ],
            }),
            (d: ProbBin) => d.prob
        );

        // 無駄なレンダリングを防ぐための handler
        const mouseOutHandler = () => {
            if (containerRef) {
                hideTooltip();
            }
        };
        const mouseOverHandler = (d: ProbBin) => (event: MouseEvent) => {
            if (containerRef) {
                const coords = localPoint(event.currentTarget, event);
                showTooltip({
                    tooltipLeft: coords?.x,
                    tooltipTop: yPoint(d),
                    tooltipData: d,
                });
            }
        };

        const binsPart = useMemo(() => {
            return orderedBins.map((d, i) => {
                let fillColor = 'teal-blue';
                if (meanProbBin == d) {
                    fillColor = 'orange-red';
                }

                return (
                    <g
                        key={`bar-${i}`}
                        onMouseOver={mouseOverHandler(d)}
                        onMouseOut={mouseOutHandler}
                    >
                        <rect
                            x={xPoint(d) + margin.left}
                            y={yPoint(d) + margin.top}
                            height={yMax - yPoint(d)}
                            width={barWidth}
                            fill={`url(#${fillColor})`}
                        />
                        <rect
                            x={xPoint(d)}
                            y={0}
                            height={yPoint(d)}
                            width={barWidth}
                            fill="transparent"
                        />
                    </g>
                );
            });
        }, [orderedBins]);

        return (
            <svg ref={containerRef} width={width} height={height}>
                <GradientTealBlue id="teal-blue" />
                <GradientOrangeRed id="orange-red" />
                {/** Graph Background */}
                {graphBGColor ? (
                    <rect
                        x={0}
                        y={0}
                        width={width}
                        height={height}
                        fill={graphBGColor}
                    ></rect>
                ) : (
                    <></>
                )}
                {/** Graph Bins */}
                {binsPart}
            </svg>
        );
    }
);
