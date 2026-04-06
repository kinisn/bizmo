import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizProcessor } from 'bizmo/core/bizProcessor/BizProcessor';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';

/**
 * BizAction専用 BizProcessor
 */
export class BizActionProcessor extends BizProcessor {
    /**
     * [overwrite対象]
     * BizIOConf の形式を確認する
     * ・DBに登録されているかどうか
     * @param {Array<BizIOConf>} orderedBizIOConf
     * @return {boolean}
     */
    override validateBizFunctionIOConfTemplate(
        orderedBizIOConf: Array<BizIOConf>
    ): boolean {
        let result: boolean = true;
        for (let cnt = 0; cnt < orderedBizIOConf.length; cnt++) {
            const inputCnf = orderedBizIOConf[cnt];
            if (
                inputCnf == undefined ||
                !this.db.isIncluded(inputCnf.targetId)
            ) {
                result = false;
            }
        }
        return result;
    }

    /**
     * [overwrite対象]
     * set_proc_output にて BizProcOutput として適切か判断する
     * ・親BizCollection が保持するリソースかどうか
     * ・対象が、更新可能なBizIOかどうか
     *
     * 適切ならば true を返す
     *
     *
     * ＝ 注意 ＝
     * BizAction に定義されている BizRelation についての考慮は、BizAction 側で完了させておくこと。
     * BizAction の create_seed_proc_output を利用して生成する想定。
     *
     * @param {BizIOId} parentId
     * @param {BizIOId} targetId
     * @return {boolean}
     */
    override validateProcOutputFuncTemplate(
        parentId?: BizIOId,
        targetId?: BizIOId
    ): boolean {
        if (parentId == undefined || targetId == undefined) return false;
        // eslint-disable-next-line require-jsdoc
        function __isAChildOf(children: Array<BizIO>): boolean {
            let inResult = false;
            for (let cnt = 0; cnt < children.length; cnt++) {
                const child = children[cnt];
                if (child instanceof CollectionBizIO) {
                    inResult = __isAChildOf(child.children);
                } else if (targetId == child.id) {
                    inResult = true;
                }
                // 成功時はBreak
                if (inResult) {
                    break;
                }
            }
            return inResult;
        }

        let result = false;
        const actor = this.db.selectById(parentId);
        const target = this.db.selectById(targetId);
        if (
            actor &&
            actor instanceof CollectionBizIO &&
            target &&
            target.editable
        ) {
            result = __isAChildOf(actor.children);
        }
        return result;
    }
}
