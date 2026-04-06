import { Button, Divider } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { FunnelComponent } from 'bizmo/core/bizIO/component/FunnelComponent';
import { RateComponent } from 'bizmo/core/bizIO/component/RateComponent';
import { UnitComponent } from 'bizmo/core/bizIO/component/UnitComponent';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { SelectedBizIOPopupDescription } from 'bizmoView/common/form/BizIOSelector';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { t } from 'i18next';
import { Dispatch } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BizIOComponentAction,
    BizIOComponentState,
    BizIOSelectableMode,
    SystemProvidedDescription,
} from '../BizIOComponent';
import {
    AutoComplementDescription,
    detectBizIOTypeDocs,
    detectGeneralBizIOType,
    makeBizIOSelectorLabel,
} from '../form/BizIOComponentForm';
import {
    AccountNameDescription,
    ComplementDescription,
    IsMonetaryDescription,
} from '../form/CommonBizIOForm';
import { AddChildrenParts } from '../parts/AddChildrenParts';
import { CollectionViewerParts } from '../parts/collectionViewer/CollectionViewerParts';

/**
 * DetailView
 *
 * Viewモードと、AddChildモードの２つがある。
 *
 * @param props
 * @returns
 */
export const BizIOStructureDetailView = (props: {
    targetBizIO:
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>
        | BizIO<BizIOExtData, BizComponentGroupType>;
    isSystemLabeled: boolean;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
    selectHandler?: (bizIO: BizIO<BizIOExtData, BizComponentGroupType>) => void;
    selectableMode?: BizIOSelectableMode;
}) => {
    const {
        targetBizIO,
        isSystemLabeled,
        parentBizIOs,
        treeState,
        dispatchState,
        selectHandler,
    } = props;
    const selectableMode = props.selectableMode ?? 'hasValueOnly';
    const { t } = useTranslation();
    const bizIOType = detectGeneralBizIOType(targetBizIO);

    const handleSelect = () => {
        if (selectHandler) {
            selectHandler(targetBizIO);
        }
    };

    let part = <></>;
    switch (bizIOType) {
        case 'UnitComponent':
            part = (
                <AutoComplementDescription
                    autoComplement={
                        (targetBizIO as UnitComponent).amountComplement
                    }
                />
            );
            break;
        case 'RateComponent':
            part = (
                <DescriptionParts label={t('CommonForm.RateComponent.label')}>
                    <SelectedBizIOPopupDescription
                        label={t('RateComponent.NUMERATOR')}
                        targetBizIO={
                            (
                                targetBizIO as RateComponent<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >
                            ).numerator
                        }
                    />
                    <Divider className="my-4" />
                    <SelectedBizIOPopupDescription
                        label={t('RateComponent.DENOMINATOR')}
                        targetBizIO={
                            (
                                targetBizIO as RateComponent<
                                    BizIOExtData,
                                    BizComponentGroupType
                                >
                            ).denominator
                        }
                    />
                </DescriptionParts>
            );
            break;
        case 'FunnelComponent':
            const orderedBizIds = (
                targetBizIO as FunnelComponent<
                    BizIOExtData,
                    BizComponentGroupType
                >
            ).orderedBizIds;
            part = (
                <DescriptionParts label={t('FunnelComponent.order')}>
                    <div className="p-2">
                        {orderedBizIds.map((bizId, index) => {
                            const targetIO = targetBizIO.db.selectById(bizId)!;
                            return (
                                <div key={index}>
                                    <SelectedBizIOPopupDescription
                                        label={t('FunnelComponent.orderLabel', {
                                            order: index + 1,
                                        })}
                                        targetBizIO={targetIO}
                                    />
                                    {index < orderedBizIds.length - 1 && (
                                        <div className="pt-4 w-full flex justify-center">
                                            <MaterialIcon
                                                codePoint={IconType.FilterList}
                                                className="text-2xl"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DescriptionParts>
            );
            break;
    }

    const isSelectable =
        selectHandler &&
        (selectableMode == 'all' || //全要素選択可能
            (selectableMode == 'hasValueOnly' && targetBizIO.hasOwnValue) || // 値を持つ要素のみ選択可能
            (selectableMode == 'bizActorOnly' && bizIOType === 'BizActors')); // BizActor要素のみ選択可能
    return (
        <>
            <div className="p-4 pt-0 grid grid-cols-1 gap-2 items-center">
                {
                    // memoの表示
                    targetBizIO.externalData?.structure.memo && (
                        <DescriptionParts label={t('CommonForm.memo')}>
                            {targetBizIO.externalData.structure.memo}
                        </DescriptionParts>
                    )
                }

                <DescriptionParts
                    label={makeBizIOSelectorLabel(bizIOType)}
                    labelStyle="-translate-y-1"
                >
                    {detectBizIOTypeDocs(bizIOType).desc}
                </DescriptionParts>

                {/** Special */}
                {part}

                {/** General */}

                <HasOwnValueDescriptions targetBizIO={targetBizIO} />

                {isSystemLabeled && <SystemProvidedDescription />}

                {/** selectHandler */}
                {isSelectable && (
                    <Button
                        onClick={handleSelect}
                        variant="contained"
                        className="mt-4"
                    >
                        {t('common.label.select')}
                    </Button>
                )}
            </div>
            {treeState.innerMode == 'detail' ? (
                <CollectionViewerParts {...props} />
            ) : (
                <AddChildrenParts {...props} />
            )}
        </>
    );
};

const HasOwnValueDescriptions = (props: { targetBizIO: BizIO }) => {
    const { targetBizIO } = props;
    return targetBizIO.hasOwnValue ? (
        <DescriptionParts label={t('CommonBizIOForm.ownValue')}>
            <div className="p-1 space-y-5">
                <IsMonetaryDescription isMonetary={targetBizIO.isMonetary} />
                <ComplementDescription complement={targetBizIO.complement} />
                <AccountNameDescription accountName={targetBizIO.accountName} />
            </div>
        </DescriptionParts>
    ) : (
        <></>
    );
};
