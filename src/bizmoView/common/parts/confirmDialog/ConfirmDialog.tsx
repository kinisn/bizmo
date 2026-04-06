import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type ConfirmDialogProps = {
    open: boolean;
    content: ReactNode;
    onClose: (options: { accepted: boolean }) => void;
    acceptButtonLabel: ReactNode;
    cancelButtonColor?: 'inherit' | 'primary' | 'secondary' | 'error';
};

/**
 * 確認Dialog
 *
 * あくまで確認を実行するだけなので、確認している内容についてはDialogを使う側で保持すること
 */
export const ConfirmDialog = ({
    open,
    content,
    onClose,
    acceptButtonLabel,
    cancelButtonColor,
}: ConfirmDialogProps) => {
    const { t } = useTranslation();

    const handleCancel = useCallback(() => {
        onClose({ accepted: false });
    }, [onClose]);

    const handleAccept = useCallback(() => {
        onClose({ accepted: true });
    }, [onClose]);

    return (
        <Dialog open={open} maxWidth="xs" onClose={handleCancel}>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <Button color="inherit" onClick={handleCancel}>
                    {t('common.label.cancel')}
                </Button>
                <Button
                    variant="contained"
                    color={cancelButtonColor}
                    onClick={handleAccept}
                >
                    {acceptButtonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
