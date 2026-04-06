import { DateMap } from './DateMap';
import { Failure, Result, ResultError, Success } from './Result';

/**
 * 補完ライブラリ
 */
export class Interpolation {
    /**
     * 時系列に離散的に存在するValue(V)の【最新値】を元に、指定した時系列におけるValue(V)を生成する
     *
     * = 補完ルール =
     * 離散的に存在する Value の集合を[実体群]とした時
     * ・[実体群]で最古（＝最初）の要素(h1)より前： 初期Value (h0)
     * ・h1より後 かつ h1の次要素(h2)より前： h1
     * ・h(n-1)より後 かつ h(n-1)の次要素(h(n))より前：h(n-1)
     * ・[実体群]で最新（＝最後）の要素(h(m))より後： h(m)
     *
     * <時系列に並べた history_entity>
     * ...---------------------------------...-----------------...
     * ...| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |...| x |x+1|x+2|x+3|...
     * ...---------------------------------...-----------------...
     * ...|   |   |h1 |   |   |h2 |   |   |...|hm |   |   |   |...
     * ...---------------------------------...-----------------...
     * ↓
     * <結果>
     * ...---------------------------------...-----------------...
     * ...| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |...| x |x+1|x+2|x+3|...
     * ...---------------------------------...-----------------...
     * ...|h0 |h0 |h1 |h1 |h1 |h2 |h2 |h2 |...|hm |hm |hm |hm |...
     * ...---------------------------------...-----------------...
     *
     * @template V 補完する型
     * @param {Date} target 時系列
     * @param {Map<Date, V>} historyEntity 離散的に存在するValueを含む辞書。
     * @return {Result<V>}
     */
    public static interpolateByLatestValue<V>(
        target: Date,
        historyEntity: DateMap<V>
    ): Result<V> {
        if (historyEntity.has(target)) {
            // historyに実体が保存されている場合
            return new Success<V>(historyEntity.get(target) as V);
        } else {
            // historyに保存されていない場合
            if (historyEntity.size > 0) {
                // 何か定義済みなら「直前」の値
                let latestEntity = target;
                const keys = historyEntity.keys();
                keys.sort((a, b) => a.getTime() - b.getTime());
                for (const sortedEntity of keys) {
                    if (sortedEntity.getTime() < target.getTime()) {
                        latestEntity = sortedEntity;
                    }
                }
                if (latestEntity < target) {
                    return new Success<V>(historyEntity.get(latestEntity) as V);
                } else {
                    // 対象からみて未来に定義されている：初期値
                    return new Failure<V>(
                        new ResultError('no entity to be interpolated found')
                    );
                }
            } else {
                // 過去にはなにもない: 初期値
                return new Failure<V>(new ResultError('no entity found'));
            }
        }
    }
}
