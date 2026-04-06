import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    AccountNames,
    AccountNamesUtil,
} from 'bizmo/core/accounting/AccountNames';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
    CustomCategoryBizIOParam,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import {
    UnitComponent,
    UnitComponentToObject,
} from 'bizmo/core/bizIO/component/UnitComponent';
import {
    AmountBizIO,
    BizIOInit,
    BizIOToObject,
    MonetaryBizIO,
} from 'bizmo/core/bizIO/single/BizIOs';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';

/**
 * 製品ステージ
 */
export const ProductStage = {
    NO_STAGE: 0,
    R_AND_D: 10,
    ON_SALE: 20,
    MAINTENANCE: 30,
    EXPIRED: 30,
};
export type ProductStage = (typeof ProductStage)[keyof typeof ProductStage];

/**
 * 製品ステージ ラベル辞書
 */
export const ProductStageLabelDict = new Map<ProductStage, Map<string, string>>(
    [
        [
            ProductStage.NO_STAGE,
            new Map<string, string>([
                ['en', '-'],
                ['ja', '-'],
            ]),
        ],
        [
            ProductStage.R_AND_D,
            new Map<string, string>([
                ['en', 'planing and UPPER&D'],
                ['ja', '企画・研究・開発'],
            ]),
        ],
        [
            ProductStage.ON_SALE,
            new Map<string, string>([
                ['en', 'on sale'],
                ['ja', '販売中：保守中'],
            ]),
        ],
        [
            ProductStage.MAINTENANCE,
            new Map<string, string>([
                ['en', 'maintenance'],
                ['ja', '販売終了：保守中'],
            ]),
        ],
        [
            ProductStage.EXPIRED,
            new Map<string, string>([
                ['en', 'expired'],
                ['ja', '販売終了：保守終了'],
            ]),
        ],
    ]
);

/**
 * 製品在庫数
 */
export class ProductStockAmount<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    static readonly PRODUCTION_AMOUNT: string = 'PRODUCTION_AMOUNT';
    static readonly SALES_AMOUNT: string = 'SALES_AMOUNT';
    static readonly DISPOSAL_AMOUNT: string = 'DISPOSAL_AMOUNT';

    constructor(props: CustomCategoryBizIOParam<T, BizComponentGroupType>) {
        const { exportWithChildren = true, ...rest } = props;
        super({
            ...rest,
            exportWithChildren,
            summarizeMode: CollectionSummarizeMode.CUSTOM,
        });
    }

    /**
     * 在庫計算用 BizFunction を設定する
     *
     * 以下のように利用すること
     *  ------
     *   const stockAmount = ProductStockAmount({timetable, db}, {name: name});
     *   stockAmount.appendChildren([this.production.amount, this.sales.amount, this.disposal.amount],
     *                              ['1', '2', '3'])
     *   ------
     * @return {BizFunction}
     */
    protected override _replaceBizFunctionAtCustom(): BizFunction {
        if (
            this.idLabeledSystemNames.isIncludedLabel(
                ProductStockAmount.PRODUCTION_AMOUNT
            ) &&
            this.idLabeledSystemNames.isIncludedLabel(
                ProductStockAmount.SALES_AMOUNT
            ) &&
            this.idLabeledSystemNames.isIncludedLabel(
                ProductStockAmount.DISPOSAL_AMOUNT
            )
        ) {
            const func = new BizFunction();
            func.addBizIOInput(this.id, 1); //先月の在庫数
            func.addBizIOInput(
                this.idLabeledSystemNames.getContentByLabel(
                    ProductStockAmount.PRODUCTION_AMOUNT
                )!,
                0
            );
            func.addBizIOInput(
                this.idLabeledSystemNames.getContentByLabel(
                    ProductStockAmount.SALES_AMOUNT
                )!,
                0
            );
            func.addBizIOInput(
                this.idLabeledSystemNames.getContentByLabel(
                    ProductStockAmount.DISPOSAL_AMOUNT
                )!,
                0
            );
            func.code = 'bizio0 + bizio1 - bizio2 - bizio3';
            console.log(func);
            return func;
        } else {
            return super._replaceBizFunctionAtCustom();
        }
    }
}

