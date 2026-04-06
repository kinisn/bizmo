import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizFunction, FuncId } from './BizFunction';
import { BizIOConf } from './input/BizIOConf';

type MetaCreateCollectionFuncParam = {
    collection: Array<BizIO>;
    operator: string;
    relativeTermIndex?: number;
    initCode?: string;
    funcId?: FuncId;
};

export type CreateCollectionFuncParam = {
    collection: Array<BizIO>;
    relativeTermIndex?: number;
    funcId?: FuncId;
};

/**
 * 典型的な BizFunction の Factory
 *
 * すべて static method のライブラリ
 */
export class TypicalFunctionFactory {
    /**
     * Stringを除く Collection の全子要素の、該当termにおける値を、
     * operator で計算した値 を取得する BizFunction を生成する
     *
     * @param {Array<BizIO>} collection
     * @param {string} operator
     * @param {number} relativeTermIndex
     * @param {string} initCode
     * @param {FuncId} funcId
     * @return {BizFunction}
     */
    static __metaCreateCollectionFunc({
        collection,
        operator,
        relativeTermIndex = 1,
        initCode = '0',
        funcId,
    }: MetaCreateCollectionFuncParam): BizFunction {
        const func = new BizFunction({ code: initCode, funcId: funcId });
        for (let index = 0; index < collection.length; index++) {
            if (index === 0) {
                func.code = `bizio${index}`;
            } else {
                func.code = func.code.concat(` ${operator} bizio${index}`);
            }
            func.orderedBizIOConf.push(
                new BizIOConf(collection[index].id, relativeTermIndex)
            );
        }
        return func;
    }

    /**
     * Collection全子要素の 該当termにおける値を 全て加算した値 を取得する BizFunction を生成する
     *  例）bizio0 + bizio1 + ... + bizioN
     * @param {CreateCollectionFuncParam} param0
     * @return {BizFunction}
     */
    static createCollectionSumFunc({
        collection,
        relativeTermIndex = 1,
        funcId,
    }: CreateCollectionFuncParam): BizFunction {
        return TypicalFunctionFactory.__metaCreateCollectionFunc({
            collection: collection,
            operator: '+',
            relativeTermIndex: relativeTermIndex,
            funcId: funcId,
        });
    }

    /**
     * Collection全子要素の 該当termにおける値を 全て除算した値 を取得する BizFunction を生成する
     *  例）bizio0 / bizio1 / ... / bizioN
     * @param {CreateCollectionFuncParam} param0
     * @return {BizFunction}
     */
    static createCollectionDivideFunc({
        collection,
        relativeTermIndex = 1,
        funcId,
    }: CreateCollectionFuncParam): BizFunction {
        return TypicalFunctionFactory.__metaCreateCollectionFunc({
            collection: collection,
            operator: '/',
            relativeTermIndex: relativeTermIndex,
            initCode: '',
            funcId: funcId,
        });
    }

    /**
     * Collection全子要素の 該当termにおける値を 全て乗算した値 を取得する BizFunction を生成する
     *  例）bizio0 * bizio1 * ... * bizioN
     * @param {CreateCollectionFuncParam} param0
     * @return {BizFunction}
     */
    static createCollectionMultipleFunc({
        collection,
        relativeTermIndex = 1,
        funcId,
    }: CreateCollectionFuncParam): BizFunction {
        return TypicalFunctionFactory.__metaCreateCollectionFunc({
            collection: collection,
            operator: '*',
            relativeTermIndex: relativeTermIndex,
            funcId: funcId,
        });
    }

    /**
     * ちょうど3要素をもつ collection を、index順に a, x, b として ax + b を計算した値を取得する BizFunction を生成する
     * @param {CreateCollectionFuncParam} param0
     * @return {BizFunction}
     */
    static createCollectionLinearFunc({
        collection,
        relativeTermIndex = 1,
        funcId,
    }: CreateCollectionFuncParam): BizFunction {
        const func = new BizFunction({ code: '', funcId: funcId });
        if (collection.length == 3) {
            func.code = func.code.concat('bizio0 * bizio1 + bizio2');
            collection.forEach((elem) =>
                func.orderedBizIOConf.push(
                    new BizIOConf(elem.id, relativeTermIndex)
                )
            );
        }
        return func;
    }
}
