import {
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
} from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { Dispatch, MouseEvent, SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BizIOComponentAction,
    BizIOComponentState,
    BizIOSelectableMode,
} from '../../BizIOComponent';
import { ListViewParts } from './ListViewParts';
import { TreeViewParts } from './TreeViewParts';

export type CollectionViewerMode = 'tree' | 'list';

export const CollectionViewerParts = (props: {
    targetBizIO:
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | BizIO<BizIOExtData, BizComponentGroupType>;
    isSystemLabeled: boolean;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
    selectableMode?: BizIOSelectableMode;
    selectHandler?: (bizIO: BizIO<BizIOExtData, BizComponentGroupType>) => void;
}) => {
    const {
        targetBizIO,
        isSystemLabeled,
        parentBizIOs,
        treeState,
        dispatchState,
        selectableMode,
        selectHandler,
    } = props;
    const { t } = useTranslation();

    const handleAddNew = (e: SyntheticEvent) => {
        e.stopPropagation();
        dispatchState({
            type: 'startAddBizIO',
            targetId: treeState.selectedNodeId,
            hierarchyIDs: treeState.selectedHierarchy,
        });
    };

    const handleAddBySelection = (e: SyntheticEvent) => {
        e.stopPropagation();
        dispatchState({
            type: 'startAddChild',
            targetId: treeState.selectedNodeId,
            hierarchyIDs: treeState.selectedHierarchy,
        });
    };

    // Tree or List
    const handleViewerMode = (
        event: MouseEvent<HTMLElement>,
        newMode: CollectionViewerMode
    ) => {
        dispatchState({
            type: 'changeCollectionViewerMode',
            mode: newMode,
        });
    };

    // Delete Mode
    const handleChangeDeleteMode = (e: SyntheticEvent) => {
        dispatchState({
            type: 'changeDeleteMode',
        });
    };

    return (
        <>
            {targetBizIO instanceof CollectionBizIO && (
                <div className="bg-zinc-800 px-2 pb-2 rounded">
                    <div className="flex items-center py-4">
                        <div className="grow text-xl flex items-center">
                            <span className="pl-2">
                                {t('CollectionTree.elements')}
                            </span>
                            <Tooltip title={t('BizIOComponent.switchView')}>
                                <ToggleButtonGroup
                                    size="small"
                                    aria-label="Small sizes"
                                    className="pl-8"
                                    value={
                                        treeState.isTreeView ? 'tree' : 'list'
                                    }
                                    exclusive={true}
                                    onChange={handleViewerMode}
                                >
                                    <ToggleButton value="tree" key="tree">
                                        <MaterialIcon
                                            codePoint={IconType.AccountTree}
                                        />
                                    </ToggleButton>
                                    <ToggleButton value="list" key="list">
                                        <MaterialIcon
                                            codePoint={IconType.List}
                                        />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Tooltip>
                        </div>
                        {treeState.componentMode == 'editor' &&
                            !targetBizIO.systemLabeledOnly && ( // systemLabeledOnly のものには手動追加できない
                                <>
                                    <Tooltip
                                        title={t('BizIOComponent.deleteMode')}
                                        className="mr-4"
                                    >
                                        <ToggleButton
                                            size="small"
                                            value="check"
                                            selected={treeState.isDeleteMode}
                                            onChange={handleChangeDeleteMode}
                                            color="error"
                                        >
                                            <MaterialIcon
                                                codePoint={IconType.Trash}
                                            />
                                        </ToggleButton>
                                    </Tooltip>
                                    <Tooltip
                                        title={t('common.label.addBySelection')}
                                    >
                                        <Button onClick={handleAddBySelection}>
                                            <MaterialIcon
                                                codePoint={IconType.AddTask}
                                            />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title={t('common.label.addNew')}>
                                        <Button onClick={handleAddNew}>
                                            <MaterialIcon
                                                codePoint={IconType.AddCircle}
                                            />
                                        </Button>
                                    </Tooltip>
                                </>
                            )}
                    </div>
                    {treeState.isTreeView ? (
                        <TreeViewParts
                            targetBizIO={targetBizIO}
                            isSystemLabeled={isSystemLabeled}
                            parentBizIOs={parentBizIOs}
                            treeState={treeState}
                            dispatchState={dispatchState}
                            selectHandler={selectHandler}
                        />
                    ) : (
                        <ListViewParts
                            targetBizIO={targetBizIO}
                            isSystemLabeled={isSystemLabeled}
                            parentBizIOs={parentBizIOs}
                            treeState={treeState}
                            dispatchState={dispatchState}
                        />
                    )}
                </div>
            )}
        </>
    );
};
