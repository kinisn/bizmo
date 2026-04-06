import { Button, Dialog, Tooltip } from '@mui/material';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizActionBase } from 'bizmo/action/core/BizActionBase';
import { BalanceSheetSetupBizAction, FinancingActions } from 'bizmo/action/template/FinancingActions';
import { AccountNames } from 'bizmo/core/accounting/AccountNames';
import Decimal from 'decimal.js';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { BizActionComponent } from 'bizmoView/component/bizActionComponent/BizActionComponent';
import { BSSetupComponent } from 'bizmoView/component/bizActionComponent/BSSetupComponent';
import { BizmoCanvas } from 'bizmoView/component/bizmoCanvas/canvas/BizmoCanvas';
import HyperParameterComponent from 'bizmoView/component/hyperParam/HyperParameterComponent';
import { useBizmo } from 'globalState/useBizmo';
import { useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BizmoDexieIDB } from 'bizmoView/common/idb/bizmoDexieIDB';
import logoImage from '../assets/logo2.png';

export type BizCanvasAction = {
    type:
        | 'hyperParamOpen'
        | 'hyperParamClose'
        | 'bizComponentOpen'
        | 'bizComponentClose'
        | 'bizActionOpen'
        | 'bizActionClose'
        | 'settingsOpen'
        | 'settingsClose';
};

export type BizCanvasState = {
    hyperParamOpen: boolean;
    bizComponentOpen: boolean;
    bizActionOpen: boolean;
    settingsOpen: boolean;
};

