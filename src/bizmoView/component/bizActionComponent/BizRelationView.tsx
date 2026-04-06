import { Button, Tooltip } from '@mui/material';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizRelation } from 'bizmo/action/core/BizRelation';
import { LinesArrowShape } from 'bizmoView/common/canvas/LinesArrowShape';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { BizIOSelector } from 'bizmoView/common/form/BizIOSelector';
import TextInput from 'bizmoView/common/form/TextInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import { Dispatch, HtmlHTMLAttributes, MouseEventHandler, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Layer, Stage } from 'react-konva';
import {
    BizActionComponentAction,
    BizActionComponentState,
} from './BizActionComponent';

export const BizRelationView = (props: {
    targetBizAction: BizAction<BizIOExtData, RelationExtData>;
    actionState: BizActionComponentState;
    actionDispatch: Dispatch<BizActionComponentAction>;
}) => {
    const { targetBizAction, actionState, actionDispatch } = props;
    const { t } = useTranslation();
    const bizmo = useBizmo();
    const handleAddRelation: MouseEventHandler<HTMLButtonElement> = () => {
        actionDispatch({
            type: 'addRelation',
            payload: {
                fromBizIOId: bizmo.bizComponent().company.id ?? '',
                toBizIOId: bizmo.bizComponent().userLifeCycles.id ?? '',
            },
        });
    };
    return (
        <div className="p-4">
            {Array.from(targetBizAction.relations.values()).map(
                (relation, index) => (
                    <BizRelationElement
                        key={`${relation.relationId}_${relation.fromBizIOId}_${relation.toBizIOId}`}
                        actionState={actionState}
                        relation={relation}
                        targetBizAction={targetBizAction}
                        actionDispatch={actionDispatch}
                    />
                )
            )}
            {actionState.mode === 'edit' && (
                <Button
                    fullWidth
                    color="primary"
                    variant="contained"
                    className="mt-8"
                    onClick={handleAddRelation}
                >
                    <MaterialIcon
                        codePoint={IconType.AddCircle}
                        className="mr-4"
                    />
                    <span className="">{t('common.label.add')}</span>
                </Button>
            )}
        </div>
    );
};

type BizRelationForm = {
    fromBizIOId: string;
    toBizIOId: string;
    name: string;
};

const BizRelationElement = (
    props: {
        actionState: BizActionComponentState;
        relation: BizRelation<RelationExtData>;
        targetBizAction: BizAction<BizIOExtData, RelationExtData>;
        actionDispatch: Dispatch<BizActionComponentAction>;
    } & HtmlHTMLAttributes<HTMLDivElement>
) => {
    const { actionState, targetBizAction, relation, actionDispatch, ...rest } =
        props;
    const { t } = useTranslation();

    const formMethods = useForm<BizRelationForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: {
            fromBizIOId: relation.fromBizIOId,
            toBizIOId: relation.toBizIOId,
            name: relation.name,
        },
    });

    // フォーム値の変更を監視して BizAction に反映する（サブスクリプション方式）
    useEffect(() => {
        const subscription = formMethods.watch((value, { name: fieldName }) => {
            if (actionState.mode === 'edit' && fieldName) {
                actionDispatch({
                    type: 'updateRelation',
                    payload: {
                        relationId: relation.relationId,
                        fromBizIOId: value.fromBizIOId ?? relation.fromBizIOId,
                        toBizIOId: value.toBizIOId ?? relation.toBizIOId,
                        name: value.name,
                    },
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [actionState.mode, relation.relationId]);

    const isRelationUsedOnOutput = targetBizAction.isUsedOnOutput(
        relation.relationId
    );

    const handleRemoveRelation: MouseEventHandler<HTMLButtonElement> = (
        event
    ) => {
        actionDispatch({
            type: 'removeRelation',
            payload: {
                relationId: event.currentTarget.value,
            },
        });
    };

    return (
        <div {...rest} className="flex flex-row items-center justify-center">
            <FormProvider {...formMethods}>
                {actionState.mode === 'edit' && isRelationUsedOnOutput && (
                    <Tooltip
                        title={t('BizActionComponent.usedOnOutput')}
                        className="mr-6"
                    >
                        <div className="flex items-center text-orange-400">
                            <MaterialIcon codePoint={IconType.Report} />
                        </div>
                    </Tooltip>
                )}
                <BizIOSelector
                    name={'fromBizIOId'}
                    setValue={formMethods.setValue}
                    selectableMode="bizActorOnly"
                    readOnly={isRelationUsedOnOutput}
                />
                <Stage width={40} height={20}>
                    <Layer>
                        <LinesArrowShape
                            start={{
                                x: 0,
                                y: 10,
                            }}
                            end={{
                                x: 40,
                                y: 10,
                            }}
                            color="white"
                            lineWidth={4}
                            arrowMode="none"
                        />
                    </Layer>
                </Stage>
                {actionState.mode === 'edit' ? (
                    <TextInput className="max-w-64" name={'name'} />
                ) : (
                    <div className="mx-4">{relation.name ?? '...'}</div>
                )}
                <Stage width={40} height={20}>
                    <Layer>
                        <LinesArrowShape
                            start={{
                                x: 0,
                                y: 10,
                            }}
                            end={{
                                x: 36,
                                y: 10,
                            }}
                            lineWidth={4}
                            color="white"
                        />
                    </Layer>
                </Stage>
                <BizIOSelector
                    name={'toBizIOId'}
                    setValue={formMethods.setValue}
                    selectableMode="bizActorOnly"
                    readOnly={isRelationUsedOnOutput}
                />
                {actionState.mode === 'edit' && (
                    <Tooltip title={t('common.label.delete')} className="ml-4">
                        <span>
                            <Button
                                value={relation.relationId}
                                aria-label="delete"
                                color="error"
                                disabled={isRelationUsedOnOutput}
                                onClick={handleRemoveRelation}
                            >
                                <MaterialIcon codePoint={IconType.Trash} />
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </FormProvider>
        </div>
    );
};
