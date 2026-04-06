/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import { PublisherTriggerEventParam, Subscriber } from './Pubsub';
import { ResultError } from './Result';
import { Timetable } from './Timetable';

// テスト用クラス
class Subscriber1 extends Subscriber {
    constructor(public name: string, public func: Function) {
        super();
    }

    handleEvent(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        kwargs = kwargs ?? new Map<string, any>();
        kwargs.set('name', this.name);
        this.func(eventName, kwargs);
    }
}

// テスト本体

describe('Timetableのテスト', () => {
    test('test_init_default', () => {
        const timetable = new Timetable();
        expect(timetable.length).toBe(36);
        expect(timetable.startDate.getFullYear()).toBe(
            new Date().getFullYear()
        );
        expect(timetable.startDate.getMonth()).toBe(new Date().getMonth());
        expect(timetable.startDate.getDate()).toBe(1);
        expect(timetable.currentIndex).toBe(0);
        expect(timetable.terms.length).toBe(36);
    });

    test('test_set_length_and_terms', () => {
        const timetable = new Timetable({ startDate: new Date(2019, 0, 1) });
        timetable.length = 3;
        expect(timetable.length).toBe(3);

        const terms = timetable.terms;
        expect(terms.length).toBe(3);
        expect(terms[0]).toStrictEqual(new Date(2019, 0, 1));
        expect(terms[1]).toStrictEqual(new Date(2019, 1, 1));
        expect(terms[2]).toStrictEqual(new Date(2019, 2, 1));
    });

    test('test_set_current_index', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
            currentIndex: 1,
        });
        timetable.length = 3;
        expect(timetable.length).toBe(3);
        expect(timetable.currentIndex).toBe(1);
    });

    test('test_set_length_not_less_than_one', () => {
        const timetable = new Timetable();
        timetable.length = 0;
        expect(timetable.length).toBe(36);
        // TODO console log を確認すべき
    });

    test('test_is_in_range_index', () => {
        const timetable = new Timetable({ length: 3 });
        expect(timetable.isInRangeIndex(-1)).toBeFalsy();
        expect(timetable.isInRangeIndex(0)).toBeTruthy();
        expect(timetable.isInRangeIndex(1)).toBeTruthy();
        expect(timetable.isInRangeIndex(2)).toBeTruthy();
        expect(timetable.isInRangeIndex(3)).toBeFalsy();
    });

    test('test_get_index_on_terms', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
        });
        expect(timetable.getIndexOnTerms(new Date(2018, 11, 1))).toBe(-1);
        expect(timetable.getIndexOnTerms(new Date(2019, 0, 1))).toBe(0);
        expect(timetable.getIndexOnTerms(new Date(2019, 1, 1))).toBe(1);
        expect(timetable.getIndexOnTerms(new Date(2019, 2, 1))).toBe(2);
        expect(timetable.getIndexOnTerms(new Date(2019, 3, 1))).toBe(-1);
    });

    test('test_start_and_end_date', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
        });
        expect(timetable.startDate).toEqual(new Date(2019, 0, 1));
        expect(timetable.endDate).toEqual(new Date(2019, 2, 1));
    });

    test('test_current_index_and_date', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
        });
        expect(timetable.currentIndex).toBe(0);
        expect(timetable.currentDate).toEqual(new Date(2019, 0, 1));

        timetable.currentIndex = 1;
        expect(timetable.currentIndex).toBe(1);
        expect(timetable.currentDate).toEqual(new Date(2019, 1, 1));

        timetable.currentIndex = 2;
        expect(timetable.currentIndex).toBe(2);
        expect(timetable.currentDate).toEqual(new Date(2019, 2, 1));

        // out of index なので変化しない
        timetable.currentIndex = -1;
        expect(timetable.currentIndex).toBe(2);
        timetable.currentIndex = 3;
        expect(timetable.currentIndex).toBe(2);
    });

    test('test_terms_ago_date', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
        });
        timetable.currentIndex = 1;
        expect(timetable.termsAgoDate(-2).isSuccess()).toBeFalsy();
        expect(timetable.termsAgoDate(-2).value).toEqual(
            new ResultError('Target is out of index.')
        );
        expect(timetable.termsAgoDate(-1).value).toEqual(new Date(2019, 2, 1));
        expect(timetable.termsAgoDate(0).value).toEqual(new Date(2019, 1, 1));
        expect(timetable.termsAgoDate(1).value).toEqual(new Date(2019, 0, 1));
        expect(timetable.termsAgoDate(2).isSuccess()).toBeFalsy();
        expect(timetable.termsAgoDate(2).value).toEqual(
            new ResultError('Target is out of index.')
        );
    });

    test('test_Symbol.toStringTag', () => {
        const timetable = new Timetable({
            startDate: new Date(2019, 0, 1),
            length: 3,
            currentIndex: 1,
        });
        timetable.currentIndex = 1;
        expect(timetable.toString()).toBe(
            `[object Timetable(start_date=${timetable.startDate}, length=3, current_index=1)]`
        );
    });

    test('test_tt_event', () => {
        const timetable = new Timetable({ startDate: new Date(2020, 1, 1) });

        const subscriber1 = new Subscriber1(
            'sb_1',
            (eventName: string, kwargs?: PublisherTriggerEventParam) => {
                if (eventName == Timetable.EVENT_TIMETABLE_UPDATED) {
                    expect(kwargs?.get('name')).toBe('sb_1');
                    expect(timetable.length).toBe(3);
                    const expected = [
                        new Date(2020, 1, 1),
                        new Date(2020, 2, 1),
                        new Date(2020, 3, 1),
                    ];
                    expect(timetable.terms).toEqual(expected);
                } else {
                    expect(true).toBe(false); // "Unexpected event name has triggered"
                }
            }
        );
        const subscriber2 = new Subscriber1(
            'sb_2',
            (eventName: string, kwargs?: PublisherTriggerEventParam) => {
                if (eventName == Timetable.EVENT_TIMETABLE_UPDATED) {
                    expect(kwargs?.get('name')).toBe('sb_2');
                    expect(timetable.length).toBe(3);
                    const expected = [
                        new Date(2020, 1, 1),
                        new Date(2020, 2, 1),
                        new Date(2020, 3, 1),
                    ];
                    expect(timetable.terms).toEqual(expected);
                } else {
                    expect(true).toBe(false); // "Unexpected event name has triggered"
                }
            }
        );

        // 同Publisher：別イベント ⇒ 別subscriber
        timetable.addEventListener(
            Timetable.EVENT_TIMETABLE_UPDATED,
            subscriber1
        );
        timetable.addEventListener(
            Timetable.EVENT_TIMETABLE_UPDATED,
            subscriber2
        );
        // 更新
        timetable.length = 3;
    });
});
