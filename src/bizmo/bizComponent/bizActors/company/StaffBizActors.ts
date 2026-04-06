import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import {
    AccountNames,
    AccountNamesUtil,
} from 'bizmo/core/accounting/AccountNames';
import {
    CollectionBizIO,
    CollectionBizIOToObject,
    CollectionSummarizeMode,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import {
    UnitComponent,
    UnitComponentToObject,
} from 'bizmo/core/bizIO/component/UnitComponent';
import {
    AmountBizIO,
    BizIOInit,
    BizIOToObject,
} from 'bizmo/core/bizIO/single/BizIOs';
import i18n from 'i18n/configs';
import { BizActors } from '../BizActors';

/**
 * 会社スタッフの最小単位グループ
 * 主に HRActions で利用する
 *
 * ＝ term毎の構成要素 ＝
 * ・新規加入： 入社により このtermから 参加するスタッフ
 *      ・数量： 入社したスタッフ数
 *      ・単価： 入社に伴い会社が負担する費用（報酬を含まず） 例：人材採用費
 *      ・調整項目
 *      ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・異動加入： 異動により このtermから 参加するスタッフ
 *      ・数量： 異動したスタッフ数
 *      ・単価： 異動に伴い会社が負担する費用（報酬を含まず）
 *      ・調整項目
 *      ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・退社脱退： 退社により このtermから 抜けるスタッフ
 *      ・数量： 退社したスタッフ数（正数）
 *      ・単価： 退社に伴い会社が負担する費用（報酬を含まず） 例：退職金
 *      ・調整項目
 *      ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・異動脱退： 異動により このtermから 抜けるスタッフ
 *      ・数量： 異動したスタッフ数（正数）
 *      ・単価： 異動に伴い会社が負担する費用（報酬を含まず）
 *      ・調整項目
 *      ・[Auto] 合計： 数量 x 単価 + 調整項目
 * ・稼働： このtermに 就労したスタッフ（加入・脱退のスタッフを含む）
 *      ・数量： 稼働スタッフ数
 *      ・単価： スタッフあたりの報酬
 *      ・調整項目
 *      ・[Auto] 合計： 数量 x 単価 + 調整項目  ⇐ TODO: 発生ベース。支払期日が異なる場合には注意
 * ・[Auto] 総合計
 * ・労働時間： 運用対象スタッフの労働時間の合計
 *
 * = POINT =
 * ・total_value を除く値は、全て「自発的に計算する」必要がある。
 *  ⇐ 細かいシミュレーションを希望しない場合に「稼働」だけを利用するなど、柔軟な対応ができるようにするため。
 * ・脱退関係の人数を「正数」で処理する
 *  ⇐ 総合計で全体コストを算出するので。脱退による稼働人数の調整は、HRActions などにより利用者が考慮すること
 */
export class StaffBizActors<T = any> extends BizActors<T> {
    public static ADD_BY_HIRED: string = 'ADD_BY_HIRED';
    public static ADD_BY_MOVED: string = 'ADD_BY_MOVED';
    public static SUB_BY_MOVED: string = 'SUB_BY_MOVED';
    public static SUB_BY_RETIRE: string = 'SUB_BY_RETIRE';
    public static WORKING: string = 'WORKING';
    public static WORKING_TASKS: string = 'WORKING_TASKS';
    public static TOTAL_VALUE: string = 'TOTAL_VALUE';
    public static WORKING_TIMES: string = 'WORKING_TIMES';

    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        this.appendChildren(
            [
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.ADD_BY_HIRED,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            amountComplement: false,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.ADD_BY_MOVED,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            amountComplement: false,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.SUB_BY_MOVED,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            amountComplement: false,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.SUB_BY_RETIRE,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            amountComplement: false,
                        }),
                    initData
                ),
                // 特殊
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.WORKING,
                    () =>
                        new UnitComponent<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.WORKING_TASKS,
                    () =>
                        new CollectionBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.WORKING_TIMES,
                    () =>
                        new AmountBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                        }),
                    initData
                ),
                StaffBizActors.pickFromInitWthDefault(
                    StaffBizActors.TOTAL_VALUE,
                    () =>
                        new CollectionBizIO<T, BizComponentGroupType>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            exportWithChildren: false,
                            summarizeMode: CollectionSummarizeMode.TOTAL_AMOUNT,
                            systemLabeledOnly: true,
                        }),
                    initData
                ),
            ],
            [
                StaffBizActors.ADD_BY_HIRED,
                StaffBizActors.ADD_BY_MOVED,
                StaffBizActors.SUB_BY_MOVED,
                StaffBizActors.SUB_BY_RETIRE,
                StaffBizActors.WORKING,
                StaffBizActors.WORKING_TASKS,
                StaffBizActors.WORKING_TIMES,
                StaffBizActors.TOTAL_VALUE,
            ]
        );
        this.totalValue.appendChildren(
            [
                this.addByHired.totalValue,
                this.addByMoved.totalValue,
                this.subByMoved.totalValue,
                this.subByRetire.totalValue,
                this.working.totalValue,
            ],
            ['addByHired', 'addByMoved', 'subByMoved', 'subByRetire', 'working']
        );
    }

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [
                StaffBizActors.ADD_BY_HIRED,
                i18n.t('translation:StaffBizActors.ADD_BY_HIRED'),
            ],
            [
                StaffBizActors.ADD_BY_MOVED,
                i18n.t('translation:StaffBizActors.ADD_BY_MOVED'),
            ],
            [
                StaffBizActors.SUB_BY_MOVED,
                i18n.t('translation:StaffBizActors.SUB_BY_MOVED'),
            ],
            [
                StaffBizActors.SUB_BY_RETIRE,
                i18n.t('translation:StaffBizActors.SUB_BY_RETIRE'),
            ],
            [
                StaffBizActors.WORKING,
                i18n.t('translation:StaffBizActors.WORKING'),
            ],
            [
                StaffBizActors.WORKING_TASKS,
                i18n.t('translation:StaffBizActors.WORKING_TASKS'),
            ],
            [
                StaffBizActors.WORKING_TIMES,
                i18n.t('translation:StaffBizActors.WORKING_TIMES'),
            ],
            [
                StaffBizActors.TOTAL_VALUE,
                i18n.t('translation:StaffBizActors.TOTAL_VALUE'),
            ],
        ]);
    }

    /**
     * [override]
     * 勘定科目を設定する。
     * 設定する科目が「費用」項目でなければ、設定されない。
     * @param {AccountNames} accountName
     */
    override setAccountName(accountName: AccountNames): void {
        if (AccountNamesUtil.isExpenses(accountName)) {
            super.setAccountName(accountName);
        }
    }

    /**
     * 新規加入： 入社により このtermから 参加するスタッフ
     */
    get addByHired(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.ADD_BY_HIRED)!;
    }

    /**
     * 異動加入： 異動により このtermから参加するスタッフ
     */
    get addByMoved(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.ADD_BY_MOVED)!;
    }

    /**
     * 異動脱退：  異動により このtermから  抜けるスタッフ
     */
    get subByMoved(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.SUB_BY_MOVED)!;
    }

    /**
     * 退社脱退：  退社により このtermから  抜けるスタッフ
     */
    get subByRetire(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.SUB_BY_RETIRE)!;
    }

    /**
     * 稼働：  このtermに 就労したスタッフ（加入・脱退のスタッフを含む）
     */
    get working(): UnitComponent<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.WORKING)!;
    }

    /**
     * 稼働：  このtermに 就労した「タスク別」のスタッフ
     */
    get workingTasks(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.WORKING_TASKS)!;
    }

    /**
     * 総合計
     */
    get totalValue(): CollectionBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.TOTAL_VALUE)!;
    }

    /**
     * 労働時間：  運用対象スタッフの労働時間の合計
     */
    get workingTimes(): AmountBizIO<T, BizComponentGroupType> {
        return this.selectChildBySystemName(StaffBizActors.WORKING_TIMES)!;
    }

    /**
     * 当該 BizIO を削除する
     *
     * = 注意 =
     * オブジェクトはDBから削除されるだけ。そのままメモリー上から消えるとは限らない。
     * @param {boolean} triggerEvent
     */
    override delete(triggerEvent: boolean): void {
        // 専用子要素を削除
        this.workingTimes.delete(false);

        // 自身を削除
        super.delete(triggerEvent);
    }

    /**
     * work の詳細を定義するタスクを追加する
     *
     * @param {string} taskName
     * @return {UnitComponent<T,S> | undefined}
     */
    createNewWorkingTask(
        taskName: string
    ): UnitComponent<T, BizComponentGroupType> | undefined {
        return this.workingTasks.appendChild(
            new UnitComponent<T, BizComponentGroupType>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name: taskName,
            })
        );
    }

    /**
     * work の詳細を定義するタスクを取得する
     *
     * @param {string} taskName
     * @return {UnitComponent<T,S>}
     */
    selectWorkingTask(
        taskName: string
    ): UnitComponent<T, BizComponentGroupType> | undefined {
        return this.workingTasks.selectChildByName<
            UnitComponent<T, BizComponentGroupType>
        >(taskName);
    }

    toObject(): StaffBizActorsToObject<T> {
        return {
            ...super.toObject(),
            addByHired: this.addByHired.toObject(),
            addByMoved: this.addByMoved.toObject(),
            subByMoved: this.subByMoved.toObject(),
            subByRetire: this.subByRetire.toObject(),
            working: this.working.toObject(),
            workingTasks: this.workingTasks.toObject(),
            workingTimes: this.workingTimes.toObject(),
            totalValue: this.totalValue.toObject(),
        };
    }
}

