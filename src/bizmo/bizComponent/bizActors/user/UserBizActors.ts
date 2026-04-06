import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    CollectionBizIO,
    CollectionBizIOParam,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { CohortComponent } from 'bizmo/core/bizIO/component/CohortComponent';
import { AmountBizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizActors } from '../BizActors';
import { UserState } from './UserState';

export type UserBizActorsRequiredParam<T = any> = CollectionBizIOParam<
    T,
    BizComponentGroupType
> &
    Required<{
        name: string;
        userState: UserState;
        isRetention: boolean;
    }> &
    Omit<
        CollectionBizIOParam<T, BizComponentGroupType>,
        'uniqueByName' | 'exportWithChildren'
    >;
//type UserBizActorsOptionalParam = { bizIOId?: BizIOId; initData?: BizIOInit };

/**
 * 同一市場における 同一UserStatusの利用者（法人・自然人）
 *
 * コンテンツ： 利用者を構成する部分要素
 *      生成時の設定により Cohort か Amount のいずれかになる。
 *      Amount の場合には、合計値も生成される
 */
export class UserBizActors<T = any> extends BizActors<T> {
    static VALUE: string = 'VALUE';
    static MAIN_USERS: string = 'MAIN_USERS';

    private __userState: UserState;
    private __isRetention: boolean;

    constructor(props: UserBizActorsRequiredParam<T>) {
        const {
            timetable,
            db,
            hyperMG,
            name,
            userState,
            isRetention,
            ...rest
        } = props;
        super({
            timetable,
            db,
            hyperMG,
            name,
            exportWithChildren: true,
            ...rest,
        });
        this.__userState = userState;
        this.__isRetention = isRetention;

        /*
        初期データ
        名称でUniqueになるCategoryを利用。Channelなどを追加できるようにする。
        CohortComponent の場合は、そのまま入っているので、使う側で料理する
        Cohort は独自の値を持たぬため、Cohortを入れた場合には、Containerそのものの値は存在しない
         */
        this.appendChild(
            new CollectionBizIO<T, BizComponentGroupType>({
                timetable,
                db,
                hyperMG,
                name,
                summarizeMode: !isRetention
                    ? CollectionSummarizeMode.TOTAL_AMOUNT
                    : CollectionSummarizeMode.NO_SUMMARIZE,
                exportWithChildren: true,
            }),
            UserBizActors.VALUE
        );

        this.addSeedContent(UserBizActors.MAIN_USERS);
    }

    /**
     * Userの状態
     */
    get userState(): UserState {
        return this.__userState;
    }

    /**
     * コンテンツが CohortComponent かどうか
     */
    get isRetention(): boolean {
        return this.__isRetention;
    }

    /**
     * UserBizActors のコンテンツ
     * FIXME あまりよろしくない実装方法
     */
    get container(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(UserBizActors.VALUE)!; // FIXME あまりよろしくない
    }

    /**
     * 新しいコンテンツを追加する
     * @param {string} name
     * @return {CohortComponent<T,S> | AmountBizIO<T,S> | undefined}
     */
    addSeedContent(
        name: string
    ):
        | CohortComponent<T, BizComponentGroupType>
        | AmountBizIO<T, BizComponentGroupType>
        | undefined {
        if (this.isRetention) {
            return this.container.appendChild(
                new CohortComponent<T, BizComponentGroupType>({
                    timetable: this.timetable,
                    db: this.db,
                    hyperMG: this.hyperMG,
                    name: name,
                })
            );
        } else {
            return this.container.appendChild(
                new AmountBizIO<T, BizComponentGroupType>({
                    timetable: this.timetable,
                    db: this.db,
                    name: name,
                })
            );
        }
    }

    /**
     * 指定した名称のコンテンツを取得する
     *
     * @param {string} name
     * @return {CohortComponent<T,S> | AmountBizIO<T,S> | undefined}
     */
    getContent(
        name?: string
    ):
        | CohortComponent<T, BizComponentGroupType>
        | AmountBizIO<T, BizComponentGroupType>
        | undefined {
        return this.container.selectChildByName(
            name ?? UserBizActors.MAIN_USERS
        );
    }

    // ==== Serialize / Deserialize ====
    toObject(): UserBizActorsToObject<T> {
        return {
            ...super.toObject(),
            name: this.name,
            userState: this.userState,
            isRetention: this.isRetention,
        };
    }
}

export type UserBizActorsToObject<T> = Omit<
    CollectionBizIOToObject<T, BizComponentGroupType>,
    'name'
> & {
    name: string;
    userState: UserState;
    isRetention: boolean;
};
