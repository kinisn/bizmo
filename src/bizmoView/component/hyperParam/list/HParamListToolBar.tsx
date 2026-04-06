import {
    Collapse,
    IconButton,
    InputAdornment,
    OutlinedInput,
    ToggleButton,
} from '@mui/material';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { Dispatch, MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HParamPageAction, HParamPageState } from '../HyperParameterComponent';

export const HParamListToolBar = ({
    pageState,
    dispatchPageState,
}: {
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    const { t } = useTranslation();

    // add
    const handleAddClick = () => {
        dispatchPageState({ type: 'addHParam' });
    };

    // delete
    const handleDeleteClick = (e: MouseEvent) => {
        dispatchPageState({
            type: 'removeHParams',
        });
    };

    return (
        <div className="flex flex-row items-center px-4 py-2">
            <div className="flex flex-row items-center">
                {pageState.selectedParamLabels.length > 0 ? (
                    <span className="text-lg">
                        {`${pageState.selectedParamLabels.length} ${t(
                            'hyperParam.selected'
                        )}`}
                    </span>
                ) : (
                    <FilterBar
                        pageState={pageState}
                        dispatchPageState={dispatchPageState}
                    />
                )}
            </div>
            <div className="ml-auto">
                {pageState.selectedParamLabels.length > 0 ? (
                    <IconButton
                        color="primary"
                        aria-label="remove selected parameters"
                        onClick={handleDeleteClick}
                    >
                        <MaterialIcon
                            codePoint={IconType.Trash}
                            style={{ fontSize: '1.75rem' }}
                        />
                    </IconButton>
                ) : (
                    <IconButton
                        color="primary"
                        aria-label="add a hyper parameter"
                        onClick={handleAddClick}
                    >
                        <MaterialIcon
                            codePoint={IconType.AddCircle}
                            style={{ fontSize: '1.75rem' }}
                        />
                    </IconButton>
                )}
            </div>
        </div>
    );
};

const FilterBar = ({
    pageState,
    dispatchPageState,
}: {
    pageState: HParamPageState;
    dispatchPageState: Dispatch<HParamPageAction>;
}) => {
    // filter query internal state
    const [filterQuery, setFilterQuery] = useState(
        pageState.filterCondition.query
    );
    const handleFilterVisible = () => {
        dispatchPageState({
            type: 'changeFilterVisible',
            visible: !pageState.filterVisible,
        });
        if (pageState.filterVisible) {
            setFilterQuery('');
        }
    };
    // filter
    const handleFilterQuerySet = (e: any) => {
        dispatchPageState({
            type: 'changeFilterCondition',
            filterCondition: {
                ...pageState.filterCondition,
                query: e.target.value,
            },
        });
    };

    const handleFilterQueryReset = () => {
        setFilterQuery('');
        dispatchPageState({
            type: 'changeFilterCondition',
            filterCondition: {
                ...pageState.filterCondition,
                query: '',
            },
        });
    };
    return (
        <>
            <ToggleButton
                value="check"
                selected={pageState.filterVisible}
                onChange={handleFilterVisible}
            >
                <MaterialIcon
                    codePoint={IconType.FilterList}
                    style={{ fontSize: '1rem' }}
                />
            </ToggleButton>
            <Collapse orientation="horizontal" in={pageState.filterVisible}>
                <OutlinedInput
                    id="filterQuery"
                    size="small"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    onBlur={handleFilterQuerySet}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                onClick={handleFilterQueryReset}
                            >
                                <MaterialIcon
                                    codePoint={IconType.Close}
                                    style={{ fontSize: '1rem' }}
                                />
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </Collapse>
        </>
    );
};
