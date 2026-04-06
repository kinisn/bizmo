import {
    CommonExtView,
    CommonExtViewDefault,
    CommonExtViewForm,
    createCommonExtView,
    initCommonExtViewForm,
} from './common/commonExtView';

/**
 * RelationOnOutputExtData
 *
 * 単一のBizProcOutputに対する、外部からの情報
 */
export type RelationOnOutputExtData = {
    name: string;
    view: CommonExtView;
};

export type RelationOnOutputExtDataForm = CommonExtViewForm & {
    ex_name?: string;
};

export function initRelationOnOutputExtDataForm(
    formData?: RelationOnOutputExtDataForm
): RelationOnOutputExtDataForm {
    const defaultValues: RelationOnOutputExtDataForm = {
        ex_name: formData?.ex_name ?? '',
        ...initCommonExtViewForm(formData),
    };
    return defaultValues;
}

export function createRelationOnOutputExtData(
    formData?: RelationOnOutputExtDataForm
): RelationOnOutputExtData {
    const makingData = {
        name: '',
        view: CommonExtViewDefault,
    };
    makingData.name = formData?.ex_name ?? '';
    makingData.view = createCommonExtView(formData);
    return makingData;
}
