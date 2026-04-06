import {
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    HyperParam,
    HyperParamElem,
} from 'bizmo/core/hyperParam/HyperParamManager';
import { ProbHyperParam } from 'bizmo/core/hyperParam/prob/ProbHyperParam';
import Decimal from 'decimal.js';
import { Dispatch, MouseEvent, useMemo } from 'react';
import {
    FilterCondition,
    HParamPageAction,
    HParamPageState,
} from '../HyperParameterComponent';
import { HParamListPagination } from './HParamListPagination';
import { HParamListSortableHeaderRows } from './HParamListSortableHeaderRows';
import { HParamListToolBar } from './HParamListToolBar';
import { ProbHyperParamSummary } from './ProbHyperParamSummary';

export type HeadTypes = 'name' | 'value';
export type HeadCell = {
    id: HeadTypes;
    label: string;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
};

export const HyperParameterListView = ({
    hyperParams,
    pageState,
    dispatchPageState,
}: {
    hyperParams: Array<HyperParam>;
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const targetHyperParams = useMemo(
        () =>
            hyperParams
                .slice() // to clone
                .filter(getFilter(pageState.filterCondition)),
        [hyperParams, pageState.filterCondition]
    );

    const handleSelectHParam = (e: MouseEvent) => {
        dispatchPageState({
            type: 'editHParam',
            targetHParamID: e.currentTarget.getAttribute('data-hyper-id') ?? '',
        });
    };

    // checkbox
    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            const newSelected = targetHyperParams.map((n) => n.name);
            dispatchPageState({
                type: 'selectParamLabels',
                labels: newSelected,
            });
            return;
        }
        dispatchPageState({
            type: 'selectParamLabels',
            labels: [],
        });
    };

    const handleCheckboxClick = (event: MouseEvent, name: string) => {
        const selectedParamLabels = pageState.selectedParamLabels;
        const selectedIndex = selectedParamLabels.indexOf(name);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selectedParamLabels, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selectedParamLabels.slice(1));
        } else if (selectedIndex === selectedParamLabels.length - 1) {
            newSelected = newSelected.concat(selectedParamLabels.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selectedParamLabels.slice(0, selectedIndex),
                selectedParamLabels.slice(selectedIndex + 1)
            );
        }

        dispatchPageState({
            type: 'selectParamLabels',
            labels: newSelected,
        });
    };

    // rows
    const hyperParamRows = useMemo(
        () =>
            targetHyperParams
                .sort(getComparator(pageState.order, pageState.orderBy))
                .slice(
                    pageState.page * pageState.rowsPerPage,
                    (pageState.page + 1) * pageState.rowsPerPage
                )
                .map((param, index) => {
                    const elem = param.element;
                    return (
                        <TableRow
                            key={param.id}
                            className="cursor-pointer transition ease-out duration-300 hover:bg-blue-900"
                        >
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={
                                        pageState.selectedParamLabels.indexOf(
                                            param.name
                                        ) !== -1
                                    }
                                    inputProps={{
                                        'aria-labelledby': `hyper-param-checkbox-${param.name}`,
                                    }}
                                    onClick={(event) =>
                                        handleCheckboxClick(event, param.name)
                                    }
                                />
                            </TableCell>
                            <TableCell
                                data-hyper-id={param.id}
                                onClick={handleSelectHParam}
                            >
                                {param.name}
                            </TableCell>
                            <TableCell
                                align="center"
                                data-hyper-id={param.id}
                                onClick={handleSelectHParam}
                            >
                                <HyperParamElemThumbnail elem={elem} />
                            </TableCell>
                        </TableRow>
                    );
                }),
        [
            targetHyperParams,
            pageState.page,
            pageState.rowsPerPage,
            pageState.order,
            pageState.orderBy,
            pageState.selectedParamLabels,
        ]
    );

    return (
        <Paper className="bg-black">
            <HParamListToolBar
                pageState={pageState}
                dispatchPageState={dispatchPageState}
            />
            <TableContainer
                component={Paper}
                className="max-h-[calc(100vh-15rem)]"
            >
                <Table stickyHeader={true}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    indeterminate={
                                        pageState.selectedParamLabels.length >
                                            0 &&
                                        pageState.selectedParamLabels.length <
                                            targetHyperParams.length
                                    }
                                    checked={
                                        targetHyperParams.length > 0 &&
                                        pageState.selectedParamLabels.length ===
                                            targetHyperParams.length
                                    }
                                    onChange={handleSelectAllClick}
                                    inputProps={{
                                        'aria-label': 'select all desserts',
                                    }}
                                />
                            </TableCell>
                            <HParamListSortableHeaderRows
                                pageState={pageState}
                                dispatchPageState={dispatchPageState}
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>{hyperParamRows}</TableBody>
                </Table>
            </TableContainer>

            <HParamListPagination
                hyperParams={targetHyperParams}
                pageState={pageState}
                dispatchPageState={dispatchPageState}
            />
        </Paper>
    );
};

export const HyperParamElemThumbnail = (props: { elem: HyperParamElem }) => {
    const elem = props.elem;
    return elem instanceof ProbHyperParam ? (
        <ProbHyperParamSummary
            orderedBins={elem.orderedBins}
            lowerLimit={elem.lowerLimit}
            upperLimit={elem.upperLimit}
            meanProbBin={elem.meanProbBin}
        />
    ) : (
        <span className="text-3xl">{elem.toString()}</span>
    );
};

function descendingComparator(
    a: HyperParam,
    b: HyperParam,
    orderBy: HeadTypes
) {
    const targetA = a[orderBy];
    const targetB = b[orderBy];
    if (targetA && targetB) {
        if (targetA instanceof Decimal && targetB instanceof Decimal) {
            if (targetB.lessThan(targetA)) {
                return -1;
            } else if (targetA.lessThan(targetB)) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (targetB < targetA) {
                return -1;
            } else if (targetB > targetA) {
                return 1;
            } else {
                return 0;
            }
        }
    } else {
        return 0;
    }
}

export type Order = 'asc' | 'desc';

function getComparator(
    order: Order,
    orderBy: HeadTypes
): (a: HyperParam, b: HyperParam) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function getFilter(
    filterConditions: FilterCondition
): (hyperParam: HyperParam) => boolean {
    return (hyperParam: HyperParam) => {
        let result = true;
        switch (filterConditions.target) {
            case 'name':
                switch (filterConditions.type) {
                    case 'include':
                        if (filterConditions.query == '') {
                            // empty query なら対象
                            break;
                        }
                        const targets = filterConditions.query.split(/\s+/);
                        result =
                            result &&
                            targets.every((v) => hyperParam.name.includes(v));
                        break;
                }
                break;
        }
        return result;
    };
}
