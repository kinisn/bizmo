import { BizAction, BizRelationToDraw } from 'bizmo/action/core/BizAction';
import { BizActionBase } from 'bizmo/action/core/BizActionBase';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizActors } from 'bizmo/bizComponent/bizActors/BizActors';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { SnappingDrag } from 'bizmoView/common/canvas/SnappingDrag';
import {
    BizIOExtData,
    traverseBizIOExtDataView,
} from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { BizCanvasState as BizCanvasPageState } from 'bizmoView/pages/BizCanvasPage';
import { useBizmo } from 'globalState/useBizmo';
import { useEffect, useReducer, useState } from 'react';
import { Group, Layer } from 'react-konva';
import { BizActionDialog } from '../../bizActionComponent/BizActionDialog';
import { BizIONodeDialog } from '../bizIONode/BizIONodeDialog';
import { BizIONodeShape } from './BizIONodeShape';
import { DraggableGridStage } from './DraggableGridStage';
import { BizRelationShape } from './bizAction/BizRelationShape';

type BizmoCanvasState = {
    storedBizIOs: Array<BizIO<BizIOExtData, BizComponentGroupType>>;
    currentActions: Array<BizActionBase<BizIOExtData, RelationExtData>>;
};

type BizmoCanvasAction =
    | {
          type: 'updateBizIO';
      }
    | {
          type: 'updateCurrentActions';
      };

