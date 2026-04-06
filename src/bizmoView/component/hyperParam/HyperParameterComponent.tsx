import {
    HyperParam,
    HyperParamID,
} from 'bizmo/core/hyperParam/HyperParamManager';
import { useEffect, useMemo, useReducer } from 'react';

import { TriangleDistribution } from 'bizmo/core/hyperParam/prob/cdf/TriangleDistribution';
import { ProbHyperParam } from 'bizmo/core/hyperParam/prob/ProbHyperParam';
import Decimal from 'decimal.js';
import { useBizmo } from 'globalState/useBizmo';
import { useTranslation } from 'react-i18next';
import {
    fillHyperParam,
    HParamForm,
    HyperParameterDetailView,
} from './detail/HyperParameterDetailView';
import {
    HeadTypes,
    HyperParameterListView,
    Order,
} from './list/HyperParameterListView';

export type FilterCondition = {
    target: 'name';
    type: 'include';
    query: string;
};
type DBTarget =
    | { target: HyperParam; mode: 'add' | 'edit' }
    | { target: HyperParamID[]; mode: 'delete' };
export type HParamPageState = {
    viewMode: 'list' | 'add' | 'edit';
    // for add/edit
    targetHParam: HyperParam; // HyperParamManager登録済のデータ
    currentFormHParam: HyperParam; // Form現在値をHyperParam化したもの（HyperParamManager未登録）
    // for list
    order: Order;
    orderBy: HeadTypes;
    page: number;
    rowsPerPage: number;
    // for list: delete
    selectedParamLabels: readonly string[];
    // for list: filter
    filterVisible: boolean;
    filterCondition: FilterCondition;
    // for db
    dbTarget: DBTarget | null;
};
export type HParamPageAction =
    | {
          type: 'initLoaded';
      }
    | {
          type: 'submittedHPram';
          formData: HParamForm;
      }
    | {
          type: 'addHParam';
      }
    | {
          type: 'editHParam';
          targetHParamID: string;
      }
    | {
          type: 'cancel';
      }
    | {
          type: 'removeHParams';
      }
    | {
          type: 'selectParamLabels';
          labels: readonly string[];
      }
    | {
          type: 'changePage';
          page: number;
      }
    | {
          type: 'changeRowsPerPage';
          rowsPerPage: number;
      }
    | {
          type: 'sort';
          order: Order;
          orderBy: HeadTypes;
      }
    | {
          type: 'changeCurrentFormHParam';
          currentFormHParam: HyperParam;
      }
    | {
          type: 'changeFilterCondition';
          filterCondition: FilterCondition;
      }
    | {
          type: 'changeFilterVisible';
          visible: boolean;
      }
    | {
          type: 'recordedOnDB';
      };

/**
 * HyperParamの初期値を生成する。
 * 注意： nameはあえてHyperParamManagerの登録を確認していないため、衝突する可能性があるが、その場合にはユーザーに自分で修正させる前提。
 * @param {string} name HyperParamのname
 * @returns {HyperParam} HyperParamの初期値
 */
function createInitHParam(name: string): HyperParam {
    return new HyperParam({
        name: name, // nameの初期値を与えないと、validationエラーになる
        // element: new Decimal(0),
        element: new ProbHyperParam({
            unit: new Decimal(1),
            lowerLimit: new Decimal(0),
            upperLimit: new Decimal(10),
            cdf: new TriangleDistribution(new Decimal(5)),
        }),
    });
}

