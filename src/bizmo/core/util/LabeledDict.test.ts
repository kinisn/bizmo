/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { LabeledDict } from './LabeledDict';
import { PreparedTaggedString } from './TaggedString';

describe('LabeledDict のテスト', () => {
    let label1: LabeledDict<string>;
    let label2: LabeledDict<string>;
    let label3: LabeledDict<Array<string>>;

    beforeEach(() => {
        label1 = new LabeledDict<string>();
        label2 = new LabeledDict<string>();
        label3 = new LabeledDict<Array<string>>();
        label2.setContentWithLabel('value1', 'key1');
        label2.setContentWithLabel('value2', 'key2');
        // label2.set_content_with_label('value4', null); // TS言語上ありえない
        // label2.set_content_with_label(null, 'keyNone'); // TS言語上ありえない
    });

    test('test_init', () => {
        expect(label1.getAllContents()).toEqual([]);
        expect(label1.getAllLabels()).toEqual([]);
    });

    test('test_make_content_label', () => {
        const result = LabeledDict.makeContentLabel('TEST');
        expect(result).toBe('TEST');
    });

    test('test_make_content_label_w_format', () => {
        type tt = { name_1: number; name_2: string };
        const label: PreparedTaggedString<tt> = {
            text: (p: tt) => `TEST_${p.name_1}_${p.name_2}`,
            tags: {
                name_1: 1,
                name_2: '10TEST',
            },
        };
        const result = LabeledDict.makeContentLabel<tt>(label);
        expect(result).toBe('TEST_1_10TEST');
    });

    test('test_set_get_minimum', () => {
        // 取得
        let result = label2.getContentByLabel('key1');
        expect(result).toBe('value1');

        result = label2.getContentByLabel('key2');
        expect(result).toBe('value2');

        result = label2.getContentByLabel('keyNone');
        expect(result).toBeUndefined();

        result = label2.getContentByLabel('NOT_EXISTED');
        expect(result).toBeUndefined();
    });

    test('test_set_get_remove_content_typical_case', () => {
        // 追加
        label1.setContentWithLabel('value1', 'key1');
        expect(label1.getAllContents().length).toEqual(1);
        expect(label1.getAllLabels().length).toEqual(1);

        label1.setContentWithLabel('value2', 'key2');
        expect(label1.getAllContents().length).toEqual(2);
        expect(label1.getAllLabels().length).toEqual(2);

        // 取得
        let result = label1.getContentByLabel('key1');
        expect(result).toBe('value1');

        result = label1.getContentByLabel('key2');
        expect(result).toBe('value2');

        result = label1.getContentByLabel('keyNone');
        expect(result).toBeUndefined();

        result = label1.getContentByLabel('NOT_EXISTED');
        expect(result).toBeUndefined();

        // 削除
        let delResult = label1.removeContentByLabel('key1');
        expect(delResult).toBe(true);
        expect(label1.getAllContents().length).toEqual(1);
        expect(label1.getAllLabels().length).toEqual(1);

        delResult = label1.removeContentByLabel('NOT_EXISTED');
        expect(delResult).toBeFalsy();
        expect(label1.getAllContents().length).toEqual(1);
        expect(label1.getAllLabels().length).toEqual(1);

        // 更新
        label1.setContentWithLabel('value2_2', 'key2');
        result = label1.getContentByLabel('key2');
        expect(result).toBe('value2_2');
    });

    test('test_get_all_contents', () => {
        const result = label2.getAllContents();
        expect(result).toEqual(['value1', 'value2']);
    });

    test('test_get_all_labels', () => {
        const result = label2.getAllLabels();
        expect(result).toEqual(['key1', 'key2']);
    });

    test('test_is_included_label', () => {
        let result = label2.isIncludedLabel('NOT_INCLUDED_LABEL');
        expect(result).toBeFalsy();

        result = label2.isIncludedLabel('key1');
        expect(result).toBeTruthy();
    });

    test('isIncludeContent', () => {
        let result = label2.isIncludeContent('NOT_INCLUDED_CONTENT');
        expect(result).toBeFalsy();

        result = label2.isIncludeContent('value2');
        expect(result).toBeTruthy();
    });

    test('test_remove_content_by_content_str', () => {
        label1.setContentWithLabel('value', 'key1');
        label1.setContentWithLabel('value', 'key2');
        expect(label1.getAllContents().length).toEqual(2);
        expect(label1.getAllLabels().length).toEqual(2);

        label1.removeAllContentsByContent('value');
        expect(label1.getAllContents().length).toEqual(0);
        expect(label1.getAllLabels().length).toEqual(0);
    });

    test('test_remove_content_by_content_obj_object_id', () => {
        const list = ['test'];
        label3.setContentWithLabel(list, 'key1');
        label3.setContentWithLabel(list, 'key2');
        expect(label3.getAllContents().length).toEqual(2);
        expect(label3.getAllLabels().length).toEqual(2);

        // 同じ値
        const list2 = ['test'];
        label3.removeAllContentsByContent(list2);
        expect(label3.getAllContents().length).toEqual(2);
        expect(label3.getAllLabels().length).toEqual(2);

        // 同じID
        label3.removeAllContentsByContent(list);
        expect(label3.getAllContents().length).toEqual(0);
        expect(label3.getAllLabels().length).toEqual(0);
    });

    test('getEntries', () => {
        expect(label2.getEntries().length).toEqual(2);
        expect(label2.getEntries()).toEqual([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]);
    });
});