export const BizmoCanvas = (props: {
    canvasPageState: BizCanvasPageState;
    handleCloseBizComponent: () => void;
}) => {
    const { canvasPageState, handleCloseBizComponent } = props;

    // === state / dispatcher ===
    //  BizmoData
    const bizmo = useBizmo();
    const [canvasState, dispatchCanvas] = useReducer(
        (state: BizmoCanvasState, action: BizmoCanvasAction) => {
            switch (action.type) {
                case 'updateBizIO':
                    return {
                        ...state,
                        storedBizIOs: traverseBizIOExtDataView(
                            bizmo.bizComponent(),
                            []
                        ),
                    };
                case 'updateCurrentActions':
                    console.log('dispatcher:updateCurrentActions');
                    return {
                        ...state,
                        currentActions: bizmo.timeline().sortToTimeline()[
                            bizmo.timetable().currentIndex
                        ],
                    };
            }
        },
        {
            storedBizIOs: traverseBizIOExtDataView(bizmo.bizComponent(), []),
            currentActions: bizmo.timeline().sortToTimeline()[
                bizmo.timetable().currentIndex
            ],
        }
    );
    console.log('BizmoCanvas', bizmo.db().graph.allNodes.length);

    // === BizIO Dialog ===
    const [popupBizIO, setPopupBizIO] = useState<
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | undefined
    >(undefined);
    const handleOpenBizIONode = (targetID: string) => {
        const candidate = bizmo.db().selectById(targetID);
        setPopupBizIO(candidate);
    };
    const handleCloseBizIONode = () => {
        // bizComponent の場合には上位Componentで表示管理されている
        if (bizmo.bizComponent().id == popupBizIO?.id) {
            handleCloseBizComponent();
        }
        setPopupBizIO(undefined);
    };
    useEffect(() => {
        if (canvasPageState.bizComponentOpen) {
            handleOpenBizIONode(bizmo.bizComponent().id);
        }
    }, [canvasPageState.bizComponentOpen]);

    // === BizAction Dialog ===
    const [popupBizAction, setPopupBizAction] = useState<
        BizActionBase<BizIOExtData, RelationExtData> | undefined
    >(undefined);
    const handleOpenBizAction = (
        bizAction: BizActionBase<BizIOExtData, RelationExtData>
    ) => {
        setPopupBizAction(bizAction);
    };
    const handleCloseBizAction = () => {
        setPopupBizAction(undefined);
    };
    useEffect(() => {
        if (canvasPageState.bizActionOpen && popupBizAction) {
            handleOpenBizAction(popupBizAction);
        }
    }, [canvasPageState.bizActionOpen, popupBizAction]);

    // 対象となる term を設定しないと、ActionやRelationが決定しない。
    // Action は prepare で Relation を決定するため、prepare が呼ばれる前に Relation を決定する必要がある。

    // === Relation Dialog ===
    const handleOpenRelation = (
        bizAction: BizActionBase<BizIOExtData, RelationExtData>
    ) => {
        return (relationID: string) => {
            console.log('handleOpenRelation', bizAction, relationID);
            handleOpenBizAction(bizAction);
        };
    };

    // == BizIONode Dragging ==
    const snappedDrag = new SnappingDrag();
    const handleDragMove = (
        targetBizIO:
            | BizIO<BizIOExtData, BizComponentGroupType>
            | CollectionBizIO<BizIOExtData, BizComponentGroupType>,
        draggedPosition: any
    ) => {
        // FIXME: 本当は対象となるRelationだけを再描画したいが、現状は全てのRelationを再描画している
        dispatchCanvas({ type: 'updateCurrentActions' });
    };
    const handleDragEnd = (
        targetBizIO:
            | BizIO<BizIOExtData, BizComponentGroupType>
            | CollectionBizIO<BizIOExtData, BizComponentGroupType>,
        draggedPosition: any
    ) => {
        // store last position
        bizmo.updateBizIO(targetBizIO);

        // FIXME: 本当は対象となるRelationだけを再描画したいが、現状は全てのRelationを再描画している
        dispatchCanvas({ type: 'updateCurrentActions' });
    };

    return (
        <>
            <DraggableGridStage gridStepSize={50} minStageHalfSize={500}>
                <Layer key="mainLayer">
                    {canvasState.storedBizIOs.map((bizIO, index) => {
                        return (
                            <BizIONodeShape
                                key={`bizIOShape_${index}`}
                                bizIO={bizIO}
                                snappedDrag={snappedDrag}
                                handleDialogOpen={handleOpenBizIONode}
                                handleDragEnd={handleDragEnd}
                                handleDragMove={handleDragMove}
                            />
                        );
                    })}

                    {canvasState.currentActions.map((action, a_index) => {
                        let relationShape = <></>;
                        let relationsToDraw:
                            | Array<
                                  BizRelationToDraw<
                                      BizIOExtData,
                                      RelationExtData
                                  >
                              >
                            | undefined = [];
                        if (action instanceof BizAction) {
                            relationsToDraw = action.getRelationsToDraw();
                        }
                        relationsToDraw?.forEach((relationToDraw) => {
                            const fromActor = getVisibleActor(
                                relationToDraw.relation.fromBizIOId
                            );
                            const toActor = getVisibleActor(
                                relationToDraw.relation.toBizIOId
                            );
                            if (fromActor && toActor) {
                                relationShape = (
                                    <>
                                        {relationShape}
                                        <BizRelationShape
                                            key={a_index}
                                            label={`${
                                                relationToDraw.relation.name ??
                                                ''
                                            } ${action.name}`}
                                            fromActor={fromActor}
                                            toActor={toActor}
                                            relationToDraw={relationToDraw}
                                            handleBizRelationOpen={handleOpenRelation(
                                                action
                                            )}
                                        />
                                    </>
                                );
                            }
                        });

                        return (
                            <Group key={`action_${a_index}`}>
                                {relationShape}
                            </Group>
                        );
                    })}
                </Layer>
            </DraggableGridStage>
            <BizIONodeDialog
                targetBizIO={popupBizIO}
                dialogOpen={popupBizIO !== undefined}
                handleDialogClose={handleCloseBizIONode}
            />
            <BizActionDialog
                targetBizAction={popupBizAction}
                dialogOpen={popupBizAction !== undefined}
                handleDialogClose={handleCloseBizAction}
            />
        </>
    );
};

function getVisibleActor(
    targetID: BizIOId
): BizActors<BizIOExtData> | undefined {
    const { bizComponent } = useBizmo();
    if (!bizComponent) return undefined;
    const actor = bizComponent().db.selectById(targetID);
    if (actor && actor instanceof BizActors) {
        if (
            actor.externalData &&
            (actor.externalData as BizIOExtData).view.visibleOnCanvas
        ) {
            return actor;
        } else {
            const ancestors = actor.actorAncestors;
            for (const i in ancestors) {
                const ancestor = ancestors[i];
                if (
                    ancestor.externalData &&
                    (ancestor.externalData as BizIOExtData).view.visibleOnCanvas
                ) {
                    return ancestor;
                }
            }
        }
    }
    return undefined;
}
