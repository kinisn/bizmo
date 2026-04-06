import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Breadcrumbs, Button, Chip, Tab, Tooltip } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import {
    CollectionBizIO,
    CollectionSummarizeMode,
} from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { FunnelComponent } from 'bizmo/core/bizIO/component/FunnelComponent';
import { RateComponent } from 'bizmo/core/bizIO/component/RateComponent';
import { UnitComponent } from 'bizmo/core/bizIO/component/UnitComponent';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizIOExtData,
    createBizIOExtData,
} from 'bizmoView/common/external/bizIOExtData';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import { Dispatch, SyntheticEvent, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { BizIOComponentForm } from './form/BizIOComponentForm';
import { BizIOComponentIcon, BizIOIndicatorIcon } from './icon/IconUtil';
import { CollectionViewerMode } from './parts/collectionViewer/CollectionViewerParts';
import { ListViewFilterForm } from './parts/collectionViewer/ListViewParts';
import { BizIOStructureDetailView } from './view/BizIOStructureDetailView';
import { BizIOStructureEditView } from './view/BizIOStructureEditView';
import { BizIOViewSetting } from './view/BizIOViewSetting';
import { TimeSeriesView } from './view/TimeSeriesView';

export type BizIOComponentMode = 'editor' | 'selector' | 'viewer';

export type BizIOSComponentTabs = 'data' | 'view' | 'timeseries';

export type BizIOSelectableMode = 'hasValueOnly' | 'all' | 'bizActorOnly';

export type BizIOComponentInnerMode =
    | 'detail'
    | 'addNew'
    | 'addBySelection'
    | 'update';

export type BizIOComponentState = {
    componentMode: BizIOComponentMode;
    rootNodeId: string;
    innerMode: BizIOComponentInnerMode;
    // tab
    selectedTab: BizIOSComponentTabs;
    // selected
    selectedNodeId: string;
    selectedHierarchy: string[];
    // form
    formData: BizIOComponentForm | undefined;
    // tree or list
    isTreeView: boolean;
    isDeleteMode: boolean;
    // tree style
    expandedNodeIds: string[];
    hoverNodeId?: string;
    // list style
    listPage: number;
    listRowsPerPage: number;
    // list filter
    isFilterOpened: boolean;
    filterData: ListViewFilterForm | undefined;

    // == sideEffect ==
    sideEffect: BizIOComponentAction | undefined;
};

export type BizIOComponentAction =
    // side Effect
    | {
          type: 'doneSideEffect';
      }
    // tab select
    | {
          type: 'changeTab';
          selectedTab: BizIOSComponentTabs;
      }
    // tree style
    | {
          type: 'enterTree';
          nodeId: string;
      }
    | {
          type: 'leaveTree';
          nodeId: string;
          parentId: string | undefined;
      }
    | {
          type: 'toggleTree';
          nodeIds: string[];
      }
    //
    | {
          type: 'selectBizIO';
          selectedID: string;
          hierarchyIDs: string[];
      }
    | {
          type: 'startUpdateBizIO';
          targetId: string;
          hierarchyIDs: string[];
      }
    | {
          type: 'updatedBizIO';
          targetId: string;
          formData: BizIOComponentForm;
      }
    | {
          type: 'startAddBizIO';
          targetId: string;
          hierarchyIDs: string[];
      }
    | {
          type: 'rerenderCurrentFormData';
          formData: BizIOComponentForm;
      }
    | {
          type: 'addBizIO';
          targetId: string;
          formData: BizIOComponentForm;
      }
    | {
          type: 'removeBizIO';
          targetId: string;
          parentId: string;
      }
    | {
          type: 'changeCollectionViewerMode';
          mode: CollectionViewerMode;
      }
    | {
          type: 'changeListViewPage';
          page: number;
      }
    | {
          type: 'changeListViewRowsPerPage';
          rowsPerPage: number;
      }
    | {
          type: 'changeFilterOpened';
          filterOpened: boolean;
      }
    | {
          type: 'changeListViewFilter';
          filterData: ListViewFilterForm;
      }
    // add Child
    | {
          type: 'startAddChild';
          targetId: string;
          hierarchyIDs: string[];
      }
    | {
          type: 'addChild';
          targetId: BizIOId;
          addChildren: Array<{ bizId: BizIOId }>;
      }
    // change Delete Mode
    | {
          type: 'changeDeleteMode';
      };

export const BizIOComponent = (
    props:
        | {
              componentMode: 'selector';
              rootCollection: BizIO<BizIOExtData, BizComponentGroupType>;
              selectHandler: (
                  bizIO: BizIO<BizIOExtData, BizComponentGroupType>
              ) => void;
              selectedBizIO?: BizIO<BizIOExtData, BizComponentGroupType>;
              selectableMode?: BizIOSelectableMode;
          }
        | {
              componentMode: 'viewer';
              rootCollection: BizIO<BizIOExtData, BizComponentGroupType>;
              selectHandler?: (
                  bizIO: BizIO<BizIOExtData, BizComponentGroupType>
              ) => void;
              selectedBizIO: BizIO<BizIOExtData, BizComponentGroupType>;
          }
        | {
              componentMode: 'editor';
              rootCollection: CollectionBizIO<
                  BizIOExtData,
                  BizComponentGroupType
              >;
              selectHandler?: (
                  bizIO: BizIO<BizIOExtData, BizComponentGroupType>
              ) => void;
              selectedBizIO?: BizIO<BizIOExtData, BizComponentGroupType>;
          }
) => {
    const { rootCollection, componentMode, selectHandler, selectedBizIO } =
        props;
    const selectableMode =
        componentMode == 'selector' ? props.selectableMode : undefined;

    // Bizmo
    const bizmo = useBizmo();

    // Hierarchy
    const hierarchy = rootCollection.db.resolveHierarchy(
        rootCollection,
        selectedBizIO
    );

    const { t } = useTranslation();
    const [treeState, dispatchBizIOComponent] = useReducer(
        (state: BizIOComponentState, action: BizIOComponentAction) => {
            switch (action.type) {
                // side Effect
                case 'doneSideEffect':
                    return {
                        ...state,
                        sideEffect: undefined,
                    };
                // tab
                case 'changeTab':
                    return {
                        ...state,
                        innerMode: 'detail' as 'detail',
                        formData: undefined,
                        selectedTab: action.selectedTab,
                    };
                // tree or list
                case 'changeCollectionViewerMode':
                    return {
                        ...state,
                        isTreeView: action.mode == 'tree' ? true : false,
                    };
                // tree style
                case 'enterTree':
                    return {
                        ...state,
                        hoverNodeId: action.nodeId,
                    };
                case 'leaveTree':
                    return {
                        ...state,
                        hoverNodeId: action.parentId,
                    };
                case 'toggleTree':
                    return {
                        ...state,
                        expandedNodeIds: action.nodeIds,
                    };
                // item button
                case 'selectBizIO':
                    return {
                        ...state,
                        selectedNodeId: action.selectedID,
                        selectedHierarchy: action.hierarchyIDs,
                        innerMode: 'detail' as 'detail',
                        listPage: 0,
                        filterData: undefined,
                        formData: undefined,
                    };
                // addNew
                case 'startAddBizIO':
                    return {
                        ...state,
                        innerMode: 'addNew' as 'addNew',
                        selectedNodeId: action.targetId,
                        selectedHierarchy: action.hierarchyIDs,
                        formData: undefined,
                        listPage: 0,
                        filterData: undefined,
                    };
                case 'addBizIO':
                    return {
                        ...state,
                        innerMode: 'detail' as 'detail',
                        formData: undefined,
                        sideEffect: action,
                    };
                // edit
                case 'startUpdateBizIO':
                    return {
                        ...state,
                        innerMode: 'update' as 'update',
                        selectedNodeId: action.targetId,
                        selectedHierarchy: action.hierarchyIDs,
                        formData: undefined,
                        listPage: 0,
                        filterData: undefined,
                    };
                case 'rerenderCurrentFormData':
                    console.log('rerenderCurrentFormData', action, state);
                    return {
                        ...state,
                        formData: action.formData,
                    };
                case 'updatedBizIO':
                    return {
                        ...state,
                        innerMode: 'detail' as 'detail',
                        formData: undefined,
                        sideEffect: action,
                    };
                // remove
                case 'removeBizIO':
                    return {
                        ...state,
                        innerMode: 'detail' as 'detail',
                        selectedNodeId: state.rootNodeId,
                        selectedHierarchy: [state.rootNodeId],
                        formData: undefined,
                        sideEffect: action,
                    };
                case 'changeDeleteMode':
                    return {
                        ...state,
                        isDeleteMode: !state.isDeleteMode,
                    };
                // list style
                case 'changeListViewPage':
                    return {
                        ...state,
                        listPage: action.page,
                    };
                case 'changeListViewRowsPerPage':
                    return {
                        ...state,
                        listRowsPerPage: action.rowsPerPage,
                        listPage: 0,
                    };
                // list filter
                case 'changeFilterOpened':
                    return {
                        ...state,
                        isFilterOpened: action.filterOpened,
                    };
                case 'changeListViewFilter':
                    return {
                        ...state,
                        filterData: action.filterData,
                    };
                // add child
                case 'startAddChild':
                    return {
                        ...state,
                        innerMode: 'addBySelection' as 'addBySelection',
                        formData: undefined,
                    };
                case 'addChild':
                    return {
                        ...state,
                        innerMode: 'detail' as 'detail',
                        selectedNodeId: state.rootNodeId,
                        selectedHierarchy: [state.rootNodeId],
                        formData: undefined,
                        sideEffect: action,
                    };
                default:
                    return state;
            }
        },
        {
            componentMode: componentMode,
            innerMode: 'detail' as 'detail',
            rootNodeId: rootCollection.id,
            selectedTab: componentMode === 'selector' ? 'data' : 'timeseries',
            selectedNodeId: hierarchy ? selectedBizIO!.id : rootCollection.id,
            selectedHierarchy: hierarchy?.map((bizIO) => bizIO.id) ?? [
                rootCollection.id,
            ],
            expandedNodeIds: [],
            isDeleteMode: false,
            isTreeView: true,
            formData: undefined,
            listPage: 0,
            listRowsPerPage: 5,
            isFilterOpened: false,
            filterData: undefined,
            // sideEffect
            sideEffect: undefined,
        }
    );

    // Side Effect
    useEffect(() => {
        if (treeState.sideEffect) {
            console.log(
                'BizIOComponent: sideEffect',
                rootCollection.db.graph.allNodes.length,
                treeState.sideEffect
            );
            switch (treeState.sideEffect.type) {
                case 'addChild':
                    const addTargetIO = rootCollection.db.selectById(
                        treeState.sideEffect.targetId
                    );
                    if (addTargetIO instanceof CollectionBizIO) {
                        treeState.sideEffect.addChildren.forEach((child) => {
                            addTargetIO.appendChild(
                                rootCollection.db.selectById(child.bizId)!
                            );
                        });
                    }
                    break;
                case 'addBizIO':
                    // selectedNode は必ず存在する
                    const targetBizIO = rootCollection.db.selectById(
                        treeState.sideEffect.targetId
                    )!;
                    if (targetBizIO instanceof CollectionBizIO) {
                        let childBizIO:
                            | CollectionBizIO<
                                  BizIOExtData,
                                  BizComponentGroupType
                              >
                            | BizActors<BizIOExtData>
                            | UnitComponent<BizIOExtData, BizComponentGroupType>
                            | RateComponent<BizIOExtData, BizComponentGroupType>
                            | FunnelComponent<
                                  BizIOExtData,
                                  BizComponentGroupType
                              >
                            | BizIO<BizIOExtData, BizComponentGroupType>
                            | undefined = undefined;

                        const externalData: BizIOExtData = createBizIOExtData();
                        externalData.structure.memo =
                            treeState.sideEffect.formData.structure_memo;

                        const commonBase = {
                            // common
                            timetable: targetBizIO.timetable,
                            db: targetBizIO.db,
                            name: treeState.sideEffect.formData.name,
                            isUserNamed: true,
                            accountName: AccountNames.INHERITANCE,
                            externalData: externalData,
                            externalGroupName: 'NOT_BELONGED' as 'NOT_BELONGED',

                            // for collection
                            hyperMG: targetBizIO.hyperMG,
                            summarizeMode: CollectionSummarizeMode.NO_SUMMARIZE,
                        };

                        const hasOwnValueBase = {
                            ...commonBase,
                            accountName:
                                treeState.sideEffect.formData.accountName,
                            complement: Boolean(
                                treeState.sideEffect.formData.complement
                            ),
                            isMonetary: Boolean(
                                treeState.sideEffect.formData.isMonetary
                            ),
                        };

                        switch (treeState.sideEffect.formData.type) {
                            case 'BizActors':
                                childBizIO = new BizActors<BizIOExtData>(
                                    commonBase
                                );
                                break;
                            case 'UnitComponent':
                                childBizIO = new UnitComponent<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >({
                                    ...commonBase,
                                    amountComplement: Boolean(
                                        treeState.sideEffect.formData
                                            .unitComponent_amountComplement
                                    ),
                                });
                                break;
                            case 'RateComponent':
                                const numerator = rootCollection.db.selectById(
                                    treeState.sideEffect.formData
                                        .rateComponent_numerator_id
                                );
                                const denominator =
                                    rootCollection.db.selectById(
                                        treeState.sideEffect.formData
                                            .rateComponent_denominator_id
                                    );
                                if (numerator && denominator) {
                                    childBizIO = new RateComponent<
                                        BizIOExtData,
                                        BizComponentGroupType
                                    >({
                                        ...hasOwnValueBase,
                                        numerator: numerator,
                                        denominator: denominator,
                                    });
                                } else {
                                    console.error(
                                        'numerator or denominator is not found'
                                    );
                                }
                                break;
                            case 'CohortComponent':
                                break;
                            case 'FunnelComponent':
                                childBizIO = new FunnelComponent<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >(commonBase);
                                treeState.sideEffect.formData.funnelComponent_biz_io_order.forEach(
                                    (elem) => {
                                        (
                                            childBizIO as FunnelComponent
                                        ).appendFunnelChild(
                                            rootCollection.db.selectById(
                                                elem.bizId
                                            )!
                                        );
                                    }
                                );
                                break;
                            case 'CollectionBizIO:TOTAL_AMOUNT':
                                childBizIO = new CollectionBizIO<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >({
                                    ...hasOwnValueBase,
                                    // collection
                                    summarizeMode:
                                        CollectionSummarizeMode.TOTAL_AMOUNT,
                                });
                                break;
                            case 'CollectionBizIO:TOTAL_MULTIPLE':
                                childBizIO = new CollectionBizIO<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >({
                                    ...hasOwnValueBase,
                                    // collection
                                    summarizeMode:
                                        CollectionSummarizeMode.TOTAL_MULTIPLE,
                                });
                                break;
                            case 'CollectionBizIO:ACCUMULATE':
                                childBizIO = new CollectionBizIO<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >({
                                    ...hasOwnValueBase,
                                    // collection
                                    summarizeMode:
                                        CollectionSummarizeMode.ACCUMULATE,
                                });
                                break;
                            case 'CollectionBizIO': // folder
                                childBizIO = new CollectionBizIO<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >(commonBase);
                                break;
                            case 'BizIO': // BizIO
                                childBizIO = new BizIO<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >({
                                    ...hasOwnValueBase,
                                });
                        }
                        if (childBizIO) {
                            bizmo.addBizIO({
                                parentBizIO: targetBizIO,
                                childBizIO: childBizIO,
                            });
                            console.log('addBizIO', childBizIO);
                        }
                    }
                    break;
                case 'updatedBizIO':
                    const updateTarget = rootCollection.db.selectById(
                        treeState.sideEffect.targetId
                    );
                    if (updateTarget) {
                        // == General Case ==
                        updateTarget.setName(
                            treeState.sideEffect.formData.name
                        );
                        updateTarget.setAccountName(
                            treeState.sideEffect.formData.accountName
                        );
                        updateTarget.setComplement(
                            treeState.sideEffect.formData.complement === 1
                                ? true
                                : false
                        );
                        updateTarget.setMonetary(
                            treeState.sideEffect.formData.isMonetary === 1
                                ? true
                                : false
                        );
                        // external data
                        updateTarget.externalData = createBizIOExtData(
                            treeState.sideEffect.formData
                        );

                        // == Special Case ==
                        switch (treeState.sideEffect.formData.type) {
                            case 'UnitComponent':
                                (
                                    updateTarget as UnitComponent
                                ).setAmountComplement(
                                    Boolean(
                                        treeState.sideEffect.formData
                                            .unitComponent_amountComplement
                                    )
                                );
                                break;
                            case 'RateComponent':
                                // [重要] ここに来るまでに numerator と denominator の不一致およびvalidationは行われていること
                                const numerator = rootCollection.db.selectById(
                                    treeState.sideEffect.formData
                                        .rateComponent_numerator_id
                                );
                                const denominator =
                                    rootCollection.db.selectById(
                                        treeState.sideEffect.formData
                                            .rateComponent_denominator_id
                                    );
                                if (numerator && denominator) {
                                    (updateTarget as RateComponent).setFraction(
                                        numerator,
                                        denominator
                                    );
                                }
                                break;
                            case 'FunnelComponent':
                                // [重要] 既存のFunnel計算結果BizIOを破壊する更新はNGとする。そのため GUI により追加のみ受け付ける。
                                if (updateTarget instanceof FunnelComponent) {
                                    const currentOrderedBizIdsLength =
                                        updateTarget.orderedBizIds.length;
                                    treeState.sideEffect.formData.funnelComponent_biz_io_order.forEach(
                                        (elem, index) => {
                                            if (
                                                index >=
                                                currentOrderedBizIdsLength
                                            ) {
                                                updateTarget.appendFunnelChild(
                                                    rootCollection.db.selectById(
                                                        elem.bizId
                                                    )!
                                                );
                                            }
                                        }
                                    );
                                }
                                break;
                        }

                        // == Update bizmo state & store on idb ==
                        bizmo.updateBizIO(updateTarget);
                    }
                    break;
                case 'removeBizIO':
                    const removeTarget = rootCollection.db.selectById(
                        treeState.sideEffect.targetId
                    );
                    const parentBizIO = rootCollection.db.selectById(
                        treeState.sideEffect.parentId
                    );
                    if (removeTarget && parentBizIO) {
                        bizmo.removeBizIO({
                            parentBizIO: rootCollection,
                            removingBizIO: removeTarget,
                        });
                    }
                    break;
            }
            dispatchBizIOComponent({
                type: 'doneSideEffect',
            });
        }
    }, [treeState.sideEffect]);

    // 選択されたBizIOを取得する。理論上、必ず存在する。
    const targetBizIO = rootCollection.db.selectById(treeState.selectedNodeId)!;

    // どこかの親BizIOで system label とされているか？
    let isSystemLabeled = false;
    let parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    if (targetBizIO) {
        parentBizIOs = rootCollection.db.parentsOf(targetBizIO.id);
        if (parentBizIOs) {
            for (const parentBizIO of parentBizIOs) {
                const isThisSystemLabeled =
                    parentBizIO.idLabeledSystemNames.isIncludeContent(
                        targetBizIO!.id
                    );
                if (!isSystemLabeled && isThisSystemLabeled) {
                    isSystemLabeled = true;
                }
            }
        }
    }

    // Construct View
    let bizIOStructure = <></>;
    switch (treeState.innerMode) {
        case 'detail':
        case 'addBySelection':
            bizIOStructure = (
                <BizIOStructureDetailView
                    targetBizIO={targetBizIO}
                    isSystemLabeled={isSystemLabeled}
                    parentBizIOs={parentBizIOs}
                    treeState={treeState}
                    dispatchState={dispatchBizIOComponent}
                    selectHandler={selectHandler}
                    selectableMode={selectableMode}
                />
            );
            break;
        case 'addNew':
        case 'update':
            bizIOStructure = (
                <BizIOStructureEditView
                    targetBizIO={targetBizIO}
                    isSystemLabeled={isSystemLabeled}
                    parentBizIOs={parentBizIOs}
                    treeState={treeState}
                    dispatchState={dispatchBizIOComponent}
                />
            );
            break;
    }

    // Tab
    const handleChange = (event: SyntheticEvent, newValue: string) => {
        dispatchBizIOComponent({
            type: 'changeTab',
            selectedTab: newValue as BizIOSComponentTabs,
        });
    };

    return (
        <>
            <ContentsHeader
                targetBizIO={targetBizIO}
                parentBizIOs={parentBizIOs}
                isSystemLabeled={isSystemLabeled}
                treeState={treeState}
                dispatchState={dispatchBizIOComponent}
            ></ContentsHeader>
            <TabContext value={treeState.selectedTab}>
                <div className="border-b border-zinc-600">
                    <TabList onChange={handleChange}>
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon
                                        codePoint={IconType.History}
                                    />
                                    <span className="px-2">
                                        {t('common.label.history')}
                                    </span>
                                </div>
                            }
                            value={'timeseries'}
                            disabled={
                                treeState.componentMode === 'selector'
                            }
                        />
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon
                                        codePoint={IconType.Description}
                                    />
                                    <span className="px-2">
                                        {t('common.label.dataStructure')}
                                    </span>
                                </div>
                            }
                            value={'data'}
                        />
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon
                                        codePoint={IconType.Visibility}
                                    />
                                    <span className="px-2">
                                        {t('common.label.viewSetting')}
                                    </span>
                                </div>
                            }
                            value={'view'}
                            disabled={
                                treeState.componentMode === 'selector'
                            }
                        />
                    </TabList>
                </div>
                <TabPanel value={'data'} className="m-0 p-4">
                    {bizIOStructure}
                </TabPanel>
                <TabPanel value={'view'}>
                    <BizIOViewSetting
                        targetBizIO={targetBizIO}
                        isSystemLabeled={isSystemLabeled}
                        parentBizIOs={parentBizIOs}
                        treeState={treeState}
                        dispatchState={dispatchBizIOComponent}
                    ></BizIOViewSetting>
                </TabPanel>
                <TabPanel value={'timeseries'} className="m-0 p-0">
                    <TimeSeriesView targetBizIO={targetBizIO} />
                </TabPanel>
            </TabContext>
        </>
    );
};