export const BizCanvasPage = ({}) => {
    const { t } = useTranslation();
    const [canvasState, dispatchCanvasAction] = useReducer(
        (state: BizCanvasState, action: BizCanvasAction) => {
            switch (action.type) {
                case 'hyperParamOpen':
                    return {
                        ...state,
                        hyperParamOpen: true,
                    };
                case 'hyperParamClose':
                    return {
                        ...state,
                        hyperParamOpen: false,
                    };
                case 'bizComponentOpen':
                    return {
                        ...state,
                        bizComponentOpen: true,
                    };
                case 'bizComponentClose':
                    return {
                        ...state,
                        bizComponentOpen: false,
                    };
                case 'bizActionOpen':
                    return {
                        ...state,
                        bizActionOpen: true,
                    };
                case 'bizActionClose':
                    return {
                        ...state,
                        bizActionOpen: false,
                    };
                case 'settingsOpen':
                    return {
                        ...state,
                        settingsOpen: true,
                    };
                case 'settingsClose':
                    return {
                        ...state,
                        settingsOpen: false,
                    };
            }
        },
        {
            hyperParamOpen: false,
            bizComponentOpen: false,
            bizActionOpen: false,
            settingsOpen: false,
        }
    );

    // hyperParam
    const handleOpenHyperParams = () => {
        dispatchCanvasAction({ type: 'hyperParamOpen' });
    };
    const handleCloseHyperParams = () => {
        dispatchCanvasAction({ type: 'hyperParamClose' });
    };

    // bizComponent
    const handleOpenBizComponent = () => {
        dispatchCanvasAction({ type: 'bizComponentOpen' });
    };
    const handleCloseBizComponent = () => {
        dispatchCanvasAction({ type: 'bizComponentClose' });
    };

    // bizAction
    const handleOpenBizAction = () => {
        dispatchCanvasAction({ type: 'bizActionOpen' });
    };
    const handleCloseBizAction = () => {
        dispatchCanvasAction({ type: 'bizActionClose' });
    };

    // settings
    const handleOpenSettings = () => {
        dispatchCanvasAction({ type: 'settingsOpen' });
    };
    const handleCloseSettings = () => {
        dispatchCanvasAction({ type: 'settingsClose' });
    };

    // simulate
    const bizmo = useBizmo();
    const [simulated, setSimulated] = useState(false);
    const handleSimulate = async () => {
        if (bizmo.simulator) {
            bizmo.simulator.simulate(0);
            setSimulated(true);
            await new BizmoDexieIDB().saveBizSimulator(bizmo.simulator);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-zinc-50">
                <div className="absolute z-10 m-2 p-1 shadow-lg rounded bg-zinc-900">
                    <div className="flex">
                        <Button>
                            <img
                                src={logoImage}
                                className="h-8 object-cover rounded-l-lg"
                            />
                        </Button>
                        <Tooltip title={t('BizComponent.BizComponent')}>
                            <Button onClick={handleOpenBizComponent}>
                                <MaterialIcon codePoint={IconType.Business} />
                            </Button>
                        </Tooltip>
                        <Tooltip title={'BizAction'}>
                            <Button onClick={handleOpenBizAction}>
                                <MaterialIcon codePoint={IconType.Cases} />
                            </Button>
                        </Tooltip>
                        <Tooltip title={t('hyperParam.viewTitle')}>
                            <Button onClick={handleOpenHyperParams}>
                                <MaterialIcon codePoint={IconType.List} />
                            </Button>
                        </Tooltip>
                        <Tooltip title={'Simulate'}>
                            <Button
                                onClick={handleSimulate}
                                style={
                                    simulated
                                        ? { backgroundColor: '#2e7d32' }
                                        : {}
                                }
                            >
                                <MaterialIcon
                                    codePoint={IconType.PlayArrow}
                                    style={
                                        simulated ? { color: '#ffffff' } : {}
                                    }
                                />
                            </Button>
                        </Tooltip>
                        <Tooltip title={t('common.label.setting') ?? '設定'}>
                            <Button onClick={handleOpenSettings}>
                                <MaterialIcon
                                    codePoint={IconType.Setting}
                                />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div className="w-full">
                    <BizmoCanvas
                        canvasPageState={canvasState}
                        handleCloseBizComponent={handleCloseBizComponent}
                    />
                </div>
            </div>

            <HyperParamDialog
                canvasState={canvasState}
                handleCloseHyperParams={handleCloseHyperParams}
            />
            <BizActionListDialog
                open={canvasState.bizActionOpen}
                handleClose={handleCloseBizAction}
            />
            <SettingsDialog
                open={canvasState.settingsOpen}
                handleClose={handleCloseSettings}
            />
        </>
    );
};

const HyperParamDialog = (props: {
    canvasState: { hyperParamOpen: boolean; bizComponentOpen: boolean };
    handleCloseHyperParams: () => void;
}) => {
    const { t } = useTranslation();
    const { canvasState, handleCloseHyperParams } = props;
    return (
        <Dialog
            open={canvasState.hyperParamOpen}
            onClose={handleCloseHyperParams}
            maxWidth="xl"
        >
            <div className={`rounded`}>
                <div className="p-4 rounded bg-black flex items-center">
                    <div className="flex justify-center items-center">
                        <MaterialIcon codePoint={IconType.List} />
                        <div className="ml-4 text-xl">
                            {t('hyperParam.viewTitle')}
                        </div>
                    </div>
                    <div className="grow flex justify-end">
                        <Tooltip title={t('common.label.close')}>
                            <Button onClick={handleCloseHyperParams}>
                                <MaterialIcon codePoint={IconType.Close} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <HyperParameterComponent />
            </div>
        </Dialog>
    );
};

const BizActionListDialog = (props: {
    open: boolean;
    handleClose: () => void;
}) => {
    const { t } = useTranslation();
    const { open, handleClose } = props;
    const bizmo = useBizmo();
    const [selectedAction, setSelectedAction] = useState<
        BizAction<BizIOExtData, RelationExtData> | undefined
    >(undefined);
    const [isAdding, setIsAdding] = useState(false);
    const [newActionName, setNewActionName] = useState('');
    const [listVersion, setListVersion] = useState(0);

    const allActions = bizmo.simulator
        ? bizmo.timeline().sortToTimeline().flat()
        : [];
    const seen = new Set<string>();
    const actions = allActions.filter((a) => {
        if (seen.has(a.actionId)) return false;
        seen.add(a.actionId);
        return true;
    });

    const handleSelectAction = (
        action: BizActionBase<BizIOExtData, RelationExtData>
    ) => {
        if (action instanceof BizAction) {
            setSelectedAction(action);
        }
    };

    const handleBackToList = () => {
        setSelectedAction(undefined);
        setIsAdding(false);
        setNewActionName('');
    };

    const handleCloseDialog = () => {
        setSelectedAction(undefined);
        setIsAdding(false);
        setNewActionName('');
        handleClose();
    };

    const handleStartAdd = () => {
        setIsAdding(true);
        setNewActionName('');
    };

    const handleDeleteAction = (
        e: React.MouseEvent,
        action: BizActionBase<BizIOExtData, RelationExtData>
    ) => {
        e.stopPropagation();
        if (!bizmo.simulator) return;
        bizmo.timeline().removeAction(action.actionId);
        setSelectedAction(undefined);
        setListVersion((v) => v + 1);
    };

    const handleConfirmAdd = async () => {
        if (!newActionName.trim() || !bizmo.simulator) return;
        const newAction = new BizAction<BizIOExtData, RelationExtData>({
            timetable: bizmo.timetable(),
            db: bizmo.db(),
            hyperMG: bizmo.hyperMG(),
            name: newActionName.trim(),
        });
        bizmo.timeline().setAction(newAction);
        await bizmo.putBizAction(newAction);
        setIsAdding(false);
        setNewActionName('');
        setSelectedAction(newAction);
    };

    const handleAddBSSetup = () => {
        if (!bizmo.simulator) return;
        const financing = new FinancingActions({
            timetable: bizmo.timetable(),
            db: bizmo.db(),
            hyperMG: bizmo.hyperMG(),
            bizComponent: bizmo.bizComponent(),
            priorityGenerator: bizmo.timeline().priorityGenerator,
        });
        const bsAction = financing.createBalanceSheetSetup(
            new Map<AccountNames, Decimal>(),
            undefined,
            'B/S初期値設定'
        );
        bizmo.timeline().setAction(bsAction);
        bizmo.putBizAction(bsAction as any);
        setSelectedAction(bsAction as any);
        setListVersion((v) => v + 1);
    };

    return (
        <Dialog
            open={open}
            onClose={handleCloseDialog}
            maxWidth="xl"
            fullWidth={!!selectedAction}
        >
            <div className="rounded">
                <div className="p-4 rounded bg-black flex items-center">
                    <div className="flex justify-center items-center">
                        <MaterialIcon codePoint={IconType.Cases} />
                        <div className="ml-4 text-xl">
                            {selectedAction
                                ? selectedAction.name
                                : 'BizAction'}
                        </div>
                    </div>
                    <div className="grow flex justify-end">
                        {selectedAction && (
                            <Tooltip title={t('common.label.back')}>
                                <Button onClick={handleBackToList}>
                                    <MaterialIcon
                                        codePoint={IconType.Reply}
                                    />
                                </Button>
                            </Tooltip>
                        )}
                        <Tooltip title={t('common.label.close')}>
                            <Button onClick={handleCloseDialog}>
                                <MaterialIcon codePoint={IconType.Close} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div className="bg-zinc-900 min-w-[500px]">
                    {selectedAction ? (
                        selectedAction instanceof
                        BalanceSheetSetupBizAction ? (
                            <BSSetupComponent
                                targetBizAction={selectedAction}
                            />
                        ) : (
                            <BizActionComponent
                                targetBizAction={selectedAction}
                            />
                        )
                    ) : (
                        <div className="p-4">
                            <div className="flex items-center mb-4 gap-2">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleAddBSSetup}
                                >
                                    <MaterialIcon
                                        codePoint={IconType.AttachMoney}
                                    />
                                    <span className="ml-1">
                                        B/S初期設定
                                    </span>
                                </Button>
                                <div className="grow" />
                                {isAdding ? (
                                    <>
                                        <input
                                            type="text"
                                            className="bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="アクション名"
                                            value={newActionName}
                                            onChange={(e) =>
                                                setNewActionName(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter')
                                                    handleConfirmAdd();
                                            }}
                                            autoFocus
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleConfirmAdd}
                                            disabled={
                                                !newActionName.trim()
                                            }
                                        >
                                            OK
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() =>
                                                setIsAdding(false)
                                            }
                                        >
                                            {t('common.label.cancel')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleStartAdd}
                                    >
                                        <MaterialIcon
                                            codePoint={IconType.Add}
                                        />
                                        <span className="ml-1">
                                            {t('common.label.add')}
                                        </span>
                                    </Button>
                                )}
                            </div>
                            {actions.length === 0 ? (
                                <div className="text-zinc-400 p-4">
                                    BizAction が登録されていません
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {actions.map((action, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center p-3 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                                            onClick={() =>
                                                handleSelectAction(action)
                                            }
                                        >
                                            <MaterialIcon
                                                codePoint={IconType.Cases}
                                                className="text-zinc-400"
                                            />
                                            <div className="ml-3 grow">
                                                <div className="font-bold">
                                                    {action.name}
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {action.actionId.substring(
                                                        0,
                                                        20
                                                    )}
                                                    ...
                                                </div>
                                            </div>
                                            <Tooltip
                                                title={t(
                                                    'common.label.delete'
                                                )}
                                            >
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) =>
                                                        handleDeleteAction(
                                                            e,
                                                            action
                                                        )
                                                    }
                                                >
                                                    <MaterialIcon
                                                        codePoint={
                                                            IconType.Trash
                                                        }
                                                    />
                                                </Button>
                                            </Tooltip>
                                            <MaterialIcon
                                                codePoint={
                                                    IconType.ArrowRight
                                                }
                                                className="text-zinc-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
};

const SettingsDialog = (props: {
    open: boolean;
    handleClose: () => void;
}) => {
    const { t } = useTranslation();
    const { open, handleClose } = props;
    const bizmo = useBizmo();

    const timetable = bizmo.simulator?.timetable;
    const [startYear, setStartYear] = useState(
        timetable?.startDate?.getFullYear()?.toString() ?? ''
    );
    const [startMonth, setStartMonth] = useState(
        timetable
            ? String(timetable.startDate.getMonth() + 1)
            : ''
    );
    const [termLength, setTermLength] = useState(
        timetable?.length?.toString() ?? '36'
    );

    const handleSave = async () => {
        if (!timetable) return;
        const year = parseInt(startYear);
        const month = parseInt(startMonth);
        const length = parseInt(termLength);
        if (isNaN(year) || isNaN(month) || isNaN(length)) return;

        timetable.startDate = new Date(year, month - 1, 1);
        timetable.length = length;

        if (bizmo.simulator) {
            await new BizmoDexieIDB().saveBizSimulator(bizmo.simulator);
        }
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm">
            <div className="rounded">
                <div className="p-4 rounded bg-black flex items-center">
                    <div className="flex justify-center items-center">
                        <MaterialIcon codePoint={IconType.Setting} />
                        <div className="ml-4 text-xl">
                            {t('common.label.setting') ?? '設定'}
                        </div>
                    </div>
                    <div className="grow flex justify-end">
                        <Tooltip title={t('common.label.close')}>
                            <Button onClick={handleClose}>
                                <MaterialIcon codePoint={IconType.Close} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
                <div className="bg-zinc-900 p-6 min-w-[400px] space-y-6">
                    <div>
                        <div className="text-sm text-zinc-400 mb-2">
                            シミュレーション開始年月
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                className="w-24 bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-2 text-sm"
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                            />
                            <span className="text-zinc-400">年</span>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                className="w-20 bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-2 text-sm"
                                value={startMonth}
                                onChange={(e) => setStartMonth(e.target.value)}
                            />
                            <span className="text-zinc-400">月</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-zinc-400 mb-2">
                            ターム数（月数）
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max="120"
                                className="w-24 bg-zinc-800 text-white border border-zinc-600 rounded px-3 py-2 text-sm"
                                value={termLength}
                                onChange={(e) => setTermLength(e.target.value)}
                            />
                            <span className="text-zinc-400">ヶ月</span>
                        </div>
                    </div>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSave}
                    >
                        <MaterialIcon
                            codePoint={IconType.Save}
                            className="mr-2"
                        />
                        {t('common.label.save')}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
