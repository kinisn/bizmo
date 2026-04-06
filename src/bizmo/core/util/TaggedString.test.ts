/* eslint-disable require-jsdoc */
import { TaggedString } from './TaggedString';

describe('TaggedString のテスト', () => {
    test('template literal に必要な param が全て揃っている', () => {
        type TT = {
            code: number;
            message: string;
        };
        const errorTemplate: TaggedString<TT> = (p: TT) =>
            `Error[${p.code}]${p.message}`;
        const param: TT = { message: 'エラーです', code: 404 };
        expect(errorTemplate(param)).toBe('Error[404]エラーです');
    });
});
