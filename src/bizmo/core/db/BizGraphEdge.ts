import { BizIOId } from '../bizIO/single/BizIOs';

/**
 * BizGraphEdge形式の from：BizIOId と to：BizIOId で生成される文字列
 * BizGraphEdge.key で生成し、BizGraphEdge.createByKey で復号化する
 */
export type BizGraphEdgeKey = string;
/**
 * BizGraph における BizIO ノード間の方向をもつ辺
 * ノード間の依存関係：  from：子BizIO -> to：親BizIO
 *
 * = 備考 =
 * key に相互変換できるようにするのは BizGraph 内部で map の key として利用するため。
 * そのため、異常系の利用法は行わないという前提にたつ
 */
export class BizGraphEdge {
    public static SEPARATOR: string = '::';

    /**
     * Key から BizGraphEdge を生成して from -> to を取り出せるようにする
     * ＝前提＝
     * BizIOGraphからしか利用しない前提で、異常系の検知処理を行わない
     * @param {BizGraphEdgeKey} key
     * @return {BizGraphEdge}
     */
    public static createByKey(key: BizGraphEdgeKey): BizGraphEdge {
        const ids = key.split(BizGraphEdge.SEPARATOR);
        return new BizGraphEdge(ids[0], ids[1]);
    }

    /**
     * @param {from} from
     * @param {public} to
     */
    constructor(public from: BizIOId, public to: BizIOId) {}

    /**
     * 設定された from -> to を示すKey
     */
    get key(): BizGraphEdgeKey {
        return `${this.from}${BizGraphEdge.SEPARATOR}${this.to}`;
    }
}
