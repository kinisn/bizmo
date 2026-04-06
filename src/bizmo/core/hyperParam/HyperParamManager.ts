/**
 * HyperParam
 *
 * ユーザーがシミュレーションに設定できるパラメータを管理するパッケージ
 */

import Decimal from 'decimal.js';
import { BizFunction } from '../bizProcessor/func/BizFunction';
import { IDGenerator } from '../util/IdGenerator';
import { ProbHyperParam } from './prob/ProbHyperParam';
import { NormalDistribution } from './prob/cdf/NormalDistribution';
import { TriangleDistribution } from './prob/cdf/TriangleDistribution';
import { UniformDistribution } from './prob/cdf/UniformDistribution';

export type HyperParamID = string;
export type HyperParamLabel = string;
export type HyperParamElem = Decimal | ProbHyperParam;

/**
 * ParamのSelectがSimulation毎かterm毎かを決めるフラグ
 */
export const HyperParamSelectMode = {
    PER_SIMULATION: 'PER_SIMULATION',
    PER_TERM: 'PER_TERM',
} as const;
export type HyperParamSelectMode =
    (typeof HyperParamSelectMode)[keyof typeof HyperParamSelectMode];

/**
 * HyperParamに設定される種別
 */
export const HyperParamTypes = {
    DECIMAL: 'DECIMAL',
    UNIFORM_DISTR: 'UNIFORM_DISTR', // 一様分布
    NORMAL_DISTR: 'NORMAL_DISTR', // 正規分布
    TRIANGLE_DISTR: 'TRIANGLE_DISTR', // 三角分布
    //CUSTOM_DISTR: 'CUSTOM_DISTR', // カスタム分布
} as const;
export type HyperParamTypes =
    (typeof HyperParamTypes)[keyof typeof HyperParamTypes];

export type HyperParamProps = {
    element: HyperParamElem;
    name?: string;
    id?: HyperParamID;
    mode?: HyperParamSelectMode;
};
/**
 * HyperParamのレコード
 */
export class HyperParam {
    private __id: HyperParamID;
    name: HyperParamLabel;
    element: HyperParamElem;
    mode: HyperParamSelectMode;

    /**
     *
     * @param param0
     */
    constructor({
        element,
        id,
        name,
        mode = HyperParamSelectMode.PER_SIMULATION,
    }: HyperParamProps) {
        this.__id = id ?? IDGenerator.generateId();
        this.name = name ?? `HyperParam:${this.__id}`;
        this.element = element;
        this.mode = mode;
    }

    get id(): HyperParamID {
        return this.__id;
    }

    /**
     * 設定されている値のタイプを取得する
     */
    get paramType(): HyperParamTypes | undefined {
        if (this.element) {
            if (this.element instanceof Decimal) {
                return HyperParamTypes.DECIMAL;
            } else if (this.element.cdf instanceof UniformDistribution) {
                return HyperParamTypes.UNIFORM_DISTR;
            } else if (this.element.cdf instanceof NormalDistribution) {
                return HyperParamTypes.NORMAL_DISTR;
            } else if (this.element.cdf instanceof TriangleDistribution) {
                return HyperParamTypes.TRIANGLE_DISTR;
            }
            /*
             else if (this.element.cdf instanceof CustomDistribution) {
                return HyperParamTypes.CUSTOM_DISTR;
            }
            */
        } else {
            return undefined;
        }
    }

    /**
     * 設定されている基準値を取得する。
     *
     * 確率型の場合には mean となる
     */
    get value(): Decimal | undefined {
        if (this.element) {
            if (this.element instanceof Decimal) {
                return this.element;
            } else if (
                this.element.cdf instanceof UniformDistribution ||
                this.element.cdf instanceof NormalDistribution ||
                this.element.cdf instanceof TriangleDistribution
                // || this.element.cdf instanceof CustomDistribution
            ) {
                return this.element.meanValue;
            }
        }
    }

    // ==  serialize ==

    private toObject(): HyperParamToObject {
        return {
            id: this.id,
            name: this.name,
            isProb: this.element instanceof ProbHyperParam,
            element:
                this.element instanceof Decimal
                    ? this.element.toString()
                    : this.element.serialize(),
            mode: this.mode,
        };
    }

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    static fromObject(obj: HyperParamToObject): HyperParam {
        return new HyperParam({
            element: obj.isProb
                ? ProbHyperParam.fromSerialized(obj.element)
                : new Decimal(obj.element),
            id: obj.id,
            name: obj.name,
            mode: obj.mode,
        });
    }

