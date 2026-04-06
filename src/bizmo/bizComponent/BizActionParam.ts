import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';
import { BizComponentGroupType } from './BizComponent';

// External Group Name
export type BizActionParamTypes =
    | 'BIZ_ACTION_PARAMS'
    | 'BIZ_ACTION_PARAMS:GLOBAL_PARAM'
    | 'BIZ_ACTION_PARAMS:LOCAL_PARAM';

/**
 * 個別の BizAction が利用する Folder。
 * 各 Action は、この Folder に、自分のAction専用のBizActionLocalParam を新要素を追加・参照してよい。
 * 新要素は name で区別される。
 *
 */
export class BizActionLocalParam<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    /**
     *
     * @param {string} actionId
     * @return {CollectionBizIO<T, BizComponentGroupType> | undefined}
     */
    getAllocatedLocalParam(
        actionId: string
    ): CollectionBizIO<T, BizComponentGroupType> | undefined {
        let result =
            this.selectChildByName<CollectionBizIO<T, BizComponentGroupType>>(
                actionId
            );
        if (!result) {
            result = new CollectionBizIO<T, BizComponentGroupType>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: actionId,
                externalGroupName: 'BIZ_ACTION_PARAMS:LOCAL_PARAM',
            });
            this.appendChild(result);
        }
        return result;
    }
}

export type BizActionParamProps<T = any> = Omit<
    CollectionBizIOParam<T, BizComponentGroupType>,
    'systemLabeledOnly'
>;

/**
 * BizAction 設定専用BizIO
 *
 * BizEnvironment と BizActors（w/子リソース）だけでは設定しきれない場合の
 * BizAction の設定・処理に必要なBizIOを管理する。
 *
 * = 構成 =
 * global: 全 BizAction から共通して利用される Folder。 name で区別する
 * local: 個別の BizAction が利用する Folder。 name で区別する
 */
export class BizActionParam<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    static GLOBAL_PARAM: string = 'GLOBAL_PARAM';
    static LOCAL_PARAM: string = 'LOCAL_PARAM';

    constructor(props: BizActionParamProps<T>) {
        super({
            ...props,
            systemLabeledOnly: true,
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
                BizActionParam.pickFromInitWthDefault(
                    BizActionParam.GLOBAL_PARAM,
                    () =>
                        new CollectionBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: BizActionParam.GLOBAL_PARAM,
                            isUserNamed: false,
                            externalGroupName: 'BIZ_ACTION_PARAMS:GLOBAL_PARAM',
                        }),
                    initData
                ),
                BizActionParam.pickFromInitWthDefault(
                    BizActionParam.LOCAL_PARAM,
                    () =>
                        new BizActionLocalParam<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: BizActionParam.LOCAL_PARAM,
                            isUserNamed: false,
                            externalGroupName: 'BIZ_ACTION_PARAMS:LOCAL_PARAM',
                        }),
                    initData
                ),
            ],
            [BizActionParam.GLOBAL_PARAM, BizActionParam.LOCAL_PARAM]
        );
    }

    /**
     * 全 BizAction から共通して利用される Folder。
     * 各 Action は、直接この Folder に、パラメータを追加・参照してよい。
     * パラメータは name で区別される。
     */
    get globalParam(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(BizActionParam.GLOBAL_PARAM)!;
    }

    /**
     * 各 BizAction が利用する専用 Folder を格納している BizActionLocalParam
     */
    get localParam(): BizActionLocalParam<T> {
        return this.selectChildBySystemName(BizActionParam.LOCAL_PARAM)!;
    }

    // == Serialize / Deserialize ==

    toObject(): BizActionParamToObject<T> {
        return {
            ...super.toObject(),
            globalParam: this.globalParam.toObject(),
            localParam: this.localParam.toObject(),
        };
    }
}

export type BizActionParamToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    globalParam: CollectionBizIOToObject<T, BizComponentGroupType>;
    localParam: CollectionBizIOToObject<T, BizComponentGroupType>;
};
