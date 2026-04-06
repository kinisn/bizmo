import { Publisher } from './Pubsub';
import { Failure, Result, ResultError, Success } from './Result';

/**
 * タイムテーブル初期設定パラメータ
 */
export type TimetableInitParam = {
    startDate?: Date; // 必ず月初になるように補正される
    length?: number;
    currentIndex?: number;
};

/**
 * タイムテーブル
 *
 * 開始日と進行状況をもつ期間
 */
export class Timetable extends Publisher {
    static EVENT_TIMETABLE_UPDATED: string = 'EVENT_TIMETABLE_UPDATED';
    static EVENT_CURRENT_CHANGED: string = 'EVENT_CURRENT_CHANGED';

    private __length: number;
    private __startDate: Date;
    private __currentIndex: number;
    private __terms: Date[];

    /**
     *
     * @param {TimetableInitParam} initParam
     */
    constructor({
        startDate,
        length,
        currentIndex,
    }: Readonly<TimetableInitParam> = {}) {
        super();

        this.__terms = [];
        this.__length = length ?? 36;
        const seedDate = new Date();
        // FIXME startDate が月初でなかった場合に、月初に補正しないと term の最初とstartDateがずれる
        this.__startDate =
            startDate ??
            new Date(seedDate.getFullYear(), seedDate.getMonth(), 1);
        this.__currentIndex = currentIndex ?? 0;

        // 更新
        this.__updateTerms(false);
    }

    // Private Methods

    /**
     * 設定に応じて terms を更新する
     * @param {boolean} triggerEvent
     */
    private __updateTerms(triggerEvent: boolean = true): void {
        const terms: Date[] = [];
        for (let order = 0; order < this.__length; order++) {
            const newDate: Date = new Date(
                this.__startDate.getFullYear(),
                this.__startDate.getMonth(),
                1 // Hack: 1/31 など翌月に同一日がない場合に getMonth が翌々月を返すのを防ぐ
            );
            newDate.setMonth(newDate.getMonth() + order);
            terms.push(newDate);
        }
        this.__terms = terms;
        if (triggerEvent) {
            this.triggerEvent(Timetable.EVENT_TIMETABLE_UPDATED);
        }
    }

    // property

    /**
     * タイムテーブルで予定される全期間の日付
     */
    get terms(): Date[] {
        return this.__terms;
    }

    /**
     * timetable の長さ
     */
    get length(): number {
        return this.__length;
    }

    /**
     * 期間の長さを変更する。
     * 同時に terms も更新され、current_index も 0 になる
     * 必ず1以上であること
     * @param {number} length
     */
    set length(length: number) {
        if (0 < length && this.length !== length) {
            this.__length = length;
            this.__currentIndex = 0;
            this.__updateTerms();
        } else {
            console.log(
                'length must be more than one and different from current value.'
            );
        }
    }

    /**
     * タイムテーブルの開始日
     */
    get startDate(): Date {
        return this.__terms[0];
    }

    /**
     * タイムテーブルの開始日を設定する
     * @param {Date} startDate
     */
    set startDate(startDate: Date) {
        if (this.startDate != startDate) {
            this.__startDate = startDate;
            this.__updateTerms();
        }
    }

    /**
     * タイムテーブルの進行状況のindex
     */
    get currentIndex(): number {
        return this.__currentIndex;
    }

    /**
     * タイムテーブルの進行状況をindexで設定する
     * @param {number} currentIndex
     */
    set currentIndex(currentIndex: number) {
        if (this.isInRangeIndex(currentIndex)) {
            this.__currentIndex = currentIndex;
            this.triggerEvent(Timetable.EVENT_CURRENT_CHANGED);
        } else {
            console.log(`current_index[${currentIndex}] is out of Timetable.`);
        }
    }

    /**
     * タイムテーブルの進行状況を示す日付
     */
    get currentDate(): Date {
        return this.terms[this.currentIndex];
    }

    /**
     * タイムテーブルの最終期間
     */
    get endDate(): Date {
        return this.terms[this.length - 1];
    }

    // GET METHOD

    /**
     * タイムテーブルに含まれるindexかを判定する
     * なお、要素数0というケースは存在しないので、それを前提にしてよい
     * @param {number} targetIndex
     * @return {boolean}
     */
    isInRangeIndex(targetIndex: number): boolean {
        return 0 <= targetIndex && targetIndex < this.length;
    }

    /**
     * タイムテーブルから該当日付のindexを取得する。存在しない場合は -1 を返す
     * @param {Date} targetDate
     * @return {number}
     */
    getIndexOnTerms(targetDate: Readonly<Date>): number {
        let resultIndex = -1;
        this.terms.filter((value, index) => {
            if (value.valueOf() == targetDate.valueOf()) {
                resultIndex = index;
            }
        });
        return resultIndex;
    }

    /**
     * タイムテーブルの進行状況からN期間前の日付を取得する
     * 期日外の場合には Result が返される
     * @param {number} target
     * @return {Result<Date, string>}
     */
    termsAgoDate(target: number): Result<Date> {
        const targetIndex = this.currentIndex - target;
        return this.isInRangeIndex(targetIndex)
            ? new Success<Date>(this.terms[targetIndex])
            : new Failure<Date>(new ResultError('Target is out of index.'));
    }

    // INDEX METHOD

    /**
     * term index を start date に設定する
     */
    setIndexToStart(): void {
        this.currentIndex = 0;
    }

    /**
     * term_index を1つ更新する
     * @return {boolean}
     */
    next(): boolean {
        let result: boolean = false;
        const nextIndex = this.currentIndex + 1;
        if (this.isInRangeIndex(nextIndex)) {
            this.currentIndex = nextIndex;
            result = true;
        }
        return result;
    }

    /**
     * @return {string}
     */
    get [Symbol.toStringTag](): string {
        return `Timetable(start_date=${this.startDate}, length=${this.length}, current_index=${this.currentIndex})`;
    }

    // == serialize / deserialize ==
    toObject(): TimetableToObject {
        return {
            length: this.length,
            startDate: this.startDate,
            currentIndex: this.currentIndex,
        };
    }

    fromObject(obj: TimetableToObject): void {
        this.length = obj.length;
        this.startDate = obj.startDate;
        this.currentIndex = obj.currentIndex;
    }
}

export type TimetableToObject = Required<TimetableInitParam>;
