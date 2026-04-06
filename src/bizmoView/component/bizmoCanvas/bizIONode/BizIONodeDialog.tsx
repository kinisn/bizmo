import { Button, Dialog, Tooltip } from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BizIOComponent } from '../../bizIOComponent/BizIOComponent';
import { BizIOComponentIcon } from '../../bizIOComponent/icon/IconUtil';

/**
 * CollectionBizIOのダイアログ
 *
 * @param props
 * @returns
 */
export const BizIONodeDialog = (props: {
    targetBizIO?:
        | BizIO<BizIOExtData, BizComponentGroupType>
        | CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    dialogOpen: boolean;
    handleDialogClose: () => void;
}) => {
    const { t } = useTranslation();
    const [fullScreen, setFullScreen] = useState(false);
    const bizComponent = useBizmo().bizComponent();

    // Note:  https://github.com/facebook/react/issues/24391
    // Put the return after calls to Hooks.
    // Please add the linter to your setup to detect these issues at compile time as originally intended.
    if (!props.targetBizIO || !bizComponent) return <></>;
    const { dialogOpen, handleDialogClose, targetBizIO } = props;

    // full screen
    const handleFullScreen = () => {
        setFullScreen(!fullScreen);
    };

    return (
        <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            fullScreen={fullScreen}
            maxWidth="xl"
        >
            <div className={`rounded`}>
                <div className="p-4 rounded bg-black flex items-center">
                    <div className="flex justify-center items-center">
                        <BizIOComponentIcon bizIO={targetBizIO} />
                        <div className="ml-8 text-lg">{targetBizIO.name}</div>
                    </div>
                    <div className="grow flex justify-end">
                        <Tooltip
                            title={
                                fullScreen
                                    ? t('common.label.exitFullScreen')
                                    : t('common.label.fullScreen')
                            }
                        >
                            <Button onClick={handleFullScreen}>
                                <MaterialIcon
                                    codePoint={
                                        fullScreen
                                            ? IconType.CloseFullscreen
                                            : IconType.OpenInFull
                                    }
                                />
                            </Button>
                        </Tooltip>
                        <Tooltip title={t('common.label.close')}>
                            <Button onClick={handleDialogClose}>
                                <MaterialIcon codePoint={IconType.Close} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>

                <div
                    className={
                        fullScreen
                            ? 'bg-zinc-900 min-h-[calc(100vh-4.5rem)]'
                            : 'bg-zinc-900'
                    }
                >
                    {targetBizIO instanceof CollectionBizIO ? (
                        <BizIOComponent
                            rootCollection={targetBizIO}
                            componentMode={'editor'}
                        ></BizIOComponent>
                    ) : (
                        <BizIOComponent
                            rootCollection={bizComponent}
                            componentMode={'viewer'}
                            selectedBizIO={targetBizIO}
                        ></BizIOComponent>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
