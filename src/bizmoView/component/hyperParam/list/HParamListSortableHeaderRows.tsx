import { Box, TableCell, TableSortLabel } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Dispatch, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';
import { HeadCell, HeadTypes } from './HyperParameterListView';

export const HParamListSortableHeaderRows = ({
    pageState,
    dispatchPageState,
}: {
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const { t } = useTranslation();
    const headCells: readonly HeadCell[] = useMemo(() => {
        return [
            {
                id: 'name',
                label: t('hyperParam.name'),
            },
            {
                id: 'value',
                label: t('hyperParam.value'),
                align: 'center',
            },
        ];
    }, [t]);

    // order
    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: HeadTypes
    ) => {
        dispatchPageState({
            type: 'sort',
            order:
                pageState.orderBy === property && pageState.order === 'asc'
                    ? 'desc'
                    : 'asc',
            orderBy: property,
        });
    };
    const createSortHandler =
        (property: any) => (event: React.MouseEvent<unknown>) => {
            handleRequestSort(event, property);
        };

    return (
        <>
            {headCells.map((headCell) => (
                <TableCell
                    key={headCell.id}
                    align={headCell.align ?? 'left'}
                    sortDirection={
                        pageState.orderBy === headCell.id
                            ? pageState.order
                            : false
                    }
                >
                    <TableSortLabel
                        active={pageState.orderBy === headCell.id}
                        direction={
                            pageState.orderBy === headCell.id
                                ? pageState.order
                                : 'asc'
                        }
                        onClick={createSortHandler(headCell.id)}
                    >
                        {headCell.label}
                        {pageState.orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {pageState.order === 'desc'
                                    ? 'sorted descending'
                                    : 'sorted ascending'}
                            </Box>
                        ) : null}
                    </TableSortLabel>
                </TableCell>
            ))}
        </>
    );
};
