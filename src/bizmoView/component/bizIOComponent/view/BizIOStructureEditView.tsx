import { Button, Checkbox, Divider, FormControlLabel } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { FunnelComponent } from 'bizmo/core/bizIO/component/FunnelComponent';
import { RateComponent } from 'bizmo/core/bizIO/component/RateComponent';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { BizIOSelector } from 'bizmoView/common/form/BizIOSelector';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import TextInput from 'bizmoView/common/form/TextInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { t } from 'i18next';
import { Dispatch, useEffect, useState } from 'react';
import {
    FormProvider,
    SubmitHandler,
    useFieldArray,
    useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
    BizIOComponentAction,
    BizIOComponentState,
    SystemProvidedDescription,
} from '../BizIOComponent';
import {
    AutoComplementSelector,
    BizIOComponentForm,
    BizIOTypeSelector,
    detectBizIOTypeDocs,
    initializeBizIOComponentForm,
} from '../form/BizIOComponentForm';
import {
    AccountNameSelector,
    ComplementSelector,
    IsMonetarySelector,
} from '../form/CommonBizIOForm';
import { CollectionViewerParts } from '../parts/collectionViewer/CollectionViewerParts';

export const BizIOStructureEditView = (props: {
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

    const isUpdate = treeState.innerMode === 'update';

    // 全種類のFormをflattenして初期化する
    const initData = initializeBizIOComponentForm(
        treeState,
        isUpdate ? targetBizIO : undefined
    );
    const formMethods = useForm<BizIOComponentForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: initData,
    });

    const funnelOrderFieldsMethods = useFieldArray<BizIOComponentForm>({
        name: 'funnelComponent_biz_io_order',
        control: formMethods.control,
    });

    let parts;
    let targetType;
    if (isUpdate) {
        targetType = initData.type;
    } else {
        targetType = treeState.formData?.type ?? 'BizIO';
    }
    parts = (
        <p className="p-4 rounded-lg bg-zinc-800">
            {detectBizIOTypeDocs(targetType).desc}
        </p>
    );
    switch (targetType) {
        // 専用の追加表示
        case 'UnitComponent':
            parts = (
                <>
                    {parts}
                    <AutoComplementSelector<BizIOComponentForm>
                        disabled={isUpdate && isSystemLabeled}
                    />
                </>
            );
            break;
        case 'RateComponent':
            parts = (
                <>
                    <DescriptionParts
                        label={t('CommonForm.RateComponent.label')}
                    >
                        <BizIOSelector<BizIOComponentForm>
                            name="rateComponent_numerator_id"
                            label={t('RateComponent.NUMERATOR')}
                            rules={{
                                required: t('common.validate.required', {
                                    name: t('RateComponent.NUMERATOR'),
                                }),
                                validate: (v) => {
                                    const denominatorId = formMethods.getValues(
                                        'rateComponent_denominator_id'
                                    );

                                    // 1. 分母と分子が同じ場合は重複エラー
                                    if (denominatorId == v) {
                                        return t('common.validate.duplicated');
                                    }

                                    // 2. 循環参照を確認する
                                    let validated = false;
                                    const newNumerator =
                                        targetBizIO.db.selectById(v);
                                    const newDenominator =
                                        targetBizIO.db.selectById(
                                            denominatorId
                                        );

                                    if (
                                        newDenominator &&
                                        newNumerator &&
                                        targetBizIO instanceof RateComponent
                                    ) {
                                        // 更新する場合には RateComponent の専用メソッドで確認する。
                                        // これは RateComponent が分子と分母を持っており、除外できないValidation時に既存のChildを含めて判断してしまうため。
                                        validated = targetBizIO.setFraction(
                                            newNumerator,
                                            newDenominator
                                        );
                                    } else if (newNumerator) {
                                        // FIXME どちらか未設定なら確認不要？？
                                        validated =
                                            targetBizIO.db.validateToAddChild(
                                                newNumerator,
                                                targetBizIO
                                            );
                                    }
                                    return (
                                        validated ||
                                        t('common.validate.circularReference')
                                    );
                                },
                            }}
                            setValue={formMethods.setValue}
                            readOnly={isUpdate && isSystemLabeled}
                        />
                        <Divider className="my-4" />
                        <BizIOSelector<BizIOComponentForm>
                            name="rateComponent_denominator_id"
                            label={t('RateComponent.DENOMINATOR')}
                            rules={{
                                required: t('common.validate.required', {
                                    name: t('RateComponent.DENOMINATOR'),
                                }),
                                validate: (v) => {
                                    const numeratorId = formMethods.getValues(
                                        'rateComponent_numerator_id'
                                    );

                                    // 1. 分母と分子が同じ場合は重複エラー
                                    if (numeratorId == v) {
                                        return t('common.validate.duplicated');
                                    }

                                    // 2. 循環参照を確認する
                                    let validated = false;
                                    const newDenominator =
                                        targetBizIO.db.selectById(v);
                                    const newNumerator =
                                        targetBizIO.db.selectById(numeratorId);

                                    if (
                                        newDenominator &&
                                        newNumerator &&
                                        targetBizIO instanceof RateComponent
                                    ) {
                                        // 更新する場合には RateComponent の専用メソッドで確認する。
                                        // これは RateComponent が分子と分母を持っており、除外できないValidation時に既存のChildを含めて判断してしまうため。
                                        validated = targetBizIO.setFraction(
                                            newNumerator,
                                            newDenominator
                                        );
                                    } else if (newDenominator) {
                                        // FIXME どちらか未設定なら確認不要？？
                                        validated =
                                            targetBizIO.db.validateToAddChild(
                                                newDenominator,
                                                targetBizIO
                                            );
                                    }
                                    return (
                                        validated ||
                                        t('common.validate.circularReference')
                                    );
                                },
                            }}
                            setValue={formMethods.setValue}
                            readOnly={isUpdate && isSystemLabeled}
                        />
                    </DescriptionParts>
                    <HasOwnValueInputs
                        isSystemLabeled={isSystemLabeled}
                        isUpdate={isUpdate}
                    />
                </>
            );
            break;
        case 'FunnelComponent':
            const currentOrderedBizIdsLength =
                isUpdate && targetBizIO instanceof FunnelComponent
                    ? targetBizIO.orderedBizIds.length
                    : 0;
            parts = (
                <>
                    {parts}
                    <DescriptionParts label={t('FunnelComponent.order')}>
                        <div className="p-2">
                            {funnelOrderFieldsMethods.fields.map(
                                (field, index) => {
                                    const targetName = t(
                                        'FunnelComponent.orderLabel',
                                        {
                                            order: index + 1,
                                        }
                                    );
                                    return (
                                        <div key={index}>
                                            <div className="flex">
                                                <div className="w-full mr-4">
                                                    <BizIOSelector<BizIOComponentForm>
                                                        keyID={field.id}
                                                        name={`funnelComponent_biz_io_order.${index}.bizId`}
                                                        label={targetName}
                                                        rules={{
                                                            required: t(
                                                                'common.validate.required',
                                                                {
                                                                    name: targetName,
                                                                }
                                                            ),
                                                            validate: (v) => {
                                                                // TODO 全ての順序を一気に確認する必要がある。
                                                                let validated =
                                                                    true;
                                                                return validated;
                                                            },
                                                        }}
                                                        setValue={
                                                            formMethods.setValue
                                                        }
                                                        readOnly={
                                                            index <
                                                                currentOrderedBizIdsLength ||
                                                            (isUpdate &&
                                                                isSystemLabeled)
                                                        }
                                                    />
                                                </div>

                                                {index >=
                                                    currentOrderedBizIdsLength && (
                                                    <Button
                                                        onClick={() => {
                                                            funnelOrderFieldsMethods.remove(
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
                                                )}
                                            </div>
                                            {index <
                                                funnelOrderFieldsMethods.fields
                                                    .length &&
                                                !(
                                                    isUpdate && isSystemLabeled
                                                ) && (
                                                    <div className="pt-4 w-full flex justify-center">
                                                        <MaterialIcon
                                                            codePoint={
                                                                IconType.FilterList
                                                            }
                                                            className="text-2xl"
                                                        />
                                                    </div>
                                                )}
                                        </div>
                                    );
                                }
                            )}
                            {!(isUpdate && isSystemLabeled) && (
                                <>
                                    <Button
                                        className="w-full my-4"
                                        variant="contained"
                                        onClick={() => {
                                            funnelOrderFieldsMethods.append({
                                                bizId: '',
                                            });
                                            dispatchState({
                                                type: 'rerenderCurrentFormData',
                                                formData:
                                                    formMethods.getValues(),
                                            });
                                        }}
                                    >
                                        <MaterialIcon
                                            codePoint={IconType.AddCircle}
                                            className="pr-2"
                                        />
                                        {t('common.label.add')}
                                    </Button>
                                </>
                            )}
                        </div>
                    </DescriptionParts>
                </>
            );
            break;
        // 追加表示しない
        case 'BizActors':
        case 'CohortComponent':
        case 'CollectionBizIO': // folder
            break;
        // HasOwnValueInputsを表示
        case 'CollectionBizIO:TOTAL_AMOUNT':
        case 'CollectionBizIO:TOTAL_MULTIPLE':
        case 'CollectionBizIO:ACCUMULATE':
        case 'CollectionBizIO:Calculate':
        default: //  'BizIO':
            parts = (
                <>
                    {parts}
                    <HasOwnValueInputs
                        isSystemLabeled={isSystemLabeled}
                        isUpdate={isUpdate}
                    />
                </>
            );
            break;
    }

    const handleSubmit: SubmitHandler<BizIOComponentForm> = (
        data: BizIOComponentForm
    ) => {
        if (isUpdate) {
            dispatchState({
                type: 'updatedBizIO',
                targetId: treeState.selectedNodeId,
                formData: data,
            });
        } else {
            dispatchState({
                type: 'addBizIO',
                targetId: treeState.selectedNodeId,
                formData: data,
            });
        }
    };

    useEffect(() => {
        const subscription = formMethods.watch((value, { name, type }) => {
            if (name == 'type' && type == 'change') {
                // 種別の変更
                dispatchState({
                    type: 'rerenderCurrentFormData',
                    formData: formMethods.getValues(),
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [formMethods.watch]);

    useEffect(() => {
        // Note
        // React Hook Form は useRef で内部に記録されているので rerender されても情報は変更されない。
        // そのため、 useEffect で reset する必要がある
        formMethods.reset(initData);
    }, [
        isUpdate,
        targetBizIO,
        treeState.formData?.funnelComponent_biz_io_order,
    ]);

    return (
        <>
            <div className="p-4">
                <FormProvider {...formMethods}>
                    <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
                        <div>
                            <div className="grid grid-cols-1 gap-8 items-center">
                                <CommonValueInputs
                                    targetBizIO={targetBizIO}
                                    parentBizIOs={parentBizIOs}
                                    isUpdate={isUpdate}
                                />
                                <Divider>
                                    <BizIOTypeSelector<BizIOComponentForm>
                                        disabled={isUpdate}
                                    />
                                </Divider>
                                {/* 個別Edit */}
                                {parts}

                                {isSystemLabeled && isUpdate && (
                                    <SystemProvidedDescription />
                                )}
                                {/* Submit */}
                                <Button type="submit" variant="contained">
                                    {t('common.label.ok')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </div>
            {
                // Update の場合だけ Tree を表示する。
                // Add で Tree を表示すると、親となるBizIOが追加される前に、子要素が生成される危険があるため。
                isUpdate && targetBizIO && (
                    <div className="pt-4">
                        <CollectionViewerParts {...props} />
                    </div>
                )
            }
            <DeleteParts
                isSystemLabeled={isSystemLabeled}
                treeState={treeState}
                dispatchState={dispatchState}
            />
        </>
    );
};

/**
 * BizIO共通入力項目
 *
 * SystemLabeled = true でも更新可能
 * @param props
 * @returns
 */
const CommonValueInputs = (props: {
    targetBizIO:
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | BizIO<BizIOExtData, BizComponentGroupType>;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    isUpdate: boolean;
}) => {
    const { targetBizIO, parentBizIOs, isUpdate } = props;
    return (
        <>
            <TextInput<BizIOComponentForm>
                name="name"
                label={t('CommonForm.name')}
                variant="standard"
                rules={{
                    required: t('common.validate.required', {
                        name: t('CommonForm.name'),
                    }),
                    validate: (v) => {
                        if (isUpdate) {
                            // 更新： 親全体の中で重複しないこと（ただし自分自身はOK）
                            if (parentBizIOs) {
                                for (const parent of parentBizIOs) {
                                    const candidateId =
                                        parent.idLabeledNames.getContentByLabel(
                                            v
                                        );
                                    if (
                                        candidateId &&
                                        targetBizIO &&
                                        candidateId != targetBizIO.id
                                    ) {
                                        return t('common.validate.duplicated');
                                    }
                                }
                            }
                            return true;
                        } else {
                            // 追加：selectedBizIO が親Collectionになることが確定している
                            return (
                                !(
                                    targetBizIO as CollectionBizIO
                                ).idLabeledNames.isIncludedLabel(v) ||
                                t('common.validate.duplicated')
                            );
                        }
                    },
                }}
                // required // ブラウザ標準のバリデーションも働き使いにくい。使わないこと。
            />
            <TextInput<BizIOComponentForm>
                name="structure_memo"
                label={t('CommonForm.memo')}
                variant="standard"
                multiline
            />
        </>
    );
};

const HasOwnValueInputs = (props: {
    isSystemLabeled: boolean;
    isUpdate: boolean;
}) => {
    const { isSystemLabeled, isUpdate } = props;
    // システムで利用しているクラス：　Updateできなくする
    // 汎用クラス：　原則Updateできる
    return (
        <DescriptionParts label={t('CommonBizIOForm.ownValue')}>
            <div className="p-1 space-y-5">
                <IsMonetarySelector<BizIOComponentForm>
                    disabled={isUpdate && isSystemLabeled}
                />
                <ComplementSelector<BizIOComponentForm>
                    disabled={isUpdate && isSystemLabeled}
                />
                <AccountNameSelector<BizIOComponentForm>
                    disabled={isUpdate && isSystemLabeled}
                />
            </div>
        </DescriptionParts>
    );
};

const DeleteParts = (props: {
    isSystemLabeled: boolean;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
}) => {
    const { t } = useTranslation();
    const { isSystemLabeled, treeState, dispatchState } = props;

    const [accepted, setAccepted] = useState(false);
    const handleAcceptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAccepted(event.target.checked);
    };

    const handleRemove = (event: any) => {
        dispatchState({
            type: 'removeBizIO',
            targetId: treeState.selectedNodeId,
            parentId:
                treeState.selectedHierarchy[
                    treeState.selectedHierarchy.length - 2 // handleRemove を表示する前にlengthが確認されているので、-2 で親を取得する
                ],
        });
    };

    return treeState.innerMode === 'update' &&
        !isSystemLabeled &&
        treeState.selectedHierarchy.length > 1 ? (
        <div className="mt-8 py-2 px-4 flex items-center rounded border-red-500 border">
            <div className="flex-grow pr-4">
                <FormControlLabel
                    control={
                        <Checkbox
                            name={'accepted'}
                            onChange={handleAcceptChange}
                        />
                    }
                    label={
                        <span className="text-base">
                            {t('CommonForm.removeMessage')}
                        </span>
                    }
                />
            </div>
            <Button
                variant="contained"
                color="error"
                disabled={!accepted}
                onClick={handleRemove}
            >
                <span className="flex items-center">
                    <MaterialIcon codePoint={IconType.Trash} />
                    <span className="pl-2">{t('common.label.delete')}</span>
                </span>
            </Button>
        </div>
    ) : (
        <></>
    );
};
