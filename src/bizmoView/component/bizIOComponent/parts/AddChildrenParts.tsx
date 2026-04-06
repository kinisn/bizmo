import { Button, Chip, Divider } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { BizIOSelector } from 'bizmoView/common/form/BizIOSelector';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { t } from 'i18next';
import { Dispatch, useEffect } from 'react';
import {
    FormProvider,
    SubmitHandler,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import {
    BizIOComponentAction,
    BizIOComponentState,
    BizIOSelectableMode,
} from '../BizIOComponent';
import {
    BizIOComponentForm,
    initializeBizIOComponentForm,
} from '../form/BizIOComponentForm';

export const AddChildrenParts = (props: {
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

    const initData = initializeBizIOComponentForm(treeState, targetBizIO);

    const formMethods = useForm<BizIOComponentForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: initData,
    });
    const addChildrenMethods = useFieldArray<BizIOComponentForm>({
        name: 'addChildren',
        control: formMethods.control,
    });

    const handleSubmit: SubmitHandler<BizIOComponentForm> = (
        data: BizIOComponentForm
    ) => {
        dispatchState({
            type: 'addChild',
            targetId: treeState.selectedNodeId,
            addChildren: data.addChildren,
        });
    };

    useEffect(() => {
        // Note
        // React Hook Form は useRef で内部に記録されているので rerender されても情報は変更されない。
        // そのため、 useEffect で reset する必要がある
        formMethods.reset(initData);
    }, [targetBizIO, treeState.formData?.addChildren]);

    // Targetに応じて、選択追加が可能なBizIOを変更する
    let selectableMode: BizIOSelectableMode = 'all';
    if (targetBizIO instanceof CollectionBizIO && targetBizIO.hasOwnValue) {
        selectableMode = 'hasValueOnly';
    }

    return (
        <div className="p-4  rounded-md">
            <Divider className="mb-4">
                <Chip
                    icon={<MaterialIcon codePoint={IconType.AddTask} />}
                    label={t('common.label.addBySelection')}
                    className="ml-4"
                />
            </Divider>

            <FormProvider {...formMethods}>
                <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                    <div className="grid grid-cols-1 gap-8 items-center">
                        <DescriptionParts
                            label={t('BizIOComponent.addingBizIO')}
                        >
                            <div className="p-2">
                                {addChildrenMethods.fields.map(
                                    (field, index) => {
                                        const targetName = t(
                                            'FunnelComponent.orderLabel',
                                            {
                                                order: index + 1,
                                            }
                                        );
                                        return (
                                            <div
                                                className="flex mb-2"
                                                key={index}
                                            >
                                                <div className="w-full mr-4">
                                                    <BizIOSelector<BizIOComponentForm>
                                                        keyID={field.id}
                                                        name={`addChildren.${index}.bizId`}
                                                        rules={{
                                                            required: t(
                                                                'common.validate.required',
                                                                {
                                                                    name: t(
                                                                        'BizIOComponent.addingBizIO'
                                                                    ),
                                                                }
                                                            ),
                                                            validate: (v) => {
                                                                // 循環参照を確認する
                                                                let validated =
                                                                    false;
                                                                const childCandidate =
                                                                    (
                                                                        targetBizIO as
                                                                            | CollectionBizIO<
                                                                                  BizIOExtData,
                                                                                  BizComponentGroupType
                                                                              >
                                                                            | BizIO<
                                                                                  BizIOExtData,
                                                                                  BizComponentGroupType
                                                                              >
                                                                    ).db.selectById(
                                                                        v
                                                                    );

                                                                if (
                                                                    childCandidate
                                                                ) {
                                                                    validated =
                                                                        targetBizIO.db.validateToAddChild(
                                                                            childCandidate,
                                                                            targetBizIO
                                                                        );
                                                                }
                                                                return (
                                                                    validated ||
                                                                    t(
                                                                        'common.validate.circularReference'
                                                                    )
                                                                );
                                                            },
                                                        }}
                                                        setValue={
                                                            formMethods.setValue
                                                        }
                                                        selectableMode={
                                                            selectableMode
                                                        }
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => {
                                                        addChildrenMethods.remove(
                                                            index
                                                        );
                                                        dispatchState({
                                                            type: 'rerenderCurrentFormData',
                                                            formData:
                                                                formMethods.getValues(),
                                                        });
                                                    }}
                                                >
                                                    <MaterialIcon
                                                        codePoint={
                                                            IconType.RemoveCircle
                                                        }
                                                    />
                                                </Button>
                                            </div>
                                        );
                                    }
                                )}

                                <Button
                                    className="w-full mt-4 mb-4"
                                    variant="contained"
                                    onClick={() => {
                                        addChildrenMethods.append({
                                            bizId: '',
                                        });
                                        dispatchState({
                                            type: 'rerenderCurrentFormData',
                                            formData: formMethods.getValues(),
                                        });
                                    }}
                                >
                                    <MaterialIcon
                                        codePoint={IconType.AddCircle}
                                        className="pr-2"
                                    />
                                    {t('common.label.add')}
                                </Button>
                            </div>
                        </DescriptionParts>
                        {/* Submit */}
                        <Button type="submit" variant="contained">
                            {t('common.label.ok')}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
