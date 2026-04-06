import { Button, Divider, IconButton, Paper } from '@mui/material';
import {
    HyperParam,
    HyperParamTypes,
} from 'bizmo/core/hyperParam/HyperParamManager';
import {
    FixedWidthBinResult,
    ProbHyperParam,
    validateFixedWidthBin,
} from 'bizmo/core/hyperParam/prob/ProbHyperParam';
import { NormalDistribution } from 'bizmo/core/hyperParam/prob/cdf/NormalDistribution';
import { TriangleDistribution } from 'bizmo/core/hyperParam/prob/cdf/TriangleDistribution';
import { UniformDistribution } from 'bizmo/core/hyperParam/prob/cdf/UniformDistribution';
import SelectInput from 'bizmoView/common/form/SelectInput';
import TextInput from 'bizmoView/common/form/TextInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import Decimal from 'decimal.js';
import { useBizmo } from 'globalState/useBizmo';
import { Dispatch, useEffect, useMemo } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';
import { HParamTypeRelatedDetail } from './HParamTypeRelatedDetail';

/**
 * HyperParameterDetailView
 * @param props
 * @returns
 */
export const HyperParameterDetailView = (props: {
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const { pageState, dispatchPageState } = props;
    const hyperMG = useBizmo().hyperMG();
    if (!hyperMG) return <></>;

    // i18n
    const { t } = useTranslation();
    const commonT = useTranslation('translation', {
        keyPrefix: 'common.hyperParamTypes',
    });

    // hyperParam
    const hParamTypeLabel = useMemo(
        () =>
            Object.keys(HyperParamTypes).map((option) => {
                return {
                    value: option,
                    label: commonT.t(option as HyperParamTypes),
                };
            }),
        [commonT]
    );

    // form
    const defaultHParamForm = initializeHParamForm(pageState.currentFormHParam);
    const methods = useForm<HParamForm>({
        defaultValues: defaultHParamForm,
        mode: 'onBlur',
        reValidateMode: 'onBlur',
    });
    const handleSubmit: SubmitHandler<HParamForm> = (data: HParamForm) => {
        dispatchPageState({ type: 'submittedHPram', formData: data });
    };
    const handleCancel = () => {
        dispatchPageState({ type: 'cancel' });
    };

    useEffect(() => {
        // Note
        // React Hook Form は useRef で内部に記録されているので rerender されても情報は変更されない。
        // そのため、 useEffect で reset する必要がある
        methods.reset(defaultHParamForm);
    }, [pageState]);

    useEffect(() => {
        // select の変更に対応
        const subscription = methods.watch((value, { name, type }) => {
            if (name == 'type' && type == 'change') {
                dispatchPageState({
                    type: 'changeCurrentFormHParam',
                    currentFormHParam: fillHyperParam(methods.getValues()),
                });
            }
        });
        return () => subscription.unsubscribe();
    }, [methods.watch]);

    return (
        <Paper className="bg-black">
            <div className="grid grid-cols-2 items-center px-4 py-2">
                <div className="flex flex-row items-center">
                    <span className="text-lg">
                        {t('hyperParam.detailViewTitle')}
                    </span>
                </div>
                <div className="flex justify-end">
                    <IconButton aria-label="close" onClick={handleCancel}>
                        <MaterialIcon
                            codePoint={IconType.Close}
                            style={{ fontSize: '1.75rem' }}
                        />
                    </IconButton>
                </div>
            </div>
            <Paper>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSubmit)}>
                        <div className="p-4">
                            <div className="grid grid-cols-1 gap-8 items-center">
                                <TextInput<HParamForm>
                                    name="name"
                                    label={t('hyperParam.name')}
                                    rules={{
                                        required: t(
                                            'common.validate.required',
                                            { name: t('hyperParam.name') }
                                        ),
                                        minLength: {
                                            value: 4,
                                            message: t(
                                                'common.validate.minLength',
                                                { min: 4 }
                                            ),
                                        },
                                        validate: (v) => {
                                            let result = false;
                                            switch (pageState.viewMode) {
                                                case 'add':
                                                    result = hyperMG.get(v)
                                                        ? false
                                                        : true;
                                                    break;
                                                case 'edit':
                                                    // 名称変更していない場合には自分自身がとれるのは当然。
                                                    // 変更された場合にだけ、他の名称と比較
                                                    if (
                                                        !hyperMG.get(v) ||
                                                        hyperMG.get(v)?.id ==
                                                            pageState
                                                                .targetHParam.id
                                                    ) {
                                                        result = true;
                                                    }
                                                    break;
                                            }
                                            return (
                                                result ||
                                                t('common.validate.duplicated')
                                            );
                                        },
                                    }}
                                    variant="standard"
                                    required
                                />

                                <Divider>
                                    <SelectInput<HParamForm>
                                        name="type"
                                        label={t('hyperParam.type')}
                                        items={hParamTypeLabel}
                                    ></SelectInput>
                                </Divider>

                                <HParamTypeRelatedDetail
                                    formMethods={methods}
                                    pageState={pageState}
                                    dispatchPageState={dispatchPageState}
                                />

                                <Button type="submit" variant="contained">
                                    {t('common.label.ok')}
                                </Button>
                            </div>
                        </div>
                    </form>
                </FormProvider>
            </Paper>
        </Paper>
    );
};

