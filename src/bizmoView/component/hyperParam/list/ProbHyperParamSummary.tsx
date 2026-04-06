import { ProbBin } from 'bizmo/core/hyperParam/prob/ProbBin';
import Decimal from 'decimal.js';
import { ProbChart, ProbChartWithTooltip } from '../common/ProbChart';

/**
 * ProbHyperParam のサマリ表示
 * グラフ表示付き
 * @param param0
 * @returns
 */
export const ProbHyperParamSummary = ({
    orderedBins,
    lowerLimit,
    upperLimit,
    meanProbBin,
    tooltip = false,
    props,
}: {
    orderedBins: Array<ProbBin>;
    lowerLimit: Decimal;
    upperLimit: Decimal;
    meanProbBin?: ProbBin;
    tooltip?: boolean;
    props?: any;
}) => {
    return (
        <div {...props}>
            <div className="grid grid-cols-auto24auto items-end">
                {/** 上段の中央 */}
                <div className="flex justify-center col-span-3">
                    <span className="text-2xl mb-0">
                        {meanProbBin?.value.toString()}
                    </span>
                </div>
                {/** 下段の中央にグラフ */}
                <div className="flex justify-end">
                    <span className="text-xs mr-2">
                        {lowerLimit.toString()}
                    </span>
                </div>
                {tooltip ? (
                    <ProbChartWithTooltip
                        orderedBins={orderedBins}
                        lowerLimit={lowerLimit}
                        upperLimit={upperLimit}
                        meanProbBin={meanProbBin}
                        width={24}
                        height={24}
                    />
                ) : (
                    <ProbChart
                        orderedBins={orderedBins}
                        lowerLimit={lowerLimit}
                        upperLimit={upperLimit}
                        meanProbBin={meanProbBin}
                        width={24}
                        height={24}
                    />
                )}
                <div className="flex justify-start">
                    <span className="text-xs ml-2">
                        {upperLimit.toString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