/**
 * 商品・製品（1種類）
 *
 * 事業内の1商品の情報を管理する。
 * 各提供項目は、term毎の値。
 *
 * ＝ 内容 ＝
 * ・製品ステージ： stage
 *      企画中から停止までの ProductStage
 *
 * ・開発コスト: rd_cost
 *      本term の 企画・研究・開発 に関するコスト
 *
 * ・累積開発コスト: accum_rd_cost
 *      本term を含む累積開発コスト
 *
 * ・生産: production
 *      ・Amount: 生産数
 *      ・Value: 提供原価/Unit
 *      ・Adjust
 *      ・Total_value： 生産原価
 *
 * ・販売: sales
 *      ・Amount: 販売数
 *      ・Value: 価格/Unit
 *      ・Adjust： 想定）細かな製品オプションなどの合計売上
 *      ・Total_value： 売上
 *
 * ・廃棄: disposal
 *      ・Amount: 廃棄数
 *      ・Value:
 *      ・Adjust： 想定）廃棄処理コストの合計
 *      ・Total_value： 廃棄費用
 *
 * ・在庫: stock
 *      ・Amount: [自動計算] term末の在庫数： 前termの在庫数 + 生産数 - 販売数 - 廃棄数
 *      ・Value:
 *      ・Adjust： 想定） 保管コストの合計
 *      ・Total_value： 保管費用
 *
 * ＝方針＝
 * 廃棄対象の自動算出はメソッドで提供。
 * BizAction の「固有パラメータ」としてメソッド引数を保管して、シミュレーション前に適用してから、シミュレーションを実施する。
 */
