import { DateMap } from 'bizmo/core/util/DateMap';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
import { BizIO, BizIOToObject } from '../single/BizIOs';
import { BizValue } from '../value/BizValue';

/**
 * RateComponent 必須パラメータ
 * @param {BizIO} numerator 分子要素
 * @param {BizIO} denominator 分母要素。NaNやZeroのtermはNaNとなる
 */
export type RateComponentRequiredParam<
    T = any,
    S extends string = string,
> = Required<{
    numerator: BizIO<T, S>;
    denominator: BizIO<T, S>;
}>;

export type RateComponentParam<
    T = any,
    S extends string = string,
> = CollectionBizIOParam<T, S> & RateComponentRequiredParam<T, S>;

/**
 * Rate Component
 *
 * 2つのBizIOの間の割合(Rate)を提供する
 * 順序を必要とし、かつ同一要素を分子分母に個別設定できる必要もあることから、あえて子要素としては保持しない
 */
export class RateComponent<
    T = any,
    S extends string = string,
> extends CollectionBizIO<T, S> {
    static DENOMINATOR: string = 'DENOMINATOR';
    static NUMERATOR: string = 'NUMERATOR';

    /**
     *
     * @param props
     */
    constructor(props: RateComponentParam<T, S>) {
        const {
            numerator,
            denominator,
            summarizeMode,
            exportWithChildren,
            ...rest
        } = props;
        super({
            ...rest,
            summarizeMode: CollectionSummarizeMode.TOTAL_DIVIDE,
            systemLabeledOnly: true,
            exportWithChildren: false,
        });
        const result = this.setFraction(numerator, denominator);
        if (!result) {
            throw new Error(
                'Numerator and denominator must be different. Also do not use circular references.'
            );
        }

        this._translate();
    }

    // === overwrite ===

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [
                RateComponent.NUMERATOR,
                i18n.t('translation:RateComponent.NUMERATOR'),
            ],
            [
                RateComponent.DENOMINATOR,
                i18n.t('translation:RateComponent.DENOMINATOR'),
            ],
        ]);
    }

    /**
     * [overwrite] should be called by only __init__
     * @param {BizIO} child
     * @param {string} systemNamedLabel
     * @return {BizIO<T,S> | undefined}
     */
    appendChild<FT extends BizIO<T, S> = BizIO<T, S>>(
        child: FT,
        systemNamedLabel?: string
    ): FT | undefined {
        if (0 <= this.children.length && this.children.length < 2) {
            return super.appendChild(child, systemNamedLabel);
        } else {
            console.log(
                'RateComponent requires just two children at initialization.'
            );
        }
    }

    /**
     * [overwrite]
     * @param {string} bizId
     */
    removeChild(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        bizId: string
    ): void {
        console.log('RateComponent does not support removeChild');
    }

    // ==== read prop ====

    /**
     * 分子
     */
    get numerator(): BizIO<T, S> {
        return this.selectChildBySystemName(RateComponent.NUMERATOR)!;
    }

    /**
     * 分母
     */
    get denominator(): BizIO<T, S> {
        return this.selectChildBySystemName(RateComponent.DENOMINATOR)!;
    }

    // ==== Rate専用 操作method ====

    /**
     *
     * @param numerator
     * @param denominator
     * @param preview
     * @returns
     */
    setFraction(
        numerator: BizIO<T, S>,
        denominator: BizIO<T, S>,
        preview: boolean = false
    ): boolean {
        let result = false;
        if (numerator.id != denominator.id) {
            const lastNumerator = this.numerator;
            const lastDenominator = this.denominator;
            if (this.children.length >= 2) {
                super.removeChild(
                    this.selectChildBySystemName(RateComponent.NUMERATOR)!.id,
                    true
                );
                super.removeChild(
                    this.selectChildBySystemName(RateComponent.DENOMINATOR)!.id,
                    true
                );
            }
            const addedNumerator = this.appendChild(
                numerator,
                RateComponent.NUMERATOR
            );
            const addedDenominator = this.appendChild(
                denominator,
                RateComponent.DENOMINATOR
            );
            if (addedNumerator && addedDenominator) {
                result = true;
            } else {
                console.log('Do not use circular references');
            }

            // rollback
            if (!result || preview) {
                super.removeChild(numerator.id, true);
                super.removeChild(denominator.id, true);
                this.appendChild(lastNumerator, RateComponent.NUMERATOR);
                this.appendChild(lastDenominator, RateComponent.DENOMINATOR);
            }
        } else {
            console.log('Numerator and denominator must be different BizIO.');
        }
        return result;
    }

    /**
     * 全てのRateが指定した割合になるように分子を更新する
     * ・分子のBizIOが Category 系でない場合のみ利用できる <= set できないので
     *
     * ＝注意＝
     * replaceFullRates: false の場合には、rateValues に設定された term のみ保証される。その間のtermの値は不定となる。
     * @param {Array<BizValue>} rateValues
     * @param {boolean} replaceFullRates rateValuesを全Rateとみなすして置き換えるか、
     */
    setRatesToUpdateNumerator(
        rateValues: Array<BizValue>,
        replaceFullRates: boolean = true
    ): void {
        const numerator = this.numerator; // 高速化のためにキャッシュ
        if (!(numerator instanceof CollectionBizIO)) {
            // rate の分母が NaN ではない場合
            let numeratorValueList: Array<BizValue> = [];
            const denominator = this.denominator;
            if (denominator) {
                let newRateValues = rateValues;
                if (replaceFullRates) {
                    const rateValuesDict = new DateMap<BizValue>();
                    rateValues.forEach((rateValue) =>
                        rateValuesDict.set(rateValue.date, rateValue)
                    );
                    newRateValues = RateComponent.complementHistory(
                        this.timetable,
                        rateValuesDict,
                        this.complement
                    );
                }
                numeratorValueList = this.__prepareNumerator(
                    denominator,
                    newRateValues
                );
            }

            // numerator を設定
            numeratorValueList.forEach((numeratorValue) =>
                numerator.set(numeratorValue)
            );
        } else {
            console.log(
                'setRatesToUpdateNumerator does not support CollectionBizIO.'
            );
        }
    }

    /**
     * [set_all_rates_to_update_numerator / set_rate_to_update_numerator専用]
     * numerator を生成する
     * @param {BizIO} denominator
     * @param {Array<BizValue>} rateValues
     * @return {Array<BizValue>}
     */
    private __prepareNumerator(
        denominator: BizIO,
        rateValues: Array<BizValue>
    ): Array<BizValue> {
        const numeratorValueList: Array<BizValue> = [];
        for (const rateValue of rateValues) {
            let numeratorValue = new BizValue(rateValue.date);
            // rate の分母が NaN ではない場合
            const denominatorValue = denominator.at(rateValue.date);
            if (denominatorValue) {
                let numeratorDecimal = new Decimal('0');
                // value
                if (
                    !denominatorValue.value.isNaN() &&
                    !denominatorValue.value.isZero() &&
                    !rateValue.value.isNaN()
                ) {
                    numeratorDecimal = denominatorValue.value.mul(
                        rateValue.value
                    );
                    numeratorDecimal = numeratorDecimal.isZero()
                        ? new Decimal(0)
                        : numeratorDecimal;
                }
                // prepare biz_value
                numeratorValue = new BizValue(rateValue.date, numeratorDecimal);
            }
            numeratorValueList.push(numeratorValue);
        }
        return numeratorValueList;
    }

    // serialize / deserialize

    toObject(): RateComponentToObject<T, S> {
        return {
            ...super.toObject(),
            numeratorId: this.numerator.id,
            denominatorId: this.denominator.id,
            numerator: this.numerator.toObject(),
            denominator: this.denominator.toObject(),
        };
    }
}

export type RateComponentToObject<
    T = any,
    S extends string = string,
> = CollectionBizIOToObject<T, S> & {
    numeratorId: string;
    denominatorId: string;
    numerator: BizIOToObject<T, S>;
    denominator: BizIOToObject<T, S>;
};
