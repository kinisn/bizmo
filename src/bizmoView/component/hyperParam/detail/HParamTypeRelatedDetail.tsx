import { HyperParamTypes } from 'bizmo/core/hyperParam/HyperParamManager';
import TextInput from 'bizmoView/common/form/TextInput';
import Decimal from 'decimal.js';
import { Dispatch } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';
import { HParamForm, fillHyperParam } from './HyperParameterDetailView';
import { ProbHParamSetting } from './ProbHParamSetting';

/**
 * HParamTypeごとの設定 & Decimalの場合の設定
 * @param props
 * @returns
 */
export const HParamTypeRelatedDetail = (props: {
    formMethods: UseFormReturn<HParamForm, any>;
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const { formMethods, pageState, dispatchPageState } = props;
    const { t } = useTranslation();

    const handleOnBlur = () => {
        console.log(
            'HParamTypeRelatedDetail:onBlur',
            formMethods.formState.isValid
        );
        if (formMethods.formState.isValid) {
            dispatchPageState({
                type: 'changeCurrentFormHParam',
                currentFormHParam: fillHyperParam(formMethods.getValues()),
            });
        }
    };

    // construct detail for each type
    let typeDetailView = <></>;
    if (pageState.currentFormHParam.paramType == HyperParamTypes.DECIMAL) {
        typeDetailView = (
            <TextInput<HParamForm>
                name="decimalValue"
                label={t('hyperParam.value')}
                variant="standard"
                rules={{
                    required: t('common.validate.required', {
                        name: t('hyperParam.value'),
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
        );
    } else if (pageState.currentFormHParam.paramType) {
        typeDetailView = (
            <ProbHParamSetting
                formMethods={formMethods}
                pageState={pageState}
                dispatchPageState={dispatchPageState}
            ></ProbHParamSetting>
        );
    }
    return typeDetailView;
};
