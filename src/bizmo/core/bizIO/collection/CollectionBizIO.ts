import {
    BizProcessor,
    BizProcessorRequiredParam,
} from 'bizmo/core/bizProcessor/BizProcessor';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { TypicalFunctionFactory } from 'bizmo/core/bizProcessor/func/TypicalFunctionFactory';
import { BizFuncResult } from 'bizmo/core/bizProcessor/func/input/BizFuncResult';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import { SystemInput } from 'bizmo/core/bizProcessor/func/input/SystemInput';
import { BizProcOutput } from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { HyperParamManager } from 'bizmo/core/hyperParam/HyperParamManager';
import {
    LabeledDict,
    LabeledDictToObject,
    isLabeledDictToObject,
} from 'bizmo/core/util/LabeledDict';
import { PublisherTriggerEventParam } from 'bizmo/core/util/Pubsub';
import { Timetable } from 'bizmo/core/util/Timetable';
import Decimal from 'decimal.js';
import {
    AmountBizIO,
    BizIO,
    BizIOId,
    BizIOInit,
    BizIOOptionalParam,
    BizIORequiredParam,
    BizIOToObject,
    ExportAsTableParam,
    ExportTable,
    History,
    MonetaryBizIO,
    NamedChildrenHolder,
} from '../single/BizIOs';
import { BizValue } from '../value/BizValue';

// Timetable の Current の変更に伴い、自動的にFolderをProcessする
const USE_TIMETABLE_CURRENT_RELATED_AUTO_PROCESS: boolean = false;

/**
 * Category 集約モード
 */
export const CollectionSummarizeMode = {
    NO_SUMMARIZE: 'NO_SUMMARIZE', // 集約しない
    TOTAL_AMOUNT: 'TOTAL_AMOUNT', // 全要素の合計を計算する
    TOTAL_MULTIPLE: 'TOTAL_MULTIPLE', // 全要素の乗算をを計算する
    ACCUMULATE: 'ACCUMULATE', // 累積値を計算する 式：累積値(term:N) = 累積値(term:N-1) + 子要素の合計値(term:N)
    // ===== 下記はシステム利用時のみ利用可能として、GUIからは選ばせない ======
    TOTAL_DIVIDE: 'TOTAL_DIVIDE', // 全要素の除算を計算する
    LINEAR: 'LINEAR', // 3要素を ax + b として計算する。system_label名により辞書順に利用する
    CUSTOM: 'CUSTOM', // カスタマイズされた計算を行う。code の適正を保証しない。system_label名により辞書順に利用する
} as const;
export type CollectionSummarizeMode =
    (typeof CollectionSummarizeMode)[keyof typeof CollectionSummarizeMode];

/**
 * FolderBizIO.constructor オプションパラメータ型
 * @param {CollectionSummarizeMode} summarizeMode Category集計モード default: NO_SUMMARIZE
 * @param {boolean} systemLabeledOnly 子要素をシステムラベルをつけた場合にだけ限定するか default: false
 * @param {boolean} exportWithChildren  構造の出力時に子要素を含むか default: !NO_SUMMARIZE
 * @param {BizIOInit} initData 初期化データ
 */
export type CollectionBizIOOptionParam = Partial<{
    summarizeMode: CollectionSummarizeMode;
    systemLabeledOnly: boolean;
    exportWithChildren: boolean;
    initData: BizIOInit;
}>;

export type CollectionBizIORequiredParam<
    T = any,
    S extends string = string,
> = BizIORequiredParam<T, S> & BizProcessorRequiredParam<T, S>;

export type CollectionBizIOToObject<T, S extends string> = BizIOToObject<T, S> &
    Omit<CollectionBizIOOptionParam, 'initData'> & {
        children: Array<BizIOId>;
        idLabeledSystemNames: LabeledDictToObject<BizIOId>;
        idLabeledNames: LabeledDictToObject<BizIOId>;
    };

export function isCollectionBizIOToObject<T, S extends string>(
    obj: any
): obj is CollectionBizIOToObject<T, S> {
    return (
        obj &&
        typeof obj === 'object' &&
        'className' in obj &&
        typeof obj.className === 'string' &&
        'children' in obj &&
        Array.isArray(obj.children) &&
        'idLabeledSystemNames' in obj &&
        isLabeledDictToObject(obj.idLabeledSystemNames) &&
        'idLabeledNames' in obj &&
        isLabeledDictToObject(obj.idLabeledNames)
    );
}

export type CollectionBizIOParam<
    T = any,
    S extends string = string,
    O = CollectionBizIOToObject<T, S>,
