import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { BizmoDexieIDB } from 'bizmoView/common/idb/bizmoDexieIDB';
import {
    IDBDownloadButton,
    JSONDownloadButton,
} from 'bizmoView/common/util/download';
import { useBizmo } from 'globalState/useBizmo';
import { Fragment } from 'react';

// === DEBUG ===

export const DebugPanel = () => {
    const bizmo = useBizmo();
    const idb = new BizmoDexieIDB();

    const downloadIDB = [
        {
            label: 'bizSimulationTB',
            idb: idb.bizSimulationTB,
        },
        {
            label: 'bizIoTB',
            idb: idb.bizIoTB,
        },
        {
            label: 'timelineTB',
            idb: idb.timelineTB,
        },
        {
            label: 'hyperParamTB',
            idb: idb.hyperParamTB,
        },
    ];

    const indexedMap = new Map<string, any>();
    const indexedNameMap = new Map<string, any>();
    idb.bizIoTB.toArray().then((records) => {
        // db on memory & indexedDB
        // db の方がデータが多い原因を確認する。indexed に重複がないか、
        records.forEach((bizIo) => {
            if (bizIo.toObject.bizIOId && bizIo.toObject.name) {
                if (indexedMap.has(bizIo.toObject.bizIOId)) {
                    console.log('duplicate', bizIo.toObject.bizIOId);
                } else {
                    indexedMap.set(bizIo.toObject.bizIOId, bizIo.toObject);
                }

                if (indexedNameMap.has(bizIo.toObject.name)) {
                    console.log('duplicate name', bizIo.toObject.name);
                } else {
                    indexedNameMap.set(bizIo.toObject.name, bizIo.toObject);
                }
            }
        });
        if (records.length !== indexedMap.size) {
            console.error('indexedDB have duplicated records.');
        } else {
            console.log(
                'indexedDB does NOT have duplicated records. OK!!',
                indexedMap.size
            );
        }

        // indexed がすべて db にあるか
        const notIncludedIDB = new Map<
            string,
            BizIO<BizIOExtData, BizComponentGroupType>
        >();
        const includedIDB = new Map<
            string,
            BizIO<BizIOExtData, BizComponentGroupType>
        >();
        bizmo.db().graph.allNodes.forEach((node) => {
            if (node.id) {
                if (!indexedMap.has(node.id)) {
                    notIncludedIDB.set(node.id, node);
                } else {
                    includedIDB.set(node.id, node);
                }
            } else {
                console.error('node has no id. error!', node);
            }
        });
        if (includedIDB.size === indexedMap.size) {
            console.log(
                'bizmoDB is all stored on IDB.',
                indexedMap.size,
                includedIDB.size,
                notIncludedIDB.size
            );
        } else {
            console.log(
                'bizmoDB is NOT all stored on IDB.',
                indexedMap.size,
                includedIDB.size,
                notIncludedIDB.size
            );
        }

        // notIncludedIDB の正体は、indexedMap の重複か？
        const duplicatedMap = new Map<
            string,
            BizIO<BizIOExtData, BizComponentGroupType>[]
        >();
        const nonDuplicatedMap = new Map<
            string,
            BizIO<BizIOExtData, BizComponentGroupType>[]
        >();
        notIncludedIDB.forEach((node) => {
            if (indexedMap.has(node.id)) {
                duplicatedMap.set(node.id, [
                    ...(duplicatedMap.get(node.id) ?? []),
                    node,
                ]);
            } else {
                nonDuplicatedMap.set(node.id, [
                    ...(duplicatedMap.get(node.id) ?? []),
                    node,
                ]);
            }
        });
        console.log('duplicatedMap on notIncludedIDB', duplicatedMap.size);

        // indexedDB にある名称で db にないものがないか
        // 名称での重複を確認する
        const duplicatedNameMap = new Map<
            string,
            Array<{
                target: BizIO<BizIOExtData, BizComponentGroupType>;
                parents:
                    | CollectionBizIO<BizIOExtData, BizComponentGroupType>[]
                    | undefined;
                parentInIDB: boolean;
            }>
        >();
        const nonDuplicatedNameMap = new Map<
            string,
            Array<{
                target: BizIO<BizIOExtData, BizComponentGroupType>;
                parents:
                    | CollectionBizIO<BizIOExtData, BizComponentGroupType>[]
                    | undefined;
                parentInIDB: boolean;
            }>
        >();
        nonDuplicatedMap.forEach((nodes) => {
            const node = nodes[0];
            if (node.name) {
                if (indexedNameMap.has(node.name)) {
                    const tempDuplicatedNameMap = (
                        duplicatedNameMap.get(node.name) ?? []
                    ).concat({
                        target: node,
                        parents: node.parents,
                        parentInIDB: includedIDB.has(node.id),
                    });
                    duplicatedNameMap.set(node.name, tempDuplicatedNameMap);
                } else {
                    const tempNonDuplicatedNameMap = (
                        nonDuplicatedNameMap.get(node.name) ?? []
                    ).concat({
                        target: node,
                        parents: node.parents,
                        parentInIDB: includedIDB.has(node.id),
                    });
                    nonDuplicatedNameMap.set(
                        node.name,
                        tempNonDuplicatedNameMap
                    );
                }
            }
        });
        console.log(
            'duplicatedNameMap on indexedNameMap',
            duplicatedNameMap,
            nonDuplicatedNameMap
        );
    });

    return (
        <div>
            {downloadIDB.map((download, index) => {
                return (
                    <Fragment key={index}>
                        <IDBDownloadButton
                            idb={download.idb}
                            label={download.label}
                        />
                    </Fragment>
                );
            })}
            <JSONDownloadButton
                json={JSON.stringify(
                    bizmo.db().graph.allNodes.map((node) => node.toObject())
                )}
                label={`db`}
            />
        </div>
    );
};
