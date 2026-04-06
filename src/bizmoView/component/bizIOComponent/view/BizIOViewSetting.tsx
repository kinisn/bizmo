import { Button } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizIOExtData,
    createBizIOExtData,
} from 'bizmoView/common/external/bizIOExtData';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import SelectInput from 'bizmoView/common/form/SelectInput';
import TextInput from 'bizmoView/common/form/TextInput';
import { BizIOComponentIcon } from 'bizmoView/component/bizIOComponent/icon/IconUtil';
import { Dispatch, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Layer, Stage } from 'react-konva';
import { BizIOComponentAction, BizIOComponentState } from '../BizIOComponent';
import {
    BizIOComponentForm,
    detectGeneralBizIOType,
    initializeBizIOComponentForm,
} from '../form/BizIOComponentForm';

export const BizIOViewSetting = (props: {
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
    const initData = initializeBizIOComponentForm(treeState, targetBizIO);
    console.log('BizIOViewSetting', targetBizIO, treeState, initData);

    const formMethods = useForm<BizIOComponentForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: initData,
    });

    const handleSubmit: SubmitHandler<BizIOComponentForm> = (
        data: BizIOComponentForm
    ) => {
        dispatchState({
            type: 'updatedBizIO',
            targetId: targetBizIO.id,
            formData: data,
        });
    };

    // プレビュー用のBizIOを作成
    const originalBizIOType = detectGeneralBizIOType(targetBizIO);
    let previewBizIO: BizIO<BizIOExtData, BizComponentGroupType> = new BizIO<
        BizIOExtData,
        BizComponentGroupType
    >({
        bizIOId: 'BizIOViewSetting-Preview',
        db: targetBizIO.db,
        timetable: targetBizIO.timetable,
    });
    const copiedData = initializeBizIOComponentForm(treeState, targetBizIO);
    previewBizIO.externalData = createBizIOExtData(copiedData);
    previewBizIO.externalGroupName = targetBizIO.externalGroupName;
    useEffect(() => {
        // プレビュー用のBizIOの削除
        return () => {
            if (previewBizIO) previewBizIO.delete(false);
        };
    }, []);

    // プレビュー再描画
    useEffect(() => {
        const subscription = formMethods.watch((value, { name, type }) => {
            if (
                (name == 'ex_view_avatar_image' && type == 'change') ||
                (name == 'ex_view_avatar_conf_size_height' &&
                    type == 'change') ||
                (name == 'ex_view_avatar_conf_size_width' &&
                    type == 'change') ||
                (name == 'ex_view_avatar_conf_hasShadow' && type == 'change')
            ) {
                dispatchState({
                    type: 'rerenderCurrentFormData',
                    formData: formMethods.getValues(),
                });
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [formMethods.watch]);

    useEffect(() => {
        // Note
        // React Hook Form は useRef で内部に記録されているので rerender されても情報は変更されない。
        // そのため、 useEffect で reset する必要がある
        formMethods.reset(initData);
    }, [targetBizIO, treeState.formData == undefined]);

    return (
        <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                <div className="grid grid-cols-1 gap-2 items-center">
                    <DescriptionParts label={t('BizmoDataView.icon')}>
                        <div className="flex items-center">
                            <BizIOComponentIcon
                                bizIO={previewBizIO}
                                overwriteBizIOType={originalBizIOType}
                            />
                            <div className="pl-4 w-full">
                                <TextInput<BizIOComponentForm>
                                    name="ex_view_avatar_image"
                                    label={t('BizmoDataView.image')}
                                    disabled={
                                        treeState.innerMode == 'update'
                                            ? false
                                            : true
                                    }
                                ></TextInput>
                            </div>
                        </div>
                    </DescriptionParts>
                    {}
                    <DescriptionParts label={t('BizmoDataView.iconOnCanvas')}>
                        <SelectInput<BizIOComponentForm>
                            name="ex_view_visible_on_canvas"
                            label={t('BizmoDataView.visibleOnCanvas')}
                            disabled={
                                treeState.innerMode == 'update' ? false : true
                            }
                            className="mt-4"
                            items={[
                                {
                                    value: 1,
                                    label: 'ON',
                                },
                                {
                                    value: 0,
                                    label: 'OFF',
                                },
                            ]}
                        />
                        <div className="flex items-center justify-center bg-zinc-200 rounded p-4 my-2">
                            <Stage
                                width={Number(
                                    formMethods.getValues(
                                        'ex_view_avatar_conf_size_width'
                                    )
                                )}
                                height={
                                    Number(
                                        formMethods.getValues(
                                            'ex_view_avatar_conf_size_height'
                                        )
                                    ) + 5 // shadow部分を考慮
                                }
                            >
                                <Layer>
                                    <BizIOComponentIcon
                                        isShape={true}
                                        bizIO={previewBizIO}
                                        overwriteBizIOType={originalBizIOType}
                                    ></BizIOComponentIcon>
                                </Layer>
                            </Stage>
                        </div>

                        <DescriptionParts label={t('common.label.size')}>
                            <div className="grid grid-cols-2 gap-2 items-center">
                                <TextInput<BizIOComponentForm>
                                    name="ex_view_avatar_conf_size_width"
                                    label={t('common.label.width')}
                                    type="number"
                                    rules={{
                                        required: t(
                                            'common.validate.required',
                                            {
                                                name: t('common.label.width'),
                                            }
                                        ),
                                        min: {
                                            message: t('common.validate.min', {
                                                min: 50,
                                            }),
                                            value: 50,
                                        },
                                    }}
                                    disabled={
                                        treeState.innerMode == 'update'
                                            ? false
                                            : true
                                    }
                                ></TextInput>
                                <TextInput<BizIOComponentForm>
                                    name="ex_view_avatar_conf_size_height"
                                    label={t('common.label.height')}
                                    type="number"
                                    rules={{
                                        required: t(
                                            'common.validate.required',
                                            {
                                                name: t('common.label.height'),
                                            }
                                        ),
                                        min: {
                                            message: t('common.validate.min', {
                                                min: 50,
                                            }),
                                            value: 50,
                                        },
                                    }}
                                    disabled={
                                        treeState.innerMode == 'update'
                                            ? false
                                            : true
                                    }
                                ></TextInput>
                            </div>
                        </DescriptionParts>

                        <SelectInput<BizIOComponentForm>
                            name="ex_view_avatar_conf_hasShadow"
                            label={t('common.label.shadow')}
                            disabled={
                                treeState.innerMode == 'update' ? false : true
                            }
                            className="mt-4"
                            items={[
                                {
                                    value: 1,
                                    label: 'ON',
                                },
                                {
                                    value: 0,
                                    label: 'OFF',
                                },
                            ]}
                        />
                    </DescriptionParts>
                    {/* Submit */}
                    {treeState.innerMode == 'update' && (
                        <Button
                            type="submit"
                            variant="contained"
                            className="mt-4"
                        >
                            {t('common.label.ok')}
                        </Button>
                    )}
                </div>
            </form>
        </FormProvider>
    );
};
