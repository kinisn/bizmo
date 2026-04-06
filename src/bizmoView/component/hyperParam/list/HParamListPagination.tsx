import { TablePagination } from '@mui/material';
import { HyperParam } from 'bizmo/core/hyperParam/HyperParamManager';
import { Dispatch } from 'react';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';

export const HParamListPagination = ({
    hyperParams,
    pageState,
    dispatchPageState,
}: {
    hyperParams: Array<HyperParam>;
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const handleChangePage = (event: unknown, newPage: number) => {
        dispatchPageState({ type: 'changePage', page: newPage });
    };
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatchPageState({
            type: 'changeRowsPerPage',
            rowsPerPage: parseInt(event.target.value, 10),
        });
    };
    return (
        <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={hyperParams.length}
            rowsPerPage={pageState.rowsPerPage}
            page={pageState.page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            className="px-4"
        />
    );
};