> = CollectionBizIORequiredParam<T, S> &
    BizIOOptionalParam<T, S, O> &
    CollectionBizIOOptionParam;

// ==== CollectionBizIOParam Variation Template ====

export type CustomCategoryBizIOParam<T = any, S extends string = string> = Omit<
    CollectionBizIOParam<T, S>,
    'summarizeMode'
>;

/**
 * 複数BizIO を子要素として保持するBizIO
 *
 * ・ファイルシステムにおける「フォルダ」のイメージ
 * ・子要素だけを input/output対象とする BizProcessor により、以下をCallしたタイミングで、 process される
 *  ・EVENT_CHILDREN_VALUES_UPDATED
 *  ・_update_history_reference_without_notification
 *
 * 前提
 * ・BizCompの構造は、BizActionが処理する前に設定される
 * ・BizCompの値は、BizAction経由でのみ設定・更新される
 *
 */
export class CollectionBizIO<T = any, S extends string = string>
    extends BizIO<T, S>
    implements NamedChildrenHolder
{
    protected _processor: BizProcessor;
    protected _systemLabeledOnly: boolean;
    protected _exportWithChildren: boolean;
    protected _summarizeMode: CollectionSummarizeMode;
    private __hyperMG: HyperParamManager;
    private __idLabeledNames: LabeledDict<BizIOId>;
    private __idLabeledSystemNames: LabeledDict<BizIOId>;
    private __preparedUpdateCollectionDependencies:
        | Array<BizIO<T, S>>
        | undefined;

    /**
     *
     * @param {CollectionBizIOParam<T ,S>} props
     */
    constructor(props: CollectionBizIOParam<T, S>) {
        const {
            hyperMG,
            summarizeMode = CollectionSummarizeMode.NO_SUMMARIZE,
            initUpdate = true,
            systemLabeledOnly = false,
            exportWithChildren = summarizeMode ===
                CollectionSummarizeMode.NO_SUMMARIZE,
            initData,
            toObj,
            ...rest
        } = props;

        super({
            ...rest,
            toObj,
            initUpdate: false, // super は更新しない
        });

        this.__hyperMG = hyperMG;
        this._processor = new BizProcessor({
            timetable: this.timetable,
            db: this.db,
            hyperMG: this.hyperMG,
            inputParams: (a, b) => {
                return this._inputParams(a, b);
            },
            outputResult: (a, b) => {
                this._outputResult(a, b);
            },
            validateProcOutput: (a?, b?) => {
                return this.validateProcOutput(a, b);
            },
        });

        // overwrite BizIOBase
        this._editable = false;
        this.__preparedUpdateCollectionDependencies = undefined; // 主にテスト用なので、削除できたらしたい

        // 継承先で変更することがあるproperty
        this._systemLabeledOnly = toObj?.systemLabeledOnly ?? systemLabeledOnly;
        this._exportWithChildren =
            toObj?.exportWithChildren ?? exportWithChildren;
        this._summarizeMode = toObj?.summarizeMode ?? summarizeMode;

        // 固有props
        this.__idLabeledNames = new LabeledDict<BizIOId>();
        this.__idLabeledSystemNames = new LabeledDict<BizIOId>();

        // processor設定： category の基本初期化後かつ更新処理の前
        this._initProcessor();

        // 自分の値の更新処理
        if (initUpdate) {
            this._doInitUpdate(initData);
        }

        // toObj に children がある場合は、ここで更新
        if (toObj?.children) {
            toObj.children.forEach((bizIOId) => {
                if (!this.children.some((child) => child.id === bizIOId)) {
                    // [前提] トポロジカルソートされた順番に呼び出されているので、children の実態がすべてDB登録済みであるはず
                    const targetOnDB = this.db.selectById(bizIOId);
                    if (targetOnDB) {
                        // システムラベルの有無を確認
                        const systemLabel = LabeledDict.fromObject(
                            toObj.idLabeledSystemNames
                        ).getContentByLabel(targetOnDB.name ?? '');
                        // ユーザーが登録したラベルがある場合は、それを利用して追加
                        const userLabel = LabeledDict.fromObject(
                            toObj.idLabeledNames
                        ).getContentByLabel(targetOnDB.name ?? '');

                        if (systemLabel) {
                            // collection にシステムラベルで登録されているならば追加しない
                            if (
                                this.selectChildBySystemName(systemLabel) ===
                                undefined
                            ) {
                                this.appendChild(targetOnDB, systemLabel);
                            }
                        } else if (userLabel) {
                            // collection にユーザーラベルで登録されているならば追加しない
                            if (
                                this.selectChildByName(userLabel) === undefined
                            ) {
                                this.appendChild(targetOnDB, userLabel);
                            }
                        } else {
                            this.appendChild(targetOnDB);
                        }
                    }
                }
            });
        }
    }

    /**
     * コンストラクタの最終段階で自己の値や子要素の初期化と、翻訳を行う
     * @param initData
     */
    protected _doInitUpdate(initData?: BizIOInit): void {
        this._updateHistoryReferenceWithoutNotification();
        // init_data で実体を更新
        this._initData(initData);
        // i18n
        this._translate();
    }

    /**
     * システムが利用する子要素のデフォルト名をまとめて設定します
     * @param {Array<[sysLabel: string, name: string]>} props
     */
    protected setDefaultNamesToSystemLabeled(
        props: Array<[sysLabel: string, name: string]>
    ): void {
        props.forEach(([sysLabel, name]) => {
            const target = this.selectChildBySystemName(sysLabel);
            //console.log(`setDefaultNamesToSystemLabeled:[${this.name}] ${sysLabel} ${name}: Target[${target?.name}]`);
            target?.setName(name, false);
        });
    }

    // ===== property =====

    /**
     * 当該IOが独自の値をもつかどうか
     */
    override get hasOwnValue(): boolean {
        return this.summarizeMode !== CollectionSummarizeMode.NO_SUMMARIZE;
    }

    /**
     * HyperParamManager
     */
    get hyperMG(): HyperParamManager {
        return this.__hyperMG;
    }

    /**
     * 出力に子要素を含むか
     */
    get exportWithChildren(): boolean {
        return this._exportWithChildren;
    }

    /**
     * 集約するモード
     */
    get summarizeMode(): CollectionSummarizeMode {
        return this._summarizeMode;
    }

    /**
     * システムラベルを付与した子要素のみを対象とするかどうかのフラグ
     */
    get systemLabeledOnly(): boolean {
        return this._systemLabeledOnly;
    }

    /**
     * 全ての子要素
     */
    get children(): Array<BizIO<T, S>> {
        return this.db.childrenOf(this.id);
    }

    /**
     * 【Override専用】公開されている子要素
     * デフォルトでは全ての子要素を公開する
     */
    get exposedChildren(): Array<BizIO<T, S>> {
        return this.children;
    }

    /**
     * ユーザが付与した名称を利用するラベル
     */
    get idLabeledNames(): LabeledDict<BizIOId> {
        return this.__idLabeledNames;
    }

    /**
     * 親の内部で利用するラベル
     * 主にコンポーネントに含まれる特定の役割を持ったBizIOに、システムとしてラベルをつけて管理するために利用する
     * name はユーザーが変更してもChildren単位で一意に決まるとはいえ、システム側で 変更された name では把握できないため。
     */
    get idLabeledSystemNames(): LabeledDict<BizIOId> {
        return this.__idLabeledSystemNames;
    }

    /**
     * システム提供Componentが内部で利用する子要素
     * Cohortなど、システムが内部で保持する子要素
     */
    get systemLabeledChildren(): Array<BizIO<T, S> | CollectionBizIO<T, S>> {
        return this.idLabeledSystemNames
            .getAllContents()
            .map((id) => this.db.selectById(id))
            .filter((bizIO): bizIO is BizIO<T, S> => bizIO !== undefined);
    }

    /**
     * 全子要素をシステム利用されているかどうかのフラグを付与して返す
     */
    get exposedChildrenWithSystemLabeledFlag(): Array<{
        bizIO: BizIO<T, S> | CollectionBizIO<T, S>;
        systemLabeled: boolean;
    }> {
        const result: Array<{
            bizIO: BizIO<T, S> | CollectionBizIO<T, S>;
            systemLabeled: boolean;
        }> = [];
        this.exposedChildren.forEach((child) => {
            result.push({
                bizIO: child,
                systemLabeled: this.idLabeledSystemNames.isIncludeContent(
                    child.id
                ),
            });
        });
        return result;
    }

    /**
     * 【再帰関数：本体】　すべての Collectionの子要素を再帰的に取得する
     */
    __flattenExposedChildren(
        parentPath: Array<{ name: string; id: string }>
    ): Array<{
        bizIO: BizIO<T, S>;
        systemLabeled: boolean;
        path: Array<{ name: string; id: string }>;
    }> {
        const result: Array<{
            bizIO: BizIO<T, S>;
            systemLabeled: boolean;
            path: Array<{ name: string; id: string }>;
        }> = [];
        this.exposedChildren.forEach((bizIO) => {
            const newParentPath = [
                ...parentPath,
                { name: bizIO.name, id: bizIO.id },
            ];
            result.push({
                bizIO,
                systemLabeled: this.idLabeledSystemNames.isIncludeContent(
                    bizIO.id
                ),
                path: newParentPath,
            });
            if (bizIO instanceof CollectionBizIO) {
                result.push(...bizIO.__flattenExposedChildren(newParentPath));
            }
        });
        return result;
    }

    /**
     * すべての Collectionの子要素を再帰的に取得する
     */
    get flattenExposedChildren(): Array<{
        bizIO: BizIO<T, S>;
        systemLabeled: boolean;
        path: Array<{ name: string; id: string }>;
    }> {
        return this.__flattenExposedChildren([]);
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
        // eslint-disable-next-line require-jsdoc
        function __commonUpdate(target: CollectionBizIO<T, S>): void {
            if (target.hasOwnValue) {
                target._updateHistoryReference(
                    keyParams?.get(
                        BizIO.EVENT_CHILDREN_VALUES_UPDATED__UPDATED_BIZ_IO
                    )
                );
            } else {
                // 自分自身の値を持たない場合、自身の値の参照先に更新を知らせる必要がないが、他の子要素への processor 適用は必要
                target._processUpdate();
            }
        }

        super.handleEvent(eventName, keyParams);
        switch (eventName) {
            case BizIO.EVENT_CHILDREN_VALUES_UPDATED:
                __commonUpdate(this);
                break;
            case Timetable.EVENT_CURRENT_CHANGED:
                if (USE_TIMETABLE_CURRENT_RELATED_AUTO_PROCESS) {
                    __commonUpdate(this);
                } else {
                    // 上記 flag が False なら、timetable の進捗に合わせて、Folder親子関係のトポロジカルソートの結果を使うこと
                }
                break;
        }
    }

    // ==== BizProcessor ====
    // TODO: 本来BizProcessorとしてOverwriteしている感じなので、そこを修正する必要がある

    /**
     * [overwrite対象]
     * BizProcOutput として適切か判断する
     *
     * = 注意 =
     * BizProcessor は、 BizAction の中で、適用順序が決まった状態で Call されることを想定しているため、制約が緩やかである。
     *
     * もしも Folder として自動的に BizProcessor を call し、特別な制約を付与しない場合には、set_proc_output だけでなく、
     * children と子孫が変更されたタイミングでも DAG を確認する必要があり、完全に実現しようとすると複雑なソースコードになりそう。
     *
     * そこで、Folderでは「自分自身を変更する場合だけOK」とする。
     * @param {BizIOId} parentId
     * @param {BizIOId} targetId
     * @return {boolean}
     */
    validateProcOutput(parentId?: BizIOId, targetId?: BizIOId): boolean {
        return parentId === targetId;
    }

    /**
     * [overwrite対象]
     * init 内での processor 初期化
     * 継承先は必要に応じて init_update を False にしてから利用すること
     */
    protected _initProcessor(): void {
        const func = this.hasOwnValue
            ? new BizFunction({ code: '0' })
            : new BizFunction({ code: 'na()' });
        this._processor.addBizFunction(func);
        this._processor.addProcOutput(
            new BizProcOutput({
                parentId: this.id,
                outputBizId: this.id,
                outputFuncId: func.funcId,
            })
        );
    }

    /**
     * [process内部 overwrite専用]
     * 計算パラメータの BizIO をインプットする
     * @param {Array<BizIOConf>} orderedBizIOConf
     * @param {number} targetIndex
     * @return {[ Array<Decimal>, Array<BizIOId>] }
     */
    protected _inputParams(
        orderedBizIOConf: Array<BizIOConf>,
        targetIndex: number
    ): [Array<Decimal>, Array<BizIOId>] {
        return this.hasOwnValue
            ? this._processor.inputParamsTemplate(orderedBizIOConf, targetIndex)
            : [[], []];
    }

    /**
     * [overwrite対象]
     *
     * @param {BizFuncResult} resInputs
     * @param {number} targetIndex
     */
    protected _outputResult(
        resInputs: BizFuncResult<Decimal>,
        targetIndex: number
    ): void {
        let timetableHistory: History;
        if (this._timetableHistory.length === this.timetable.length) {
            timetableHistory = this._timetableHistory;
        } else {
            const value = this.hasOwnValue
                ? new Decimal('0')
                : new Decimal('NaN');
            timetableHistory = this.timetable.terms.map(
                (term) => new BizValue(term, value)
            );
        }
        timetableHistory[targetIndex] = new BizValue(
            timetableHistory[targetIndex].date,
            resInputs[0]
        );
        this._timetableHistory = timetableHistory;
    }

    /**
     * [overwrite対象]
     * BizProcess を更新する
     * @param {BizIO} elem
     */
    protected _updateProcessorForAppendChild(elem: BizIO<T, S>): void {
        if (this.hasOwnValue) {
            this._replaceBizFunction();
        } else {
            if (this._processor.orderedBizFunctions.length > 0) {
                // TODO  通常はは入力パラメータ数が変化するので src 修正も必要。 単なる Folder は NaN で固定しているので、問題ない
                this._processor.orderedBizFunctions[0].addBizIOInput(
                    elem.id,
                    0
                );
            }
        }
    }

    /**
     * [overwrite専用]
     * @param {BizIOId} bizId
     */
    protected _updateProcessorForRemoveChild(bizId: BizIOId): void {
        if (this.hasOwnValue) {
            this._replaceBizFunction(bizId);
        } else {
            if (this._processor.orderedBizFunctions.length > 0) {
                // TODO  通常はは入力パラメータ数が変化するので src 修正も必要。 単なる Folder は NaN で固定しているので、問題ない
                this._processor.orderedBizFunctions[0].removeBizIOInputById(
                    bizId
                );
            }
        }
    }

    // ===== internal process for overwrite  =====

    /**
     * init で与えられた初期値からデータを取り出す。
     * @param {string} label
     * @param {(() => T)} defaultValue 失敗時の値
     * @param {BizIOInit} initData
     * @return {T}
     */
    static pickFromInitWthDefault<T>(
        label: string | number,
        defaultValue: () => T,
        initData?: BizIOInit
    ): T {
        if (initData) {
            if (initData instanceof Map) {
                return (initData.get(label) as T) ?? defaultValue();
            } else if (initData instanceof Array && typeof label === 'number') {
                return (initData[label] as T) ?? defaultValue();
            }
        }
        return defaultValue();
    }

    /**
     * [Overwrite対象]
     * 子要素を初期化する
     * 継承クラスが、initの中でChildrenを初期化するためにも利用される想定
     * @param {BizIOInit} initData
     */
    protected _initData(initData?: BizIOInit): void {
        // FIXME ここは専用の子要素として見るのではなく、統一的に扱いたい
        if (
            initData &&
            initData instanceof Array &&
            initData.length > 0 &&
            initData[0] instanceof BizIO
        ) {
            // for child in init_data:
            initData.forEach((child) => this.appendChild(child));
        }
    }

    // ===== Process ====

    /**
     * update_processor を実行する
     */
    _processUpdate(): void {
        /* 全term実行する場合
        for index, term in enumerate(self.timetable.terms):
            self.process(sys_inputs=SystemInput(term_index=index, term_date=term).inputs)
        */
        // folder は 必ず 初期termから順にprocessされている前提
        this._processor.process(
            new SystemInput(
                this.timetable.currentIndex,
                this.timetable.currentDate
            ).inputs
        );
    }

    /**
     * [BizDBだけが呼ぶ想定]
     * 現在の _history_entity から _timetable_history を再設定する
     * 再設定の結果を依存先に知らせない
     */
    _updateHistoryReferenceWithoutNotification(): void {
        // update_history_referenceの共通処理
        this._processUpdate();
    }

    /**
     * [overwritten]
     * 現在の _history_entity から _timetable_history を再設定する
     * @param {BizIO} updatedBizIO
     */
    _updateHistoryReference(updatedBizIO?: BizIO<T, S>): void {
        if (this.db.autoUpdateDependencies) {
            this._updateHistoryReferenceWithoutNotification();
            if (this.hasOwnValue) {
                // 後続に処理をつなぐ
                this.triggerEvent(
                    BizIO.EVENT_CHILDREN_VALUES_UPDATED,
                    new Map([
                        ['updated_biz_io', updatedBizIO ?? this],
                        ['last_updated_biz_io', this],
                    ])
                );
            }
        }
    }

    // ==== Folder like methods ====

    /**
     *
     */
    _adjustTimetableCurrentChangedListener(): void {
        // 子要素が全て CollectionBizIO ではない場合は、EVENT_CURRENT_CHANGED を listenする
        this.timetable.removeEventListener(
            Timetable.EVENT_CURRENT_CHANGED,
            this
        );
        let challenge = true;
        this.children.forEach((child) => {
            // Hack
            if (challenge && !(child instanceof CollectionBizIO)) {
                challenge = false;
            }
        });
        if (challenge) {
            this.timetable.addEventListener(
                Timetable.EVENT_CURRENT_CHANGED,
                this
            );
        }
    }

    /**
     * 子要素を追加する。
     * 既存子要素のIDと同じ場合には、追加も更新もしない。
     *
     * ＝注意＝
     * システム使用ラベル と ユーザ使用ラベル は、本メソッド呼び出し前に「一意」になっていないと、
     * IDでしかアプローチできないBizIOが発生するので注意。
     *
     * 課題
     * 同じIDでnewしてしまうと、既存Nodeに対してdbにエッジができてしまう、 new するときはDBを確認してからにしないとあかんそう。
     * @param {FT} child
     * @param {string} systemNamedLabel システム使用ラベル。「一意」が保証されている前提
     * @return {FT | undefined}
     */
    appendChild<FT extends BizIO<T, S> = BizIO<T, S>>(
        child: FT,
        systemNamedLabel?: string
    ): FT | undefined {
        if (this._validateAppendingChild(child, systemNamedLabel)) {
            // externalGroupName の継承
            if (
                this.externalGroupName &&
                child.externalGroupName == undefined
            ) {
                child.externalGroupName = this.externalGroupName;
            }
            // main process
            const elem = this.db.insert(child, this);
            if (elem) {
                this.idLabeledNames.removeAllContentsByContent(elem.id);
                this.idLabeledNames.setContentWithLabel(elem.id, elem.name);
                if (systemNamedLabel) {
                    this.idLabeledSystemNames.removeAllContentsByContent(
                        elem.id
                    );
                    this.idLabeledSystemNames.setContentWithLabel(
                        elem.id,
                        systemNamedLabel
                    );
                }
                this._adjustTimetableCurrentChangedListener();
                this._updateProcessorForAppendChild(elem);
                this._updateHistoryReference();
                return elem as FT;
            }
        }
    }

    protected _validateAppendingChild<FT extends BizIO<T, S> = BizIO<T, S>>(
        child: FT,
        systemNamedLabel?: string
    ): boolean {
        // hack CollectionBizIO から
        if (this.systemLabeledOnly && !systemNamedLabel) {
            console.log(
                `Not allowed to add a child without systemLabel on CollectionBizIO[${this.name}].`
            );
            return false;
        }

        if (
            !systemNamedLabel &&
            this.idLabeledNames.isIncludedLabel(child.name)
        ) {
            console.log(
                `Not allowed to add same named BizIO on CollectionBizIO[${this.name}].`
            );
            return false;
        }

        if (this.children.find((value) => value.id == child.id)) {
            // 存在意義： db.insertUpdate を参照すること
            console.log(
                `Not allowed to add same id on CollectionBizIO[${this.name}].`
            );
            return false;
        }

        return true;
    }

    /**
     * 子要素を【まとめて】追加する
     *
     * @param {Array<BizIO>} children
     * @param {Array<string>} systemNamedLabels
     * @return {Array<BizIO | undefined>}
     */
    appendChildren(
        children: Array<BizIO<T, S>>,
        systemNamedLabels?: Array<string>
    ): Array<BizIO<T, S> | undefined> {
        const result: Array<BizIO<T, S> | undefined> = [];
        if (systemNamedLabels && systemNamedLabels.length == children.length) {
            children.forEach((child, index) =>
                result.push(this.appendChild(child, systemNamedLabels[index]))
            );
        } else {
            children.forEach((child) => result.push(this.appendChild(child)));
        }
        return result;
    }

    /**
     * 指定した子要素を、構成要素から外す
     * ・子要素でない場合には、何もしない
     * ・子要素のノードそのものは、削除されない
     * ・デフォルトでは、 idLabeledSystemNames に登録されている場合は削除しない
     * @param {BizIOId} bizId
     * @param {boolean} enforce idLabeledSystemNames に登録されている場合でも削除する
     */
    removeChild(bizId: BizIOId, enforce: boolean = false): void {
        if (
            this.children.find(
                (child) =>
                    child.id === bizId &&
                    (enforce ||
                        (!enforce &&
                            !this.idLabeledSystemNames.isIncludeContent(bizId)))
            )
        ) {
            // ラベル削除
            this.idLabeledNames.removeAllContentsByContent(bizId);
            this.idLabeledSystemNames.removeAllContentsByContent(bizId);
            // db削除
            this.db.deleteEdgeOn(this.id, bizId);
            this._adjustTimetableCurrentChangedListener();
            // processor更新
            this._updateProcessorForRemoveChild(bizId);
            // 更新
            this._updateHistoryReference();
        }
    }

    /**
     * 指定した名前をもつ子要素のうち、最後にSetされた要素を取得する
     * 名称はユーザーが変更できる
     * @param {string} name
     * @return {FT | undefined}
     */
    selectChildByName<FT extends BizIO<T, S> = BizIO<T, S>>(
        name: string
    ): FT | undefined {
        const result = this.idLabeledNames.getContentByLabel(name);
        if (result) {
            return this.db.selectById<FT>(result);
        }
    }

    /**
     * 指定したシステム指定名をもつ子要素のうち、最後にSetされた要素を取得する
     * ・システムが提供する名称でアプローチする。システムは名称を事前に Unique にしている前提
     * @param {string} name
     * @return {BizIO<T, S> | undefined}
     */
    selectChildBySystemName<FT extends BizIO<T, S> = BizIO<T, S>>(
        name: string
    ): FT | undefined {
        const result = this.idLabeledSystemNames.getContentByLabel(name);
        if (result) {
            return this.db.selectById<FT>(result);
        }
    }

    // ==== Utility ====
    /**
     * 【公開子要素のデータだけ】含めて2次元配列として出力する
     *
     * biz_io_id | name | term_1    | term_2    | ... | term_last
     * biz_io_id | name | m_value_1 | m_value_2 | ... | m_value_last
     * biz_io_id | name | prob_1    | prob_2    | ... | prob_last
     * biz_io_id | name | amount_1  | amount_2  | ... | amount_last
     * @param {ExportAsTableParam}
     *  {string} idCol: biz_io_idのカラムを各行前方に追加する
     *  {string} nameCol: 名前のカラムを各行前方に追加する
     *  {string} termRow: 期間の行を追加する。date
     *  {string} nameSpace: 名前空間
     * @return {ExportTable}
     */
    exportAsTable({
        idCol = false,
        nameCol = true,
        termRow = false,
        nameSpace,
    }: ExportAsTableParam = {}): ExportTable {
        let childrenTable: ExportTable = [];
        const fullName = nameSpace ? nameSpace + ':' + this.name : this.name;
        let processChild = false;
        // Hack CollectionBizIO から一次的に変更
        if (this instanceof CollectionBizIO) {
            // FIXME has_own_value = True だけ _export_with_children が適用されるの？
            processChild = this.hasOwnValue ? this._exportWithChildren : true;
        }
        if (processChild) {
            this.exposedChildren.forEach((child) => {
                childrenTable = childrenTable.concat(
                    child.exportAsTable({
                        idCol: idCol,
                        nameCol: nameCol,
                        termRow: false,
                        nameSpace: fullName,
                    })
                );
            });
        }

        const exportTable: ExportTable = this._addHeaderToExportTable(
            fullName,
            this.hasOwnValue
                ? [this.timetableHistory.map((x) => x.value)]
                : undefined,
            childrenTable,
            idCol,
            nameCol,
            termRow
        );
        return exportTable;
    }

    /**
     * [利用注意]
     * DBに登録されているFolderだけをトポロジカルソートした順に更新する
     * 事前に prepareUpdateFullCOllections した結果を利用する。
     */
    updateFullCollections(): void {
        if (this.__preparedUpdateCollectionDependencies) {
            this.db.updateFullCollections(
                this.__preparedUpdateCollectionDependencies
            );
        }
    }

    /**
     * [利用注意]
     * db に登録されている全BizIOにつきトポロジカルソートを行い、更新するFolderだけを、順番に抽出する
     *
     * ＝前提＝
     * BizIO構造がシミュレーション中に変化しないこと
     */
    prepareUpdateFullCOllections(): void {
        this.__preparedUpdateCollectionDependencies =
            this.db.prepareUpdateFullCollections();
    }

    /**
     * [テスト簡便化目的]
     * DB に登録されている全Folderの値が、全Termについて更新される
     */
    prepareAndUpdateFullCollectionsForAllTerms(): void {
        this.prepareUpdateFullCOllections();
        this.timetable.setIndexToStart();
        for (let index = 0; index < this.timetable.terms.length; index++) {
            this.updateFullCollections();
            this.timetable.next();
        }
    }

    // ==== 独自拡張: CollectionBizIO ではプロトコル上、MonetaryBizIO や AmountBizIO が利用できないため。 ====

    /**
     * FolderBizIO の初期データを追加する
     * @param {string} name
     * @return {CollectionBizIO<T,S> | undefined}
     */
    addSeedFolder(name: string): CollectionBizIO<T, S> | undefined {
        return this.appendChild(
            new CollectionBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
            })
        );
    }

    /**
     * MonetaryBizIO の標準初期データを追加する
     * 同一名の子要素があった場合には、新要素に置換される
     * @param {string} name
     * @return {MonetaryBizIO | undefined}
     */
    addSeedMonetaryIO(name: string): MonetaryBizIO<T, S> | undefined {
        return this.appendChild(
            new MonetaryBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                name: name,
            })
        );
    }

    /**
     * AmountBizIO の標準初期データを追加する
     * 同一名の子要素があった場合には、新要素に置換される
     * @param {string} name
     * @return {AmountBizIO | undefined}
     */
    addSeedAmountIO(name: string): AmountBizIO<T, S> | undefined {
        return this.appendChild(
            new AmountBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                name: name,
            })
        );
    }

    /**
     * Category 統合
     */

    // ==== BizProcessor ====
    /**
     * [overwrite対象]
     * BizFunction を設定し、要素を再計算する
     * @param {BizIOId} bizId 設定されればremoveとして扱う
     */
    protected _replaceBizFunction(bizId?: BizIOId) {
        if (
            this.summarizeMode != CollectionSummarizeMode.NO_SUMMARIZE &&
            this._processor.orderedBizFunctions.length > 0
        ) {
            let func: BizFunction | undefined = undefined;
            // システムラベルに依存したCollectionを必要とするか
            const collectionSeed =
                this.summarizeMode !== CollectionSummarizeMode.LINEAR
                    ? this.children
                    : this.systemLabeledChildren;
            // remove_children か append_children か
            const collection = !bizId
                ? collectionSeed
                : collectionSeed.filter((child) => child.id != bizId); // remove した結果を生成
            switch (this.summarizeMode) {
                case CollectionSummarizeMode.TOTAL_AMOUNT:
                    func = TypicalFunctionFactory.createCollectionSumFunc({
                        collection: collection,
                        relativeTermIndex: 0,
                    });
                    break;
                case CollectionSummarizeMode.TOTAL_DIVIDE:
                    func = TypicalFunctionFactory.createCollectionDivideFunc({
                        collection: collection,
                        relativeTermIndex: 0,
                    });
                    break;
                case CollectionSummarizeMode.TOTAL_MULTIPLE:
                    func = TypicalFunctionFactory.createCollectionMultipleFunc({
                        collection: collection,
                        relativeTermIndex: 0,
                    });
                    break;
                case CollectionSummarizeMode.LINEAR:
                    func = TypicalFunctionFactory.createCollectionLinearFunc({
                        collection: collection,
                        relativeTermIndex: 0,
                    });
                    break;
                case CollectionSummarizeMode.ACCUMULATE:
                    func = new BizFunction();
                    func.addBizIOInput(this.id, 1);
                    func.code = 'bizio0';
                    for (let index = 0; index < this.children.length; index++) {
                        func.addBizIOInput(this.children[index].id, 0);
                        func.code = func.code.concat(` + bizio${index + 1}`);
                    }
                    break;
                case CollectionSummarizeMode.CUSTOM:
                    func = this._replaceBizFunctionAtCustom();
                    break;
            }
            this._processor.replaceBizFunctionAt(0, func);
        }
    }

    /**
     * [overwrite対象]
     * Customモード時の BizFunction の定義を行う
     * @return {BizFunction}
     */
    protected _replaceBizFunctionAtCustom(): BizFunction {
        return this._processor.orderedBizFunctions[0];
    }

    /**
     * 値持ちCollectionBizIO = Category の標準初期データを追加する
     * 同一名の子要素があった場合には、新要素に置換される
     * @param {string} name
     * @return {CategoryBizIO<T, S> | undefined}
     */
    addSeedCategory(name: string): CollectionBizIO<T, S> | undefined {
        return this.appendChild(
            new CollectionBizIO<T, S>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: name,
                summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                exportWithChildren: true,
            })
        );
    }

    // == Serialize / Deserialize ==

    toObject(): CollectionBizIOToObject<T, S> {
        return {
            ...super.toObject(),
            className: this.constructor.name,
            summarizeMode: this.summarizeMode,
            systemLabeledOnly: this.systemLabeledOnly,
            exportWithChildren: this._exportWithChildren,
            idLabeledSystemNames: this.__idLabeledSystemNames.toObject(),
            idLabeledNames: this.__idLabeledNames.toObject(),
            children: this.children.map((child) => child.id),
        };
    }
}
