/* eslint-disable require-jsdoc */
//import { describe } from '@jest/globals';
import { DateMap } from './DateMap';
import {vi } from 'vitest';

describe('DateMap のテスト', () => {
    let strDMap: DateMap<string>;
    let dateDMap: DateMap<Date>;

    beforeEach(() => {
        // setテスト対象グループ
        strDMap = new DateMap<string>();
        strDMap.set(new Date(2020, 5, 1), '2020-05-01');
        strDMap.set(new Date(2020, 3, 1), '2020-03-01');
        strDMap.set(new Date(2020, 1, 1), '2020-01-01');

        dateDMap = new DateMap<Date>();
        dateDMap.set(new Date(2020, 5, 1), new Date(3020, 5, 1));
        dateDMap.set(new Date(2020, 3, 1), new Date(3020, 3, 1));
        dateDMap.set(new Date(2020, 1, 1), new Date(3020, 1, 1));
    });

    describe('init', () => {
        test('プリミティブ型', () => {
            const map = new DateMap<string>();
            expect(map.size).toBe(0);
            expect(map.keys()).toEqual([]);
            expect(map.values()).toEqual([]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mockFunc = vi.fn((value, key) => {});
            map.forEach(mockFunc);
            expect(mockFunc).toBeCalledTimes(0);
        });

        test('オブジェクト型', () => {
            const map = new DateMap<Date>();
            expect(map.size).toBe(0);
            expect(map.keys()).toEqual([]);
            expect(map.values()).toEqual([]);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mockFunc = vi.fn((value, key) => {});
            map.forEach(mockFunc);
            expect(mockFunc).toBeCalledTimes(0);
        });
    });

    describe('set, keys, values, forEach', () => {
        test('プリミティブ型', () => {
            expect(strDMap.size).toBe(3);
            expect(strDMap.keys()).toEqual([
                new Date(2020, 5, 1),
                new Date(2020, 3, 1),
                new Date(2020, 1, 1),
            ]);
            expect(strDMap.values()).toEqual([
                '2020-05-01',
                '2020-03-01',
                '2020-01-01',
            ]);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mockFunc = vi.fn((value, key) => {});
            strDMap.forEach(mockFunc);
            expect(mockFunc).toBeCalledTimes(3);
            expect(mockFunc.mock.calls[0][0]).toBe('2020-05-01');
            expect(mockFunc.mock.calls[0][1]).toEqual(new Date(2020, 5, 1));
            expect(mockFunc.mock.calls[1][0]).toBe('2020-03-01');
            expect(mockFunc.mock.calls[1][1]).toEqual(new Date(2020, 3, 1));
            expect(mockFunc.mock.calls[2][0]).toBe('2020-01-01');
            expect(mockFunc.mock.calls[2][1]).toEqual(new Date(2020, 1, 1));
        });

        test('オブジェクト型', () => {
            expect(dateDMap.size).toBe(3);
            expect(dateDMap.keys()).toEqual([
                new Date(2020, 5, 1),
                new Date(2020, 3, 1),
                new Date(2020, 1, 1),
            ]);
            expect(dateDMap.values()).toEqual([
                new Date(3020, 5, 1),
                new Date(3020, 3, 1),
                new Date(3020, 1, 1),
            ]);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const mockFunc = vi.fn((value, key) => {});
            dateDMap.forEach(mockFunc);
            expect(mockFunc).toBeCalledTimes(3);
            expect(mockFunc.mock.calls[0][0]).toEqual(new Date(3020, 5, 1));
            expect(mockFunc.mock.calls[0][1]).toEqual(new Date(2020, 5, 1));
            expect(mockFunc.mock.calls[1][0]).toEqual(new Date(3020, 3, 1));
            expect(mockFunc.mock.calls[1][1]).toEqual(new Date(2020, 3, 1));
            expect(mockFunc.mock.calls[2][0]).toEqual(new Date(3020, 1, 1));
            expect(mockFunc.mock.calls[2][1]).toEqual(new Date(2020, 1, 1));
        });
    });

    describe('get', () => {
        test('プリミティブ型', () => {
            expect(strDMap.get(new Date(2020, 5, 1))).toEqual('2020-05-01');
            expect(strDMap.get(new Date(2020, 4, 1))).toBeUndefined();
            expect(strDMap.get(new Date(2020, 3, 1))).toEqual('2020-03-01');
            expect(strDMap.get(new Date(2020, 2, 1))).toBeUndefined();
            expect(strDMap.get(new Date(2020, 1, 1))).toEqual('2020-01-01');
        });

        test('オブジェクト型', () => {
            expect(dateDMap.get(new Date(2020, 5, 1))).toEqual(
                new Date(3020, 5, 1)
            );
            expect(dateDMap.get(new Date(2020, 4, 1))).toBeUndefined();
            expect(dateDMap.get(new Date(2020, 3, 1))).toEqual(
                new Date(3020, 3, 1)
            );
            expect(dateDMap.get(new Date(2020, 2, 1))).toBeUndefined();
            expect(dateDMap.get(new Date(2020, 1, 1))).toEqual(
                new Date(3020, 1, 1)
            );
        });
    });

    describe('delete', () => {
        describe('プリミティブ型', () => {
            test('存在するKey', () => {
                const result = strDMap.delete(new Date(2020, 3, 1));
                expect(result).toBeTruthy;
                expect(strDMap.size).toBe(2);
                expect(strDMap.keys()).toEqual([
                    new Date(2020, 5, 1),
                    new Date(2020, 1, 1),
                ]);
                expect(strDMap.values()).toEqual(['2020-05-01', '2020-01-01']);
            });

            test('存在しないKey', () => {
                const result = strDMap.delete(new Date(3020, 3, 1));
                expect(result).toBeFalsy();
                expect(strDMap.size).toBe(3);
                expect(strDMap.keys()).toEqual([
                    new Date(2020, 5, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 1, 1),
                ]);
                expect(strDMap.values()).toEqual([
                    '2020-05-01',
                    '2020-03-01',
                    '2020-01-01',
                ]);
            });
        });

        describe('オブジェクト型', () => {
            test('存在するKey', () => {
                const result = dateDMap.delete(new Date(2020, 3, 1));
                expect(result).toBeTruthy;
                expect(dateDMap.size).toBe(2);
                expect(dateDMap.keys()).toEqual([
                    new Date(2020, 5, 1),
                    new Date(2020, 1, 1),
                ]);
                expect(dateDMap.values()).toEqual([
                    new Date(3020, 5, 1),
                    new Date(3020, 1, 1),
                ]);
            });

            test('存在しないKey', () => {
                const result = dateDMap.delete(new Date(5020, 3, 1));
                expect(result).toBeFalsy();
                expect(dateDMap.size).toBe(3);
                expect(dateDMap.keys()).toEqual([
                    new Date(2020, 5, 1),
                    new Date(2020, 3, 1),
                    new Date(2020, 1, 1),
                ]);
                expect(dateDMap.values()).toEqual([
                    new Date(3020, 5, 1),
                    new Date(3020, 3, 1),
                    new Date(3020, 1, 1),
                ]);
            });
        });
    });

    describe('clear', () => {
        test('プリミティブ型', () => {
            strDMap.clear();
            expect(strDMap.size).toBe(0);
            expect(strDMap.keys()).toEqual([]);
            expect(strDMap.values()).toEqual([]);
        });

        test('オブジェクト型', () => {
            dateDMap.clear();
            expect(dateDMap.size).toBe(0);
            expect(dateDMap.keys()).toEqual([]);
            expect(dateDMap.values()).toEqual([]);
        });
    });

    describe('初期化 ', () => {
        test('初期値を与える', () => {
            const data = new DateMap<string>([
                [new Date(2020, 1, 1), '1'],
                [new Date(2020, 2, 1), '2'],
            ]);
            expect(data.size).toBe(2);
            expect(data.get(new Date(2020, 1, 1))).toBe('1');
            expect(data.get(new Date(2020, 2, 1))).toBe('2');
        });
    });
});