export type StaffBizActorsToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    addByHired: UnitComponentToObject<T, BizComponentGroupType>;
    addByMoved: UnitComponentToObject<T, BizComponentGroupType>;
    subByMoved: UnitComponentToObject<T, BizComponentGroupType>;
    subByRetire: UnitComponentToObject<T, BizComponentGroupType>;
    working: UnitComponentToObject<T, BizComponentGroupType>;
    workingTasks: CollectionBizIOToObject<T, BizComponentGroupType>;
    workingTimes: BizIOToObject<T, BizComponentGroupType>;
    totalValue: CollectionBizIOToObject<T, BizComponentGroupType>;
};

export const StaffRole = {
    EMPLOYERS: 'EMPLOYERS',
    EMPLOYEES: 'EMPLOYEES',
};
export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

/**
 * 役職別  従業員リスト
 * 主に HRActions で利用する
 *
 * 人月計算を行うための、役割別の従業員グループ(UniqueByNameFolderBizIO)。
 * ・役員
 * ・従業員
 */
export class StaffList<T = any> extends BizActors<T> {
    /**
     *
     * @param {BizIOInit | undefined} initData
     */
    override _initData(initData?: BizIOInit | undefined): void {
        // 当該クラスが UniqueByNameCollectionBizIO なので、ダミー名称を設定しないと登録できない
        this.appendChildren(
            [
                StaffList.pickFromInitWthDefault(
                    StaffRole.EMPLOYERS,
                    () =>
                        new BizActors<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: StaffRole.EMPLOYERS,
                            isUserNamed: false,
                            exportWithChildren: true,
                        }),
                    initData
                ),
                StaffList.pickFromInitWthDefault(
                    StaffRole.EMPLOYEES,
                    () =>
                        new BizActors<T>({
                            timetable: this.timetable,
                            db: this.db,
                            hyperMG: this.hyperMG,
                            name: StaffRole.EMPLOYEES,
                            isUserNamed: false,
                            exportWithChildren: true,
                        }),
                    initData
                ),
            ],
            [StaffRole.EMPLOYERS, StaffRole.EMPLOYEES]
        );
    }

    protected override _updateTranslation(): void {
        this.setDefaultNamesToSystemLabeled([
            [StaffRole.EMPLOYERS, i18n.t('translation:StaffRole.EMPLOYERS')],
            [StaffRole.EMPLOYEES, i18n.t('translation:StaffRole.EMPLOYEES')],
        ]);
    }

    /**
     *
     */
    get employers(): BizActors<T> {
        return this.selectChildBySystemName(StaffRole.EMPLOYERS)!;
    }

    /**
     *
     */
    get employees(): BizActors<T> {
        return this.selectChildBySystemName(StaffRole.EMPLOYEES)!;
    }

    // 操作系メソッド

    /**
     * 役員として、スタッフのグループを追加する
     *
     * @param {string} name
     * @return {StaffBizActors<T> | undefined}
     */
    addSeedEmployer(name: string): StaffBizActors<T> | undefined {
        return this.employers.appendChild(
            new StaffBizActors<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name,
            })
        );
    }

    /**
     * 従業員として、スタッフのグループを追加します
     *
     * @param {string} name
     * @return {StaffBizActors<T> | undefined}
     */
    selectEmployer(name: string): StaffBizActors<T> | undefined {
        return this.employers.selectChildByName(name);
    }

    /**
     * 役員として、スタッフのグループを追加する
     *
     * @param {string} name
     * @return {StaffBizActors<T> | undefined}
     */
    addSeedEmployee(name: string): StaffBizActors<T> | undefined {
        return this.employees.appendChild(
            new StaffBizActors<T>({
                timetable: this.timetable,
                db: this.db,
                hyperMG: this.hyperMG,
                name,
            })
        );
    }

    /**
     * 指定した名称をもつ 従業員グループ を取得します
     *
     * @param {string} name
     * @return {StaffBizActors<T> | undefined}
     */
    selectEmployee(name: string): StaffBizActors<T> | undefined {
        return this.employees.selectChildByName(name);
    }

    toObject(): StaffListToObject<T> {
        return {
            ...super.toObject(),
            employers: this.employers.toObject(),
            employees: this.employees.toObject(),
        };
    }
}

export type StaffListToObject<T> = CollectionBizIOToObject<
    T,
    BizComponentGroupType
> & {
    employers: CollectionBizIOToObject<T, BizComponentGroupType>;
    employees: CollectionBizIOToObject<T, BizComponentGroupType>;
};
