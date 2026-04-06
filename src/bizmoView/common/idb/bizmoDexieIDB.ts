import { BizSimulator, BizSimulatorToObject } from 'bizmo/BizSimulator';
import {
    BizActionTimeline,
    BizActionTimelineToObject,
} from 'bizmo/action/BizActionTimeline';
import {
    BizComponent,
    BizComponentGroupType,
} from 'bizmo/bizComponent/BizComponent';
import {
    BizIODeserializer,
    DeserializedBizIO,
    ToBizIOObject,
} from 'bizmo/bizComponent/BizIODeserializer';
import { BizDatabase } from 'bizmo/core/db/BizDatabase';
import {
    HyperParam,
    HyperParamManager,
} from 'bizmo/core/hyperParam/HyperParamManager';
import { Timetable } from 'bizmo/core/util/Timetable';
import Dexie, { Table } from 'dexie';
import { BizIOExtData } from '../external/bizIOExtData';
import { RelationExtData } from '../external/relationExtData';

export type HyperParamTB = {
    hyperParamId: string;
    simId: string;
    json: string;
};

export type BizIoTB = {
    bizIOId: string;
    simId: string;
    toObject: ToBizIOObject<BizIOExtData>;
};

export type BizActionTimelineTB = {
    timelineId: string;
    simId: string;
    toObject: BizActionTimelineToObject<BizIOExtData, RelationExtData>;
};

/**
 * IndexedDB によるデータ永続化のためのラッパークラス
 *
 * React の必要クラスで各自直接インスタンス化するので、このクラス内にはインスタンス変数を持たせないこと。
 */
export class BizmoDexieIDB extends Dexie {
    // Followings are added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    bizSimulationTB!: Table<BizSimulatorToObject, string>;
    hyperParamTB!: Table<HyperParamTB, string>;
    bizIoTB!: Table<BizIoTB, string>;
    timelineTB!: Table<BizActionTimelineTB, string>;

    constructor() {
        super('Bizmo');
        // Primary key and indexed props
        // https://dexie.org/docs/Version/Version.stores()
        this.version(1).stores({
            bizSimulationTB: 'id, name',
            hyperParamTB: 'hyperParamId, [simId+hyperParamId], simId',
            bizIoTB: 'bizIOId, [simId+bizIOId], simId',
            timelineTB: 'timelineId, [simId+timelineId], simId',
        });
    }

    // == BizSimulation ==
    // timetable, db の実態は、BizSimulator で管理される