const HyperParameterComponent = ({}) => {
    const { t } = useTranslation();
    const { hyperMG, simulator, putHyperParam, removeHyperParams } = useBizmo();
    if (!hyperMG) return <></>;

    // reducer
    const initHParam = createInitHParam(
        t('hyperParam.initParamName', { token: hyperMG()?.values().length })
    );
    const [pageState, dispatchPageState] = useReducer(
        (state: HParamPageState, action: HParamPageAction): HParamPageState => {
            switch (action.type) {
                case 'initLoaded':
                    return { ...state };
                case 'submittedHPram':
                    let dbTarget: DBTarget | null = null;
                    switch (state.viewMode) {
                        case 'edit':
                            dbTarget = {
                                // HyperParamMGの中の実態を直接編集してしまうので永続化のときに注意
                                target: fillHyperParam(
                                    action.formData,
                                    hyperMG()?.getByID(state.targetHParam.id)
                                ),
                                mode: 'edit',
                            };
                            break;
                        case 'add':
                            const newHPram = fillHyperParam(action.formData);
                            //hyperMG.set({ data: newHPram }); // zustand にて登録
                            dbTarget = { target: newHPram, mode: 'add' };
                            break;
                    }
                    return {
                        ...state,
                        viewMode: 'list',
                        dbTarget: dbTarget,
                    };
                case 'recordedOnDB':
                    return {
                        ...state,
                        dbTarget: null,
                    };
                case 'editHParam':
                    const targetHParam = hyperMG()?.getByID(
                        action.targetHParamID
                    );
                    if (targetHParam) {
                        return {
                            ...state,
                            viewMode: 'edit',
                            targetHParam: targetHParam,
                            currentFormHParam: targetHParam,
                            selectedParamLabels: [],
                        };
                    } else {
                        return state;
                    }
                case 'addHParam':
                    const newHPram = createInitHParam(
                        t('hyperParam.initParamName', {
                            token: hyperMG()?.values().length,
                        })
                    );
                    return {
                        ...state,
                        viewMode: 'add',
                        targetHParam: newHPram,
                        currentFormHParam: newHPram,
                        selectedParamLabels: [],
                    };
                case 'cancel':
                    return { ...state, viewMode: 'list' };
                case 'changeCurrentFormHParam':
                    return {
                        ...state,
                        currentFormHParam: action.currentFormHParam,
                    };
                // == list: delete ==
                case 'removeHParams':
                    const removedIDs: string[] = [];
                    state.selectedParamLabels.map((name) => {
                        const data = hyperMG()?.get(name);
                        if (data) removedIDs.push(data.id);
                    });
                    return {
                        ...state,
                        viewMode: 'list',
                        selectedParamLabels: [],
                        dbTarget: { target: removedIDs, mode: 'delete' },
                        page: 0, // 削除したら必ずページをリセット
                    };
                case 'selectParamLabels':
                    return {
                        ...state,
                        viewMode: 'list',
                        selectedParamLabels: action.labels,
                    };
                // == list: sort ==
                case 'changePage':
                    return { ...state, viewMode: 'list', page: action.page };
                case 'changeRowsPerPage':
                    return {
                        ...state,
                        viewMode: 'list',
                        rowsPerPage: action.rowsPerPage,
                        page: 0,
                    };
                case 'sort':
                    return {
                        ...state,
                        viewMode: 'list',
                        order: action.order,
                        orderBy: action.orderBy,
                    };
                // == list: filter ==
                case 'changeFilterCondition':
                    return {
                        ...state,
                        viewMode: 'list',
                        filterCondition: action.filterCondition,
                    };
                case 'changeFilterVisible':
                    const filterCondition = state.filterCondition;
                    filterCondition.query = '';
                    return {
                        ...state,
                        viewMode: 'list',
                        filterVisible: action.visible,
                        filterCondition: filterCondition,
                    };
            }
        },
        {
            viewMode: 'list',
            targetHParam: initHParam,
            currentFormHParam: initHParam,
            selectedParamLabels: [],
            order: 'asc',
            orderBy: 'name',
            page: 0,
            rowsPerPage: 5,
            filterCondition: {
                target: 'name',
                type: 'include',
                query: '',
            },
            filterVisible: false,
            dbTarget: null,
        }
    );

    // db
    useEffect(() => {
        let ignore = false;
        async function onRequiredDBStore() {
            if (!ignore && pageState.dbTarget) {
                switch (pageState.dbTarget.mode) {
                    case 'add':
                    case 'edit':
                        await putHyperParam(pageState.dbTarget.target)
                            .then(() => {
                                dispatchPageState({ type: 'recordedOnDB' });
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        break;
                    case 'delete':
                        await removeHyperParams(pageState.dbTarget.target)
                            .then(() => {
                                dispatchPageState({ type: 'recordedOnDB' });
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                        break;
                }
            }
        }
        onRequiredDBStore();

        return () => {
            ignore = true;
        };
    }, [pageState.dbTarget]);

    // construct DOM
    const listView = useMemo(() => {
        const hyperParams = hyperMG()!.values();
        return (
            <HyperParameterListView
                hyperParams={hyperParams}
                pageState={pageState}
                dispatchPageState={dispatchPageState}
            ></HyperParameterListView>
        );
    }, [pageState, hyperMG, hyperMG()!.values()]);

    const detailView = useMemo(() => {
        return (
            <HyperParameterDetailView
                pageState={pageState}
                dispatchPageState={dispatchPageState}
            />
        );
    }, [pageState]);

    return <>{pageState.viewMode == 'list' ? listView : detailView}</>;
};
export default HyperParameterComponent;