/**
 * HyperParam Form設定
 * HyperParam設定のため、全項目をFlattenしたもの
 */
export type HParamForm = {
    // 共通
    name: string;
    type: string;
    // decimal
    decimalValue: string;
    // probHyperParam共通
    bins: number; // unitそのものを設定せず FixedWidthBinで設定する
    lowerLimit: string;
    upperLimit: string;
    // Normal Dist.
    normalDistMean: string;
    normalDistSD: string;
    // Triangle Dist.
    triangleDistMean: string;
};

/**
 * HyperParam から HParamForm を生成する
 *
 * HyperParamに該当値が存在しない場合には、初期値を設定する
 * @param hyperParam
 * @returns
 */
function initializeHParamForm(hyperParam: HyperParam): HParamForm {
    const valueSeed = {
        name: hyperParam.name,
        type: String(hyperParam.paramType),
        // probHyperParam共通
        bins:
            hyperParam.element instanceof ProbHyperParam
                ? hyperParam.element.orderedBins.length
                : 10,
        lowerLimit:
            hyperParam.element instanceof ProbHyperParam
                ? hyperParam.element.lowerLimit.toString()
                : hyperParam.element.minus(new Decimal(10)).toString(),
        upperLimit:
            hyperParam.element instanceof ProbHyperParam
                ? hyperParam.element.upperLimit.toString()
                : hyperParam.element.plus(new Decimal(10)).toString(),
    };

    const middleValue = new Decimal(valueSeed.upperLimit)
        .plus(new Decimal(valueSeed.lowerLimit))
        .div(new Decimal(2));
    const middleRange = new Decimal(valueSeed.upperLimit).minus(
        new Decimal(valueSeed.lowerLimit)
    );
    const defaultValues = {
        // decimal
        decimalValue:
            hyperParam.paramType == HyperParamTypes.DECIMAL
                ? hyperParam.element.toString()
                : middleValue.toString(),
        // Normal Dist.
        normalDistMean:
            hyperParam.paramType == HyperParamTypes.NORMAL_DISTR
                ? (
                      (hyperParam.element as ProbHyperParam)
                          .cdf as NormalDistribution
                  ).mean.toString()
                : middleValue.toString(),
        normalDistSD:
            hyperParam.paramType == HyperParamTypes.NORMAL_DISTR
                ? (
                      (hyperParam.element as ProbHyperParam)
                          .cdf as NormalDistribution
                  ).sd.toString()
                : middleRange.div(new Decimal(5)).toString(),
        // Triangle Dist.
        triangleDistMean:
            hyperParam.paramType == HyperParamTypes.TRIANGLE_DISTR
                ? (
                      (hyperParam.element as ProbHyperParam)
                          .cdf as TriangleDistribution
                  ).mode.toString()
                : middleValue.toString(),
        ...valueSeed,
    };
    return defaultValues;
}

/**
 * HParamForm から HyperParam を生成する
 * @param data
 * @param targetHParam 設定する対象となるHyperParam。指定しない場合には新規作成される
 * @returns
 */
export function fillHyperParam(
    data: HParamForm,
    targetHParam?: HyperParam
): HyperParam {
    const target = targetHParam ?? new HyperParam({ element: new Decimal(0) });
    if (target) {
        target.name = data.name;
        if (data.type == HyperParamTypes.DECIMAL) {
            target.element = new Decimal(data.decimalValue);
        } else {
            let probInit = undefined;
            // FixedWidthBinsを前提とする
            const binResult = validateFixedWidthBin(
                new Decimal(data.bins),
                new Decimal(data.lowerLimit),
                new Decimal(data.upperLimit)
            );
            const unit =
                binResult.result == FixedWidthBinResult.SUCCESS
                    ? binResult.value
                    : new Decimal(10); // 事前に調整された値が入っているはずなので、ここが選択される可能性はない
            switch (data.type) {
                case HyperParamTypes.UNIFORM_DISTR:
                    probInit = {
                        unit: new Decimal(unit),
                        lowerLimit: new Decimal(data.lowerLimit),
                        upperLimit: new Decimal(data.upperLimit),
                        cdf: new UniformDistribution(),
                    };
                    break;
                case HyperParamTypes.NORMAL_DISTR:
                    probInit = {
                        unit: new Decimal(unit),
                        lowerLimit: new Decimal(data.lowerLimit),
                        upperLimit: new Decimal(data.upperLimit),
                        cdf: new NormalDistribution(
                            new Decimal(data.normalDistMean),
                            new Decimal(data.normalDistSD)
                        ),
                    };
                    break;
                case HyperParamTypes.TRIANGLE_DISTR:
                    probInit = {
                        unit: new Decimal(unit),
                        lowerLimit: new Decimal(data.lowerLimit),
                        upperLimit: new Decimal(data.upperLimit),
                        cdf: new TriangleDistribution(
                            new Decimal(data.triangleDistMean)
                        ),
                    };
                    break;
            }
            target.element = new ProbHyperParam(probInit);
        }
    }
    return target;
}
