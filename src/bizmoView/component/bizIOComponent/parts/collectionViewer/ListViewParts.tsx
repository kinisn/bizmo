import {
    Breadcrumbs,
    Button,
    Collapse,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    ToggleButton,
    Tooltip,
} from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { CollectionBizIO } from 'bizmo/core/bizIO/collection/CollectionBizIO';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizIOExtData,
    BizIOExtDataStructure,
} from 'bizmoView/common/external/bizIOExtData';
import TextInput from 'bizmoView/common/form/TextInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import useConfirmDialog from 'bizmoView/common/parts/confirmDialog/useConfirmDialog';
import { Dispatch, MouseEventHandler, SyntheticEvent, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import {
    BizIOComponentAction,
    BizIOComponentState,
} from '../../BizIOComponent';
import {
    BizIOSelectorForFilter,
    FilterableBizIOType,
    detectBizIOTypeDocs,
    detectGeneralBizIOType,
} from '../../form/BizIOComponentForm';
import {
    CommonFormBizIOType,
    CommonFormName,
    MemoDescription,
} from '../../form/CommonForm';
import { BizIOComponentIcon, BizIOIndicatorIcon } from '../../icon/IconUtil';
import { BizIOItemBaseParts } from './BizIOParts';

export type ListViewFilterForm = CommonFormName &
    BizIOExtDataStructure &
    CommonFormBizIOType<FilterableBizIOType>;

const DELIMITER = '::';

export const ListViewParts = (props: {
    targetBizIO: CollectionBizIO<BizIOExtData, BizComponentGroupType>;
    isSystemLabeled: boolean;
    parentBizIOs:
        | Array<CollectionBizIO<BizIOExtData, BizComponentGroupType>>
        | undefined;
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
}) => {
    const {
        targetBizIO,
        isSystemLabeled,
        parentBizIOs,
        treeState,
        dispatchState,
    } = props;
    const { t } = useTranslation();
    const collections = targetBizIO.flattenExposedChildren;

    const { confirmDialog, renderConfirmDialog } = useConfirmDialog();

    // table ui
    const handleChangePage = (event: unknown, newPage: number) => {
        dispatchState({ type: 'changeListViewPage', page: newPage });
    };
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatchState({
            type: 'changeListViewRowsPerPage',
            rowsPerPage: parseInt(event.target.value, 10),
        });
    };

    // table button ui
    const handleSelected = async (e: SyntheticEvent) => {
        if (treeState.componentMode === 'viewer') return; // viewer mode では選択できない

        e.stopPropagation();
        const targetID = e.currentTarget.getAttribute('data-biz-id') ?? '';
        const selectedBizIO = targetBizIO.db.selectById(targetID)!; // 必ず存在する
        const dataHierarchyId =
            e.currentTarget.getAttribute('data-hierarchy-id') ?? '';
        const systemLabeled =
            e.currentTarget.getAttribute('data-system-labeled') == 'true'
                ? true
                : false ?? false;
        const hierarchy = dataHierarchyId.split(DELIMITER);
        if (!treeState.isDeleteMode) {
            dispatchState({
                type: 'selectBizIO',
                selectedID: targetID,
                hierarchyIDs: hierarchy,
            });
        } else if (treeState.isDeleteMode && !systemLabeled) {
            const { accepted } = await confirmDialog({
                content: (
                    <>
                        <div className="font-bold text-lg">
                            {t('common.label.delete')}
                        </div>
                        <div className="p-4">
                            <BizIOItemBaseParts
                                bizIO={selectedBizIO}
                                systemLabeled={systemLabeled}
                            />
                        </div>
                        <div>
                            <Trans i18nKey="common.message.deleteIrreversibleConfirm" />
                        </div>
                    </>
                ),
                acceptButtonLabel: t('common.label.delete'),
                cancelButtonColor: 'error',
            });

            if (!accepted) return; // キャンセル時は処理に進まない

            if (hierarchy.length > 1) {
                dispatchState({
                    type: 'removeBizIO',
                    targetId: selectedBizIO.id,
                    parentId: hierarchy[hierarchy.length - 2],
                });
            }
        }
    };

    /*
    const handleAdd = (e: SyntheticEvent) => {
        e.stopPropagation();
        const targetID = e.currentTarget.getAttribute('data-biz-id') ?? '';
        const dataHierarchyId =
            e.currentTarget.getAttribute('data-hierarchy-id') ?? '';
        const hierarchy = dataHierarchyId.split(DELIMITER);
        dispatchState({
            type: 'startAddBizIO',
            targetId: targetID,
            hierarchyIDs: hierarchy,
        });
    };
    */

    // filter
    const filteredCollection = collections.filter((predicate) => {
        if (treeState.filterData) {
            const isTitleIncluded =
                treeState.filterData.name === '' || // この場合はnameは無視 => true
                predicate.bizIO.name
                    .toLowerCase()
                    .indexOf(treeState.filterData.name.toLowerCase()) !== -1;

            const isMemoIncluded =
                treeState.filterData.memo === '' || // この場合はmemoは無視 => true
                (predicate.bizIO.externalData?.structure.memo ?? '')
                    .toLowerCase()
                    .indexOf(treeState.filterData.memo.toLowerCase()) !== -1;

            const isTypeIncluded =
                treeState.filterData.type === 'All' ||
                detectGeneralBizIOType(predicate.bizIO) ===
                    treeState.filterData.type;

            const isDeleteMode =
                !treeState.isDeleteMode ||
                (treeState.isDeleteMode && !predicate.systemLabeled);

            return (
                isTitleIncluded &&
                isMemoIncluded &&
                isTypeIncluded &&
                isDeleteMode
            );
        } else if (treeState.isDeleteMode && predicate.systemLabeled) {
            // no filter かつ deleteMode
            return false;
        } else {
            // no filter
            return true;
        }
    });

    const filteredSlicedCollection =
        treeState.listRowsPerPage > 0
            ? filteredCollection.slice(
                  treeState.listPage * treeState.listRowsPerPage,
                  (treeState.listPage + 1) * treeState.listRowsPerPage
              )
            : collections;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        treeState.listPage > 0
            ? Math.max(
                  0,
                  (1 + treeState.listPage) * treeState.listRowsPerPage -
                      filteredCollection.length
              )
            : 0;

    // filter ui
    const handleFilterOpen = () => {
        dispatchState({
            type: 'changeFilterOpened',
            filterOpened: !treeState.isFilterOpened,
        });
    };

    // for rows key
    let counter = 0;
    return (
        <>
            <ListFilterParts
                treeState={treeState}
                dispatchState={dispatchState}
                totalNumber={collections.length}
            />
            <TableContainer
                component={Paper}
                className="max-h-[calc(100vh-15rem)]"
            >
                <Table stickyHeader={true}>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('CommonForm.name')}</TableCell>
                            <TableCell>{t('CommonForm.type')}</TableCell>
                            <TableCell>
                                {t('ListViewParts.hierarchy')}
                            </TableCell>
                            <TableCell>{t('CommonForm.memo')}</TableCell>
                            <TableCell align="center">
                                <Tooltip title={t('common.label.filter')}>
                                    <ToggleButton
                                        value="check"
                                        selected={treeState.isFilterOpened}
                                        size="small"
                                        onChange={handleFilterOpen}
                                    >
                                        <MaterialIcon
                                            codePoint={IconType.FilterList}
                                        />
                                    </ToggleButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSlicedCollection.map((data) => {
                            counter++;
                            const typeData = detectBizIOTypeDocs(
                                detectGeneralBizIOType(data.bizIO)
                            );
                            return (
                                <TableRow
                                    className="cursor-pointer transition ease-out duration-300 hover:bg-blue-900"
                                    key={data.bizIO.id + ':' + counter}
                                >
                                    <PreparedTableCell
                                        targetBizId={targetBizIO.id}
                                        data={data}
                                        onClick={handleSelected}
                                    >
                                        <div className="flex items-center p-2 pr-0">
                                            <BizIOComponentIcon
                                                bizIO={data.bizIO}
                                            />
                                            <div className="ml-4 text-sm">
                                                {data.bizIO.name}
                                            </div>
                                        </div>
                                    </PreparedTableCell>
                                    <PreparedTableCell
                                        targetBizId={targetBizIO.id}
                                        data={data}
                                        onClick={handleSelected}
                                    >
                                        <div className="flex items-center ml-8">
                                            {typeData.label}
                                            <span className="ml-4">
                                                <BizIOIndicatorIcon
                                                    bizIO={data.bizIO}
                                                    systemLabeled={
                                                        data.systemLabeled
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </PreparedTableCell>
                                    <PreparedTableCell
                                        targetBizId={targetBizIO.id}
                                        data={data}
                                        onClick={handleSelected}
                                    >
                                        <Breadcrumbs
                                            maxItems={3}
                                            aria-label="breadcrumb"
                                        >
                                            <span
                                                className="x-2 text-xs"
                                                key={targetBizIO.id}
                                            >
                                                {targetBizIO.name}
                                            </span>
                                            {data.path.map((path) => (
                                                <span
                                                    className="x-2 text-xs"
                                                    key={path.id}
                                                >
                                                    {path.name}
                                                </span>
                                            ))}
                                        </Breadcrumbs>
                                    </PreparedTableCell>
                                    <PreparedTableCell
                                        targetBizId={targetBizIO.id}
                                        data={data}
                                        onClick={handleSelected}
                                    >
                                        <MemoDescription
                                            memo={
                                                data.bizIO.externalData
                                                    ?.structure.memo
                                            }
                                        />
                                    </PreparedTableCell>

                                    <PreparedTableCell
                                        targetBizId={targetBizIO.id}
                                        data={data}
                                        onClick={handleSelected}
                                    />
                                </TableRow>
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={5} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredCollection.length}
                rowsPerPage={treeState.listRowsPerPage}
                page={treeState.listPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                className="px-4"
            />
            {renderConfirmDialog()}
        </>
    );
};

const PreparedTableCell = (props: {
    onClick: MouseEventHandler<HTMLTableCellElement>;
    data: {
        bizIO: BizIO<BizIOExtData, BizComponentGroupType>;
        systemLabeled: boolean;
        path: Array<{ name: string; id: string }>;
    };
    targetBizId: string;
    children?: React.ReactNode;
}) => {
    const { onClick, data, targetBizId, children } = props;
    return (
        <TableCell
            onClick={onClick}
            data-biz-id={data.bizIO.id}
            data-hierarchy-id={data.path.reduce(
                (a, b) => a + DELIMITER + b.id,
                targetBizId
            )}
            data-system-labeled={data.systemLabeled.toString()}
        >
            {children}
        </TableCell>
    );
};

const ListFilterParts = (props: {
    treeState: BizIOComponentState;
    dispatchState: Dispatch<BizIOComponentAction>;
    totalNumber: number;
}) => {
    const { treeState, dispatchState, totalNumber } = props;
    const { t } = useTranslation();

    const initData = treeState.filterData ?? {
        name: '',
        memo: '',
        type: 'All' as 'All',
    };

    const formMethods = useForm<ListViewFilterForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: initData,
    });

    const handleSubmit: SubmitHandler<ListViewFilterForm> = (
        data: ListViewFilterForm
    ) => {
        dispatchState({
            type: 'changeListViewFilter',
            filterData: data,
        });
    };

    useEffect(() => {
        // Note
        // React Hook Form は useRef で内部に記録されているので rerender されても情報は変更されない。
        // そのため、 useEffect で reset する必要がある
        formMethods.reset(initData);
    }, [treeState.filterData]);

    return (
        <Collapse in={treeState.isFilterOpened}>
            <div className="bg-zinc-900 m-1 mb-0 p-4 rounded-t-lg border border-b-0 border-zinc-700">
                <FormProvider {...formMethods}>
                    <div className="flex items-center pb-4">
                        <MaterialIcon codePoint={IconType.FilterList} />
                        <span className="pl-2">{t('common.label.filter')}</span>
                        <span className="pl-4 grow text-sm">
                            {t('common.label.total')} {totalNumber}
                        </span>
                        <div>
                            <Tooltip title={t('common.label.search')}>
                                <Button
                                    variant="contained"
                                    onClick={formMethods.handleSubmit(
                                        handleSubmit
                                    )}
                                >
                                    <MaterialIcon
                                        codePoint={IconType.Search}
                                    ></MaterialIcon>
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 items-center">
                        <div>
                            <TextInput<ListViewFilterForm>
                                name="name"
                                label={t('CommonForm.name')}
                                variant="outlined"
                            />
                        </div>
                        <div>
                            <BizIOSelectorForFilter<ListViewFilterForm> />
                        </div>
                        <div>
                            <TextInput<ListViewFilterForm>
                                name="memo"
                                label={t('CommonForm.memo')}
                                variant="outlined"
                            />
                        </div>
                    </div>
                </FormProvider>
            </div>
        </Collapse>
    );
};
