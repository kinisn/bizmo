import { Result } from './Result';
import { PreparedTaggedString } from './TaggedString';

/**
 * ラベル名
 */
export type Label<T> = string | PreparedTaggedString<T>;

/**
 * ラベリングされた Dictionary
 *
 * ラベルによりコンテンツを管理するライブラリ
 * 標準的にラベルに文字列フォーマットが利用できる
 */
export class LabeledDict<C> {
    private __idContentDict: Map<string, C>;

    /**
     *
     */
    constructor() {
        this.__idContentDict = new Map<string, C>();
    }

    /**
     * ラベルを生成する
     * ラベルは文字列なので、フォーマットが使える
     * @param {Label<T>} label
     * @return {string}
     */
    public static makeContentLabel<T = {}>(label: Label<T>): string {
        if (typeof label === 'string') {
            return label;
        } else {
            return label.text(label.tags);
        }
    }

    /**
     * ラベルをつけてコンテンツを追加・更新する
     * @param {C} content
     * @param {Label<T>} label
     */
    setContentWithLabel<T = {}>(content: C, label: Label<T>): void {
        this.__idContentDict.set(
            LabeledDict.makeContentLabel<T>(label),
            content
        );
    }

    /**
     * ラベルによりコンテンツを取得する
     * @param {Label<T>} label
     * @return {Result<C>}
     */
    getContentByLabel<T = {}>(label: Label<T>): C | undefined {
        return this.__idContentDict.get(LabeledDict.makeContentLabel<T>(label));
    }

    /**
     * ラベルで指定したコンテンツを取り除く
     * @param {Label<T>} label
     * @return {boolean}
     */
    removeContentByLabel<T = {}>(label: Label<T>): boolean {
        return this.__idContentDict.delete(
            LabeledDict.makeContentLabel<T>(label)
        );
    }

    /**
     * 指定したコンテンツを保持するペアをすべて取り除く
     * @param {C} content
     * @param {boolean} compareObjectId 厳密比較する（===）か、等価比較（==）するかを選ぶ。
     */
    removeAllContentsByContent(content: C): void {
        const labelList: string[] = [];
        this.__idContentDict.forEach((value, key) => {
            if (value === content) {
                labelList.push(key);
            }
        });
        for (const deleteLabel of labelList) {
            this.__idContentDict.delete(deleteLabel);
        }
    }

    /**
     * 該当ラベルが登録済みかを確認する
     * @param {string} resolvedLabel
     * @return {boolean}
     */
    isIncludedLabel(resolvedLabel: string): boolean {
        return this.__idContentDict.has(resolvedLabel);
    }

    /**
     * 該当コンテンツが登録済みかを確認する
     * @param {C} content
     * @returns {boolean}
     */
    isIncludeContent(content: C): boolean {
        return Array.from(this.__idContentDict.values()).some(
            (v) => v === content
        );
    }

    /**
     * 全コンテンツのリストを取得する
     * @return {Array<C>}
     */
    getAllContents(): Array<C> {
        return Array.from(this.__idContentDict.values());
    }

    /**
     * 全ラベルのリストを取得する
     * @return {Array<string>}
     */
    getAllLabels(): Array<string> {
        return Array.from(this.__idContentDict.keys());
    }

    /**
     * 全要素のラベルとコンテンツのペアの IterableIterator を取得する
     * @returns
     */
    getEntries(): Array<[string, C]> {
        return Array.from(this.__idContentDict.entries());
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): LabeledDictToObject<C> {
        const newArray: Array<[string, any]> = [];
        this.__idContentDict.forEach((value, key) => {
            if ((value as any).toObject instanceof Function) {
                newArray.push([key, (value as any).toObject()]);
            } else {
                newArray.push([key, value]);
            }
        });
        return newArray;
    }

    static fromObject<C>(
        obj: LabeledDictToObject<C>,
        decoder?: LabelDictContentDecoder<C>
    ): LabeledDict<C> {
        const newDict = new LabeledDict<C>();
        const newDecoder = decoder || ((data: any, key?: string) => data);
        for (const [key, value] of obj) {
            newDict.setContentWithLabel(newDecoder(value, key), key);
        }
        return newDict;
    }

    static fromSerialized<C>({
        serialized,
        decoder,
    }: {
        serialized: string;
        decoder?: LabelDictContentDecoder<C>;
    }): LabeledDict<C> {
        return LabeledDict.fromObject(JSON.parse(serialized), decoder);
    }
}

export type LabelDictContentDecoder<C> = (data: any, key?: string) => C;
export type LabeledDictToObject<C> = Array<[string, any]>;

export function isLabeledDictToObject<C>(
    value: any
): value is LabeledDictToObject<C> {
    return (
        Array.isArray(value) &&
        value.every(([key, val]) => typeof key === 'string')
    );
}
