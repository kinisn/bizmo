/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { Duration } from './Duration';

describe('Duration のテスト', () => {
    test('test_init_default', () => {
        const duration = new Duration();
        expect(duration.length).toBe(1);
    });

    test('test_init_length', () => {
        const duration = new Duration(10);
        expect(duration.length).toBe(10);
    });

    test('test_set_length', () => {
        const duration = new Duration(10);
        duration.length = 36;
        expect(duration.length).toBe(36);
    });

    test('test_set_length_must_not_less_than_1', () => {
        const duration = new Duration();
        duration.length = 0; // TODO ここで log になる
        expect(duration.length).toBe(1);
    });
});