/**
 * BizIOComponent の各Viewの共通ヘッダー
 * @param props
 * @returns
 */
export const ContentsHeader = (props: {
    targetBizIO:
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | BizIO<BizIOExtData, BizComponentGroupType>;
    isSystemLabeled: boolean;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
}) => {
    const {
        targetBizIO,
        isSystemLabeled,
        parentBizIOs,
        treeState,
        dispatchState,
    } = props;
    const { t } = useTranslation();

    let currentModeIndicator = <></>;
    switch (treeState.innerMode) {
        case 'update':
            currentModeIndicator = (
                <Chip
                    icon={<MaterialIcon codePoint={IconType.Edit} />}
                    label={t('common.label.edit')}
                    color="secondary"
                    className="ml-4"
                />
            );
            break;
        case 'addNew':
            currentModeIndicator = (
                <Chip
                    icon={<MaterialIcon codePoint={IconType.AddCircle} />}
                    label={t('common.label.addNew')}
                    color="secondary"
                    className="ml-4"
                />
            );
            break;
        case 'addBySelection':
            currentModeIndicator = (
                <Chip
                    icon={<MaterialIcon codePoint={IconType.AddTask} />}
                    label={t('common.label.addBySelection')}
                    color="secondary"
                    className="ml-4"
                />
            );
            break;
    }

    return (
        <div className="flex items-center p-4">
            <span className="ml-2">
                <BizIOComponentIcon bizIO={targetBizIO} />
            </span>
            <div className="ml-8 grow">
                <div className="flex row items-center">
                    <Breadcrumbs maxItems={3} aria-label="breadcrumb">
                        {treeState.selectedHierarchy.map((bizId, index) => {
                            const bizIO = targetBizIO.db.selectById(bizId);
                            return (
                                <div
                                    className={
                                        index ==
                                        treeState.selectedHierarchy.length - 1
                                            ? 'text-xl text-white'
                                            : 'text-xs'
                                    }
                                    key={bizId}
                                >
                                    {bizIO?.name}
                                </div>
                            );
                        })}
                    </Breadcrumbs>
                    <span className="ml-4">
                        <BizIOIndicatorIcon
                            bizIO={targetBizIO}
                            systemLabeled={isSystemLabeled}
                        />
                    </span>
                    {currentModeIndicator}
                </div>
            </div>

            {treeState.componentMode == 'editor' &&
                treeState.innerMode == 'detail' && (
                    <Tooltip title={t('common.label.edit')}>
                        <Button
                            value="edit"
                            aria-label="edit"
                            onClick={() => {
                                dispatchState({
                                    type: 'startUpdateBizIO',
                                    targetId: treeState.selectedNodeId,
                                    hierarchyIDs: treeState.selectedHierarchy,
                                });
                            }}
                            color="primary"
                        >
                            <MaterialIcon codePoint={IconType.Edit} />
                        </Button>
                    </Tooltip>
                )}

            {(targetBizIO.id != treeState.rootNodeId ||
                treeState.innerMode != 'detail') &&
                treeState.componentMode != 'viewer' && (
                    <Tooltip
                        title={
                            treeState.innerMode != 'detail'
                                ? t('common.label.cancel') // update or add
                                : t('common.label.backTo', {
                                      name:
                                          targetBizIO.db.selectById(
                                              treeState.rootNodeId
                                          )?.name ?? '',
                                  })
                        }
                    >
                        <Button
                            value="cancel"
                            onClick={() => {
                                dispatchState({
                                    type: 'selectBizIO',
                                    selectedID:
                                        treeState.innerMode != 'detail'
                                            ? treeState.selectedNodeId
                                            : treeState.rootNodeId,
                                    hierarchyIDs:
                                        treeState.innerMode != 'detail'
                                            ? treeState.selectedHierarchy
                                            : [treeState.rootNodeId],
                                });
                            }}
                            color={
                                treeState.innerMode != 'detail'
                                    ? 'primary'
                                    : 'inherit'
                            }
                        >
                            <MaterialIcon
                                codePoint={
                                    treeState.innerMode != 'detail'
                                        ? IconType.Close // update or add
                                        : IconType.Reply
                                }
                            />
                        </Button>
                    </Tooltip>
                )}
        </div>
    );
};

/**
 * システム提供のBizIOの説明
 * @returns
 */
export const SystemProvidedDescription = () => {
    const { t } = useTranslation();
    return (
        <DescriptionParts
            label={
                <Chip
                    icon={<MaterialIcon codePoint={IconType.Lock} />}
                    size="small"
                    label={t('CommonForm.systemProvided')}
                />
            }
            bgStyle="pt-3"
        >
            <span className="text-xs">
                {t('CommonForm.systemProvidedMessage')}
            </span>
        </DescriptionParts>
    );
};

