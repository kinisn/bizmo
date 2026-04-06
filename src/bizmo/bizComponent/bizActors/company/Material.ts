import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { AssetsExpensedThings } from './AssetsExpensedThings';

/**
 * 特定の製品材料
 */
export class Material<T = any> extends AssetsExpensedThings<T> {}

/**
 * 製品材料の一覧
 */
export class MaterialList<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    /**
     * 初期設定用の Material を追加する
     * 同一名称はつけられない
     *
     * @param {string} name
     * @return {Material<T> | undefined}
     */
    addSeedMaterial(name: string): Material<T> | undefined {
        return this.appendChild(
            new Material<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
            })
        );
    }

    /**
     * 指定した名前をもつ Material を取得する
     *
     * @param {string} name
     * @return {Material<T> | undefined}
     */
    selectMaterial(name: string): Material<T> | undefined {
        return this.selectChildByName(name);
    }
}
