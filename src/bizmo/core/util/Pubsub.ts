/**
 * Publisher
 *
 * ObserverパターンにおけるPublisher
 * 注意：継承クラスで constructor を overwrite する場合には、super() を行うこと
 */
export class Publisher {
    private __subscribers: Map<string, Subscriber[]>;

    /**
     *
     */
    constructor() {
        this.__subscribers = new Map<string, Subscriber[]>();
    }

    /**
     * 指定されたイベントに、subscriber を追加する。
     * 同一イベントには同一 Subscriber インスタンスは１つだけ登録されるので、複数回呼び出しても trigger は１回で済む
     * @param {string} eventName イベント名
     * @param {Subscriber} subscriber イベントを監視するオブジェクト
     */
    addEventListener(eventName: string, subscriber: Subscriber): void {
        if (!this.__subscribers.get(eventName)) {
            this.__subscribers.set(eventName, []);
        }
        if (!this.__subscribers.get(eventName)?.includes(subscriber)) {
            this.__subscribers.get(eventName)?.push(subscriber);
        }
    }

    /**
     * 指定されたイベントから、subscriber を除去する
     * @param {string} eventName イベント名
     * @param {Subscriber} subscriber イベントを監視するオブジェクト
     */
    removeEventListener(eventName: string, subscriber: Subscriber): void {
        if (this.__subscribers.has(eventName)) {
            const filtered = this.__subscribers
                .get(eventName)
                ?.filter((value) => value !== subscriber) as Subscriber[];
            this.__subscribers.set(eventName, filtered);
        }
    }

    /**
     * 指定したイベントを発生させる
     * @param {string} eventName イベント名
     * @param {PublisherTriggerEventParam} keyParams 任意のキーワード引数
     */
    triggerEvent(
        eventName: string,
        keyParams?: PublisherTriggerEventParam
    ): void {
        this.__subscribers.get(eventName)?.forEach((subscriber) => {
            subscriber.handleEvent(eventName, keyParams);
        });
    }
}

/**
 * Publisher Trigger event パラメータ
 */
export type PublisherTriggerEventParam = Map<string, any>;

/**
 * [抽象クラス] Subscriber
 * ObserverパターンにおけるSubscriber
 */
export abstract class Subscriber {
    /**
     * [抽象メソッド] イベントハンドラ
     * Publisher により発生されたイベントを受け取る
     * @param {string} eventName
     * @param {PublisherTriggerEventParam} keyParams
     */
    abstract handleEvent(
        eventName: string,
        keyParams?: PublisherTriggerEventParam
    ): void;
}

/**
 * [抽象クラス] PubSub
 */
export abstract class PubSub extends Publisher implements Subscriber {
    abstract handleEvent(
        eventName: string,
        keyParams?: PublisherTriggerEventParam
    ): void;
}
