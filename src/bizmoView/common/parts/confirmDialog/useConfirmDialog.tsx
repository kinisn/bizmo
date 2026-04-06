import { ReactNode, useCallback, useState } from 'react';
import { ConfirmDialog, ConfirmDialogProps } from './ConfirmDialog';

type State = {
    content: ReactNode;
    onClose: ConfirmDialogProps['onClose'];
    acceptButtonLabel: ReactNode;
    cancelButtonColor?: 'inherit' | 'primary' | 'secondary' | 'error';
};

type OpenModalResult = Parameters<State['onClose']>[0];

type ReturnValues = {
    confirmDialog: (props: Omit<State, 'onClose'>) => Promise<OpenModalResult>;
    renderConfirmDialog: () => ReactNode;
};

const useConfirmDialog = (): ReturnValues => {
    const [state, setState] = useState<State | undefined>(undefined);

    const confirmDialog: ReturnValues['confirmDialog'] = useCallback(
        (props) =>
            new Promise((resolve) => {
                setState({ ...props, onClose: resolve });
            }),
        []
    );

    const handleClose: State['onClose'] = useCallback(
        (options) => {
            state?.onClose(options);
            setState(undefined);
        },
        [state]
    );

    const renderConfirmDialog: ReturnValues['renderConfirmDialog'] = () => {
        return (
            <ConfirmDialog
                open={!!state}
                onClose={handleClose}
                content={state?.content}
                acceptButtonLabel={state?.acceptButtonLabel}
                cancelButtonColor={state?.cancelButtonColor}
            />
        );
    };

    return {
        confirmDialog,
        renderConfirmDialog,
    };
};

export default useConfirmDialog;
