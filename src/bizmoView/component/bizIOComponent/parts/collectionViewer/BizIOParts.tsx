import { Breadcrumbs } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO, BizIOId } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { useBizmo } from 'globalState/useBizmo';
import { HTMLAttributes, ReactNode } from 'react';
import { MemoDescription } from '../../form/CommonForm';
import { BizIOComponentIcon, BizIOIndicatorIcon } from '../../icon/IconUtil';

export const BizIOItemBaseParts = (
    props: {
        bizIO:
            | BizIO<BizIOExtData, BizComponentGroupType>
            | CollectionBizIO<BizIOExtData, BizComponentGroupType>;
        systemLabeled: boolean;
        rootBizIO?: BizIO<BizIOExtData, BizComponentGroupType>;
        button?: ReactNode;
        nameCss?: string;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { bizIO, systemLabeled, rootBizIO, button, nameCss, ...rest } = props;
    let nameElem: ReactNode = (
        <div className={`ml-2 whitespace-nowrap ${nameCss ?? 'text-sm'}`}>
            {bizIO.name}
        </div>
    );
    if (rootBizIO) {
        const hierarchy = rootBizIO.db.resolveHierarchy(rootBizIO, bizIO);
        if (hierarchy && hierarchy.length > 0) {
            nameElem = (
                <Breadcrumbs maxItems={3} className="ml-2">
                    {hierarchy.map((bizIO, index) => {
                        return (
                            <div
                                className={
                                    index == hierarchy.length - 1
                                        ? 'text-xl text-white'
                                        : 'text-xs'
                                }
                                key={bizIO.id}
                            >
                                {bizIO?.name}
                            </div>
                        );
                    })}
                </Breadcrumbs>
            );
        }
    }
    return (
        <div {...rest}>
            <div className="flex flex-row flex-nowrap items-center p-2 pr-0">
                <BizIOComponentIcon bizIO={bizIO} />
                {nameElem}
                <div className="grow flex items-center ml-8">
                    <BizIOIndicatorIcon
                        bizIO={bizIO}
                        systemLabeled={systemLabeled}
                    />
                    <MemoDescription
                        memo={bizIO.externalData?.structure.memo}
                    />
                </div>
                {button}
            </div>
        </div>
    );
};

export const BizIOParts = (
    props: {
        bizIOId?: BizIOId;
        systemLabeled?: boolean;
        rootBizIOId?: BizIOId;
        nameCss?: string;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { bizIOId, systemLabeled, rootBizIOId, nameCss, ...rest } = props;
    const db = useBizmo().db();
    if (!db) return <></>;
    const bizIO = db.selectById(bizIOId);
    const rootBizIO = db.selectById(rootBizIOId);
    return bizIO ? (
        <BizIOItemBaseParts
            bizIO={bizIO}
            rootBizIO={rootBizIO}
            systemLabeled={systemLabeled ?? false}
            nameCss={nameCss}
            {...rest}
        />
    ) : (
        <></>
    );
};
