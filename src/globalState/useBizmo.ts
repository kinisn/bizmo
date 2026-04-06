import { BizSimulator } from 'bizmo/BizSimulator';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import { FinancingActions } from 'bizmo/action/template/FinancingActions';
import { HRActions } from 'bizmo/action/template/hr/HRActions';
import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import { StaffRole } from 'bizmo/bizComponent/bizActors/company/StaffBizActors';
import { UserState } from 'bizmo/bizComponent/bizActors/user/UserState';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import { RateComponent } from 'bizmo/core/bizIO/component/RateComponent';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import {
    HyperParam,
    HyperParamManager,
} from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import {
    BizIOExtData,
    createBizIOExtData,
} from 'bizmoView/common/external/bizIOExtData';
import { BizmoDexieIDB } from 'bizmoView/common/idb/bizmoDexieIDB';
import Decimal from 'decimal.js';

// ZUSTAND

import { BizActionTimeline } from 'bizmo/action/BizActionTimeline';
import { DeserializedBizIO } from 'bizmo/bizComponent/BizIODeserializer';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { create } from 'zustand';

export type BizmoState = {
    simulator: BizSimulator<BizIOExtData> | null;
    /*
    db: BizDatabase<BizIOExtData, BizComponentGroupType> | null;
    hyperMG: HyperParamManager | null;
    timetable: Timetable | null;
    timeline: BizActionTimeline<BizIOExtData, RelationExtData> | null;
    // BizComponent
    bizComponent: BizComponent<BizIOExtData> | null;
    */
};

export type BizmoStateAlias = {
    db: () => BizDatabase<BizIOExtData, BizComponentGroupType>;
    hyperMG: () => HyperParamManager;
    timetable: () => Timetable;
    timeline: () => BizActionTimeline<BizIOExtData, RelationExtData>;
    bizComponent: () => BizComponent<BizIOExtData>;
};

export type BizmoActions = {
    // simulator
    loadSimulator: (simId: string) => Promise<void>;

    // hyperParam
    putHyperParam: (hyperParam: HyperParam) => Promise<void>;
    removeHyperParams: (hyperParamIds: Array<string>) => Promise<void>;

    // db & BizComponent
    addBizIO: ({
        parentBizIO,
        childBizIO,
    }: {
        parentBizIO: DeserializedBizIO<BizIOExtData>;
        childBizIO: DeserializedBizIO<BizIOExtData>;
    }) => Promise<void>;
    updateBizIO: (bizIO: DeserializedBizIO<BizIOExtData>) => Promise<void>;
    removeBizIO: ({
        parentBizIO,
        removingBizIO,
    }: {
        parentBizIO: DeserializedBizIO<BizIOExtData>;
        removingBizIO: DeserializedBizIO<BizIOExtData>;
    }) => Promise<void>;

    // BizAction

    // save / update
    putBizAction: (
        bizAction: BizAction<BizIOExtData, RelationExtData>
    ) => Promise<void>;

    /*
    updateBizAction: (
        bizAction: BizAction<BizIOExtData, RelationExtData>
    ) => Promise<void>;
    */
    //removeBizAction: (bizActionId: string) => Promise<void>;
};

export type BizmoStore = BizmoState & BizmoStateAlias & BizmoActions;

