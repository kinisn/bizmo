/**
 * 期間
 */
export class Duration {
    private __length: number;

    /**
     *
     * @param {number} length
     */
    constructor(length: number = 1) {
        this.__length = length;
    }

    /**
     * @return {number}
     */
    get length(): number {
        return this.__length;
    }

    /**
     * @param {number} length
     */
    set length(length: number) {
        if (0 < length) {
            this.__length = length;
        } else {
            console.log('length must be more than one.');
        }
    }
}
