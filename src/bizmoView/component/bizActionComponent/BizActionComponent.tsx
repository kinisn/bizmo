import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Button, Chip, Tab, Tooltip } from '@mui/material';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import { BizActionProcessor } from 'bizmo/action/core/BizActionProcessor';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import { SyntheticEvent, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BizProcessorComponent } from './BizProcessorComponent';
import { BizRelationView } from './BizRelationView';
import { TermPriorityView } from './TermPriorityView';

type BizActionComponentTabs = 'Relations' | 'BizProcessors' | 'Priorities';

export type BizActionComponentState = {
    // Side effect actions
    sideEffectAction: BizActionComponentAction | undefined;

    // BizAction state
    mode: 'view' | 'edit';
    selectedTab: BizActionComponentTabs;
};

export type BizActionComponentAction =
    | {
          type: 'saved';
      }
    | {
          type: 'addRelation';
          payload: { fromBizIOId: string; toBizIOId: string; name?: string };
      }
    | {
          type: 'updateRelation';
          payload: {
              relationId: string;
              fromBizIOId: string;
              toBizIOId: string;
              name?: string;
          };
      }
    | {
          type: 'removeRelation';
          payload: { relationId: string };
      }
    | { type: 'changeMode'; payload: 'view' | 'edit' }
    | { type: 'changeTab'; payload: BizActionComponentTabs };

