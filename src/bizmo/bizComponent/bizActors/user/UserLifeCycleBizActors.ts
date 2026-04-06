import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIOToObject } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import {
    FunnelComponent,
    FunnelComponentToObject,
} from 'bizmo/core/bizIO/component/FunnelComponent';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';
import i18n from 'i18n/configs';
import { BizActors } from '../BizActors';
import { Market, MarketToObject } from './Market';
import { UserBizActors } from './UserBizActors';
import { UserState, UserStateUtil } from './UserState';

/**
 * 利用者ライフサイクル（BizActor）
 * 同一市場の利用者（法人・自然人）を、UserStatus（ユーザー区分）ごとの利用者の集合として扱う
 *
 *
 *  == ユーザ区分 ==
 * ・MarketingTarget： マーケティング対象となる全ユーザ
 *     ・Unreachable target： 自社から直接対象にアプローチ[できない]マーケティング対象
 *     ・Reachable target： 自社から直接対象にアプローチ[できる]マーケティング対象
 *     ↓
 * ・Purchaser： 一度でも購入したことのある全ユーザ
 *     ・Each time purchaser： 都度毎に購入するユーザ
 *     ・Subscriber： サブスクリプションによる購入ユーザ
 *
 * ----------------------------------------------------------
 * | Market                                                 |
 * |   |----------------------------------------------------|
 * |   | MarketingTarget                                    |
 * |   |----------------------------------------------------|
 * |   |   Unreachable Target   |     Reachable Target      |
 * |   |                        |                           |
 * |   |                        :                           |
 * |   |                                                    |
 * |   |   |------------------------------------------------|
 * |   |   | Purchaser                                      |
 * |   |   |------------------------------------------------|
 * |   |   |  Each time purchaser  |       Subscriber       |
 * |   |   |                       |                        |
 * ----------------------------------------------------------
 */
export class UserLifeCycleBizActors<T = any> extends BizActors<T> {
    public static MARKET: string = 'MARKET';
    public static FUNNEL: string = 'FUNNEL';
    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChildren(
            [
                UserLifeCycleBizActors.pickFromInitWthDefault(
                    UserLifeCycleBizActors.MARKET,
                    () =>
                        new Market<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: UserLifeCycleBizActors.MARKET,
                            isUserNamed: false,
                        }),
                    initData
                ),
                UserLifeCycleBizActors.pickFromInitWthDefault(
                    UserLifeCycleBizActors.FUNNEL,
                    () =>
                        new FunnelComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: UserLifeCycleBizActors.FUNNEL,
                            isUserNamed: false,
                        }),
                    initData
                ),
            ],
            [UserLifeCycleBizActors.MARKET, UserLifeCycleBizActors.FUNNEL]
        );
    }
    // ======== Translation ========

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [
                UserLifeCycleBizActors.MARKET,
                i18n.t('translation:UserLifeCycleBizActors.MARKET'),
            ],
            [
                UserLifeCycleBizActors.FUNNEL,
                i18n.t('translation:UserLifeCycleBizActors.FUNNEL'),
            ],
        ]);
    }

    /**
     *
     */
    get market(): Market<T> {
        return this.selectChildBySystemName(UserLifeCycleBizActors.MARKET)!;
    }

    /**
     *
     */
    get marketingFunnel(): FunnelComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(UserLifeCycleBizActors.FUNNEL)!;
    }

    /**
     *
     */
    get marketingTargets(): Array<UserBizActors<T>> {
        return this.children.filter(
            (child) =>
                child instanceof UserBizActors &&
                UserStateUtil.isMarketingTarget(child.userState)
        ) as Array<UserBizActors<T>>;
    }

    /**
     *
     */
    get purchasers(): Array<UserBizActors<T>> {
        return this.children.filter(
            (child) =>
                child instanceof UserBizActors &&
                UserStateUtil.isPurchaser(child.userState)
        ) as Array<UserBizActors<T>>;
    }

    // 操作

    /**
     * UserBizActors を選択する
     * @param {string} name
     * @return {UserBizActors | undefined}
     */
    selectUsers(name: string): UserBizActors<T> | undefined {
        return this.selectChildByName(name);
    }

    /**
     * UserBizActors を初期化して追加する
     * 自動的に funnel の最終ターゲットに追加される
     *
     * 注意： 同一名称は登録できない
     *
     * @param {string} name
     * @param {UserState} userState
     * @param {boolean} isRetention
     * @return {UserBizActors | undefined}
     */
    addSeedUsers(
        name: string,
        userState: UserState = UserState.MARKETING_TARGET,
        isRetention: boolean = false
    ): UserBizActors | undefined {
        const user = this.appendChild(
            new UserBizActors({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name,
                userState,
                isRetention,
            })
        );
        if (user != undefined) {
            if (user.isRetention) {
                this.marketingFunnel.appendFunnelChild(
                    (
                        user.getContent() as CohortComponent<
                            T,
                            BizComponentGroupType
                        >
                    ).action2nd
                );
            } else {
                this.marketingFunnel.appendFunnelChild(user.container);
            }
        }
        return user;
    }

    // == Serialize / Deserialize ==

    toObject(): UserLifeCycleBizActorsToObject<T> {
        return {
            ...super.toObject(),
            market: this.market.toObject(),
            marketingFunnel: this.marketingFunnel.toObject(),
        };
    }
}

export type UserLifeCycleBizActorsToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    market: MarketToObject<T>;
    marketingFunnel: FunnelComponentToObject<T, BizComponentGroupType>;
};