export const useBizmo = create<BizmoStore>()((set, get) => ({
    simulator: null,

    // == Alias ==
    db: () => get().simulator!.db,
    hyperMG: () => get().simulator!.hyperMG,
    timetable: () => get().simulator!.timetable,
    timeline: () => get().simulator!.timeline,
    bizComponent: () => get().simulator!.component,

    // == Actions ==
    loadSimulator: async (name: string) => {
        // Dexieを使用してBizSimulatorをロード

        await new BizmoDexieIDB()
            .loadBizSimulator(name)
            .then((simulator) => {
                // set state
                set({
                    simulator,
                });
                console.log(
                    'useBizmo: loadSimulator',
                    simulator.id,
                    simulator.db.graph.allNodes.length,
                    simulator
                );
            })
            .catch((e) => {
                const defaultSimulator = new BizSimulator<BizIOExtData>({
                    name: 'BizSimulator',
                });
                console.log('useBizmo: loadSimulator :err', defaultSimulator);
                if (true) {
                    // debug
                    initSimulator()
                        .then((simulator) => {
                            console.log(
                                'useBizmo: initSimulator',
                                simulator.id,
                                simulator.db.graph.allNodes.length,
                                simulator
                            );
                            set({
                                simulator: simulator,
                            });
                        })
                        .catch((e) => {
                            set({
                                simulator: defaultSimulator,
                            });
                        });
                } else {
                    set({
                        simulator: defaultSimulator,
                    });
                }
            });
    },

    // == HyperParam ==
    putHyperParam: async (hyperParam: HyperParam) => {
        const simulator = get().simulator;
        if (simulator) {
            await new BizmoDexieIDB()
                .putHyperParam(simulator.id, hyperParam)
                .then(() => {
                    simulator.hyperMG.set({ data: hyperParam });
                    set({ simulator: simulator });
                    console.log('useBizmo: putHyperParam', get().hyperMG());
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
    removeHyperParams: async (hyperParamIds: Array<string>) => {
        const simulator = get().simulator;
        if (simulator) {
            const idb = new BizmoDexieIDB();
            hyperParamIds.forEach(async (hyperParamId) => {
                await idb
                    .deleteHyperParam(simulator.id, hyperParamId)
                    .then(() => {
                        simulator.hyperMG.removeByID(hyperParamId);
                        set({ simulator: simulator });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
        }
    },

    // == BizComponen w/ DB ==

    addBizIO: async ({
        parentBizIO,
        childBizIO,
    }: {
        parentBizIO: DeserializedBizIO<BizIOExtData>;
        childBizIO: DeserializedBizIO<BizIOExtData>;
    }) => {
        const simulator = get().simulator;
        if (
            simulator &&
            parentBizIO &&
            childBizIO &&
            parentBizIO instanceof CollectionBizIO
        ) {
            console.log(
                'useBizmo: addBizIO: db.length',
                parentBizIO?.db.graph.allNodes.length
            );
            const result = (parentBizIO as CollectionBizIO).appendChild(
                childBizIO
            );
            if (result) {
                await new BizmoDexieIDB()
                    .saveBizDatabase({
                        simId: simulator.id,
                        bizDB: parentBizIO.db,
                    })
                    .then(() => {
                        set({ simulator: simulator });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    },
    /**
     * BizIO を更新を state に保存しつつ永続化する
     * BizIOそのものの更新は事前に行われている前提
     * @param updatedBizIO
     */
    updateBizIO: async (updatedBizIO: DeserializedBizIO<BizIOExtData>) => {
        const simulator = get().simulator;
        if (simulator && updatedBizIO) {
            // 1つのBizIOを変更するだけなので、DB全体の再構築は不要とする。
            // もし内部でBizIOの追加・削除がある場合は、DB全体の再構築が必要

            console.log('useBizmo: updateBizIO:0', updatedBizIO);
            await new BizmoDexieIDB()
                .putBizIO({
                    simId: simulator.id,
                    bizIO: updatedBizIO,
                })
                .then((result) => {
                    if (result) {
                        const bizComponent: BizComponent<BizIOExtData> =
                            updatedBizIO.db.selectById(
                                updatedBizIO.db.bizComponentId
                            )!; // 必ず存在するはず

                        set({ simulator: simulator });
                        console.log(
                            'useBizmo: updateBizIO: done',
                            updatedBizIO
                        );
                    } else {
                        console.log(
                            'useBizmo: updateBizIO: failed to putBizIO'
                        );
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },

    /**
     * Remove BizIO
     * @param param0
     */
    removeBizIO: async ({
        parentBizIO,
        removingBizIO,
    }: {
        parentBizIO: DeserializedBizIO<BizIOExtData>;
        removingBizIO: DeserializedBizIO<BizIOExtData>;
    }) => {
        const simulator = get().simulator;
        if (simulator && removingBizIO) {
            // == 前提処理 ==
            // TODO: BizActionなどで利用されている場合には、削除することができないように確認する

            // == 削除処理 ==
            if (parentBizIO && parentBizIO instanceof CollectionBizIO) {
                parentBizIO.removeChild(removingBizIO.id);
            }

            // もう Parent がない場合には、自分自身をdbから削除
            const parentBizIOs = parentBizIO.db.parentsOf(removingBizIO.id);
            if (parentBizIOs.length == 0) {
                removingBizIO.delete(true);
            }

            // ToDo :  BizComponent の再設定が必要化？
            await new BizmoDexieIDB()
                .saveBizDatabase({
                    simId: simulator.id,
                    bizDB: removingBizIO.db,
                })
                .then(() => {
                    set({ simulator: simulator });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },

    // == BizAction ==
    putBizAction: async (
        bizAction: BizAction<BizIOExtData, RelationExtData>
    ) => {
        const simulator = get().simulator;

        if (simulator) {
            simulator.timeline.setAction(bizAction);
            await new BizmoDexieIDB()
                .putBizActionTimeline({
                    simId: simulator.id,
                    timeline: simulator.timeline,
                })
                .then(() => {
                    //set({ simulator });
                    console.log('useBizmo: putBizAction: done', bizAction);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    },
}));

// == Demo & Debug ==

export async function initSimulator(): Promise<BizSimulator<BizIOExtData>> {
    return new Promise(async (resolve, reject) => {
        let simulator = new BizSimulator<BizIOExtData>({
            name: 'BizSimulator',
        });
        simulator = dummyData(simulator);

        // save to IDB
        await new BizmoDexieIDB().saveBizSimulator(simulator);

        resolve(simulator);
    });
}

function dummyData(
    simulator: BizSimulator<BizIOExtData>
): BizSimulator<BizIOExtData> {
    // ============================================================
    // Sunrise Coffee — コーヒーショップ事業シミュレーション
    // ============================================================

    // === 外部環境 ===
    simulator.component.environment.addSeedMonetaryIO('コーヒー豆国際価格');
    const e_pop =
        simulator.component.environment.addSeedCategory('商圏人口');
    const e_pop_office = e_pop!.addSeedAmountIO('オフィスワーカー人口');
    const e_pop_student = e_pop!.addSeedAmountIO('学生人口');
    const rate_pop = new RateComponent<BizIOExtData, BizComponentGroupType>({
        timetable: e_pop!.timetable,
        db: e_pop!.db,
        hyperMG: e_pop!.hyperMG,
        name: 'オフィスワーカー比率',
        numerator: e_pop_office!,
        denominator: e_pop_student!,
    });
    simulator.component.environment.appendChild(rate_pop);

    // === 仕入先・協力者 ===
    // 仕入先グループ: 左側に配置
    simulator.component.collaborators.externalData = createBizIOExtData();
    simulator.component.collaborators.externalData.view.visibleOnCanvas = true;
    simulator.component.collaborators.externalData.view.position = {
        x: -700,
        y: 0,
    };

    const c_coffee =
        simulator.component.collaborators.addSeedCollaborator('山田珈琲農園');
    const c_coffee_cost = c_coffee?.addSeedMonetaryIO('豆仕入原価');
    c_coffee?.addSeedAmountIO('豆在庫（kg）');
    c_coffee!.externalData = createBizIOExtData();
    c_coffee!.externalData.view.visibleOnCanvas = true;
    c_coffee!.externalData.view.position = { x: -600, y: -350 };

    const c_sweets =
        simulator.component.collaborators.addSeedCollaborator('佐藤製菓');
    c_sweets?.addSeedMonetaryIO('菓子仕入原価');
    c_sweets?.addSeedAmountIO('菓子在庫');
    c_sweets!.externalData = createBizIOExtData();
    c_sweets!.externalData.view.visibleOnCanvas = true;
    c_sweets!.externalData.view.position = { x: -600, y: 150 };

    // === 自社: Sunrise Coffee ===
    // 中央に配置
    simulator.component.company.setName('Sunrise Coffee');
    simulator.component.company.externalData = createBizIOExtData();
    simulator.component.company.externalData.view.visibleOnCanvas = true;
    simulator.component.company.externalData.view.position = {
        x: 0,
        y: 0,
    };

    // スタッフ: 自社の上に配置
    simulator.component.company.staffs.externalData = createBizIOExtData();
    simulator.component.company.staffs.externalData.view.visibleOnCanvas = true;
    simulator.component.company.staffs.externalData.view.position = {
        x: 0,
        y: -350,
    };

    simulator.component.company.staffs.employees.externalData =
        createBizIOExtData();
    simulator.component.company.staffs.employees.externalData.view.visibleOnCanvas =
        true;
    simulator.component.company.staffs.employees.externalData.view.position = {
        x: -200,
        y: -500,
    };

    simulator.component.company.staffs.employers.externalData =
        createBizIOExtData();
    simulator.component.company.staffs.employers.externalData.view.visibleOnCanvas =
        true;
    simulator.component.company.staffs.employers.externalData.view.position = {
        x: 200,
        y: -500,
    };

    // 役員: 田中太郎（オーナー）
    const owner =
        simulator.component.company.staffs.addSeedEmployer('田中太郎');
    owner!.externalData = createBizIOExtData();
    owner!.externalData.view.visibleOnCanvas = false;

    // 従業員: 初期メンバー
    const emp1 =
        simulator.component.company.staffs.addSeedEmployee('鈴木花子');
    emp1!.externalData = createBizIOExtData();
    emp1!.externalData.view.visibleOnCanvas = false;

    const emp2 =
        simulator.component.company.staffs.addSeedEmployee('佐藤次郎');
    emp2!.externalData = createBizIOExtData();
    emp2!.externalData.view.visibleOnCanvas = false;

    // === 顧客セグメント ===
    // 右側に配置
    simulator.component.userLifeCycles.setName('顧客セグメント');
    simulator.component.userLifeCycles.externalData = createBizIOExtData();
    simulator.component.userLifeCycles.externalData.view.visibleOnCanvas = true;
    simulator.component.userLifeCycles.externalData.view = {
        visibleOnCanvas: true,
        position: { x: 600, y: 0 },
        avatarConf: {
            size: { height: 100, width: 100 },
            hasShadow: true,
        },
        avatarImage: '',
    };

    const seg_office =
        simulator.component.userLifeCycles.addSeedUsersLifeCycle(
            'オフィスワーカー層'
        );
    seg_office!.externalData = createBizIOExtData();
    seg_office!.externalData.view.visibleOnCanvas = true;
    seg_office!.externalData.view.position = { x: 600, y: -250 };
    seg_office!.externalData.view.avatarConf = {
        size: { height: 100, width: 100 },
        hasShadow: true,
    };

    const t_direct = seg_office?.addSeedUsers(
        '直接マーケティング対象',
        UserState.REACHABLE_TARGET
    );
    t_direct?.addSeedContent('SNS広告経由');
    t_direct?.addSeedContent('チラシ経由');

    const t_indirect = seg_office?.addSeedUsers(
        '間接マーケティング対象',
        UserState.UNREACHABLE_TARGET
    );
    t_indirect?.addSeedContent('口コミ経由');
    t_indirect?.addSeedContent('通りすがり');

    const t_each = seg_office?.addSeedUsers(
        '都度購入者',
        UserState.EACH_TIME_PURCHASER
    );
    t_each?.addSeedContent('テイクアウト客');
    t_each?.addSeedContent('イートイン客');

    const t_sub = seg_office?.addSeedUsers(
        'サブスク会員',
        UserState.SUBSCRIBER,
        true
    );
    t_sub?.addSeedContent('月額プラン会員');
    t_sub?.addSeedContent('年額プラン会員');

    const seg_student =
        simulator.component.userLifeCycles.addSeedUsersLifeCycle(
            '学生・若年層'
        );
    seg_student!.externalData = createBizIOExtData();
    seg_student!.externalData.view.visibleOnCanvas = true;
    seg_student!.externalData.view.position = { x: 600, y: 250 };
    seg_student!.externalData.view.avatarConf = {
        size: { height: 100, width: 100 },
        hasShadow: true,
    };

    // === BizAction ===

    // 仕入アクション: 仕入先 → 自社
    const funcPurchase = new BizFunction({
        code: 'bizio0',
        orderedBizIOConf: [new BizIOConf(emp1?.id!, 1)],
    });

    const companyOutput =
        simulator.component.company.addSeedAmountIO('月間販売杯数');

    const actionPurchase = new BizAction({
        timetable: simulator.timetable,
        db: simulator.db,
        hyperMG: simulator.hyperMG,
        name: '豆仕入アクション',
        orderedFunctions: [funcPurchase],
        outputs: [
            new BizProcOutput({
                outputId: 'PURCHASE_OUT',
                parentId: c_coffee!.id,
                outputBizId: c_coffee_cost!.id,
                outputFuncId: funcPurchase.funcId,
                outputMode: BizProcOutputMode.SUB,
            }),
        ],
    });
    const relPurchase = new BizRelation({
        relationId: 'REL_PURCHASE',
        fromBizIOId: simulator.component.company.id,
        toBizIOId: c_coffee!.id,
    });
    actionPurchase.setRelation(relPurchase);

    // HR: バリスタ採用
    const hrTemplate = new HRActions({
        timetable: simulator.timetable,
        db: simulator.db,
        hyperMG: simulator.hyperMG,
        bizComponent: simulator.component,
        priorityGenerator: simulator.timeline.priorityGenerator,
    });

    const actionHireBarista = hrTemplate.createHireStaff({
        staffRole: StaffRole.EMPLOYEES,
        staffName: 'バリスタ',
        numberOfHiring: BizFunction.makeInputDecimal(new Decimal(3)),
        hiringUnitCost: BizFunction.makeInputDecimal(new Decimal(200_000)),
        workingUnitCost: BizFunction.makeInputDecimal(new Decimal(250_000)),
        actionName: 'バリスタ採用',
    });

    // HR: 店長採用
    const actionHireManager = hrTemplate.createHireStaff({
        staffRole: StaffRole.EMPLOYERS,
        staffName: '店長',
        numberOfHiring: BizFunction.makeInputDecimal(new Decimal(1)),
        hiringUnitCost: BizFunction.makeInputDecimal(new Decimal(300_000)),
        workingUnitCost: BizFunction.makeInputDecimal(new Decimal(400_000)),
        actionName: '店長採用',
    });

    // B/S 初期設定
    const financing = new FinancingActions({
        timetable: simulator.timetable,
        db: simulator.db,
        hyperMG: simulator.hyperMG,
        bizComponent: simulator.component,
        priorityGenerator: simulator.timeline.priorityGenerator,
    });
    const bsSetup = financing.createBalanceSheetSetup(
        new Map<AccountNames, Decimal>([
            [AccountNames.BS_CASH_AND_DEPOSITS, new Decimal(10_000_000)],
            [AccountNames.BS_SHARE_CAPITAL, new Decimal(10_000_000)],
        ]),
        undefined,
        'B/S初期値設定'
    );

    // タイムラインに登録
    simulator.timeline.setAction(bsSetup);
    simulator.timeline.setAction(actionPurchase);
    simulator.timeline.setAction(actionHireBarista);
    simulator.timeline.setAction(actionHireManager);

    return simulator;
}