export const BizActionComponent = (props: {
    targetBizAction: BizAction<BizIOExtData, RelationExtData>;
}) => {
    let { targetBizAction } = props;
    const { t } = useTranslation();
    const bizmo = useBizmo();
    const [actionState, dispatchAction] = useReducer(
        (state: BizActionComponentState, action: BizActionComponentAction) => {
            switch (action.type) {
                // side effect actions
                case 'addRelation':
                case 'removeRelation':
                case 'updateRelation':
                    return {
                        ...state,
                        sideEffectAction: action,
                    };
                case 'saved':
                    return {
                        ...state,
                        sideEffectAction: undefined,
                    };
                // inner state actions
                case 'changeMode':
                    return { ...state, mode: action.payload };
                case 'changeTab':
                    return { ...state, selectedTab: action.payload };
                default:
                    return state;
            }
        },
        {
            sideEffectAction: undefined,
            mode: 'view',
            selectedTab: 'Relations',
        }
    );

    useEffect(() => {
        //let ignore = false;
        async function fetchData() {
            if (actionState.sideEffectAction) {
                switch (actionState.sideEffectAction.type) {
                    case 'addRelation':
                        const newRelation = new BizRelation({
                            name: actionState.sideEffectAction.payload.name,
                            fromBizIOId:
                                actionState.sideEffectAction.payload
                                    .fromBizIOId,
                            toBizIOId:
                                actionState.sideEffectAction.payload.toBizIOId,
                        });
                        targetBizAction.relations.set(
                            newRelation.relationId,
                            newRelation
                        );
                        break;
                    case 'removeRelation':
                        targetBizAction.removeRelation(
                            actionState.sideEffectAction.payload.relationId
                        );
                        break;
                    case 'updateRelation':
                        const oldRelation = targetBizAction.getRelation(
                            actionState.sideEffectAction.payload.relationId
                        );
                        if (oldRelation) {
                            const updatedRelation = new BizRelation({
                                relationId: oldRelation.relationId,
                                fromBizIOId:
                                    actionState.sideEffectAction.payload
                                        .fromBizIOId,
                                toBizIOId:
                                    actionState.sideEffectAction.payload
                                        .toBizIOId,
                                name: actionState.sideEffectAction.payload.name,
                                externalData: oldRelation.externalData,
                            });
                            targetBizAction.relations.set(
                                updatedRelation.relationId,
                                updatedRelation
                            );
                        }
                        break;
                }

                console.log(
                    'BizActionComponent: useEffect',
                    actionState.sideEffectAction
                );
                await bizmo.putBizAction(targetBizAction).then(() => {
                    console.log('BizActionComponent: saved');
                    dispatchAction({ type: 'saved' });
                });
            }
        }
        fetchData();
        /*
        return () => {
            ignore = true;
        };
        */
    }, [actionState.sideEffectAction]);

    // == GUI ==
    let currentModeIndicator = <></>;
    switch (actionState.mode) {
        case 'edit':
            currentModeIndicator = (
                <Chip
                    icon={<MaterialIcon codePoint={IconType.Edit} />}
                    label={t('common.label.edit')}
                    color="secondary"
                    className="ml-4"
                />
            );
            break;
    }

    // Tab
    const handleChange = (event: SyntheticEvent, newValue: string) => {
        console.log('handleChange', newValue);
        dispatchAction({
            type: 'changeTab',
            payload: newValue as BizActionComponentTabs,
        });
    };

    return (
        <div className="p-4">
            <div className="flex flex-row">
                <div className="flex-1 flex items-center">
                    {actionState.mode === 'edit' ? (
                        <input
                            type="text"
                            className="text-2xl mr-6 bg-zinc-800 text-white border border-zinc-600 rounded px-2 py-1"
                            defaultValue={targetBizAction.name}
                            onChange={(e) => {
                                targetBizAction.name = e.target.value;
                            }}
                            onBlur={() =>
                                bizmo.putBizAction(targetBizAction)
                            }
                        />
                    ) : (
                        <div className="text-2xl mr-6">
                            {targetBizAction.name}
                        </div>
                    )}
                    <div className="text-xs">{targetBizAction.actionType}</div>
                    {currentModeIndicator}
                </div>
                <div className="flex-0">
                    {actionState.mode === 'view' ? (
                        <Tooltip title={t('common.label.edit')}>
                            <Button
                                value="edit"
                                aria-label="edit"
                                onClick={() => {
                                    dispatchAction({
                                        type: 'changeMode',
                                        payload: 'edit',
                                    });
                                }}
                                color="primary"
                            >
                                <MaterialIcon codePoint={IconType.Edit} />
                            </Button>
                        </Tooltip>
                    ) : (
                        <Tooltip title={t('common.label.cancel')}>
                            <Button
                                value="cancelEdit"
                                aria-label="cancelEdit"
                                onClick={() => {
                                    dispatchAction({
                                        type: 'changeMode',
                                        payload: 'view',
                                    });
                                }}
                                color="primary"
                            >
                                <MaterialIcon codePoint={IconType.Cancel} />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            </div>

            <TabContext value={actionState.selectedTab}>
                <div className="border-b border-zinc-600">
                    <TabList onChange={handleChange}>
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon codePoint={IconType.Link} />
                                    <span className="px-2">
                                        {t('BizActionComponent.relation')}
                                    </span>
                                </div>
                            }
                            value={'Relations'}
                        />
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon codePoint={IconType.Memory} />
                                    <span className="px-2">
                                        {t('BizActionComponent.processor')}
                                    </span>
                                </div>
                            }
                            value={'BizProcessors'}
                        />
                        <Tab
                            label={
                                <div className="flex items-center">
                                    <MaterialIcon codePoint={IconType.Memory} />
                                    <span className="px-2">
                                        {t('BizActionComponent.priority')}
                                    </span>
                                </div>
                            }
                            value={'Priorities'}
                        />
                    </TabList>
                </div>
                <TabPanel value={'Relations'}>
                    <BizRelationView
                        targetBizAction={targetBizAction}
                        actionState={actionState}
                        actionDispatch={dispatchAction}
                    />
                </TabPanel>
                <TabPanel value={'BizProcessors'}>
                    {targetBizAction.orderedProcessors.map(
                        (processor, index) => {
                            // 空の processor はスキップ（関数もOutputもない）
                            if (
                                processor.orderedBizFunctions.length === 0 &&
                                processor.procOutputs.length === 0
                            )
                                return null;
                            return (
                                <div
                                    key={index}
                                    className="relative"
                                >
                                    <BizProcessorComponent
                                        bizActionProcessor={processor}
                                        order={index}
                                        isEditMode={
                                            actionState.mode === 'edit'
                                        }
                                    />
                                    {actionState.mode === 'edit' && (
                                        <div className="absolute top-0 right-0">
                                            <Tooltip
                                                title={t(
                                                    'common.label.delete'
                                                )}
                                            >
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    onClick={() => {
                                                        targetBizAction.removeActionProcessorAt(
                                                            index
                                                        );
                                                        bizmo.putBizAction(
                                                            targetBizAction
                                                        );
                                                        dispatchAction({
                                                            type: 'saved',
                                                        });
                                                    }}
                                                >
                                                    <MaterialIcon
                                                        codePoint={
                                                            IconType.Trash
                                                        }
                                                    />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                    {actionState.mode === 'edit' && (
                        <AddProcessorForm
                            targetBizAction={targetBizAction}
                            onAdded={() => {
                                bizmo.putBizAction(targetBizAction);
                                dispatchAction({ type: 'saved' });
                            }}
                        />
                    )}
                </TabPanel>
                <TabPanel value={'Priorities'}>
                    <TermPriorityView
                        timetable={targetBizAction.timetable}
                        priorities={targetBizAction.priorities}
                        isEditMode={actionState.mode === 'edit'}
                    />
                </TabPanel>
            </TabContext>
        </div>
    );
};

const AddProcessorForm = (props: {
    targetBizAction: BizAction<BizIOExtData, RelationExtData>;
    onAdded: () => void;
}) => {
    const { targetBizAction, onAdded } = props;
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [previewProcessor, setPreviewProcessor] = useState<
        BizActionProcessor | undefined
    >(undefined);

    const handleStartAdd = () => {
        // 空の BizFunction で仮の Processor を作成
        const emptyFunc = new BizFunction({ code: '' });
        const processor = new BizActionProcessor({
            timetable: targetBizAction.timetable,
            db: targetBizAction.db,
            hyperMG: targetBizAction.hyperMG,
            orderedFunctions: [emptyFunc],
        });
        setPreviewProcessor(processor);
        setIsAdding(true);
    };

    const handleConfirm = () => {
        if (!previewProcessor) return;
        // previewProcessor の関数を取得して targetBizAction に追加
        const funcs = previewProcessor.orderedBizFunctions;
        const outputs = previewProcessor.procOutputs;
        targetBizAction.appendActionProcessor(
            funcs.length > 0 ? funcs : undefined,
            outputs.length > 0 ? outputs : undefined
        );
        setIsAdding(false);
        setPreviewProcessor(undefined);
        onAdded();
    };

    const handleCancel = () => {
        setIsAdding(false);
        setPreviewProcessor(undefined);
    };

    return isAdding && previewProcessor ? (
        <div className="mt-4 border-2 border-blue-500 rounded p-2">
            <BizProcessorComponent
                bizActionProcessor={previewProcessor}
                order={targetBizAction.orderedProcessors.length}
                isEditMode={true}
            />
            <div className="flex gap-2 mt-4 justify-end p-2">
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleConfirm}
                >
                    {t('common.label.add')}
                </Button>
                <Button size="small" onClick={handleCancel}>
                    {t('common.label.cancel')}
                </Button>
            </div>
        </div>
    ) : (
        <Button
            fullWidth
            color="primary"
            variant="contained"
            className="mt-4"
            onClick={handleStartAdd}
        >
            <MaterialIcon codePoint={IconType.AddCircle} className="mr-4" />
            <span>
                {t('BizActionComponent.processor')} {t('common.label.add')}
            </span>
        </Button>
    );
};
