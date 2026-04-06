import { HyperParamTypes } from 'bizmo/core/hyperParam/HyperParamManager';
import { ProbHyperParam } from 'bizmo/core/hyperParam/prob/ProbHyperParam';
import TextInput from 'bizmoView/common/form/TextInput';
import Decimal from 'decimal.js';
import { Dispatch } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';
import { HParamForm, fillHyperParam } from './HyperParameterDetailView';
import { ProbHParamCommonSetting } from './ProbHParamCommonSetting';

/**
 * ProbHParamの場合の設定
 * @param props
 * @returns
 */
export const ProbHParamSetting = (props: {
    formMethods: UseFormReturn<HParamForm, any>;
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const { formMethods, pageState, dispatchPageState } = props;
    const { t } = useTranslation();
    const formHParam = pageState.currentFormHParam.element as ProbHyperParam;

    const handleOnBlur = () => {
        if (formMethods.formState.isValid) {
            dispatchPageState({
                type: 'changeCurrentFormHParam',
                currentFormHParam: fillHyperParam(formMethods.getValues()),
            });
        }
    };

    // construct detail for each type
    let typeDetailView = <></>;
    let probHParamSetting = (
        <ProbHParamCommonSetting
            formMethods={formMethods}
            orderedBins={formHParam.orderedBins}
            lowerLimit={formHParam.lowerLimit}
            upperLimit={formHParam.upperLimit}
            meanProbBin={formHParam.meanProbBin}
            onBlur={handleOnBlur}
        />
    );
    switch (
        pageState.currentFormHParam.paramType // when type is changed, must rerender
    ) {
        case HyperParamTypes.UNIFORM_DISTR:
            typeDetailView = <>{probHParamSetting}</>;
            break;
        case HyperParamTypes.NORMAL_DISTR:
            typeDetailView = (
                <>
                    {probHParamSetting}
                    <TextInput<HParamForm>
                        name="normalDistMean"
                        label={t('hyperParam.normalDistMean')}
                        variant="standard"
                        rules={{
                            required: t('common.validate.required', {
                                name: t('hyperParam.normalDistMean'),
                            }),
                            validate: (v) => {
                                let result = false;
                                try {
                                    result = !new Decimal(v).isNaN();
                                } catch (ex) {}
                                return result || t('common.validate.number');
                            },
                        }}
                        onBlur={handleOnBlur}
                        required
                    />
                    <TextInput<HParamForm>
                        name="normalDistSD"
                        label={t('hyperParam.normalDistSD')}
                        variant="standard"
                        rules={{
                            required: t('common.validate.required', {
                                name: t('hyperParam.normalDistSD'),
                            }),
                            validate: (v) => {
                                let result = false;
                                try {
                                    result = !new Decimal(v).isNaN();
                                } catch (ex) {}
                                return result || t('common.validate.number');
                            },
                        }}
                        onBlur={handleOnBlur}
                        required
                    />
                </>
            );
            break;
        case HyperParamTypes.TRIANGLE_DISTR:
            typeDetailView = (
                <>
                    {probHParamSetting}
                    <TextInput<HParamForm>
                        name="triangleDistMean"
                        label={t('hyperParam.triangleDistMean')}
                        variant="standard"
                        rules={{
                            required: t('common.validate.required', {
                                name: t('hyperParam.triangleDistMean'),
                            }),
                            validate: (v) => {
                                let result = false;
                                try {
                                    result = !new Decimal(v).isNaN();
                                } catch (ex) {}
                                return result || t('common.validate.number');
                            },
                        }}
                        onBlur={handleOnBlur}
                        required
                    />
                </>
            );
            break;
    }
    return typeDetailView;
};
