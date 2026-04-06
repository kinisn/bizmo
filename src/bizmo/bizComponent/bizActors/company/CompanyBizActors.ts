import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIOToObject } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { AccountingComponent } from 'bizmo/core/bizIO/component/AccountingComponent';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';
import i18n from 'i18n/configs';
import { BizActors } from '../BizActors';
import { AssetsExpensedThingsList } from './AssetsExpensedThings';
import { MaterialList } from './Material';
import { ProductList } from './Product';
import { StaffList } from './StaffBizActors';

// External Group Name
export type CompanyBizActorsTypes =
    | 'COMPANY'
    | 'COMPANY:ACCOUNTING'
    | 'COMPANY:STAFFS'
    | 'COMPANY:PRODUCTS'
    | 'COMPANY:MATERIALS'
    | 'COMPANY:ASSET_EXPENSES_LIST';

/**
 * 自社
 *
 * ・事業モデルにおける自社であり、事業の主体。
 *
 * ＝ 基本構成要素 ＝
 * 人（役員・スタッフ）：  StaffList
 * 資金：  MonetaryAssets
 * モノ
 * ・備品等：  AssetsExpensedThingsList
 * ・材料：  MaterialList
 * ・商材：  ProductList
 */
export class CompanyBizActors<T = any> extends BizActors<T> {
    public static ACCOUNTING: string = 'ACCOUNTING';
    public static STAFFS: string = 'STAFFS';
    public static MATERIALS: string = 'MATERIALS';
    public static ASSET_EXPENSES_LIST: string = 'ASSET_EXPENSES_LIST';
    public static PRODUCTS: string = 'PRODUCTS';

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChildren(
            [
                CompanyBizActors.pickFromInitWthDefault(
                    CompanyBizActors.ACCOUNTING,
                    () =>
                        new AccountingComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY:ACCOUNTING',
                        }),
                    initData
                ),
                CompanyBizActors.pickFromInitWthDefault(
                    CompanyBizActors.STAFFS,
                    () =>
                        new StaffList({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY:STAFFS',
                        }),
                    initData
                ),
                CompanyBizActors.pickFromInitWthDefault(
                    CompanyBizActors.PRODUCTS,
                    () =>
                        new ProductList({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY:PRODUCTS',
                        }),
                    initData
                ),
                CompanyBizActors.pickFromInitWthDefault(
                    CompanyBizActors.MATERIALS,
                    () =>
                        new MaterialList({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY:MATERIALS',
                        }),
                    initData
                ),
                CompanyBizActors.pickFromInitWthDefault(
                    CompanyBizActors.ASSET_EXPENSES_LIST,
                    () =>
                        new AssetsExpensedThingsList({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY:ASSET_EXPENSES_LIST',
                        }),
                    initData
                ),
            ],
            [
                CompanyBizActors.ACCOUNTING,
                CompanyBizActors.STAFFS,
                CompanyBizActors.PRODUCTS,
                CompanyBizActors.MATERIALS,
                CompanyBizActors.ASSET_EXPENSES_LIST,
            ]
        );
    }

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [
                CompanyBizActors.ACCOUNTING,
                i18n.t('translation:CompanyBizActors.ACCOUNTING'),
            ],
            [
                CompanyBizActors.STAFFS,
                i18n.t('translation:CompanyBizActors.STAFFS'),
            ],
            [
                CompanyBizActors.PRODUCTS,
                i18n.t('translation:CompanyBizActors.PRODUCTS'),
            ],
            [
                CompanyBizActors.MATERIALS,
                i18n.t('translation:CompanyBizActors.MATERIALS'),
            ],
            [
                CompanyBizActors.ASSET_EXPENSES_LIST,
                i18n.t('translation:CompanyBizActors.ASSET_EXPENSES_LIST'),
            ],
        ]);
    }

    /**
     * 会計帳簿
     * 現金などもここに含まれる
     */
    get accounting(): AccountingComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(CompanyBizActors.ACCOUNTING)!;
    }

    /**
     * スタッフ
     */
    get staffs(): StaffList<T> {
        return this.selectChildBySystemName(CompanyBizActors.STAFFS)!;
    }

    /**
     * 事業活動に必要な設備・道具
     */
    get assets(): AssetsExpensedThingsList<T> {
        return this.selectChildBySystemName(
            CompanyBizActors.ASSET_EXPENSES_LIST
        )!;
    }

    /**
     * 材料・仕入れ
     */
    get materials(): MaterialList<T> {
        return this.selectChildBySystemName(CompanyBizActors.MATERIALS)!;
    }

    /**
     * 商材
     */
    get products(): ProductList<T> {
        return this.selectChildBySystemName(CompanyBizActors.PRODUCTS)!;
    }

    // == Serialize / Deserialize ==

    toObject(): CompanyBizActorsToObject<T> {
        return {
            ...super.toObject(),
            accounting: this.accounting.toObject(),
            staffs: this.staffs.toObject(),
            products: this.products.toObject(),
            materials: this.materials.toObject(),
            assets: this.assets.toObject(),
        };
    }
}

export type CompanyBizActorsToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    accounting: CollectionBizIOToObject<T, BizComponentGroupType>;
    staffs: CollectionBizIOToObject<T, BizComponentGroupType>;
    products: CollectionBizIOToObject<T, BizComponentGroupType>;
    materials: CollectionBizIOToObject<T, BizComponentGroupType>;
    assets: CollectionBizIOToObject<T, BizComponentGroupType>;
};
