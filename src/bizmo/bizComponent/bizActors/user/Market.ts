import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    CollectionBizIO,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
    CustomCategoryBizIOParam,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import {
    AmountBizIO,
    BizIOInit,
    BizIOToObject,
} from 'bizmo/core/bizIO/single/BizIOs';
import { BizValue } from 'bizmo/core/bizIO/value/BizValue';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { DateMap } from 'bizmo/core/util/DateMap';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';

/**
 * 特定市場の想定ユーザ（自然人・法人両方含む）
 *
 * 基礎値 と 成長率 から Market を算出する。
 *  式： Market(該当term) = Market(該当term-1) * 成長率(該当term) + 基礎値(該当term)
 *
 * ＝ 注意 ＝
 *  基礎値 と Market は「人数」を示すため、小数点で四捨五入されて整数となる。（成長率はそのまま利用する）
 *  そのため、最終的な計算結果は、期待成長率からみて誤差が含まれることに注意。
 *
 * TODO： 精密にしたければ、termが進む毎に計算結果と残期間から再計算すればよい。ただし、処理速度が犠牲になるので注意。
 *
 * ＝ 利用法 ＝
 * ・利用法A： Growth
 *     1つの基礎値に対して、成長率を設定していく方法
 * ・利用法B： Base amount only
 *     基礎値を精緻に設定し、成長率を0に固定する方法
 */
export class Market<T = any> extends CollectionBizIO<T, BizComponentGroupType> {
    static BASE_AMOUNT: string = 'BASE_AMOUNT';
    static GROWTH_RATE: string = 'GROWTH_RATE';

    constructor(props: CustomCategoryBizIOParam<T, BizComponentGroupType>) {
        const { exportWithChildren = true, ...rest } = props;
        super({
            exportWithChildren,
            summarizeMode: CollectionSummarizeMode.CUSTOM,
            ...rest,
        });
    }

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        super._initData(initData);
        this.appendChildren(
            [
                Market.pickFromInitWthDefault(
                    Market.BASE_AMOUNT,
                    () =>
                        new AmountBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            name: Market.BASE_AMOUNT,
                            isUserNamed: false,
                        }),
                    initData
                ),
                Market.pickFromInitWthDefault(
                    Market.GROWTH_RATE,
                    () =>
                        new AmountBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            name: Market.GROWTH_RATE,
                            isUserNamed: false,
                        }),
                    initData
                ),
            ],
            [Market.BASE_AMOUNT, Market.GROWTH_RATE]
        );
    }

    // ======== Translation ========

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [Market.BASE_AMOUNT, i18n.t('translation:Market.BASE_AMOUNT')],
            [Market.GROWTH_RATE, i18n.t('translation:Market.GROWTH_RATE')],
        ]);
    }

    /**
     * 基礎値
     */
    get baseAmount(): AmountBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Market.BASE_AMOUNT)!;
    }

    /**
     * 成長率
     * 注意： ％ではなく実数なので注意
     */
    get growthRate(): AmountBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Market.GROWTH_RATE)!;
    }

    /**
     *
     * @return {BizFunction}
     */
    protected override _replaceBizFunctionAtCustom(): BizFunction {
        if (this.systemLabeledChildren.length == 2) {
            const func = new BizFunction();
            func.addBizIOInput(this.id, 1); // Market(n-1)
            func.addBizIOInput(this.growthRate.id, 0); // GROWTH_RATE(n)
            func.addBizIOInput(this.baseAmount.id, 0); // BASE_AMOUNT(n)
            func.code = 'round(bizio0 * bizio1 + bizio2, 0)';
            return func;
        } else {
            return super._replaceBizFunctionAtCustom();
        }
    }

    // Util

    /**
     * 期間成長率 を 月次成長率 に変換する
     *
     * @param {Decimal} durationGrowthRate
     * @param {number} unitDuration
     * @return {Decimal}
     */
    static changeToMonthlyRate(
        durationGrowthRate: Decimal,
        unitDuration: number = 12
    ): Decimal {
        return new Decimal(1)
            .add(durationGrowthRate)
            .pow(new Decimal(1).div(new Decimal(unitDuration)))
            .minus(new Decimal(1));
    }

    /**
     * 基礎値だけの市場変化シミュレーションをするための設定を行う
     * growth_rate が すべて0 に設定される
     */
    setupForSimpleBaseAmountMode(): void {
        this.growthRate.setHistory(
            this.timetable.terms.map(
                (term) => new BizValue(term, new Decimal(0))
            )
        );
    }

    /**
     * 期間成長率による市場変化シミュレーションのための設定を行う
     *
     * @param {Decimal} initAmount timetable 開始時の「1つ前のterm」の基礎値。初項なので、timetable に現れない。
     * @param {Map<Date, Decimal>} durationGrowthRate 期間成長率の実数。内部で適宜月次成長率に修正される。％ではないので注意
     * @param {number} unitDuration 期間成長率 の 単位期間。デフォルトで12ヶ月
     */
    setupForSimpleGrowthMode(
        initAmount: Decimal,
        durationGrowthRate: DateMap<Decimal>,
        unitDuration: number = 12
    ): void {
        const historyList: Array<BizValue> = [];
        let monthlyRate: Decimal | undefined = undefined;
        this.timetable.terms.map((term) => {
            const growthRate = durationGrowthRate.get(term);
            if (growthRate) {
                monthlyRate = Market.changeToMonthlyRate(
                    growthRate,
                    unitDuration
                );
            }
            if (monthlyRate) {
                historyList.push(new BizValue(term, monthlyRate.add(1)));
            }
        });
        this.growthRate.setHistory(historyList);

        // 基礎値
        const startGrowthRate = this.growthRate.atTheStart();
        if (startGrowthRate) {
            const RoundDec = Decimal.clone({
                rounding: Decimal.ROUND_HALF_UP,
            });
            const value = RoundDec.round(initAmount.mul(startGrowthRate.value));
            this.baseAmount.setValue(this.timetable.terms[0], value);
            if (this.timetable.length > 1) {
                this.baseAmount.setValue(
                    this.timetable.terms[1],
                    new Decimal(0)
                );
            }
        }
    }

    toObject(): MarketToObject<T> {
        return {
            ...super.toObject(),
            baseAmount: this.baseAmount.toObject(),
            growthRate: this.growthRate.toObject(),
        };
    }
}

export type MarketToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    baseAmount: BizIOToObject<T, BizComponentGroupType>;
    growthRate: BizIOToObject<T, BizComponentGroupType>;
};
