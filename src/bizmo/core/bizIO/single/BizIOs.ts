/**
 * BizIOモジュール
 */
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { Serializable } from 'bizmo/core/db/BizGraphNode';
import { DateMap } from 'bizmo/core/util/DateMap';
import { IDGenerator } from 'bizmo/core/util/IdGenerator';
import { Interpolation } from 'bizmo/core/util/Interpolation';
import { PublisherTriggerEventParam, PubSub } from 'bizmo/core/util/Pubsub';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import i18n from 'i18n/configs';
import { BizDatabase } from '../../db/BizDatabase';
import { LabeledDict } from '../../util/LabeledDict';
import { CollectionBizIO } from '../collection/CollectionBizIO';
import { BizValue } from '../value/BizValue';

/**
 * BizIOのID型
 */
export type BizIOId = string;

/**
 * BizIO初期化データ型
 */
export type BizIOInit = Map<string | number, any> | Array<any>;

/**
 * 時系列のBizValue型
 */
export type History = Array<BizValue>;

/**
 * 抽出テーブル行型
 */
export type ExportRow = Array<any>;

/**
 * * 抽出テーブル型
 */
export type ExportTable = Array<ExportRow>;

/**
 * NamedChildrenHolder型
 * BizIOを子要素として名前で参照できる形で保持するためのInterface
 */
export type NamedChildrenHolder = {
    idLabeledNames: LabeledDict<BizIOId>;
    children: Array<BizIO>;
};

/**
 * NamedChildrenHolder の型ガード
 * @param {any} target
 * @return {boolean}
 */
export function isNamedChildrenHolder(
    target: any
): target is NamedChildrenHolder {
    return (
        target.children !== undefined &&
        target.children instanceof Array &&
        target.idLabeledNames !== undefined &&
        target.idLabeledNames instanceof LabeledDict
    );
}

/**
 * BizIO.constructor 必須パラメータ型
 * @param {Timetable} timetable      当該IOのtimetable
 * @param {BizDatabase} db       当該IOの保管されるDB
 */
export type BizIORequiredParam<T = any, S extends string = string> = Required<{
    timetable: Timetable;
    db: BizDatabase<T, S>;
}>;

/**
 * BizIO.toObject 用パラメータ型
 */
export type BizIOToObject<T = any, S extends string = string> = Partial<{
    bizIOId: BizIOId;
    name: string;
    isUserNamed: boolean;
    accountName: AccountNames;
    complement: boolean;
    isMonetary: boolean;
    initUpdate: boolean;
    externalData: T;
    externalGroupName: S;
    className: string;
}>;

export function isBizIOToObject<T = any, S extends string = string>(
    target: any
): target is BizIOToObject<T, S> {
    if (typeof target !== 'object') {
        return false;
    }
    if ('bizIOId' in target && typeof target.bizIOId !== 'string') {
        return false;
    }
    if ('name' in target && typeof target.name !== 'string') {
        return false;
    }
    if ('isUserNamed' in target && typeof target.isUserNamed !== 'boolean') {
        return false;
    }
    if ('accountName' in target && typeof target.accountName !== 'number') {
        return false;
    }
    if ('complement' in target && typeof target.complement !== 'boolean') {
        return false;
    }
    if ('isMonetary' in target && typeof target.isMonetary !== 'boolean') {
        return false;
    }
    if ('initUpdate' in target && typeof target.initUpdate !== 'boolean') {
        return false;
    }
    const flag =
        target?.className !== undefined && typeof target.className === 'string';
    return flag;
}

/**
 * BizIO.constructor オプションパラメータ型
 * @param {BizIOId} bizIOId BizIOのID       デフォルト:UUID
 * @param {string} name BizIOの名称     デフォルト:クラス名
 * @param {boolean} isUserNamed 名称をユーザーが設定したか   デフォルト: name設定時：true & name未設定時：false
 * @param {AccountNames} accountName accountName 勘定科目   デフォルト:AccountNames.INHERITANCE
 * @param {boolean} complement 当該IDのBizValueを補完するかどうかのフラグ   デフォルト:true
 * @param {boolean} isMonetary 値が金銭価値か数値かを示すフラグ   デフォルト:false
 * @param {boolean} initUpdate init内で値を更新するかのフラグ   デフォルト:true
 * @param {T} externalData 外部から定義される任意のデータ型   デフォルト:true
 * @param {S} externalGroupName 外部から定義されるカテゴリーの名称   デフォルト:なし
 */
