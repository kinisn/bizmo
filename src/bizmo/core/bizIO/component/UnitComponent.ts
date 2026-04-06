import i18n from 'i18n/configs';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
} from '../collection/CollectionBizIO';
import {
    AmountBizIO,
    BizIO,
    BizIOToObject,
    MonetaryBizIO,
} from '../single/BizIOs';

export type UnitComponentOptionalParam = Partial<{
    amountComplement: boolean;
}>;

export type UnitComponentParam<
    T = any,
    S extends string = string,
> = CollectionBizIOParam<T, S> &
    UnitComponentOptionalParam &
    Omit<CollectionBizIOParam<T, S>, 'systemLabeledOnly'>;

/**
 * Unit 単位で構成要素をまとめてコントロールするコンポーネント
 *
 * ＝ 構成要素 ＝
 * ・[RW] Unit数： AMOUNT
 * ・[RW] Unit単価： VALUE
 * ・[RW] 調整項： ADJUSTER
 * ・[UPPER] 総額： TOTAL_VALUE
 *      総額 = Unit数 x Unit単価 + 調整項
 * ＝ 補足 ＝
 * ・Unit の 初期・運用・終了時の価値 が [term単位] で同じグループとする
 * ・対象期間は「量」で調整する。特に「運用対象Unit数」
 * ・本コンポーネントの子要素のとして、更なるChildを想定していない
 */
export class UnitComponent<
    T = any,
    S extends string = string,
> extends CollectionBizIO<T, S> {
    static AMOUNT: string = 'AMOUNT';
    static VALUE: string = 'VALUE';
    static ADJUSTER: string = 'ADJUSTER';
    static TOTAL_VALUE: string = 'TOTAL_VALUE';

    private __amountComplement: boolean;
    private __amount: AmountBizIO<T, S>;
    private __value: MonetaryBizIO<T, S>;
    private __adjuster: MonetaryBizIO<T, S>;
    private __totalValue: CollectionBizIO<T, S>;

    /**
     *
     * @param props
     */
    constructor(props: UnitComponentParam<T, S>) {
        const {
            timetable,
            db,
            hyperMG,
            initData,
            amountComplement = true,
            initUpdate,
            ...rest
        } = props;
        super({
            timetable,
            db,
            hyperMG,
            initData,
            initUpdate: false,
            systemLabeledOnly: true,
            ...rest,
        });

        // FIXME initUpdate が super で走らない状態なので、 constructor から出して初期化したい！！
        this.__amountComplement = amountComplement;

        const children: Array<BizIO<T, S>> = [];
        const systemNameLabels: Array<string> = [];

        // UnitComponent.AMOUNT
        this.__amount = UnitComponent.pickFromInitWthDefault(
            UnitComponent.AMOUNT,
            () =>
                new AmountBizIO<T, S>({
                    timetable,
                    db,
                    name: UnitComponent.AMOUNT,
                    complement: amountComplement,
                }),
            initData
        )!;
        children.push(this.amount);
        systemNameLabels.push(UnitComponent.AMOUNT);

        // UnitComponent.VALUE
        this.__value = UnitComponent.pickFromInitWthDefault(
            UnitComponent.VALUE,
            () =>
                new MonetaryBizIO<T, S>({
                    timetable,
                    db,
                    name: UnitComponent.VALUE,
                }),
            initData
        )!;
        children.push(this.value);
        systemNameLabels.push(UnitComponent.VALUE);

        // UnitComponent.ADJUSTER
        this.__adjuster = UnitComponent.pickFromInitWthDefault(
            UnitComponent.ADJUSTER,
            () =>
                new MonetaryBizIO<T, S>({
                    timetable,
                    db,
                    name: UnitComponent.ADJUSTER,
                }),
            initData
        )!;
        children.push(this.adjuster);
        systemNameLabels.push(UnitComponent.ADJUSTER);

        // UnitComponent.TOTAL_VALUE
        this.__totalValue = UnitComponent.pickFromInitWthDefault(
            UnitComponent.TOTAL_VALUE,
            () =>
                new CollectionBizIO<T, S>({
                    timetable,
                    db,
                    hyperMG,
                    name: UnitComponent.TOTAL_VALUE,
                    summarizeMode: CollectionSummarizeMode.LINEAR,
                    exportWithChildren: false,
                    isMonetary: true,
                    systemLabeledOnly: true,
                }),
            initData
        )!;
        this.totalValue.appendChildren(
            [this.amount, this.value, this.adjuster],
            ['1', '2', '3']
        ); // CategorySummarizeMode.LINEAR集計用
        children.push(this.totalValue);
        systemNameLabels.push(UnitComponent.TOTAL_VALUE);

        // 全要素を配置
        this.appendChildren(children, systemNameLabels);

        // 値を更新
        this._doInitUpdate(initData);
    }

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [UnitComponent.AMOUNT, i18n.t('translation:UnitComponent.AMOUNT')],
            [UnitComponent.VALUE, i18n.t('translation:UnitComponent.VALUE')],
            [
                UnitComponent.ADJUSTER,
                i18n.t('translation:UnitComponent.ADJUSTER'),
            ],
            [
                UnitComponent.TOTAL_VALUE,
                i18n.t('translation:UnitComponent.TOTAL_VALUE'),
            ],
        ]);
    }

    setAmountComplement(complement: boolean): void {
        this.__amountComplement = complement;
        this.amount.setComplement(complement);
    }

    /**
     * amount を補完するかどうか
     */
    get amountComplement(): boolean {
        return this.__amountComplement;
    }

    /**
     * [Read/Write] Unit数
     */
    get amount(): AmountBizIO<T, S> {
        return this.__amount;
    }

    /**
     * [Read/Write] Unit価値
     */
    get value(): MonetaryBizIO<T, S> {
        return this.__value;
    }

    /**
     * [Read/Write]  調整項
     */
    get adjuster(): MonetaryBizIO<T, S> {
        return this.__adjuster;
    }

    /**
     * [Read]  総額：  総額 = Unit数 x Unit単価 + 調整項
     */
    get totalValue(): CollectionBizIO<T, S> {
        return this.__totalValue;
    }

    // ==== BizIO Overwrite ====

    /**
     * 当該 BizIO を削除する
     *
     * = 注意 =
     * オブジェクトはDBから削除されるだけ。そのままメモリー上から消えるとは限らない。
     * @param {boolean} triggerEvent
     */
    delete(triggerEvent: boolean = true): void {
        // 専用子要素を削除
        this.amount.delete(false);
        this.value.delete(false);
        this.adjuster.delete(false);
        this.totalValue.delete(false);

        // 自身を削除
        super.delete(triggerEvent);
    }

    // == Serialize / Deserialize ==

    toObject(): UnitComponentToObject<T, S> {
        return {
            ...super.toObject(),
            amountComplement: this.amountComplement,
            amount: this.amount.toObject(),
            value: this.value.toObject(),
            adjuster: this.adjuster.toObject(),
            totalValue: this.totalValue.toObject(),
        };
    }
}

export type UnitComponentToObject<
    T = any,
    S extends string = string,
> = CollectionBizIOToObject<T, S> &
    UnitComponentOptionalParam & {
        amount: BizIOToObject<T, S>;
        value: BizIOToObject<T, S>;
        adjuster: BizIOToObject<T, S>;
        totalValue: BizIOToObject<T, S>;
    };
