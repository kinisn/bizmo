import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIOToObject } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIOInit } from 'bizmo/core/bizIO/single/BizIOs';
import { BizActors } from '../BizActors';
import { UserLifeCycleBizActors } from './UserLifeCycleBizActors';

/**
 * 利用者ライフサイクルのリスト
 */
export class UserLifeCycleList<T = any> extends BizActors<T> {
    public static MAIN_TARGET: string = 'MAIN_TARGET';

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChild(
            UserLifeCycleList.pickFromInitWthDefault(
                UserLifeCycleList.MAIN_TARGET,
                () =>
                    new UserLifeCycleBizActors<T>({
                        timetable: this.timetable,
                        db: this.db,
                        hyperMG: this.hyperMG,
                        name: UserLifeCycleList.MAIN_TARGET,
                    }),
                initData
            ),
            UserLifeCycleList.MAIN_TARGET
        );
    }

    /**
     * 初期設定用の UserLifeCycleBizActors を追加する
     *
     * @param {string} name
     * @return {UserLifeCycleBizActors | undefined}
     */
    addSeedUsersLifeCycle(name: string): UserLifeCycleBizActors | undefined {
        return this.appendChild(
            new UserLifeCycleBizActors({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name,
            })
        );
    }

    /**
     * 指定した名前をもつ UserLifeCycleBizActors を取得する
     *
     * @param {string} name
     * @return {UserLifeCycleBizActors<T,S> | undefined}
     */
    selectUsersLifeCycle(name?: string): UserLifeCycleBizActors<T> | undefined {
        return this.selectChildByName(name ?? UserLifeCycleList.MAIN_TARGET);
    }

    // == Serialize / Deserialize ==
    toObject(): UserLifeCycleListToObject<T> {
        //console.log('UserLifeCycleList.toObject');
        return {
            ...super.toObject(),
            mainTarget: this.selectUsersLifeCycle()!.toObject(),
        };
    }
}

export type UserLifeCycleListToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    mainTarget: CollectionBizIOToObject<T, BizComponentGroupType>;
};
