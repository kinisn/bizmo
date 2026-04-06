import {
    CollectionBizIO,
    CollectionBizIOToObject,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizActionParam,
    BizActionParamToObject,
    BizActionParamTypes,
} from './BizActionParam';
import { CollaboratorList } from './bizActors/CollaboratorBizActors';
import {
    CompanyBizActors,
    CompanyBizActorsToObject,
    CompanyBizActorsTypes,
} from './bizActors/company/CompanyBizActors';
import {
    UserLifeCycleList,
    UserLifeCycleListToObject,
} from './bizActors/user/UserLifeCycleList';

// 最初に定義したBookインスタンス (翻訳データ) を明示的にimportする
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import i18n from 'i18n/configs';
import { BizIODeserializer } from './BizIODeserializer';
import { BizActors } from './bizActors/BizActors';

export type BizComponentGroupNotBelonged = 'NOT_BELONGED';
export type BizComponentGroupType =
    | BizComponentGroupNotBelonged // グループに所属しないという意味
    | 'ENVIRONMENT'
    | 'COLLABORATORS'
    | 'USERS'
    | BizActionParamTypes
    | CompanyBizActorsTypes
    | 'BIZ_COMPONENT';

/**
 * 事業の全構成要素
 * ・事業活動を行う上で利用されうる構成要素を、ひとまとめにしたもの
 * ・すべての BizAction と BizIO は、この中の構成要素から計算される
 *
 *  ＝ 構成要素 ＝
 * ＜事業要素＞
 *  ・事業環境： BizEnvironment
 *      ・PEST要素や競合などに関する要素
 *  ・参加者： BizActor
 *      ・自社： 事業の提供者
 *      ・利用者： 事業の購入者（未購入のマーケティング対象を含む）
 *      ・協力者： 事業提供するために必要な協力者（仕入先や販売店など）
 *  ＜BizAction制御＞
 *  ・BizAction追加設定： BizActionParam
 */
