/**
 *  == ユーザ区分 ==
 *
 * ・MarketingTarget： マーケティング対象となる全ユーザ
 *     ・Unreachable target： 自社から直接対象にアプローチ[できない]マーケティング対象
 *     ・Reachable target： 自社から直接対象にアプローチ[できる]マーケティング対象
 *     ↓
 * ・Purchaser： 一度でも購入したことのある全ユーザ
 *     ・Each time purchaser： 都度毎に購入するユーザ
 *     ・Subscriber： サブスクリプションによる購入ユーザ
 *
 * ----------------------------------------------------------
 * | Market                                                 |
 * |   |----------------------------------------------------|
 * |   | MarketingTarget                                    |
 * |   |----------------------------------------------------|
 * |   |   Unreachable Target   |     Reachable Target      |
 * |   |                        |                           |
 * |   |                        :                           |
 * |   |                                                    |
 * |   |   |------------------------------------------------|
 * |   |   | Purchaser                                      |
 * |   |   |------------------------------------------------|
 * |   |   |  Each time purchaser  |       Subscriber       |
 * |   |   |                       |                        |
 * ----------------------------------------------------------
 */
export const UserState = {
    MARKETING_TARGET: 10000,
    REACHABLE_TARGET: 11000,
    UNREACHABLE_TARGET: 12000,
    PURCHASER: 300,
    EACH_TIME_PURCHASER: 310,
    SUBSCRIBER: 320,
};
export type UserState = typeof UserState[keyof typeof UserState];

/**
 * UserState ユーティリティ
 */
export class UserStateUtil {
    /**
     * マーケティング対象かを判定する
     * UnreachableかReachableを問わない
     *
     * @param {UserState} state
     * @return {boolean}
     */
    static isMarketingTarget(state: UserState): boolean {
        return (
            state == UserState.MARKETING_TARGET ||
            state == UserState.REACHABLE_TARGET ||
            state == UserState.UNREACHABLE_TARGET
        );
    }

    /**
     * 購入者かを判定する
     * 個別購入か定期購入かを問わない
     *
     * @param {UserState} state
     * @return {boolean}
     */
    static isPurchaser(state: UserState): boolean {
        return (
            state == UserState.PURCHASER ||
            state == UserState.EACH_TIME_PURCHASER ||
            state == UserState.SUBSCRIBER
        );
    }
}
