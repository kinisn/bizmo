import { Button, Tooltip } from '@mui/material';
import { TreeItem, TreeView } from '@mui/x-tree-view';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import useConfirmDialog from 'bizmoView/common/parts/confirmDialog/useConfirmDialog';
import { t } from 'i18next';
import { Dispatch, ReactNode, SyntheticEvent } from 'react';
import { Trans } from 'react-i18next';
import {
    BizIOComponentAction,
    BizIOComponentState,
} from '../../BizIOComponent';
import { BizIOItemBaseParts } from './BizIOParts';

export const TreeViewParts = (props: {
    targetBizIO: CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    isSystemLabeled: boolean;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
    selectHandler?: (bizIO: BizIO<BizIOExtData, BizComponentGroupType>) => void;
}) => {
    const { targetBizIO, treeState, dispatchState, selectHandler } = props;

    const handleToggleTree = (
        event: React.SyntheticEvent,
        nodeIds: string[]
    ) => {
        dispatchState({ type: 'toggleTree', nodeIds: nodeIds });
    };
    return (
        <TreeView
            defaultCollapseIcon={
                <MaterialIcon codePoint={IconType.ArrowDropDown} />
            }
            defaultExpandIcon={<MaterialIcon codePoint={IconType.ArrowRight} />}
            onNodeToggle={handleToggleTree}
            expanded={treeState.expandedNodeIds}
            selected={treeState.selectedNodeId}
        >
            {resolveTree(
                targetBizIO,
                targetBizIO.id == treeState.rootNodeId
                    ? [targetBizIO.id]
                    : treeState.selectedHierarchy,
                treeState,
                dispatchState,
                selectHandler
            )}
        </TreeView>
    );
};

const resolveTree = (
    parent: CollectionBizIO<any, BizComponentGroupType>,
    ancestors: Array<string>,
    treeState: BizIOComponentState,
    dispatchState: Dispatch<BizIOComponentAction>,
    selectHandler?: (bizIO: BizIO<BizIOExtData, BizComponentGroupType>) => void,
    html: ReactNode = <></>
): ReactNode => {
    parent.exposedChildrenWithSystemLabeledFlag.forEach((data) => {
        const { bizIO, systemLabeled } = data;
        if (bizIO instanceof CollectionBizIO && bizIO.exportWithChildren) {
            const deeperAncestors = ancestors.slice(0);
            deeperAncestors.push(bizIO.id);
            html = (
                <>
                    {html}
                    <StyledTreeItem
                        bizIO={bizIO}
                        ancestors={ancestors}
                        treeState={treeState}
                        systemLabeled={systemLabeled}
                        dispatchState={dispatchState}
                        selectHandler={selectHandler}
                    >
                        {resolveTree(
                            bizIO,
                            deeperAncestors,
                            treeState,
                            dispatchState,
                            selectHandler
                        )}
                    </StyledTreeItem>
                </>
            );
        } else {
            html = (
                <>
                    {html}
                    <StyledTreeItem
                        bizIO={bizIO}
                        ancestors={ancestors}
                        treeState={treeState}
                        systemLabeled={systemLabeled}
                        dispatchState={dispatchState}
                        selectHandler={selectHandler}
                    ></StyledTreeItem>
                </>
            );
        }
    });
    return html;
};

type StyledTreeItemProps = {
    bizIO:
        | BizIO<any, BizComponentGroupType>
        | CollectionBizIO<any, BizComponentGroupType>;
    ancestors: Array<string>;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
    systemLabeled: boolean;
    selectHandler?: (bizIO: BizIO<BizIOExtData, BizComponentGroupType>) => void;
    children?: ReactNode;
};

const StyledTreeItem = (props: StyledTreeItemProps) => {
    const {
        bizIO,
        ancestors,
        treeState,
        systemLabeled,
        dispatchState,
        selectHandler,
        ...rest
    } = props;

    const { confirmDialog, renderConfirmDialog } = useConfirmDialog();

    // onHover
    const handleMouseEnter = () => {
        dispatchState({
            type: 'enterTree',
            nodeId: bizIO.id,
        });
    };
    const handleMouseLeave = () => {
        dispatchState({
            type: 'leaveTree',
            nodeId: bizIO.id,
            parentId:
                ancestors.length > 0 ? ancestors[ancestors.length - 1] : '',
        });
    };

    // button
    let button = <></>;
    if (bizIO.id === treeState.hoverNodeId) {
        const hierarchy = ancestors.slice(0);
        hierarchy.push(bizIO.id);

        const handleSelected = (e: SyntheticEvent) => {
            e.stopPropagation();
            dispatchState({
                type: 'selectBizIO',
                selectedID: bizIO.id,
                hierarchyIDs: hierarchy,
            });
        };

        const handleDelete = async () => {
            const { accepted } = await confirmDialog({
                content: (
                    <>
                        <div className="font-bold text-lg">
                            {t('common.label.delete')}
                        </div>
                        <div className="p-4">
                            <BizIOItemBaseParts
                                bizIO={bizIO}
                                systemLabeled={systemLabeled}
                            />
                        </div>
                        <div>
                            {/*Hack： i18next での deleteIrreversibleConfirm の翻訳は brタグを含むので Trans を利用する必要が」ある */}
                            <Trans i18nKey="common.message.deleteIrreversibleConfirm" />
                        </div>
                    </>
                ),
                acceptButtonLabel: t('common.label.delete'),
                cancelButtonColor: 'error',
            });

            if (!accepted) return; // キャンセル時は処理に進まない

            if (hierarchy.length > 1) {
                dispatchState({
                    type: 'removeBizIO',
                    targetId: bizIO.id,
                    parentId: hierarchy[hierarchy.length - 2],
                });
            }
        };

        if (
            treeState.componentMode === 'selector' &&
            selectHandler &&
            bizIO instanceof BizActors
        ) {
            button = (
                <Tooltip title={t('common.label.select')}>
                    <Button
                        onClick={(e: SyntheticEvent) => {
                            e.stopPropagation();
                            selectHandler(bizIO);
                        }}
                        color="primary"
                        variant="contained"
                        size="small"
                    >
                        {t('common.label.select')}
                    </Button>
                </Tooltip>
            );
        } else if (
            !treeState.isDeleteMode &&
            treeState.componentMode !== 'viewer'
        ) {
            button = (
                <Tooltip title={t('common.label.detail')}>
                    <Button onClick={handleSelected} color="inherit">
                        <MaterialIcon codePoint={IconType.MoreHoriz} />
                    </Button>
                </Tooltip>
            );
        } else if (treeState.isDeleteMode && !systemLabeled) {
            button = (
                <Tooltip title={t('common.label.delete')}>
                    <Button onClick={handleDelete} color="error">
                        <MaterialIcon codePoint={IconType.Trash} />
                    </Button>
                </Tooltip>
            );
        }
    }

    return (
        <>
            <TreeItem
                nodeId={bizIO.id}
                label={
                    <BizIOItemBaseParts
                        bizIO={bizIO}
                        systemLabeled={systemLabeled}
                        button={button}
                    />
                }
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                {...rest}
            />
            {renderConfirmDialog()}
        </>
    );
};
