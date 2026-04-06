/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { DateMap } from './DateMap';
import { Interpolation } from './Interpolation';

describe('Interpolation のテスト', () => {
    let strDMap: DateMap<string>;

    beforeEach(() => {
        strDMap = new DateMap<string>();
        strDMap.set(new Date(2020, 5, 1), '2020-05-01');
        strDMap.set(new Date(2020, 3, 1), '2020-03-01');
        strDMap.set(new Date(2020, 1, 1), '2020-01-01');
    });

    describe('interpolateByLatestValue', () => {
        test('実体の最小よりも前（＝小さい）: 存在しない', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2019, 12, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeFalsy();
        });

        test('登録済みの実体の最小値', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 1, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-01-01');
        });

        test('補完（実体の最小値）', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 2, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-01-01');
        });

        test('実体', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 3, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-03-01');
        });

        test('補完', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 4, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-03-01');
        });

        test('実体の最大値', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 5, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-05-01');
        });

        test('補完 ', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2020, 6, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-05-01');
        });

        test('補完: どれだけ大きくても最終値で補完', () => {
            const result = Interpolation.interpolateByLatestValue<string>(
                new Date(2220, 1, 1),
                strDMap
            );
            expect(result.isSuccess()).toBeTruthy();
            expect(result.value).toBe('2020-05-01');
        });
    });
});
