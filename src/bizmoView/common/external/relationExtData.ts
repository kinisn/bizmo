import {
    CommonConnector,
    CommonConnectorDefault,
    CommonConnectorType,
    createCommonConnector,
} from './common/commonConnector';

/**
 * RelationExtData
 *
 * Relation の接続データ
 */
export type RelationExtData = {
    fromConnector: CommonConnector;
    toConnector: CommonConnector;
};

export type RelationExtDataForm = {
    ex_relation_from_connector_edge?: CommonConnectorType;
    ex_relation_from_connector_ratioOfEdge?: number;
    ex_relation_to_connector_edge?: CommonConnectorType;
    ex_relation_to_connector_ratioOfEdge?: number;
};

export function initRelationExtDataForm(
    formData?: RelationExtDataForm
): RelationExtDataForm {
    const defaultValues: RelationExtDataForm = {
        ex_relation_from_connector_edge:
            formData?.ex_relation_from_connector_edge !== undefined
                ? formData.ex_relation_from_connector_edge
                : CommonConnectorDefault.edge,
        ex_relation_from_connector_ratioOfEdge:
            formData?.ex_relation_from_connector_ratioOfEdge !== undefined
                ? formData.ex_relation_from_connector_ratioOfEdge
                : CommonConnectorDefault.ratioOfEdge,
        ex_relation_to_connector_edge:
            formData?.ex_relation_to_connector_edge !== undefined
                ? formData.ex_relation_to_connector_edge
                : CommonConnectorDefault.edge,
        ex_relation_to_connector_ratioOfEdge:
            formData?.ex_relation_to_connector_ratioOfEdge !== undefined
                ? formData.ex_relation_to_connector_ratioOfEdge
                : CommonConnectorDefault.ratioOfEdge,
    };
    return defaultValues;
}

export function createRelationExtData(
    formData?: RelationExtDataForm
): RelationExtData {
    const makingData = {
        fromConnector: createCommonConnector({
            ex_connector_edge: formData?.ex_relation_from_connector_edge,
            ex_connector_ratioOfEdge:
                formData?.ex_relation_from_connector_ratioOfEdge,
        }),
        toConnector: createCommonConnector({
            ex_connector_edge: formData?.ex_relation_to_connector_edge,
            ex_connector_ratioOfEdge:
                formData?.ex_relation_to_connector_ratioOfEdge,
        }),
    };
    return makingData;
}
