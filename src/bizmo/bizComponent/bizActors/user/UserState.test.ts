import { UserState, UserStateUtil } from './UserState';

describe('UserState & UserStateUtil のテスト', () => {
    test('isMarketingTarget', () => {
        expect(
            UserStateUtil.isMarketingTarget(UserState.MARKETING_TARGET)
        ).toBeTruthy();
        expect(
            UserStateUtil.isMarketingTarget(UserState.REACHABLE_TARGET)
        ).toBeTruthy();
        expect(
            UserStateUtil.isMarketingTarget(UserState.UNREACHABLE_TARGET)
        ).toBeTruthy();

        expect(
            UserStateUtil.isMarketingTarget(UserState.PURCHASER)
        ).toBeFalsy();
        expect(
            UserStateUtil.isMarketingTarget(UserState.EACH_TIME_PURCHASER)
        ).toBeFalsy();
        expect(
            UserStateUtil.isMarketingTarget(UserState.SUBSCRIBER)
        ).toBeFalsy();
    });

    test('isPurchaser', () => {
        expect(
            UserStateUtil.isPurchaser(UserState.MARKETING_TARGET)
        ).toBeFalsy();
        expect(
            UserStateUtil.isPurchaser(UserState.REACHABLE_TARGET)
        ).toBeFalsy();
        expect(
            UserStateUtil.isPurchaser(UserState.UNREACHABLE_TARGET)
        ).toBeFalsy();

        expect(UserStateUtil.isPurchaser(UserState.PURCHASER)).toBeTruthy();
        expect(
            UserStateUtil.isPurchaser(UserState.EACH_TIME_PURCHASER)
        ).toBeTruthy();
        expect(UserStateUtil.isPurchaser(UserState.SUBSCRIBER)).toBeTruthy();
    });
});
