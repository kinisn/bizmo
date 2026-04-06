/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { IDGenerator } from './IdGenerator';

describe('IDGenerator のテスト', () => {
    test('test_generateId', () => {
        const id1 = IDGenerator.generateId();
        expect(id1).not.toBeNull();
        const id2 = IDGenerator.generateId();
        expect(id2).not.toBeNull();

        // 同じであってはならない
        expect(id1).not.toEqual(id2);
    });
});
