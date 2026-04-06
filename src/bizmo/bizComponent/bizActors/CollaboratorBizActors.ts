import { BizActors } from './BizActors';

/**
 * 協力者グループ
 *
 * 利用法： 適宜 add_seed_xxx をして利用する
 * ・事業モデルにおいて、自社と協力して User にサービス・製品を提供する自然人・法人（のグループ）
 * ・各グループにおいて、どの粒度にするかは利用者次第
 * 例） 仕入先、販売代理店
 */
export class CollaboratorBizActors<T = any> extends BizActors<T> {}

/**
 * 協力者のリスト
 */
export class CollaboratorList<T = any> extends BizActors<T> {
    /**
     * 新しい協力者グループを追加する
     * 同一名をつけることはできない
     * @param {string} name
     * @return {CollaboratorBizActors<T> | undefined}
     */
    addSeedCollaborator(name: string): CollaboratorBizActors<T> | undefined {
        return this.appendChild(
            new CollaboratorBizActors<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name,
            })
        );
    }

    /**
     * 協力者グループ を名称で選択する
     * @param {string} name
     * @return {CollaboratorBizActors<T> | undefined}
     */
    selectCollaborator(name: string): CollaboratorBizActors<T> | undefined {
        return this.selectChildByName(name);
    }
}
