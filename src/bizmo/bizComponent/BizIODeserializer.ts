import { AccountedCollectionBizIO } from 'bizmo/core/bizIO/collection/AccountedCollectionBizIO';
import {
    CollectionBizIO,
    CollectionBizIORequiredParam,
    CollectionBizIOToObject,
    isCollectionBizIOToObject,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { AccountingComponent } from 'bizmo/core/bizIO/component/AccountingComponent';
import {
    FunnelComponent,
    FunnelComponentToObject,
} from 'bizmo/core/bizIO/component/FunnelComponent';
import {
    RateComponent,
    RateComponentToObject,
} from 'bizmo/core/bizIO/component/RateComponent';
import {
    UnitComponent,
    UnitComponentToObject,
} from 'bizmo/core/bizIO/component/UnitComponent';
import { AccountedMonetaryBizIO } from 'bizmo/core/bizIO/single/AccountedMonetaryBizIO';
import {
    AmountBizIO,
    BizIO,
    BizIOToObject,
    MonetaryBizIO,
    ReadOnlyBizIO,
    isBizIOToObject,
} from 'bizmo/core/bizIO/single/BizIOs';
import { LabeledDict } from 'bizmo/core/util/LabeledDict';
import {
    BizActionLocalParam,
    BizActionParam,
    BizActionParamToObject,
} from './BizActionParam';
import {
    BizComponent,
    BizComponentGroupType,
    BizComponentToObject,
    Environment,
} from './BizComponent';
import { BizActors } from './bizActors/BizActors';
import {
    CollaboratorBizActors,
    CollaboratorList,
} from './bizActors/CollaboratorBizActors';
import {
    AssetsExpensedThings,
    AssetsExpensedThingsList,
    AssetsExpensedThingsToObject,
} from './bizActors/company/AssetsExpensedThings';
import {
    CompanyBizActors,
    CompanyBizActorsToObject,
} from './bizActors/company/CompanyBizActors';
import { Material, MaterialList } from './bizActors/company/Material';
import {
    Product,
    ProductList,
    ProductToObject,
} from './bizActors/company/Product';
import {
    StaffBizActors,
    StaffBizActorsToObject,
    StaffList,
    StaffListToObject,
    StaffRole,
} from './bizActors/company/StaffBizActors';
import {
    UserBizActors,
    UserBizActorsToObject,
} from './bizActors/user/UserBizActors';
import {
    UserLifeCycleBizActors,
    UserLifeCycleBizActorsToObject,
} from './bizActors/user/UserLifeCycleBizActors';
import {
    UserLifeCycleList,
    UserLifeCycleListToObject,
} from './bizActors/user/UserLifeCycleList';

/**
 * BizIOに関する ToObject / FromObject に関する処理をまとめたクラス
 *
 * BizIO / CollectionBizIO クラスで　ToObject を定義し、ToObject を利用してインスタンス化する部分だけを担う。
 */

export class BizIODeserializer {
    static serialize<T>(bizIO: DeserializedBizIO<T>): string | undefined {
        return bizIO ? JSON.stringify(bizIO.toObject()) : undefined;
    }

    /**
     * ユーザー定義のCollectionBizIOの子要素を追加する
     * 前提：　システムが定義する子要素は、システムラベルで事前登録されている
     * @param param0
     * @returns
     */
    static _appendChildren<
        C extends CollectionBizIO<T, BizComponentGroupType>,
        T = any,
    >({
        collection,
        obj,
    }: {
        collection: C;
        obj: CollectableBizIOToObject<T>;
    }): C {
        // システムラベルの有無を確認
        const systemLabelDict = LabeledDict.fromObject(
            obj.idLabeledSystemNames
        );
        // ユーザーが登録したラベルがある場合は、それを利用して追加
        const userLabelDict = LabeledDict.fromObject(obj.idLabeledNames);
        obj.children.forEach((bizIOId) => {
            if (!collection.children.some((child) => child.id === bizIOId)) {
                // [前提] トポロジカルソートされた順番に呼び出されているので、children の実態がすべてDB登録済みであるはず
                const targetOnDB = collection.db.selectById(bizIOId);
                if (targetOnDB) {
                    // システムラベルの有無を確認
                    const systemLabel = systemLabelDict.getContentByLabel(
                        targetOnDB.name ?? ''
                    );
                    // ユーザーが登録したラベルがある場合は、それを利用して追加
                    const userLabel = userLabelDict.getContentByLabel(
                        targetOnDB.name ?? ''
                    );

                    // collection.addChild の挙動
                    // system label => system と user の両方に登録される
                    // user label => user にのみ登録される
                    if (systemLabel) {
                        // collection にシステムラベルで登録されているならば追加しない
                        if (
                            collection.selectChildBySystemName(systemLabel) ===
                            undefined
                        ) {
                            collection.appendChild(targetOnDB, systemLabel);
                        }
                    } else if (userLabel) {
                        // collection にユーザーラベルで登録されているならば追加しない
                        if (
                            collection.selectChildByName(userLabel) ===
                            undefined
                        ) {
                            collection.appendChild(targetOnDB);
                        }
                    } else {
                        collection.appendChild(targetOnDB);
                    }
                }
            }
        });
        return collection;
    }

    /**
     * オブジェクトからBizIOを生成する
     *
     * 子要素も再帰的に処理すると、最上位階層の BizComponent だと StackOverFlow が発生する。
     *
     * @param param0
     * @param log
     * @param logData
     * @returns
     */
    static fromObject<T = any>(
        {
            obj,
            db,
            timetable,
            hyperMG,
        }: {
            obj: ToBizIOObject<T>;
        } & CollectionBizIORequiredParam<T, BizComponentGroupType>,
        log?: string,
        logData?: any
    ): DeserializedBizIO<T> | undefined {
        const bizCore = { db, timetable, hyperMG };
        const targetOnDB = db.selectById(obj.bizIOId);

        if (log) {
            console.log(
                'BizIODeserializer: fromObject',
                obj.className,
                log,
                logData,
                targetOnDB
            );
        }

        // db登録済の場合はそのまま返す
        if (targetOnDB) {
            if (log) {
                console.log('fromObject: already stored', targetOnDB, obj);
            }
            return targetOnDB;
        }

        if (!obj.bizIOId) {
            console.error('bizIOId is not defined', obj);
        }

        if (isCollectionBizIOToObject(obj)) {
            switch (obj.className) {
                case 'BizComponent':
                    const bizCompObj = obj as BizComponentToObject<T>;
                    const bizComponent = new BizComponent({
                        ...bizCore,
                        ...bizCompObj,
                        initData: new Map([
                            [
                                BizComponent.ENVIRONMENT,
                                BizIODeserializer.fromObject({
                                    obj: bizCompObj.environment,
                                    ...bizCore,
                                }),
                            ],
                            [
                                BizComponent.COLLABORATORS,
                                BizIODeserializer.fromObject({
                                    obj: bizCompObj.collaborators,
                                    ...bizCore,
                                }),
                            ],
                            [
                                BizComponent.COMPANY,
                                BizIODeserializer.fromObject({
                                    obj: bizCompObj.company,
                                    ...bizCore,
                                }),
                            ],
                            [
                                BizComponent.USERS,
                                BizIODeserializer.fromObject({
                                    obj: bizCompObj.userLifeCycles,
                                    ...bizCore,
                                }),
                            ],
                            [
                                BizComponent.BIZ_ACTION_PARAMS,
                                BizIODeserializer.fromObject({
                                    obj: bizCompObj.bizActionParams,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: bizComponent,
                        obj: bizCompObj,
                    });
                    return bizComponent;
                case 'CollaboratorBizActors':
                    const collaboratorBizActors = new CollaboratorBizActors({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: collaboratorBizActors,
                        obj,
                    });
                    return collaboratorBizActors;
                case 'CollaboratorList':
                    const collaboratorList = new CollaboratorList({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: collaboratorList,
                        obj: obj,
                    });
                    return collaboratorList;
                case 'UserBizActors':
                    const userBizActorsObj = obj as UserBizActorsToObject<T>;
                    const userBizActors = new UserBizActors({
                        ...bizCore,
                        ...userBizActorsObj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: userBizActors,
                        obj: userBizActorsObj,
                    });
                    return userBizActors;
                case 'UserLifeCycleBizActors':
                    const userLifeCycleBizActorsToObject =
                        obj as UserLifeCycleBizActorsToObject<T>;
                    const userLifeCycleBizActors = new UserLifeCycleBizActors({
                        ...bizCore,
                        ...userLifeCycleBizActorsToObject,
                        initData: new Map([
                            [
                                UserLifeCycleBizActors.MARKET,
                                BizIODeserializer.fromObject({
                                    obj: userLifeCycleBizActorsToObject.market,
                                    ...bizCore,
                                }),
                            ],
                            [
                                UserLifeCycleBizActors.FUNNEL,
                                BizIODeserializer.fromObject({
                                    obj: userLifeCycleBizActorsToObject.marketingFunnel,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: userLifeCycleBizActors,
                        obj: userLifeCycleBizActorsToObject,
                    });
                    /*
                    console.log(
                        'fromObject:UserLifeCycleBizActors',
                        userLifeCycleBizActors
                    );
                    */
                    return userLifeCycleBizActors;
                case 'AccountingComponent':
                    const accountingComponent = new AccountingComponent<
                        T,
                        BizComponentGroupType
                    >({
                        ...bizCore,
                        ...obj,
                        initAccountHierarchy: false, // 強制的に生成しないようにする
                    });
                    BizIODeserializer._appendChildren({
                        collection: accountingComponent,
                        obj: obj,
                    });
                    return accountingComponent;
                case 'StaffBizActors':
                    const staffBizActorsObj = obj as StaffBizActorsToObject<T>;
                    const staffBizActors = new StaffBizActors({
                        ...bizCore,
                        ...staffBizActorsObj,
                        initData: new Map([
                            [
                                StaffBizActors.ADD_BY_HIRED,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.addByHired,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.ADD_BY_MOVED,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.addByMoved,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.SUB_BY_MOVED,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.subByMoved,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.SUB_BY_RETIRE,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.subByRetire,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.WORKING,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.working,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.WORKING_TASKS,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.workingTasks,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.WORKING_TIMES,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.workingTimes,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffBizActors.TOTAL_VALUE,
                                BizIODeserializer.fromObject({
                                    obj: staffBizActorsObj.totalValue,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: staffBizActors,
                        obj: staffBizActorsObj,
                    });
                    return staffBizActors;
                case 'StaffList':
                    const staffListObj = obj as StaffListToObject<T>;
                    const staffList = new StaffList({
                        ...bizCore,
                        ...staffListObj,
                        initData: new Map([
                            [
                                StaffRole.EMPLOYERS,
                                BizIODeserializer.fromObject({
                                    obj: staffListObj.employers,
                                    ...bizCore,
                                }),
                            ],
                            [
                                StaffRole.EMPLOYEES,
                                BizIODeserializer.fromObject({
                                    obj: staffListObj.employees,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: staffList,
                        obj: staffListObj,
                    });
                    return staffList;
                case 'Product':
                    const productObj = obj as ProductToObject<T>;
                    const product = new Product({
                        ...bizCore,
                        ...productObj,
                        initData: new Map([
                            [
                                Product.STAGE,
                                BizIODeserializer.fromObject({
                                    obj: productObj.stage,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.RD_COST,
                                BizIODeserializer.fromObject({
                                    obj: productObj.rdCost,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.ACCUM_RD_COST,
                                BizIODeserializer.fromObject({
                                    obj: productObj.accumulateRDCost,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.PRODUCTION,
                                BizIODeserializer.fromObject({
                                    obj: productObj.production,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.SALES,
                                BizIODeserializer.fromObject({
                                    obj: productObj.sales,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.DISPOSAL,
                                BizIODeserializer.fromObject({
                                    obj: productObj.disposal,
                                    ...bizCore,
                                }),
                            ],
                            [
                                Product.STOCK,
                                BizIODeserializer.fromObject({
                                    obj: productObj.stock,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: product,
                        obj: productObj,
                    });
                    return product;
                case 'ProductList':
                    const productList = new ProductList({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: productList,
                        obj: obj,
                    });
                    return productList;
                case 'Material':
                    const material = new Material({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: material,
                        obj: obj,
                    });
                    return material;
                case 'MaterialList':
                    const materialList = new MaterialList({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: materialList,
                        obj: obj,
                    });
                    return materialList;
                case 'AssetsExpensedThings':
                    const assetsExpensedThingsObj =
                        obj as AssetsExpensedThingsToObject<T>;
                    const assetsExpensedThings = new AssetsExpensedThings({
                        ...bizCore,
                        ...assetsExpensedThingsObj,
                        initData: new Map([
                            [
                                AssetsExpensedThings.INITIALIZED,
                                BizIODeserializer.fromObject({
                                    obj: assetsExpensedThingsObj.initialized,
                                    ...bizCore,
                                }),
                            ],
                            [
                                AssetsExpensedThings.RUNNING,
                                BizIODeserializer.fromObject({
                                    obj: assetsExpensedThingsObj.running,
                                    ...bizCore,
                                }),
                            ],
                            [
                                AssetsExpensedThings.FINALIZED,
                                BizIODeserializer.fromObject({
                                    obj: assetsExpensedThingsObj.finalized,
                                    ...bizCore,
                                }),
                            ],
                            [
                                AssetsExpensedThings.TOTAL_VALUE,
                                BizIODeserializer.fromObject({
                                    obj: assetsExpensedThingsObj.totalValue,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: assetsExpensedThings,
                        obj: assetsExpensedThingsObj,
                    });
                    return assetsExpensedThings;
                case 'AssetsExpensedThingsList':
                    const assetsExpensedThingsList =
                        new AssetsExpensedThingsList({
                            ...bizCore,
                            ...obj,
                        });
                    BizIODeserializer._appendChildren({
                        collection: assetsExpensedThingsList,
                        obj: obj,
                    });
                    return assetsExpensedThingsList;
                case 'CompanyBizActors':
                    const companyBizActorsObj =
                        obj as CompanyBizActorsToObject<T>;
                    const companyBizActors = new CompanyBizActors({
                        ...bizCore,
                        ...companyBizActorsObj,
                        initData: new Map([
                            [
                                CompanyBizActors.ACCOUNTING,
                                BizIODeserializer.fromObject({
                                    obj: companyBizActorsObj.accounting,
                                    ...bizCore,
                                }),
                            ],
                            [
                                CompanyBizActors.STAFFS,
                                BizIODeserializer.fromObject({
                                    obj: companyBizActorsObj.staffs,
                                    ...bizCore,
                                }),
                            ],
                            [
                                CompanyBizActors.PRODUCTS,
                                BizIODeserializer.fromObject({
                                    obj: companyBizActorsObj.products,
                                    ...bizCore,
                                }),
                            ],
                            [
                                CompanyBizActors.MATERIALS,
                                BizIODeserializer.fromObject({
                                    obj: companyBizActorsObj.materials,
                                    ...bizCore,
                                }),
                            ],
                            [
                                CompanyBizActors.ASSET_EXPENSES_LIST,
                                BizIODeserializer.fromObject({
                                    obj: companyBizActorsObj.assets,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: companyBizActors,
                        obj: companyBizActorsObj,
                    });
                    return companyBizActors;
                case 'UserLifeCycleList':
                    const userLCObj = obj as UserLifeCycleListToObject<T>;
                    const userLifeCycleList = new UserLifeCycleList({
                        ...bizCore,
                        ...userLCObj,
                        initData: new Map([
                            [
                                UserLifeCycleList.MAIN_TARGET,
                                BizIODeserializer.fromObject({
                                    obj: userLCObj.mainTarget,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: userLifeCycleList,
                        obj: userLCObj,
                    });
                    return userLifeCycleList;
                case 'BizActionParam':
                    const actionParamObj = obj as BizActionParamToObject<T>;
                    const bizActionParam = new BizActionParam({
                        ...bizCore,
                        ...actionParamObj,
                        initData: new Map([
                            [
                                BizActionParam.GLOBAL_PARAM,
                                BizIODeserializer.fromObject({
                                    obj: actionParamObj.globalParam,
                                    ...bizCore,
                                }),
                            ],
                            [
                                BizActionParam.LOCAL_PARAM,
                                BizIODeserializer.fromObject({
                                    obj: actionParamObj.localParam,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: bizActionParam,
                        obj: actionParamObj,
                    });
                    return bizActionParam;
                case 'BizActionLocalParam':
                    const bizActionLocalParam = new BizActionLocalParam({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: bizActionLocalParam,
                        obj: obj,
                    });
                    return bizActionLocalParam;
                case 'BizActors':
                    const bizActors = new BizActors({ ...bizCore, ...obj });
                    BizIODeserializer._appendChildren({
                        collection: bizActors,
                        obj: obj,
                    });
                    return bizActors;
                case 'Environment':
                    const environment = new Environment({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: environment,
                        obj: obj,
                    });
                    return environment;
                case 'RateComponent':
                    const rateComponentToObj = obj as RateComponentToObject<
                        T,
                        BizComponentGroupType
                    >;

                    let numerator = db.selectById(
                        rateComponentToObj.numeratorId
                    );
                    if (numerator === undefined) {
                        numerator = BizIODeserializer.fromObject({
                            obj: rateComponentToObj.numerator,
                            ...bizCore,
                        });
                    }
                    let denominator = db.selectById(
                        rateComponentToObj.denominatorId
                    );
                    if (denominator === undefined) {
                        denominator = BizIODeserializer.fromObject({
                            obj: rateComponentToObj.denominator,
                            ...bizCore,
                        });
                    }
                    if (!numerator || !denominator) return undefined;
                    const rateComponent = new RateComponent({
                        ...bizCore,
                        ...rateComponentToObj,
                        numerator,
                        denominator,
                    });
                    return rateComponent;
                case 'FunnelComponent':
                    const funnelComponentToObj = obj as FunnelComponentToObject<
                        T,
                        BizComponentGroupType
                    >;
                    // appendChild できないので、専用関数で処理
                    const funnelComponent = FunnelComponent.fromObject({
                        ...bizCore,
                        obj: funnelComponentToObj,
                    });
                    return funnelComponent;
                case 'UnitComponent':
                    const unitObj = obj as UnitComponentToObject<
                        T,
                        BizComponentGroupType
                    >;
                    const unitComponent = new UnitComponent({
                        ...bizCore,
                        ...unitObj,
                        initData: new Map([
                            [
                                UnitComponent.AMOUNT,
                                BizIODeserializer.fromObject({
                                    obj: unitObj.amount,
                                    ...bizCore,
                                }),
                            ],
                            [
                                UnitComponent.VALUE,
                                BizIODeserializer.fromObject({
                                    obj: unitObj.value,
                                    ...bizCore,
                                }),
                            ],
                            [
                                UnitComponent.ADJUSTER,
                                BizIODeserializer.fromObject({
                                    obj: unitObj.adjuster,
                                    ...bizCore,
                                }),
                            ],
                            [
                                UnitComponent.TOTAL_VALUE,
                                BizIODeserializer.fromObject({
                                    obj: unitObj.totalValue,
                                    ...bizCore,
                                }),
                            ],
                        ]),
                    });
                    BizIODeserializer._appendChildren({
                        collection: unitComponent,
                        obj: unitObj,
                    });
                    return unitComponent;
                case 'AccountedCollectionBizIO':
                    const accountedCollectionBizIO =
                        new AccountedCollectionBizIO({
                            ...bizCore,
                            ...obj,
                        });
                    BizIODeserializer._appendChildren({
                        collection: accountedCollectionBizIO,
                        obj: obj,
                    });
                    return accountedCollectionBizIO;
                default:
                    const collectionBizIO = new CollectionBizIO({
                        ...bizCore,
                        ...obj,
                    });
                    BizIODeserializer._appendChildren({
                        collection: collectionBizIO,
                        obj: obj,
                    });
                    return collectionBizIO;
            }
        } else if (isBizIOToObject(obj)) {
            switch (obj.className) {
                case 'AccountedMonetaryBizIO':
                    return new AccountedMonetaryBizIO({
                        ...bizCore,
                        ...obj,
                    });
                case 'MonetaryBizIO':
                    return new MonetaryBizIO({
                        ...bizCore,
                        ...obj,
                    });
                case 'AmountBizIO':
                    return new AmountBizIO({
                        ...bizCore,
                        ...obj,
                    });
                case 'ReadOnlyBizIO':
                    return new ReadOnlyBizIO({
                        ...bizCore,
                        ...obj,
                    });
                default:
                    return new BizIO({
                        ...bizCore,
                        ...obj,
                    });
            }
        }
    }
}

export type ToBizIOObject<T> =
    | SingleBizIOToObject<T>
    | CollectableBizIOToObject<T>;

export type SingleBizIOToObject<T> = BizIOToObject<T, BizComponentGroupType>;

export type CollectableBizIOToObject<T> =
    | CollectionBizIOToObject<T, BizComponentGroupType>
    | UnitComponentToObject<T, BizComponentGroupType>
    | FunnelComponentToObject<T, BizComponentGroupType>
    | RateComponentToObject<T, BizComponentGroupType>
    | BizComponentToObject<T>
    | BizActionParamToObject<T>
    | UserBizActorsToObject<T>
    | UserLifeCycleListToObject<T>
    | CompanyBizActorsToObject<T>
    | AssetsExpensedThingsToObject<T>
    | ProductToObject<T>
    | StaffBizActorsToObject<T>
    | StaffListToObject<T>;

export type DeserializedBizIO<T> =
    | BizIO<T, BizComponentGroupType>
    | ReadOnlyBizIO<T, BizComponentGroupType>
    | AmountBizIO<T, BizComponentGroupType>
    | MonetaryBizIO<T, BizComponentGroupType>
    | AccountedMonetaryBizIO<T, BizComponentGroupType>
    | CollectionBizIO<T, BizComponentGroupType>
    | AccountedCollectionBizIO<T, BizComponentGroupType>
    | UnitComponent<T, BizComponentGroupType>
    | FunnelComponent<T, BizComponentGroupType>
    | RateComponent<T, BizComponentGroupType>
    | AccountingComponent<T, BizComponentGroupType>
    | Environment<T>
    | BizComponent<T>
    | BizActionLocalParam<T>
    | BizActionParam<T>
    | BizActors<T>
    | UserBizActors<T>
    | UserLifeCycleList<T>
    | CompanyBizActors<T>
    | CollaboratorList<T>
    | CollaboratorBizActors<T>
    | AssetsExpensedThingsList<T>
    | AssetsExpensedThings<T>
    | MaterialList<T>
    | Material<T>
    | ProductList<T>
    | Product<T>
    | StaffList<T>
    | StaffBizActors<T>;
