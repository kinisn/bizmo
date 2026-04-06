import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizComponentGroupType } from '../BizComponent';

/**
 * 事業上の特定の役割を担う自然人・法人（のグループ）
 */
export class BizActors<T = any> extends CollectionBizIO<
    T,
    BizComponentGroupType
> {
    protected _validateAppendingChild<
        FT extends BizIO<T, BizComponentGroupType> = BizIO<
            T,
            BizComponentGroupType
        >,
    >(child: FT, systemNamedLabel?: string | undefined): boolean {
        let result = super._validateAppendingChild(child, systemNamedLabel);
        if (result) {
            // BizActors の直系の先祖BizActorが一意に定まる必要がある。
            // そのため、子要素候補の先祖にBizActorを含まないことを確認する
            return !this.__includeBizActorInAncestor(child);
        }
        return result;
    }

    private __includeBizActorInAncestor(
        bizIO: BizIO<T, BizComponentGroupType>,
        currentDepth: number = 0
    ): boolean {
        if (currentDepth > 0 && bizIO instanceof BizActors) {
            return true;
        }
        if (bizIO.parents.length === 0) {
            return false;
        }
        return bizIO.parents.some((parent) =>
            this.__includeBizActorInAncestor(parent, currentDepth++)
        );
    }

    // utility

    /**
     * BizActors の子要素
     */
    get actorChildren(): Array<BizActors<T>> {
        return this.children.filter(
            (child) => child instanceof BizActors
        ) as Array<BizActors<T>>;
    }
    /**
     * BizActors ではない子要素
     */
    get nonActorChildren(): Array<BizIO<T>> {
        return this.children.filter((child) => !(child instanceof BizActors));
    }

    /**
     * BizActors の親要素
     * addChild 時の制約により、親要素には最大１つのBizActorsしか存在しない。
     */
    get actorParent(): BizActors<T> | undefined {
        const parents = this.parents.filter(
            (parent) => parent instanceof BizActors
        ) as Array<BizActors<T>>;
        if (parents.length > 0) {
            return parents[0];
        }
    }

    /**
     * BizActors の祖先要素の配列を返す
     * 当該BizActorに近い祖先要素から順に格納される
     */
    get actorAncestors(): Array<BizActors<T>> {
        return this.__getActorAncestors(this);
    }

    private __getActorAncestors(
        bizIO: BizIO<T, BizComponentGroupType>,
        currentAncestors: Array<BizActors<T>> = []
    ): Array<BizActors<T>> {
        // 複数の系統の祖先を持つことは、制約上ありえない
        bizIO.parents.forEach((parent) => {
            if (parent instanceof BizActors) {
                currentAncestors.push(parent);
            }
            this.__getActorAncestors(parent, currentAncestors);
        });
        return currentAncestors;
    }
}
