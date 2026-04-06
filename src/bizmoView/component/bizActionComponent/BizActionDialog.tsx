import { Button, Dialog, Tooltip } from '@mui/material';
import { BizAction } from 'bizmo/action/core/BizAction';
import { BizActionBase } from 'bizmo/action/core/BizActionBase';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { RelationExtData } from 'bizmoView/common/external/relationExtData';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BizActionComponent } from './BizActionComponent';

/**
 * Dialog for BizAction
 *
 * @param props
 * @returns
 */
export const BizActionDialog = (props: {
    targetBizAction?: BizActionBase<BizIOExtData, RelationExtData>;
    dialogOpen: boolean;
    handleDialogClose: () => void;
}) => {
    const { t } = useTranslation();
    const [fullScreen, setFullScreen] = useState(false);

    // Note:  https://github.com/facebook/react/issues/24391
    // Put the return after calls to Hooks.
    // Please add the linter to your setup to detect these issues at compile time as originally intended.
    if (!props.targetBizAction) return <></>;
    const { dialogOpen, handleDialogClose, targetBizAction } = props;

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
                        <MaterialIcon codePoint={IconType.Cases} />
                        <div className="ml-8 text-lg">
                            {targetBizAction.name}
                        </div>
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
                    {targetBizAction instanceof BizAction && (
                        <BizActionComponent
                            targetBizAction={targetBizAction}
                        ></BizActionComponent>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
