import { ProbBin } from 'bizmo/core/hyperParam/prob/ProbBin';
import {
    FixedWidthBinResult,
    validateFixedWidthBin,
} from 'bizmo/core/hyperParam/prob/ProbHyperParam';
import TextInput from 'bizmoView/common/form/TextInput';
import Decimal from 'decimal.js';
import { ChangeEventHandler } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProbChartWithTooltip } from '../common/ProbChart';
import { HParamForm } from './HyperParameterDetailView';

/**
 * ProbHParamの場合の共通設定
 * @param param0
 * @returns
 */
export const ProbHParamCommonSetting = ({
    orderedBins,
    lowerLimit,
    upperLimit,
    meanProbBin,
    onBlur,
    formMethods,
}: {
    orderedBins: Array<ProbBin>;
    lowerLimit: Decimal;
    upperLimit: Decimal;
    meanProbBin?: ProbBin;
    onBlur: ChangeEventHandler;
    formMethods: UseFormReturn<HParamForm, any>;
}) => {
    const { t } = useTranslation();
    return (
        <div className="grid grid-cols-auto240auto items-end">
            {/** 上段の中央 */}
            <div className="flex justify-center col-span-3">
                <span className="text-3xl mb-2">
                    {meanProbBin?.value.toString()}
                </span>
            </div>
            {/** 中断の中央にグラフ */}
            <div className="flex justify-end mr-4">
                <TextInput<HParamForm>
                    name="lowerLimit"
                    label={t('hyperParam.lowerLimit')}
                    variant="standard"
                    rules={{
                        required: t('common.validate.required', {
                            name: t('hyperParam.lowerLimit'),
                        }),
                        validate: (v) => {
                            let result = false;
                            try {
                                // validate Decimal
                                const current = new Decimal(v);
                                if (!current.isNaN()) {
                                    // more then LL
                                    if (
                                        new Decimal(
                                            formMethods.getValues().upperLimit
                                        ).greaterThan(current)
                                    ) {
                                        result = true;
                                    } else {
                                        return t('common.validate.less', {
                                            less: t('hyperParam.upperLimit'),
                                        });
                                    }
                                } else {
                                    return t('common.validate.number');
                                }
                            } catch (ex) {
                                return t('common.validate.number');
                            }
                            return result;
                        },
                    }}
                    onBlur={onBlur}
                    required
                />
            </div>
            <ProbChartWithTooltip
                orderedBins={orderedBins}
                lowerLimit={lowerLimit}
                upperLimit={upperLimit}
                meanProbBin={meanProbBin}
                width={240}
                height={240}
            />
            <div className="flex justify-start ml-4">
                <TextInput<HParamForm>
                    name="upperLimit"
                    label={t('hyperParam.upperLimit')}
                    variant="standard"
                    rules={{
                        required: t('common.validate.required', {
                            name: t('hyperParam.upperLimit'),
                        }),
                        validate: (v) => {
                            let result = false;
                            try {
                                // validate Decimal
                                const current = new Decimal(v);
                                if (!current.isNaN()) {
                                    // more then LL
                                    if (
                                        new Decimal(
                                            formMethods.getValues().lowerLimit
                                        ).lessThan(current)
                                    ) {
                                        result = true;
                                    } else {
                                        return t('common.validate.greater', {
                                            greater: t('hyperParam.lowerLimit'),
                                        });
                                    }
                                } else {
                                    return t('common.validate.number');
                                }
                            } catch (ex) {
                                return t('common.validate.number');
                            }
                            return result;
                        },
                    }}
                    onBlur={onBlur}
                    required
                />
            </div>
            {/** 下段の中央 */}
            <div className="flex justify-center col-span-3 mt-4">
                <div>
                    <TextInput<HParamForm>
                        name="bins"
                        label={t('hyperParam.unit')}
                        variant="standard"
                        rules={{
                            required: t('common.validate.required', {
                                name: t('hyperParam.unit'),
                            }),
                            max: {
                                value: 100,
                                message: t('common.validate.max', {
                                    max: 100,
                                }),
                            },
                            min: {
                                value: 1,
                                message: t('common.validate.min', {
                                    min: 1,
                                }),
                            },
                            validate: (v) => {
                                try {
                                    const target = new Decimal(v);
                                    if (!target.isNaN() && target.isInteger()) {
                                        if (
                                            validateFixedWidthBin(
                                                target,
                                                new Decimal(
                                                    formMethods.getValues().lowerLimit
                                                ),
                                                new Decimal(
                                                    formMethods.getValues().upperLimit
                                                )
                                            ).result ==
                                            FixedWidthBinResult.SUCCESS
                                        ) {
                                            return true;
                                        } else {
                                            return t(
                                                'hyperParam.splitToFixedWidth'
                                            );
                                        }
                                    } else {
                                        return t(
                                            'common.validate.betweenInteger',
                                            {
                                                min: 1,
                                                max: 100,
                                            }
                                        );
                                    }
                                } catch (ex) {
                                    return t('common.validate.betweenInteger', {
                                        min: 1,
                                        max: 100,
                                    });
                                }
                            },
                        }}
                        onBlur={onBlur}
                        required
                    />
                </div>
            </div>
        </div>
    );
};