export type BizIOOptionalParam<
    T = any,
    S extends string = string,
    O = BizIOToObject<T, S>,
> = Omit<BizIOToObject<T, S>, 'className'> &
    Partial<{
        toObj: O;
    }>;

/**
 * BizIO.exportAsTable 用パラメータ型
 * @param {string} nameSpace: 名前空間
 * @param {string} idCol: biz_io_idのカラムを各行前方に追加する: string
 * @param {string} nameCol: 名前のカラムを各行前方に追加する: string
 * @param {string} termRow: 期間の行を追加する： date
 */
export type ExportAsTableParam = Partial<{
    nameSpace: string;
    idCol: boolean;
    nameCol: boolean;
    termRow: boolean;
}>;

/**
 * BizIO.constructor パラメータ型
 */
export type BizIOParam<T = any, S extends string = string> = BizIORequiredParam<
    T,
    S
> &
    BizIOOptionalParam<T, S>;

/**
 * Bizmoの入力・出力要素を示す基礎クラス
 */
export class BizIO<T = any, S extends string = string>
    extends PubSub
    implements Serializable
{
    // Event: Children Values Updated
    static EVENT_CHILDREN_VALUES_UPDATED: string =
        'EVENT_CHILDREN_VALUES_UPDATED';
    static EVENT_CHILDREN_VALUES_UPDATED__UPDATED_BIZ_IO: string =
        'updated_biz_io';
    static EVENT_CHILDREN_VALUES_UPDATED__LAST_UPDATED_BIZ_IO: string =
        'last_updated_biz_io';

    // === Props ===
    private __timetable: Timetable;
    private __db: BizDatabase<T, S>;
    private __id: BizIOId;
    private __name: string;
    private __isUserNamed: boolean;
    private __complement: boolean;
    private __accountName: AccountNames;
    protected _editable: boolean;
    protected _historyEntity: DateMap<BizValue>;
    protected _timetableHistory: History;
    protected _isMonetary: boolean;

    /**
     * 外部から設定されるデータ
     * @param {T} externalData
     */
    public externalData: T | undefined;

    /**
     * 外部から設定されるグループ名称。
     * 子要素になる時に未設定なら、親Collectionのグループ名称が設定される。
     * @param {S} externalGroupName
     */
    public externalGroupName: S | undefined;

    /**
     *
     * @param {BizIOParam<T, S>} param0
     */
    constructor(props: BizIOParam<T, S>) {
        // parameters
        const {
            timetable,
            db,
            toObj, // optional
        } = props;
        // optional
        const bizIOId = toObj?.bizIOId ?? props.bizIOId;
        const name = toObj?.name ?? props.name;
        const isUserNamed = toObj?.isUserNamed ?? props.isUserNamed ?? true;
        const accountName =
            toObj?.accountName ?? props.accountName ?? AccountNames.INHERITANCE;
        const complement = toObj?.complement ?? props.complement ?? true;
        const isMonetary = toObj?.isMonetary ?? props.isMonetary ?? false;
        const initUpdate = toObj?.initUpdate ?? props.initUpdate ?? true;
        const externalData = toObj?.externalData ?? props.externalData;
        const externalGroupName =
            toObj?.externalGroupName ?? props.externalGroupName;

        // PubSub設定
        super();

        // 1. プロパティの初期化
        // required
        this.__timetable = timetable;
        this.timetable.addEventListener(
            Timetable.EVENT_TIMETABLE_UPDATED,
            this
        );
        this.__db = db;

        // optional
        this.__id = bizIOId ?? IDGenerator.generateId();
        this.__complement = complement;
        this.__name = ''; // 初期化の目的
        this.__isUserNamed = isUserNamed;
        if (name) {
            this.setName(name, isUserNamed);
        } else {
            this.__isUserNamed = false; // 名称が設定されない場合には自動的に false に設定される
            this.setName(this.constructor.name, false);
        }
        this.__accountName = AccountNames.INHERITANCE; // 初期化の目的
        this.setAccountName(accountName ?? AccountNames.INHERITANCE);
        this._isMonetary = isMonetary;

        // 1-2. protected: 継承先にて overwrite する前提
        this._editable = true;
        this._historyEntity = new DateMap<BizValue>();
        this._timetableHistory = [];

        // 1-3. 外部から設定されるデータ
        this.externalData = externalData;
        this.externalGroupName = externalGroupName;

        // 2. DB登録
        this.db.insert(this);

        // 3. i18n登録
        this._initI18N();

        // 4. 更新処理
        if (initUpdate) {
            this._doInitUpdate();
        }
    }

    /**
     * 初期Updateを実行する。翻訳も含む
     */
    protected _doInitUpdate(initData?: BizIOInit): void {
        this._updateHistoryReferenceWithoutNotification();
        this._translate();
    }

    // ===== i18n =====
    /**
     * i18nextの更新を購読する
     */
    protected _initI18N(): void {
        i18n.on('languageChanged', (lng) => {
            this._translate();
        });
        i18n.on('loaded', (lng) => {
            this._translate();
        });
    }

    protected _translate(): void {
        if (i18n.isInitialized) {
            this._updateTranslation();
        }
    }

    /**
     * [overwrite対象]
     * i18nextを利用して翻訳する
     */
    protected _updateTranslation(): void {
        // 子要素で適宜更新する
    }

    /**
     * 【離散的時系列に存在する BizValue】を元に、
     * 指定されたタイムテーブルの範囲で【連続的に存在する BizValue】を生成する
     *  = 補完ルール =
     *  離散的に存在する BizValue の集合を[実体群]とした時
     * ・[実体群]で最古（＝最初）の要素(h1)より前： 初期BizValue (h0)
     * ・h1より後 かつ h1の次要素(h2)より前： h1
     *  ↓
     * ・h(n-1)より後 かつ h(n-1)の次要素(h(n))より前： h(n-1)
     *  ↓
     * ・[実体群]で最新（＝最後）の要素(h(m))より後： h(m)
     * <時系列に並べた history_entity>
     * ...---------------------------------...-----------------...
     * ...| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |...| x |x+1|x+2|x+3|...
     * ...---------------------------------...-----------------...
     * ...|   |   |h1 |   |   |h2 |   |   |...|hm |   |   |   |...
     * ...---------------------------------...-----------------...
     *  ↓
     * <タイムテーブルの範囲期間>
     *        <----------------------------...------------>
     * ...---------------------------------...-----------------...
     * ...| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |...| x |x+1|x+2|x+3|...
     * ...---------------------------------...-----------------...
     * ...|   |   |h1 |   |   |h2 |   |   |...|hm |   |   |   |...
     * ...---------------------------------...-----------------...
     *  ↓
     * <結果>
     * -----------------------------...-------------
     * | 2 | 3 | 4 | 5 | 6 | 7 | 8 |...| x |x+1|x+2|
     * -----------------------------...-------------
     * |h0 |h1 |h1 |h1 |h2 |h2 |h2 |...|hm |hm |hm |
     * -----------------------------...-------------
     * @param {Timetable} timetable タイムテーブル
     * @param {DateMap<BizValue>} historyEntity 離散的に存在するBizValue。timetableの時系列とは完全に独立していてよい
     * @param {boolean} complementValue 値を補完するかどうか。値を補完しない場合、Dateのみ補完される
     * @return {Array<BizValue>}
     */
    public static complementHistory(
        timetable: Timetable,
        historyEntity: DateMap<BizValue>,
        complementValue: boolean
    ): Array<BizValue> {
        const historyReference: Array<BizValue> = [];
        for (const targetDate of timetable.terms) {
            let seedBizValue: BizValue | undefined;
            if (complementValue) {
                const result = Interpolation.interpolateByLatestValue(
                    targetDate,
                    historyEntity
                );
                seedBizValue = result.isSuccess() ? result.value : undefined;
            } else if (historyEntity.has(targetDate)) {
                seedBizValue = historyEntity.get(targetDate);
            }
            historyReference.push(
                seedBizValue
                    ? new BizValue(targetDate, seedBizValue.value)
                    : new BizValue(targetDate)
            );
        }
        return historyReference;
    }

    // === internal process for overwrite ===

    /**
     * [Overwrite対象]
     * BizValue 設定時に、内部の値を自動的に補完・変更する。
     * @param {Date} targetDate 対象となる日付。
     * @param {BizValue} targetValue 対象となるValue。
     *  なおValueは参照時に直近のValueをもってくる可能性があるため、target と一致するとは限らない。
     * @return {BizValue}
     */
    _adjustBizValue(targetDate: Date, targetValue: BizValue): BizValue {
        return targetValue;
    }

    /**
     * 現在の _history_entity から _timetable_history を再設定する
     * 更新イベントの伝搬は、行わない
     */
    _updateHistoryReferenceWithoutNotification(): void {
        // TODO 補完せずに、term更新に応じて、前の値をそのままコピーするように修正すべき
        const historyReference = BizIO.complementHistory(
            this.timetable,
            this._historyEntity,
            this.complement
        );
        this._timetableHistory = historyReference.map((value) => {
            return this._adjustBizValue(value.date, value);
        });
    }

    /**
     * [Overwrite対象]
     * 現在の _history_entity から _timetable_history を再設定する
     * @param {BizIO} updatedBizIO 大本の更新が起きたBizIO
     */
    _updateHistoryReference(updatedBizIO?: BizIO): void {
        this._updateHistoryReferenceWithoutNotification();
        // 後続に処理をつなぐ
        this.triggerEvent(
            BizIO.EVENT_CHILDREN_VALUES_UPDATED,
            new Map([
                [
                    BizIO.EVENT_CHILDREN_VALUES_UPDATED__UPDATED_BIZ_IO,
                    updatedBizIO ?? this,
                ],
                [
                    BizIO.EVENT_CHILDREN_VALUES_UPDATED__LAST_UPDATED_BIZ_IO,
                    this,
                ],
            ])
        );
    }

    /**
     * 親に子の値のUpdateを知らせる
     * BizIODatabase 内で利用する想定
     * @param {BizIO} parentBizIo
     */
    _addChildrenValuesUpdatedEventListener(parentBizIo: BizIO): void {
        this.addEventListener(BizIO.EVENT_CHILDREN_VALUES_UPDATED, parentBizIo);
    }

    // === PubSub ===
    /**
     * イベントハンドラ
     * Publisher により発生されたイベントを受け取る
     * @param {string} eventName
     * @param {PublisherTriggerEventParam} keyParams
     */
    handleEvent(
        eventName: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        keyParams?: PublisherTriggerEventParam
    ): void {
        if (eventName === Timetable.EVENT_TIMETABLE_UPDATED) {
            // FIXME 全部のBizIOが一気に変更されるので notification は不要だよね？？要確認
            this._updateHistoryReferenceWithoutNotification();
        }
    }

    // === Properties ===
    /**
     * タイムテーブル
     * 親子関係にある場合には、同一のタイムテーブルである想定
     * @return {Timetable}
     */
    get timetable(): Timetable {
        return this.__timetable;
    }

    /**
     * 登録するDB
     * @return {BizDatabase<T, S>}
     */
    get db(): BizDatabase<T, S> {
        return this.__db;
    }

    /**
     * 当該IOのID
     * この名称をもとに親子間インスタンスを管理する
     */
    get id(): BizIOId {
        return this.__id;
    }

    /**
     * 当該IOが金銭価値か数値かのフラグ
     */
    get isMonetary(): boolean {
        return this._isMonetary;
    }

    /**
     * 当該IOが金銭価値か否かを設定する
     * @param
     */
    setMonetary(isMonetary: boolean): void {
        this._isMonetary = isMonetary;
    }

    /**
     * 当該IDのBizValueを補完するかどうかのフラグ
     * 補完する場合： 直近に設定されたBizValueを継続する
     */
    get complement(): boolean {
        return this.__complement;
    }

    /**
     * 当該IDのBizValueを補完するかどうかを設定する
     * @param complement
     */
    setComplement(complement: boolean): void {
        this.__complement = complement;
        // 自分自身の値を再構築し、伝播させる
        this._updateHistoryReference(this);
    }

    /**
     * 当該IOに値を設定できるかどうか
     */
    get editable(): boolean {
        return this._editable;
    }

    /**
     * 当該IOに値を設定できるかどうかを設定する
     * @param {boolean} editable
     */
    setEditable(editable: boolean): void {
        this._editable = editable;
    }

    /**
     * 当該IOが独自の値をもつかどうか
     */
    get hasOwnValue(): boolean {
        return true;
    }

    /**
     * ユーザーが命名した名称かどうか
     * setName により変更される
     */
    get isUserNamed(): boolean {
        return this.__isUserNamed;
    }

    /**
     * 当該IOの名称
     */
    get name(): string {
        return this.__name;
    }

    /**
     * 名称を変更する
     *
     * 下記の場合には変更しない
     * ・name が None である
     * ・name が 当該BizIOを参照するCategoryのラベルに存在する
     * ・ユーザー命名後にユーザー以外が変更しようとする
     *
     * = 例外 =
     * クラス初期化のデフォルト命名時には、必要に応じて名称を変更して追加する
     *
     * @param {string} name
     * @param {boolean} isUserNamed ユーザーが命名したかどうか デフォルト：true
     * @return {boolean} 変更した場合に True
     */
    setName(name: string, isUserNamed: boolean = true): boolean {
        let result = false;
        let isNotExisted = true;
        for (const parent of this.db.parentsOf(this.id)) {
            if (
                isNamedChildrenHolder(parent) &&
                parent.idLabeledNames.isIncludedLabel(name)
            ) {
                isNotExisted = false;
                break;
            }
        }

        // ユーザー命名後にシステムが変更しようとしていないか
        if (isNotExisted && (!this.__isUserNamed || isUserNamed)) {
            for (const parent of this.db.parentsOf(this.id)) {
                // FIXME 既存IDをつけた「新規」BizIOで上書きするときに、前の label_name が remove されない
                if (
                    isNamedChildrenHolder(parent) &&
                    parent.children.includes(this)
                ) {
                    parent.idLabeledNames.removeContentByLabel(this.__name);
                    parent.idLabeledNames.setContentWithLabel(this.id, name);
                }
            }
            this.__name = name;
            if (isUserNamed) {
                this.__isUserNamed = true;
            }
            result = true;
        }
        return result;
    }

    /**
     * タイムテーブルの開始から終了までの BizValue の参照用タプル
     */
    get timetableHistory(): History {
        if (this._timetableHistory.length == 0) {
            // 参照用タプルが未初期化の場合
            this._updateHistoryReference();
        }
        return this._timetableHistory;
    }

    /**
     * 勘定科目を取得する
     * @param {string} name
     */
    get accountName(): AccountNames {
        return this.__accountName;
    }

    /**
     * 勘定科目を設定する
     * @param {accountName} accountName
     */
    setAccountName(accountName: AccountNames): void {
        this.__accountName = accountName;
    }

    /**
     * 子要素として参照するBizIOのリストを取得する
     * @return {Array<CollectionBizIO<T, S>>} 存在しない場合には空配列
     */
    get parents(): Array<CollectionBizIO<T, S>> {
        return this.db.parentsOf(this.id);
    }

    // === Value Set / Get ===
    /**
     * 指定期日に値を上書き設定する
     * @param {date} date
     * @param {T} value
     */
    setValue(date: Date, value?: Decimal): void {
        this.set(new BizValue(date, value));
    }

    /**
     * 指定期日に値を上書き設定する
     * BizIO派生クラスからのみ呼び出される想定
     * @param {BizValue} value
     */
    set(value: BizValue): void {
        if (this.editable) {
            if (
                !this._historyEntity.has(value.date) ||
                this._historyEntity.get(value.date) != value
            ) {
                this._historyEntity.set(value.date, value);
                this._updateHistoryReference();
            } else {
                console.log(
                    `The same value is already set in [name:${this.name}, editable:${this.editable}]`
                );
            }
        } else {
            console.log(
                `Not allowed to set function in [name:${this.name}, editable:${this.editable}]`
            );
        }
    }

    /**
     * [deprecated]
     * history を削除して history_list のデータで設定し直す
     * 複数回 set するよりも効率がよい
     * Noneや空集合を渡すと、全期間が初期値に設定される
     *
     * = 注意 =
     * シミュレーション中にtermをまたいで一気に変更することは想定されない。
     * テスト用にのみ使うべき
     * @param {Array<BizValue>} historyList
     */
    setHistory(historyList?: Array<BizValue>): void {
        if (this.editable) {
            const newEntity = new DateMap<BizValue>();
            for (const value of historyList ?? []) {
                newEntity.set(value.date, value);
            }

            let compareResult = false;
            if (this._historyEntity.keys().length === newEntity.keys().length) {
                compareResult = true;
                for (const key of newEntity.keys()) {
                    if (
                        this._historyEntity.get(key)?.value !=
                        newEntity.get(key)?.value
                    ) {
                        compareResult = false;
                        break;
                    }
                }
            }
            if (!compareResult) {
                this._historyEntity = newEntity;
                this._updateHistoryReference();
            } else {
                console.log(
                    `Same values are setting in [name:${this.name}, editable:${this.editable}]`
                );
            }
        } else {
            console.log(
                `Not supported set_history function in [name:${this.name}, editable:${this.editable}]`
            );
        }
    }

    /**
     * タイムテーブルにある日付から指定期日の値を取得する
     * target は事前に範囲内であることが確認されている前提
     *
     * @param {date} targetDate
     * @return {BizValue}
     */
    __atTimetableDate(targetDate: Date): BizValue {
        if (this.timetableHistory.length === 0) {
            this._updateHistoryReference();
        }
        // 参照用タプルが未初期化の場合
        return this.timetableHistory[
            this.timetable.getIndexOnTerms(targetDate)
        ];
    }

    /**
     * 指定期日の値を取得する
     * @param {Date} targetDate 指定期日
     * @param {BizValue} ifNone 指定期日がシミュレーション範囲外だった場合の値
     * @return {BizValue | undefined}
     */
    at(targetDate: Date, ifNone?: BizValue): BizValue | undefined {
        if (this.timetable.getIndexOnTerms(targetDate) >= 0) {
            return this.__atTimetableDate(targetDate);
        } else {
            // # 指定期日がタイムテーブルに含まれない場合
            return ifNone;
        }
    }

    /**
     *  現在日付の値を取得する
     * @return {BizValue | undefined}
     */
    atCurrent(): BizValue | undefined {
        return this.at(this.timetable.currentDate);
    }

    /**
     * 開始日付の値を取得する
     * @return {BizValue | undefined}
     */
    atTheStart(): BizValue | undefined {
        return this.at(this.timetable.startDate);
    }

    /**
     * 終了日付の値を取得する
     * @return {BizValue | undefined}
     */
    atTheEnd(): BizValue | undefined {
        return this.at(this.timetable.endDate);
    }

    /**
     * 指定term前の値を取得する
     * @param {number} target
     * @param {BizValue} ifNone
     * @return {BizValue | undefined}
     */
    atTermsAgo(target: number, ifNone?: BizValue): BizValue | undefined {
        const result = this.timetable.termsAgoDate(target);
        return result.isSuccess() ? this.at(result.value) : ifNone;
    }

    /**
     * 当該 BizIO を削除する
     *
     * = 注意 =
     * オブジェクトはDBから削除されるだけ。そのままメモリー上から消えるとは限らない。
     * @param {boolean} triggerEvent デフォルト: true
     */
    delete(triggerEvent: boolean): void {
        this.db.delete(this.id);
        if (triggerEvent) {
            this.triggerEvent(
                BizIO.EVENT_CHILDREN_VALUES_UPDATED,
                new Map([
                    [BizIO.EVENT_CHILDREN_VALUES_UPDATED__UPDATED_BIZ_IO, this],
                    [
                        BizIO.EVENT_CHILDREN_VALUES_UPDATED__LAST_UPDATED_BIZ_IO,
                        this,
                    ],
                ])
            );
        }
    }

    /**
     * export_table にヘッダー行・列を追加する
     * @param {string} fullName
     * @param {ExportTable} myselfTable
     * @param {ExportTable} childrenTable
     * @param {boolean} idCol
     * @param {boolean} nameCol
     * @param {boolean} termRow
     * @return {ExportTable}
     */
    _addHeaderToExportTable(
        fullName?: string,
        myselfTable?: ExportTable,
        childrenTable?: ExportTable,
        idCol: boolean = false,
        nameCol: boolean = true,
        termRow: boolean = false
    ): ExportTable {
        // export_table にヘッダー行・列を追加する
        let exportTable: ExportTable = [];
        if (termRow) {
            exportTable.push(this.timetable.terms.map((x) => x));
            if (nameCol) {
                exportTable[0].unshift('name');
            }
            if (idCol) {
                exportTable[0].unshift('id');
            }
        }

        // children's table
        if (childrenTable) {
            exportTable = exportTable.concat(childrenTable);
        }

        // myself table
        if (myselfTable) {
            if (nameCol) {
                for (const row of myselfTable) {
                    row.unshift(fullName);
                }
            }
            if (idCol) {
                for (const row of myselfTable) {
                    row.unshift(this.id);
                }
            }
            exportTable = exportTable.concat(myselfTable);
        }
        return exportTable;
    }

    /**
     * 2次元配列として出力する
     *
     * biz_io_id | name | term_1    | term_2    | ... | term_last
     * biz_io_id | name | m_value_1 | m_value_2 | ... | m_value_last
     * biz_io_id | name | prob_1    | prob_2    | ... | prob_last
     * biz_io_id | name | amount_1  | amount_2  | ... | amount_last
     * @param {ExportAsTableParam}
     *      {string} nameSpace: 名前空間
     *      {string} idCol: biz_io_idのカラムを各行前方に追加する
     *      {string} nameCol: 名前のカラムを各行前方に追加する
     *      {string} termRow: 期間の行を追加する。date
     * @return {ExportTable}
     */
    exportAsTable({
        nameSpace,
        idCol = false,
        nameCol = true,
        termRow = false,
    }: ExportAsTableParam = {}): ExportTable {
        const fullName = nameSpace ? `${nameSpace}:${this.name}` : this.name;
        const myselfTable = [this.timetableHistory.map((x) => x.value)];
        const exportTable: ExportTable = this._addHeaderToExportTable(
            fullName,
            myselfTable,
            undefined,
            idCol,
            nameCol,
            termRow
        );
        return exportTable;
    }

    // == Serialize / Deserialize ==

    toObject(): BizIOToObject<T, S> {
        return {
            className: this.constructor.name,
            bizIOId: this.id,
            name: this.name,
            isUserNamed: this.isUserNamed,
            accountName: this.accountName,
            complement: this.complement,
            isMonetary: this.isMonetary,
            externalData: this.externalData,
            externalGroupName: this.externalGroupName,
        };
    }
}

/**
 * 数量を示すBizIO
 */
export class AmountBizIO<T = any, S extends string = string> extends BizIO<
    T,
    S
> {
    constructor(prop: BizIOParam<T, S>) {
        super({ ...prop, isMonetary: false });
    }
}

/**
 * 金銭価値を示すBizIO
 */
export class MonetaryBizIO<T = any, S extends string = string> extends BizIO<
    T,
    S
> {
    constructor(prop: BizIOParam<T, S>) {
        super({ ...prop, isMonetary: true });
    }
}

/**
 * 読み出し専用BizIO
 *
 * 書き込み時は setEditable を制御すること
 */
export class ReadOnlyBizIO<T = any, S extends string = string> extends BizIO<
    T,
    S
> {
    // eslint-disable-next-line require-jsdoc
    constructor(prop: BizIOParam<T, S>) {
        super(prop);
        this.setEditable(false);
    }
}
