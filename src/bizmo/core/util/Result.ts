/**
 * 結果型
 *
 * 異常値を含む結果を返すことがある関数の戻り値に利用する
 *
 * 参考： https://dev.classmethod.jp/articles/error-handling-practice-of-typescript/
 */
export class ResultError extends Error {}
export type Result<T, E extends Error = ResultError> =
    | Success<T, E>
    | Failure<T, E>;

/**
 * 成功時ラップオブジェクト
 */
export class Success<T, E extends Error = ResultError> {
    type = 'success' as const;
    /**
     *
     * @param {T} value
     */
    constructor(readonly value: T) {}

    /**
     *
     * @return {boolean}
     */
    isSuccess(): this is Success<T, E> {
        return true;
    }

    /**
     *
     * @return {boolean}
     */
    isFailure(): this is Failure<T, E> {
        return false;
    }
}

/**
 * 失敗時ラップオブジェクト
 */
export class Failure<T, E extends Error = ResultError> {
    type = 'failure' as const;
    /**
     *
     * @param {E} value
     */
    constructor(readonly value: E) {}

    /**
     *
     * @return {boolean}
     */
    isSuccess(): this is Success<T, E> {
        return false;
    }

    /**
     *
     * @return {boolean}
     */
    isFailure(): this is Failure<T, E> {
        return true;
    }
}