export class Product<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    public static STAGE: string = 'STAGE';
    public static RD_COST: string = 'RD_COST';
    public static ACCUM_RD_COST: string = 'ACCUM_RD_COST';
    public static PRODUCTION: string = 'PRODUCTION';
    public static DISPOSAL: string = 'DISPOSAL';
    public static SALES: string = 'SALES';
    public static STOCK: string = 'STOCK';

    /**
     *
     * @param props
     */
    constructor(props: CollectionBizIOParam<T, BizComponentGroupType>) {
        const { accountName = AccountNames.PL_EXPENSES, ...rest } = props;
        super({ accountName, ...rest });
    }

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChildren(
            [
                Product.pickFromInitWthDefault(
                    Product.STAGE,
                    () =>
                        new AmountBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            name: Product.STAGE,
                        }),
                    initData
                ),
                Product.pickFromInitWthDefault(
                    Product.RD_COST,
                    () =>
                        new MonetaryBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            name: Product.RD_COST,
                        }),
                    initData
                ),
                Product.pickFromInitWthDefault(
                    Product.PRODUCTION,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: Product.PRODUCTION,
                        }),
                    initData
                ),
                Product.pickFromInitWthDefault(
                    Product.SALES,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: Product.SALES,
                        }),
                    initData
                ),
                Product.pickFromInitWthDefault(
                    Product.DISPOSAL,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: Product.DISPOSAL,
                        }),
                    initData
                ),
            ],
            [
                Product.STAGE,
                Product.RD_COST,
                Product.PRODUCTION,
                Product.SALES,
                Product.DISPOSAL,
            ]
        );

        // 自動集計用
        const accumRD = this.appendChild(
            new CollectionBizIO({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                summarizeMode: CollectionSummarizeMode.ACCUMULATE,
                name: Product.ACCUM_RD_COST,
                exportWithChildren: false,
            }),
            Product.ACCUM_RD_COST
        );
        accumRD?.appendChild(this.rdCost);

        // ここで stock の amount を特別に定義して埋め込む。
        const stockAmount = new ProductStockAmount<T>({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            name: UnitComponent.AMOUNT,
            exportWithChildren: false,
        });
        stockAmount.appendChildren(
            [this.production.amount, this.sales.amount, this.disposal.amount],
            [
                ProductStockAmount.PRODUCTION_AMOUNT,
                ProductStockAmount.SALES_AMOUNT,
                ProductStockAmount.DISPOSAL_AMOUNT,
            ]
        ); // ProductStockAmount集計用

        this.appendChild(
            Product.pickFromInitWthDefault(
                Product.STOCK,
                () =>
                    new UnitComponent<T, BizComponentGroupType>({
                        timetable: this.timetable,
                        db: this.db,
                        hyperMG: this.hyperMG,
                        name: Product.STOCK,
                        initData: new Map([
                            [UnitComponent.AMOUNT, stockAmount],
                        ]),
                    }),
                initData
            ),
            Product.STOCK
        );
    }

    /**
     * [override]
     * 勘定科目を設定する。
     * 設定する科目が「資産」「費用」のどちらかの項目でなければ、設定されない。
     * @param {AccountNames} accountName
     */
    override setAccountName(accountName: AccountNames): void {
        if (
            AccountNamesUtil.isAssets(accountName) ||
            AccountNamesUtil.isExpenses(accountName)
        ) {
            super.setAccountName(accountName);
        }
    }

    /**
     * 製品ステージ
     * 各term における企画中から停止までの ProductStage
     */
    get stage(): AmountBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.STAGE)!;
    }

    /**
     * 開発コスト
     * 各本term の 企画・研究・開発 に関するコスト
     */
    get rdCost(): MonetaryBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.RD_COST)!;
    }

    /**
     * 累計開発コスト
     * 本term を含めた累積開発コスト
     */
    get accumulateRDCost(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.ACCUM_RD_COST)!;
    }

    /**
     * ・生産: production
     *      ・Amount: 生産数
     *      ・Value: 提供原価/Unit
     *      ・Adjust
     *      ・Total_value： 生産原価
     */
    get production(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.PRODUCTION)!;
    }

    /**
     * ・販売: sales
     *      ・Amount: 販売数
     *      ・Value: 価格/Unit
     *      ・Adjust： 想定）細かな製品オプションなどの合計売上
     *      ・Total_value： 売上
     */
    get sales(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.SALES)!;
    }

    /**
     * ・廃棄: disposal
     *      ・Amount: 廃棄数
     *      ・Value:
     *      ・Adjust： 想定）廃棄処理コストの合計
     *      ・Total_value： 廃棄費用
     */
    get disposal(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.DISPOSAL)!;
    }

    /**
     * ・在庫: stock
     *      ・Amount: [自動計算] term末の在庫数： 前termの在庫数 + 生産数 - 販売数 - 廃棄数
     *      ・Value:
     *      ・Adjust： 想定） 保管コストの合計
     *      ・Total_value： 保管費用
     */
    get stock(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(Product.STOCK)!;
    }

    toObject(): ProductToObject<T> {
        return {
            ...super.toObject(),
            stage: this.stage.toObject(),
            rdCost: this.rdCost.toObject(),
            accumulateRDCost: this.accumulateRDCost.toObject(),
            production: this.production.toObject(),
            sales: this.sales.toObject(),
            disposal: this.disposal.toObject(),
            stock: this.stock.toObject(),
        };
    }
}

export type ProductToObject<T = any> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    stage: BizIOToObject<T, BizComponentGroupType>;
    rdCost: BizIOToObject<T, BizComponentGroupType>;
    accumulateRDCost: CollectionBizIOToObject<T, BizComponentGroupType>;
    production: UnitComponentToObject<T, BizComponentGroupType>;
    sales: UnitComponentToObject<T, BizComponentGroupType>;
    disposal: UnitComponentToObject<T, BizComponentGroupType>;
    stock: UnitComponentToObject<T, BizComponentGroupType>;
};

/**
 * 製品の一覧
 */
export class ProductList<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    /**
     * 初期設定用の Product を追加する
     *
     * @param {string} name
     * @return {Product | undefined}
     */
    addSeedProduct(name: string): Product<T> | undefined {
        return this.appendChild(
            new Product<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
            })
        );
    }

    /**
     * 指定した名前をもつ Product を取得する
     *
     * @param {string} name
     * @return {Product<T,S> | undefined}
     */
    selectProduct(name: string): Product<T> | undefined {
        return this.selectChildByName(name);
    }
}