    async putBizSimulation(obj: BizSimulatorToObject): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.bizSimulationTB
                .put(obj)
                .then((result) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error('addBizSimulation', err);
                    resolve(false);
                });
        });
    }

    async getBizSimulation(
        id: string
    ): Promise<BizSimulatorToObject | undefined> {
        return new Promise((resolve, reject) => {
            this.bizSimulationTB
                .get(id)
                .then((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(undefined);
                    }
                })
                .catch((err) => {
                    console.error('getBizSimulation', err);
                    resolve(undefined);
                });
        });
    }

    async getBizSimulationByName(
        name: string
    ): Promise<BizSimulatorToObject | undefined> {
        return new Promise((resolve, reject) => {
            this.bizSimulationTB
                .where('name')
                .equals(name)
                .first()
                .then((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(undefined);
                    }
                })
                .catch((err) => {
                    console.error('getBizSimulation', err);
                    resolve(undefined);
                });
        });
    }

    async getAllBizSimulations(): Promise<BizSimulatorToObject[]> {
        return new Promise((resolve, reject) => {
            this.bizSimulationTB
                .toArray()
                .then((result) => {
                    resolve(result);
                })
                .catch((err) => {
                    console.error('getAllBizSimulation', err);
                    resolve([]);
                });
        });
    }

    // == HyperParam ==

    async putHyperParam(
        simId: string,
        hyperParam: HyperParam
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.hyperParamTB
                .put({
                    simId,
                    hyperParamId: hyperParam.id,
                    json: hyperParam.serialize(),
                })
                .then((result) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error('addHyperParam', err);
                    resolve(false);
                });
        });
    }

    async deleteHyperParam(
        simId: string,
        hyperParamId: string
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.hyperParamTB
                .where('[simId+hyperParamId]')
                .equals([simId, hyperParamId])
                .delete()
                .then((result) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error('deleteHyperParam', err);
                    resolve(false);
                });
        });
    }

    async getHyperParam(
        simId: string,
        hyperParamId: string
    ): Promise<HyperParam | undefined> {
        return new Promise((resolve, reject) => {
            this.hyperParamTB
                .get([simId, hyperParamId])
                .then((result) => {
                    if (result) {
                        resolve(HyperParam.fromSerialized(result.json));
                    } else {
                        resolve(undefined);
                    }
                })
                .catch((err) => {
                    console.error('getHyperParam', err);
                    resolve(undefined);
                });
        });
    }

    async getAllHyperParams(simId: string): Promise<HyperParam[]> {
        return new Promise((resolve, reject) => {
            this.hyperParamTB
                .where('simId')
                .equals(simId)
                .toArray()
                .then((result) => {
                    const hyperParams = result.map((r) =>
                        HyperParam.fromSerialized(r.json)
                    );
                    resolve(hyperParams);
                })
                .catch((err) => {
                    console.error('getAllHyperParams', err);
                    resolve([]);
                });
        });
    }

    // == BizComponent ==

    /**
     * IndexedDB の BizIO を更新する
     * 注意：　新規追加は saveBizDatabase を使うこと。
     *
     * @param param0
     * @returns
     */
    async putBizIO({
        simId,
        bizIO,
    }: {
        simId: string;
        bizIO: DeserializedBizIO<BizIOExtData>;
    }): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (bizIO) {
                this.bizIoTB
                    .put({
                        simId,
                        bizIOId: bizIO.id,
                        toObject: bizIO.toObject(),
                    })
                    .then((result) => {
                        resolve(true);
                    })
                    .catch((err) => {
                        console.error('putBizIO', err);
                        resolve(false);
                    });
            } else {
                resolve(false);
            }
        });
    }

    /**
     * BizDatabase の全レコードを IndexedDB に保存する
     * 新規BizIO追加時も、こちらを使うこと
     *
     * 注意：　内部でトポロジカルソートを行い、循環参照されていないことを確認しているため。 // ToDO: 循環参照をやめたら修正
     *
     * @param param0
     * @returns
     */
    async saveBizDatabase({
        simId,
        bizDB,
    }: {
        simId: string;
        bizDB: BizDatabase<
            BizIOExtData,
            BizComponentGroupType,
            DeserializedBizIO<BizIOExtData>
        >;
    }): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.transaction(
                'rw',
                this.bizSimulationTB,
                this.bizIoTB,
                async () => {
                    const sortedBizIOIdList = bizDB.graph.topologicalSort();
                    if (sortedBizIOIdList.isSuccess()) {
                        console.log(
                            'saveBizDatabase:: sortedBizIOIdList:value:length',
                            sortedBizIOIdList.value.length
                        );
                        const bulkData = sortedBizIOIdList.value.map(
                            (bizIOId) => ({
                                simId,
                                bizIOId,
                                toObject: bizDB.selectById(bizIOId)!.toObject(),
                            })
                        );
                        // 1. topological Sort を BizSimulation に保存
                        // * BizIOの増減に伴いSort情報は全て変更されるので、BizIOTableの更新が煩雑になるのを防ぐため。
                        // 2. topological Sort の順で BizIOTable に保存する
                        await this.bizSimulationTB
                            .where('id')
                            .equals(simId)
                            .modify({
                                dbSortedList: sortedBizIOIdList.value,
                            })
                            .then(() => {
                                // FIXME:　bulk putするなら、既存データをすべて削除しないといけない??
                                console.log(
                                    'saveBizDatabase:: bulkPut:length',
                                    bulkData.length
                                );
                                this.bizIoTB.clear().then(() => {
                                    this.bizIoTB.bulkPut(bulkData);
                                });
                            });
                    }
                }
            )
                .then((result) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error('saveBizDatabase', err);
                    resolve(false);
                });
        });
    }

    async loadBizDatabase({
        simId,
        timetable,
        hyperMG,
    }: {
        simId: string;
        timetable: Timetable;
        hyperMG: HyperParamManager;
    }): Promise<
        BizDatabase<
            BizIOExtData,
            BizComponentGroupType,
            DeserializedBizIO<BizIOExtData>
        >
    > {
        return new Promise((resolve, reject) => {
            this.bizSimulationTB
                .get(simId)
                .then((result) => {
                    if (result) {
                        const bizDB = new BizDatabase<
                            BizIOExtData,
                            BizComponentGroupType,
                            DeserializedBizIO<BizIOExtData>
                        >();
                        const promises = result.dbSortedList.map((bizIOId) =>
                            this.bizIoTB
                                .where('[simId+bizIOId]')
                                .equals([simId, bizIOId])
                                .first()
                                .then((data) => {
                                    if (data) {
                                        const bizIO =
                                            BizIODeserializer.fromObject({
                                                obj: data.toObject,
                                                db: bizDB,
                                                timetable,
                                                hyperMG,
                                            });
                                        if (bizIO) {
                                            bizDB.insert(bizIO);
                                            /*
                                            console.log(
                                                'loadBizDatabase:: bizIoTB:: OK',
                                                data.toObject.bizIOId,
                                                data.toObject.name
                                            );
                                            */
                                        } else {
                                            console.error(
                                                'loadBizDatabase:: bizIO is undefined',
                                                data.toObject
                                            );
                                        }
                                    }
                                })
                        );
                        console.log(
                            'bizmoDexie: loadBizDatabase:: start',
                            bizDB.graph.allNodes.length,
                            result.dbSortedList.length,
                            promises.length
                        );
                        Promise.all(promises)
                            .then(() => {
                                // HACK:
                                // BizIODeserializer のバグにより indexedDB に保存された以上のデータが BizDatabase に入ってしまう
                                // そのため indexedDB に存在しないデータを削除する
                                bizDB.graph.allNodes.forEach((node) => {
                                    if (
                                        !result.dbSortedList.includes(node.id)
                                    ) {
                                        //bizDB.delete(node.id);
                                        console.log(
                                            'bizmoDexie: loadBizDatabase:: not found in sortedList',
                                            node.name,
                                            node.db.resolveHierarchy(
                                                bizDB.selectById(
                                                    bizDB.bizComponentId
                                                )!,
                                                node
                                            ),
                                            node.db
                                                .ancestorsOf(node.id)
                                                .map((a) => a.name)
                                        );
                                    }
                                });

                                console.log(
                                    'bizmoDexie: loadBizDatabase:: OK',
                                    bizDB.graph.allNodes.length,
                                    result.dbSortedList.length,
                                    promises.length
                                );
                                resolve(bizDB);
                            })
                            .catch((err) => {
                                console.error('Error processing bizIoTB', err);
                                reject(err);
                            });
                    }
                })
                .catch((err) => {
                    console.error('getBizComponent', err);
                    reject();
                });
        });
    }

    // == BizActionTimeline ==

    async putBizActionTimeline({
        simId,
        timeline,
    }: {
        simId: string;
        timeline: BizActionTimeline;
    }): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.timelineTB
                .put({
                    simId,
                    timelineId: timeline.id,
                    toObject: timeline.toObject(),
                })
                .then((result) => {
                    resolve(true);
                })
                .catch((err) => {
                    console.error('addBizActionTimeline', err);
                    resolve(false);
                });
        });
    }

    async getBizActionTimeline({
        simId,
        timelineId,
        bizmoDB,
        timetable,
        hyperMG,
    }: {
        simId: string;
        timelineId: string;
        bizmoDB: BizDatabase<BizIOExtData, BizComponentGroupType>;
        timetable: Timetable;
        hyperMG: HyperParamManager;
    }): Promise<BizActionTimeline<BizIOExtData, RelationExtData> | undefined> {
        return new Promise((resolve, reject) => {
            this.timelineTB
                .where('[simId+timelineId]')
                .equals([simId, timelineId])
                .first()
                .then((result) => {
                    if (result) {
                        const timeline = BizActionTimeline.fromObject({
                            obj: result.toObject,
                            db: bizmoDB,
                            timetable,
                            hyperMG,
                        });
                        //console.log('getBizActionTimeline:: OK', timeline);
                        resolve(timeline);
                    } else {
                        console.log('getBizActionTimeline:: false');
                        resolve(undefined);
                    }
                })
                .catch((err) => {
                    console.error('getBizActionTimeline', err);
                    resolve(undefined);
                });
        });
    }

    // == BizSimulation ==

    async loadBizSimulator(name: string): Promise<BizSimulator<BizIOExtData>> {
        return new Promise(async (resolve, reject) => {
            try {
                const simObj = await this.getBizSimulationByName(name);
                if (simObj) {
                    const timetable = new Timetable(simObj.timetable);
                    //hyperMG
                    const hyperMGObj = await this.getAllHyperParams(simObj.id);
                    const hyperMG = new HyperParamManager(hyperMGObj);

                    // db
                    const db = await this.loadBizDatabase({
                        simId: simObj.id,
                        timetable: timetable,
                        hyperMG: hyperMG,
                    });

                    // component
                    const component = db.selectById<BizComponent<BizIOExtData>>(
                        simObj.componentId
                    );

                    // action
                    const actionTimeline = await this.getBizActionTimeline({
                        simId: simObj.id,
                        timelineId: simObj.timelineId,
                        timetable: timetable,
                        bizmoDB: db,
                        hyperMG,
                    });

                    const simulator = new BizSimulator<BizIOExtData>({
                        timetable,
                        db,
                        hyperMG,
                        timeline: actionTimeline,
                        component,
                        id: simObj.id,
                        name: simObj.name,
                    });

                    // simulator
                    resolve(simulator);
                } else {
                    console.error('not found BizSimulator');
                    reject();
                }
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }

    async saveBizSimulator(simulator: BizSimulator<BizIOExtData>) {
        // save  on indexedDB
        this.putBizSimulation(simulator.toObject());
        this.saveBizDatabase({
            simId: simulator.id,
            bizDB: simulator.db,
        });
        this.putBizActionTimeline({
            simId: simulator.id,
            timeline: simulator.timeline,
        });
    }
}