export class BizComponent<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    /** Process 時に read only */
    // Environment
    static ENVIRONMENT: string = 'ENVIRONMENT';
    // BizAction Params
    static BIZ_ACTION_PARAMS: string = 'BIZ_ACTION_PARAMS';

    /** Process 時に read / write */
    // Actor
    static COLLABORATORS: string = 'COLLABORATORS';
    static COMPANY: string = 'COMPANY';
    static USERS: string = 'USERS';

    /**
     * [Overwrite対象]
     * 子要素を初期化する
     * 継承クラスが、initの中でChildrenを初期化するためにも利用される想定
     * @param {BizIOInit} initData
     */
    override _initData(initData?: BizIOInit): void {
        super._initData(initData);
        this.db.bizComponentId = this.id;
        this.externalGroupName = 'BIZ_COMPONENT';
        this.appendChildren(
            [
                BizComponent.pickFromInitWthDefault(
                    BizComponent.ENVIRONMENT,
                    () =>
                        new Environment<T>({
                            db: this.db,
                            timetable: this.timetable,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'ENVIRONMENT',
                        }),
                    initData
                ),
                BizComponent.pickFromInitWthDefault(
                    BizComponent.COLLABORATORS,
                    () =>
                        new CollaboratorList<T>({
                            db: this.db,
                            timetable: this.timetable,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COLLABORATORS',
                        }),
                    initData
                ),
                BizComponent.pickFromInitWthDefault(
                    BizComponent.COMPANY,
                    () =>
                        new CompanyBizActors<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'COMPANY',
                        }),
                    initData
                ),
                BizComponent.pickFromInitWthDefault(
                    BizComponent.USERS,
                    () =>
                        new UserLifeCycleList<T>({
                            db: this.db,
                            timetable: this.timetable,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'USERS',
                        }),
                    initData
                ),
                BizComponent.pickFromInitWthDefault(
                    BizComponent.BIZ_ACTION_PARAMS,
                    () =>
                        new BizActionParam<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            isUserNamed: false,
                            externalGroupName: 'BIZ_ACTION_PARAMS',
                        }),
                    initData
                ),
            ],
            [
                BizComponent.ENVIRONMENT,
                BizComponent.COLLABORATORS,
                BizComponent.COMPANY,
                BizComponent.USERS,
                BizComponent.BIZ_ACTION_PARAMS,
            ]
        );
    }

    override _updateTranslation(): void {
        this.setName(i18n.t('translation:BizComponent.BizComponent'), false);
        this.setDefaultNamesToSystemLabeled([
            [
                BizComponent.ENVIRONMENT,
                i18n.t('translation:BizComponent.ENVIRONMENT'),
            ],
            [
                BizComponent.COLLABORATORS,
                i18n.t('translation:BizComponent.COLLABORATORS'),
            ],
            [BizComponent.COMPANY, i18n.t('translation:BizComponent.COMPANY')],
            [BizComponent.USERS, i18n.t('translation:BizComponent.USERS')],
            [
                BizComponent.BIZ_ACTION_PARAMS,
                i18n.t('translation:BizComponent.BIZ_ACTION_PARAMS'),
            ],
        ]);
    }

    /**
     * 事業環境
     * 事業活動に影響を与えるが、事業活動からは「直接」影響を与えにくい要素
     *
     * ＝ 例 ＝
     * ・PEST（政治・経済・社会・技術）
     *      ・為替
     *      ・人口推移
     *      ・インターネット普及率/自動運転車普及率など
     * ・競合
     *      ・競合商品価格
     *      ・市場占有率
     */
    get environment(): Environment<T> {
        return this.selectChildBySystemName(BizComponent.ENVIRONMENT)!;
    }

    /**
     * 協力者グループのリスト
     */
    get collaborators(): CollaboratorList<T> {
        return this.selectChildBySystemName(BizComponent.COLLABORATORS)!;
    }

    /**
     * 自社
     */
    get company(): CompanyBizActors<T> {
        return this.selectChildBySystemName(BizComponent.COMPANY)!;
    }

    /**
     * 利用者ライフサイクルのリスト
     */
    get userLifeCycles(): UserLifeCycleList<T> {
        return this.selectChildBySystemName(BizComponent.USERS)!;
    }

    /**
     * BizAction 設定専用BizIO
     */
    get bizActionParams(): BizActionParam<T> {
        return this.selectChildBySystemName(BizComponent.BIZ_ACTION_PARAMS)!;
    }

    // == Serialize / Deserialize ==

    toObject(): BizComponentToObject<T> {
        return {
            ...super.toObject(),
            environment: this.environment.toObject(),
            collaborators: this.collaborators.toObject(),
            userLifeCycles: this.userLifeCycles.toObject(),
            bizActionParams: this.bizActionParams.toObject(),
            company: this.company.toObject(),
        };
    }

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    static deserialize<T = any>({
        json,
        db,
        timetable,
        hyperMG,
    }: {
        json: string;
        db: BizDatabase<T, BizComponentGroupType>;
        timetable: Timetable;
        hyperMG: HyperParamManager;
    }): BizComponent<T> | undefined {
        const obj = JSON.parse(json);
        console.log('BizComponent.deserialize', obj);
        // FIXME 本当は型ガードすべき
        const bizComponent = BizIODeserializer.fromObject<T>({
            obj,
            db,
            timetable,
            hyperMG,
        });
        if (bizComponent && bizComponent instanceof BizComponent) {
            return bizComponent;
        }
    }
}

export type BizComponentToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    bizActionParams: BizActionParamToObject<T>;
    environment: CollectionBizIOToObject<T, BizComponentGroupType>;
    collaborators: CollectionBizIOToObject<T, BizComponentGroupType>;
    userLifeCycles: UserLifeCycleListToObject<T>;
    company: CompanyBizActorsToObject<T>;
};

export class Environment<T = any> extends BizActors<T> {}
