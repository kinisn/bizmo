import { BizAction } from 'bizmo/action/core/BizAction';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { Dispatch } from 'react';
import {
    BizActionComponentAction,
    BizActionComponentState,
} from './BizActionComponent';
import { BizProcessorComponent } from './BizProcessorComponent';

export const OrderedProcessorsView = (props: {
    targetBizAction: BizAction<BizIOExtData, RelationExtData>;
    actionState: BizActionComponentState;
    actionDispatch: Dispatch<BizActionComponentAction>;
}) => {
    const { targetBizAction, actionState, actionDispatch } = props;
    return (
        <div>
            {targetBizAction.orderedProcessors.map((processor, index) => {
                return (
                    <BizProcessorComponent
                        key={index}
                        bizActionProcessor={processor}
                        order={index}
                    />
                );
            })}
        </div>
    );
};
