/* eslint-disable require-jsdoc */
//import { describe, expect, test } from '@jest/globals';
import {
    Publisher,
    PublisherTriggerEventParam,
    PubSub,
    Subscriber,
} from './Pubsub';

// テスト用クラス

const EVENT_1: string = 'EVENT_1';
const EVENT_2: string = 'EVENT_2';

class Publisher1 extends Publisher {}

class Subscriber1 extends Subscriber {
    constructor(public name: string) {
        super();
    }

    handleEvent(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        this.tester(eventName, kwargs);
    }

    tester(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        if (eventName === EVENT_1) {
            expect(eventName).toBe(EVENT_1);
            expect(kwargs?.get('name')).toBe('sb_1');
            expect(kwargs?.get('karg_1')).toBe('a');
            expect(kwargs?.get('karg_2')).toBe(100);
        } else if (eventName === EVENT_2) {
            expect(eventName).toBe(EVENT_2);
            expect(kwargs?.get('name')).toBe('sb_2');
            expect(kwargs?.get('karg_1')).toBe('b');
            expect(kwargs?.get('karg_2')).toBe(110);
        } else {
            expect(true).toBe(false); // "Unexpected event name has triggered"
        }
    }
}

class Subscriber2 extends Subscriber {
    constructor(public name: string, public calledCount: number = 0) {
        super();
    }

    handleEvent(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        this.calledCount += 1;
        this.tester(eventName, kwargs);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tester(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        expect(eventName).toBe(EVENT_1);
    }
}

class PubSubBase extends PubSub {
    constructor(public name: string, public calledCount: number = 0) {
        super();
    }

    handleEvent(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        this.calledCount += 1;
        kwargs = kwargs ?? new Map<string, any>();
        kwargs.set('name', this.name);
        this.tester(eventName, kwargs);
    }

    tester(eventName: string, kwargs?: PublisherTriggerEventParam): void {
        if (eventName === EVENT_1) {
            expect(kwargs?.get('name')).toBe('pubsub_2');
        } else if (eventName === EVENT_2) {
            expect(kwargs?.get('name')).toBe('pubsub_1');
        } else {
            expect(true).toBe(false); // Unexpected event has called.
        }
    }
}
class PubSub1 extends PubSubBase {}
class PubSub2 extends PubSubBase {}

// テスト本体

describe('PubSub モジュールのテスト', () => {
    let publisher1: Publisher1;

    beforeEach(() => {
        publisher1 = new Publisher1();
    });

    describe('publisher のテスト', () => {
        test('test_diff_event_diff_subscriber_w_add_trigger', () => {
            const subscriber1 = new Subscriber1('sb_1');
            const subscriber2 = new Subscriber1('sb_2');

            // 同Publisher：別イベント ⇒ 別subscriber
            publisher1.addEventListener(EVENT_1, subscriber1);
            publisher1.addEventListener(EVENT_2, subscriber2);

            const param1 = new Map<string, any>();
            param1.set('name', subscriber1.name);
            param1.set('karg_1', 'a');
            param1.set('karg_2', 100);

            const param2 = new Map<string, any>();
            param2.set('name', subscriber2.name);
            param2.set('karg_1', 'b');
            param2.set('karg_2', 110);

            publisher1.triggerEvent(EVENT_1, param1);
            publisher1.triggerEvent(EVENT_2, param2);
        });

        test('test_same_event_diff_subscriber_w_remove', () => {
            const subsc = publisher1['__subscribers'];
            expect(JSON.stringify(subsc)).toBe(JSON.stringify({}));
            const subscriber1 = new Subscriber2('sb_1');
            const subscriber2 = new Subscriber2('sb_2');
            const subscriber3 = new Subscriber2('sb_3');

            // 1回目
            publisher1.addEventListener(EVENT_1, subscriber1);
            publisher1.addEventListener(EVENT_1, subscriber2);
            publisher1.addEventListener(EVENT_1, subscriber3);

            let expected = {
                EVENT_1: [subscriber1, subscriber2, subscriber3],
            };
            expect(JSON.stringify(Object.fromEntries(subsc))).toBe(
                JSON.stringify(expected)
            );

            publisher1.triggerEvent(EVENT_1);
            expect(subscriber1.calledCount).toBe(1);
            expect(subscriber2.calledCount).toBe(1);
            expect(subscriber3.calledCount).toBe(1);

            // 異常: イベント名
            publisher1.removeEventListener('NOT_EXISTED_EVENT', subscriber3);

            // 異常: 未登録のSubscriber
            publisher1.removeEventListener(
                EVENT_1,
                new Subscriber2('NOT_EXISTED_SUBSCRIBER')
            );
            expected = { EVENT_1: [subscriber1, subscriber2, subscriber3] };
            expect(JSON.stringify(Object.fromEntries(subsc))).toBe(
                JSON.stringify(expected)
            );

            // 2回目: subscriber_3 を削除
            subscriber3.name = 'SB_3AF';
            expect(subscriber3.name).toBe('SB_3AF'); // インスタンスの中身を変更
            publisher1.removeEventListener(EVENT_1, subscriber3);
            expected = { EVENT_1: [subscriber1, subscriber2] };
            expect(JSON.stringify(Object.fromEntries(subsc))).toBe(
                JSON.stringify(expected)
            );

            publisher1.triggerEvent(EVENT_1);
            expect(subscriber1.calledCount).toBe(2);
            expect(subscriber2.calledCount).toBe(2);
            expect(subscriber3.calledCount).toBe(1);
        });

        test('test_pubsub', () => {
            const pubsub1 = new PubSub1('pubsub_1');
            const pubsub2 = new PubSub2('pubsub_2');
            pubsub1.addEventListener(EVENT_1, pubsub2);
            pubsub2.addEventListener(EVENT_2, pubsub1);

            pubsub1.triggerEvent(EVENT_1);
            expect(pubsub1.calledCount).toBe(0);
            expect(pubsub2.calledCount).toBe(1);

            pubsub2.triggerEvent(EVENT_2);
            expect(pubsub1.calledCount).toBe(1);
            expect(pubsub2.calledCount).toBe(1);

            pubsub1.triggerEvent(EVENT_1);
            expect(pubsub1.calledCount).toBe(1);
            expect(pubsub2.calledCount).toBe(2);
        });
    });
});