    static fromSerialized(serialized: string): HyperParam {
        return HyperParam.fromObject(JSON.parse(serialized));
    }
}

export type HyperParamToObject = Omit<HyperParamProps, 'element'> & {
    element: string;
    isProb: boolean;
};

/**
 * HyperParamManager
 *
 * HyperParam のデータベースであると同時に、データベースの情報をもとに BizAction や BizFunction との連携を行う。
 */
export class HyperParamManager {
    private static DECIMAL_NAN = new Decimal('NaN');
    private __nameMap: Map<HyperParamLabel, HyperParam>;

    constructor(initData?: Array<HyperParam>) {
        this.__nameMap = new Map<HyperParamLabel, HyperParam>();
        if (initData) {
            initData.forEach((data) => {
                this.set({ data });
            });
        }
    }

    // == DB操作 ==

    set(
        props:
            | {
                  label: HyperParamLabel;
                  value: HyperParamElem;
                  mode?: HyperParamSelectMode;
              }
            | { data: HyperParam }
    ): void {
        let hyperParam: HyperParam;
        let label: string;
        if ('data' in props) {
            label = props.data.name;
            hyperParam = props.data;
        } else {
            label = props.label;
            hyperParam = new HyperParam({
                element: props.value,
                name: label,
                mode: props.mode ?? HyperParamSelectMode.PER_SIMULATION,
            });
        }

        // 設定済みラベルに更新されているなら、一度削除してから再設定
        this.removeByID(hyperParam.id);

        // 設定
        this.__nameMap.set(label, hyperParam);
    }

    remove(label: HyperParamLabel): void {
        const target = this.get(label);
        if (target) {
            this.__nameMap.delete(target.name);
        }
    }

    removeByID(id: HyperParamID): void {
        const temp = Array.from(this.__nameMap.entries()).filter(
            ([label, value]) => value.id == id
        );
        if (temp && temp.length > 0) {
            this.__nameMap.delete(temp[0][0]);
        }
    }

    get(label: HyperParamLabel): HyperParam | undefined {
        return this.__nameMap.get(label);
    }

    getByID(id: HyperParamID): HyperParam | undefined {
        const temp = this.values().filter((value) => value.id == id);
        if (temp.length > 0) {
            return temp[0];
        }
    }

    values(): Array<HyperParam> {
        return Array.from(this.__nameMap.values());
    }

    // == BizAction/BizFunction連携用 ==

    /**
     * 指定されたHyperParamを設定したBizFunctionを生成する。
     *  - BizAction 連携用
     * @param label
     * @returns
     */
    makeBizFuncFor(label: HyperParamLabel): BizFunction | undefined {
        const target = this.__nameMap.get(label);
        if (
            target &&
            (target.element instanceof ProbHyperParam ||
                target.element instanceof Decimal)
        ) {
            return new BizFunction({
                code: 'hyper0',
                orderedHyperParamIDs: [target.id],
            });
        }
    }

    /**
     * 全ての確率分布Hyperパラメータにつき、シミュレーションに利用する値を選出する
     * - BizSimulator 連携用
     */
    prepareSimulation(): void {
        this.__nameMap.forEach((hyperParam) => {
            if (hyperParam.element instanceof ProbHyperParam) {
                hyperParam.element.select();
            }
        });
    }

    /**
     * 次のTermのために、Term更新モードの確率分布Hyperパラメータにつき、シミュレーションに利用する値を選出する
     */
    prepareForNextTerm(): void {
        this.__nameMap.forEach((hyperParam) => {
            if (
                hyperParam.element instanceof ProbHyperParam &&
                hyperParam.mode == HyperParamSelectMode.PER_TERM
            ) {
                hyperParam.element.select();
            }
        });
    }

    /**
     * 指定した HyperParam の prepareSimulation 実行後の結果を含めてDecimal変換した結果を取得する
     *
     * @param {Array<HyperParamID>} targetIDs
     * @returns {Array<Decimal>}
     */
    fillSelectedHyperParams(targetIDs: Array<HyperParamID>): Array<Decimal> {
        const result: Array<Decimal> = [];
        for (const targetID of targetIDs) {
            const target = this.get(targetID);
            if (target && target.element instanceof ProbHyperParam) {
                result.push(
                    target.element.selectedValue ??
                        HyperParamManager.DECIMAL_NAN
                );
            } else if (target && target.element instanceof Decimal) {
                result.push(target.element);
            } else {
                result.push(HyperParamManager.DECIMAL_NAN);
            }
        }
        return result;
    }
}
