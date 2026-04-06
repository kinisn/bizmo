/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { Failure, Result, Success } from './Result';

class ErrorA<T> extends Error {
    constructor(public value: T) {
        super();
    }
}

function tester<T>(mode: boolean, value: T): Result<T, ErrorA<T>> {
    if (mode) {
        return new Success<T, ErrorA<T>>(value);
    } else {
        return new Failure<T, ErrorA<T>>(new ErrorA<T>(value));
    }
}

describe('Result のテスト', () => {
    test('test_success_number', () => {
        const result = tester<number>(true, 123);
        expect(result.value).toBe(123);
        expect(result.isSuccess()).toBeTruthy();
    });

    test('test_failure_number', () => {
        const result = tester<number>(false, 404);
        expect((result.value as ErrorA<number>).value).toBe(404);
        expect(result.isSuccess()).toBeFalsy();
    });

    test('test_success_string', () => {
        const result = tester<string>(true, 'abc');
        expect(result.value).toBe('abc');
        expect(result.isSuccess()).toBeTruthy();
    });

    test('test_failure_string', () => {
        const result = tester<string>(false, 'error_msg');
        expect((result.value as ErrorA<string>).value).toBe('error_msg');
        expect(result.isSuccess()).toBeFalsy();
    });
});
