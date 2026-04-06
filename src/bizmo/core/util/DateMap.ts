/**
 * Date型をKeyにする辞書型
 *
 * ＝ 特徴 ＝
 * new Date(yyyy, mm, dd) の形式でKeyを指定しても、正しく get, has ができるように、
 * 内部では key を timestamp として保持する
 */
export class DateMap<V = any> {
    private __map: Map<number, V>;

    /**
     *
     * @param {Array<[Date, V]>} initData
     */
    constructor(initData?: Array<[Date, V]>) {
        this.__map = new Map<number, V>();
        if (initData) {
            initData.map((data) => {
                this.set(data[0], data[1]);
            });
        }
    }

    /**
     *
     */
    get size(): number {
        return this.__map.size;
    }

    /**
     *
     * @return {Array<Date>}
     */
    keys(): Array<Date> {
        const keys: Array<Date> = [];
        for (const key of this.__map.keys()) {
            keys.push(new Date(key));
        }
        return keys;
    }

    /**
     *
     * @return {Array<number>}
     */
    sortedTimeKeys(): Array<number> {
        return Array.from(this.__map.keys()).sort();
    }

    /**
     *
     * @return {Array<V>}
     */
    values(): Array<V> {
        return Array.from(this.__map.values());
    }

    /**
     *
     * @param {Date} key
     * @return {boolean}
     */
    has(key: Date): boolean {
        return this.__map.has(key.getTime());
    }

    /**
     *
     * @param {Date} key
     * @return {V | undefined}
     */
    get(key: Date): V | undefined {
        return this.__map.get(key.getTime());
    }

    /**
     *
     * @param {Date} key
     * @param {V} value
     */
    set(key: Date, value: V): void {
        this.__map.set(key.getTime(), value);
    }

    /**
     *
     * @return {void}
     */
    clear(): void {
        return this.__map.clear();
    }

    /**
     *
     * @param {Date} key
     * @return {boolean}
     */
    delete(key: Date): boolean {
        return this.__map.delete(key.getTime());
    }

    /**
     *
     * @param {Function} callbackfn
     */
    forEach(callbackfn: (value: V, key: Date) => void): void {
        this.__map.forEach((value: V, key: number) => {
            callbackfn(value, new Date(key));
        });
    }

    // == Serialize / Deserialize ==

    serialize(): string {
        return JSON.stringify(this.toObject());
    }

    toObject(): DateMapToObject<V> {
        const newArray: DateMapToObject<V> = [];
        this.forEach((value, key) => {
            if ((value as any).toObject instanceof Function) {
                newArray.push([key, JSON.stringify((value as any).toObject())]);
            } else {
                newArray.push([key, JSON.stringify(value)]);
            }
        });
        return newArray;
    }

    static fromSerialized<V>({
        serialized,
    }: {
        serialized: string;
    }): DateMap<V> {
        const obj: DateMapToObject<V> = JSON.parse(serialized);
        return DateMap.fromObject(obj);
    }

    static fromObject<V>(
        obj: DateMapToObject<V>,
        decoder?: DateMapContentDecoder<V>
    ): DateMap<V> {
        return new DateMap<V>(
            obj.map((data) => {
                return [
                    data[0],
                    decoder
                        ? decoder(JSON.parse(data[1]))
                        : JSON.parse(data[1]),
                ];
            })
        );
    }
}

export type DateMapContentDecoder<V> = (data: any) => V;
export type DateMapToObject<V> = Array<[Date, string]>;
