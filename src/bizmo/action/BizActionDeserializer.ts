import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizProcessorRequiredParam } from 'bizmo/core/bizProcessor/BizProcessor';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { DateMap, DateMapContentDecoder } from 'bizmo/core/util/DateMap';
import Decimal from 'decimal.js';
import { BizAction, BizActionParam, BizActionToObject } from './core/BizAction';
import { BizActionParams } from './core/BizActionBase';
import { BizActionProcessor } from './core/BizActionProcessor';
import { BizRelation } from './core/BizRelation';
import { HireStaffAction } from './template/hr/HireStaffAction';

/**
 * Deserializes a BizAction from a JSON object.
 */
export class BizActionDeserializer {
    /**
     * Deserializes a BizAction from a JSON object.
     *
     * @param obj The JSON object to deserialize.
     * @param timetable The timetable.
     * @param db The database.
     * @param hyperMG The hyper parameter manager.
     * @param decoderForGeneral The decoder for general.
     * @param decoderForTermGeneral The decoder for term general.
     * @returns The deserialized BizAction.
     */
    static fromObject<T = any, R = any>({
        obj,
        timetable,
        db,
        hyperMG,
    }: {
        obj: BizActionToObject<T, R>;
    } & BizActionParam<T, R>): DeserializableBizAction<T> | undefined {
        let targetBizAction: DeserializableBizAction<T> | undefined;
        switch (obj.className) {
            case 'HireStaffAction':
                targetBizAction = new HireStaffAction(
                    BizActionDeserializer.__makeBizActionParam({
                        obj,
                        timetable,
                        db,
                        hyperMG,
                        decoderForTermGeneral: (data) =>
                            BizFunction.fromObject(data),
                    })
                );
                break;
            case 'BizAction':
            default: {
                targetBizAction = new BizAction(
                    BizActionDeserializer.__makeBizActionParam({
                        obj,
                        timetable,
                        db,
                        hyperMG,
                    })
                );
            }
        }

        // Add additional processors
        if (obj.orderedProcessors.length > 1 && targetBizAction != undefined) {
            obj.orderedProcessors.forEach((obj, index) => {
                if (index > 0) {
                    const processor = BizActionProcessor.fromObject({
                        obj,
                        timetable,
                        db,
                        hyperMG,
                    });
                    targetBizAction!.appendActionProcessor(
                        processor.orderedBizFunctions,
                        processor.procOutputs
                    );
                }
            });
        }

        console.log(
            'BizActionDeserializer: targetBizAction',
            targetBizAction,
            obj
        );

        return targetBizAction;
    }

    static __makeBizActionParam<T = any, R = any, DG = any, DTG = any>({
        obj,
        timetable,
        db,
        hyperMG,
        decoderForGeneral,
        decoderForTermGeneral,
    }: {
        obj: BizActionToObject<T, R>;
        decoderForGeneral?: DateMapContentDecoder<DG>;
        decoderForTermGeneral?: DateMapContentDecoder<DTG>;
    } & BizProcessorRequiredParam<T, BizComponentGroupType>): BizActionParam<
        T,
        R
    > {
        // 必ず 1つ以上の Processor が存在する
        const firstProcessor = BizActionProcessor.fromObject({
            obj: obj.orderedProcessors[0]!,
            timetable,
            db,
            hyperMG,
        });

        const bizActionParam: BizActionParam = {
            timetable,
            db,
            hyperMG,
            actionId: obj.actionId,
            name: obj.name,
            actionType: obj.actionType,
            priorityEntity: DateMap.fromObject<Decimal>(
                obj.priorityEntity,
                (data) => new Decimal(data)
            ),
            actionParam: BizActionParams.fromObject({
                timetable,
                ...obj.actionParam,
                decoderForGeneral,
                decoderForTermGeneral,
            }),
            orderedFunctions: firstProcessor.orderedBizFunctions?.map(
                (func) => func
            ),
            outputs: firstProcessor.procOutputs?.map((output) => output),
            relations: new Map(
                [...obj.relations].map(([key, value]) => [
                    key,
                    BizRelation.fromObject({ ...value }),
                ])
            ),
            externalData: obj.externalData,
        };
        /*
        console.log(
            'BizActionDeserializer: __makeBizActionParam',
            bizActionParam,
            obj.relations
        );
        */

        return bizActionParam;
    }
}

export type DeserializableBizAction<T = any, R = any> =
    | BizAction<T, R>
    | HireStaffAction<T>;
