import { Button } from '@mui/material';
import { BizFunction } from 'bizmo/core/bizProcessor/func/BizFunction';
import { BizIOConf } from 'bizmo/core/bizProcessor/func/input/BizIOConf';
import {
    HyperParamID,
    HyperParamManager,
} from 'bizmo/core/hyperParam/HyperParamManager';
import { BizIOExtData } from 'bizmoView/common/external/bizIOExtData';
import { BizIOSelector } from 'bizmoView/common/form/BizIOSelector';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import TextInput from 'bizmoView/common/form/TextInput';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { BizIOParts } from 'bizmoView/component/bizIOComponent/parts/collectionViewer/BizIOParts';
import { HyperParamElemThumbnail } from 'bizmoView/component/hyperParam/list/HyperParameterListView';
import Decimal from 'decimal.js';
import { useBizmo } from 'globalState/useBizmo';
import { HTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ReactBizFuncParserCombinator } from './ReactBizFuncParserCombinator';

export type BizFunctionState = {
    isEditMode: boolean;

    // form state
    formData?: BizFunctionForm;

    // state
    code: string;
    orderedBizIOConf: Array<BizIOConf>;
    orderedInitValues: Array<Decimal>;
    orderedHyperParamIDs: Array<HyperParamID>;
};

export type BizFunctionForm = {
    code: string;
    orderedBizIOConf: Array<BizIOConf>;
    orderedInitValues: Array<Decimal>;
    orderedHyperParamIDs: Array<string>;
};

export function initializeBizFunctionForm(
    state: BizFunctionState,
    bizFunction?: BizFunction
): BizFunctionForm {
    const defaultValues = {
        code: state.formData?.code
            ? state.formData?.code
            : bizFunction?.code ?? '',

        orderedBizIOConf: state.formData?.orderedBizIOConf
            ? state.formData?.orderedBizIOConf
            : bizFunction?.orderedBizIOConf ?? [],
        orderedInitValues: state.formData?.orderedInitValues
            ? state.formData?.orderedInitValues
            : bizFunction?.orderedInitValues ?? [],
        orderedHyperParamIDs: state.formData?.orderedHyperParamIDs
            ? state.formData?.orderedHyperParamIDs
            : bizFunction?.orderedHyperParamIDs ?? [],
    };

    return defaultValues;
}

export const BizFunctionFormComponent = (
    props: {
        state: BizFunctionState;
        bizFunction: BizFunction;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { state, bizFunction, ...rest } = props;
    const { t } = useTranslation();
    const bizmo = useBizmo();
    if (!bizmo || !bizmo.hyperMG() || !bizmo.db() || !bizmo.timetable()) {
        return <></>;
    }

    const initData = initializeBizFunctionForm(state, bizFunction);

    const formMethods = useForm<BizFunctionForm>({
        mode: 'onBlur',
        reValidateMode: 'onBlur',
        defaultValues: initData,
    });

    const orderedBizIOConfMethods = useFieldArray<BizFunctionForm>({
        name: 'orderedBizIOConf',
        control: formMethods.control,
    });

    // 編集モード時: フォームの code 変更を bizFunction に書き戻す
    useEffect(() => {
        if (!state.isEditMode) return;
        const subscription = formMethods.watch((value, { name: fieldName }) => {
            if (fieldName === 'code' && typeof value.code === 'string') {
                try {
                    bizFunction.code = value.code;
                } catch (e) {
                    // パースエラーは無視（入力途中）
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [state.isEditMode]);

    // Construct function view
    const functionParserCombinator = new ReactBizFuncParserCombinator();
    const bizFunctionView = bizFunction.process<ReactNode>({
        parser: functionParserCombinator,
        bizIdInputs: [],
        bizIOInputs: bizFunction.orderedBizIOConf.map((bizIOConf) => (
            <BizIOInputParamParts bizIOConf={bizIOConf} />
        )),
        resInputs: [],
        sysInputs: SystemInputParamList,
        initValues: bizFunction.orderedInitValues.map((initValue) =>
            String(initValue)
        ),
        hyperParams: bizFunction.orderedHyperParamIDs.map((hyperParamID) => (
            <HyperParamInputParamParts
                hyperParamID={hyperParamID}
                hyperMG={bizmo.hyperMG()!}
            />
        )),
        db: bizmo.db(),
        timetable: bizmo.timetable(),
    });

    return (
        <div {...rest}>
            {state.isEditMode ? (
                <FormProvider {...formMethods}>
                    <TextInput<BizFunctionForm> name="code" label={'code'} />
                    <div className="mt-4 space-y-4">
                        <EditableInitValues
                            bizFunction={bizFunction}
                            formMethods={formMethods}
                        />
                        <EditableBizIOConf bizFunction={bizFunction} />
                        <EditableHyperParamIDs
                            bizFunction={bizFunction}
                            hyperMG={bizmo.hyperMG()}
                        />
                    </div>
                </FormProvider>
            ) : (
                <div>
                    <div className="overflow-auto [&>div]:justify-start">
                        {bizFunctionView}
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * sys0: 処理 term の index
 * sys1: 処理 term の 西暦（YYYYMMDD形式）の数値
 * sys2: 処理 term の 西暦の年
 * sys3: 処理 term の 西暦の月
 * sys4: 処理 term の 西暦の日
 */
const SystemInputParamList = [
    'Index of term',
    'YYYYMMDD',
    'Year',
    'Month',
    'Day',
];

const BizIOInputParamParts = (props: { bizIOConf: BizIOConf }) => {
    const { bizIOConf } = props;
    return (
        <div className="ml-2 flex flex-row flex-nowrap items-center">
            <div className="border rounded-lg">
                <BizIOParts bizIOId={bizIOConf.targetId} />
            </div>
            <span className="ml-2">before</span>
            <div className="ml-2 min-w-8 min-h-8 rounded-full flex items-center justify-center bg-white/25 ">
                {bizIOConf.relativeTermIndex}
            </div>
            <span className="ml-2">terms</span>
        </div>
    );
};

const HyperParamInputParamParts = (props: {
    hyperParamID: HyperParamID;
    hyperMG: HyperParamManager;
}) => {
    const { hyperParamID, hyperMG } = props;
    const hyperParam = hyperMG.getByID(hyperParamID);
    return hyperParam ? (
        <div className="mx-2 flex flex-row flex-nowrap items-center">
            <div className="border rounded-lg flex flex-row items-center">
                <div className="whitespace-nowrap p-2">{hyperParam.name}</div>
                <div className="px-2">
                    <HyperParamElemThumbnail elem={hyperParam.element} />
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
};

/**
 * InitValues の編集：追加・削除・値変更
 */
const EditableInitValues = (props: {
    bizFunction: BizFunction;
    formMethods: any;
}) => {
    const { bizFunction } = props;
    const [values, setValues] = useState<string[]>(
        bizFunction.orderedInitValues.map((v) => v.toString())
    );

    const handleChange = (index: number, val: string) => {
        const next = [...values];
        next[index] = val;
        setValues(next);
        try {
            bizFunction.orderedInitValues[index] = new Decimal(val || '0');
        } catch {}
    };

    const handleAdd = () => {
        bizFunction.orderedInitValues.push(new Decimal(0));
        setValues([...values, '0']);
    };

    const handleRemove = (index: number) => {
        bizFunction.orderedInitValues.splice(index, 1);
        const next = [...values];
        next.splice(index, 1);
        setValues(next);
    };

    return (
        <DescriptionParts label="InitValues（init0, init1, ...）">
            {values.map((val, index) => (
                <div key={index} className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400 w-12">
                        init{index}
                    </span>
                    <input
                        type="text"
                        className="flex-1 bg-zinc-800 text-white border border-zinc-600 rounded px-2 py-1 text-sm font-mono"
                        value={val}
                        onChange={(e) => handleChange(index, e.target.value)}
                    />
                    <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemove(index)}
                    >
                        <MaterialIcon codePoint={IconType.Remove} />
                    </Button>
                </div>
            ))}
            <Button size="small" onClick={handleAdd}>
                <MaterialIcon codePoint={IconType.Add} className="mr-1" />
                追加
            </Button>
        </DescriptionParts>
    );
};

/**
 * BizIOConf の編集：BizIO参照の追加・削除
 */
type BizIOConfEditForm = {
    newBizIOId: string;
};

const EditableBizIOConf = (props: { bizFunction: BizFunction }) => {
    const { bizFunction } = props;
    const [confs, setConfs] = useState<BizIOConf[]>([
        ...bizFunction.orderedBizIOConf,
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [newTermIndex, setNewTermIndex] = useState('0');

    const formMethods = useForm<BizIOConfEditForm>({
        defaultValues: { newBizIOId: '' },
    });

    const handleAdd = () => {
        const bizIOId = formMethods.getValues().newBizIOId;
        if (!bizIOId) return;
        const conf = new BizIOConf(bizIOId, parseInt(newTermIndex) || 0);
        bizFunction.orderedBizIOConf.push(conf);
        setConfs([...bizFunction.orderedBizIOConf]);
        setIsAdding(false);
        formMethods.reset();
        setNewTermIndex('0');
    };

    const handleRemove = (index: number) => {
        bizFunction.orderedBizIOConf.splice(index, 1);
        setConfs([...bizFunction.orderedBizIOConf]);
    };

    return (
        <DescriptionParts label="BizIO参照（bizio0, bizio1, ...）">
            {confs.map((conf, index) => (
                <div
                    key={`${index}_${conf.targetId}`}
                    className="flex items-center gap-2 mb-1"
                >
                    <span className="text-xs text-zinc-400 w-16">
                        bizio{index}
                    </span>
                    <div className="flex-1 border rounded-lg">
                        <BizIOParts bizIOId={conf.targetId} />
                    </div>
                    <span className="text-xs text-zinc-400">
                        {conf.relativeTermIndex}期前
                    </span>
                    <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemove(index)}
                    >
                        <MaterialIcon codePoint={IconType.Remove} />
                    </Button>
                </div>
            ))}
            {isAdding ? (
                <div className="mt-2 p-2 border border-zinc-600 rounded space-y-2">
                    <FormProvider {...formMethods}>
                        <BizIOSelector<BizIOConfEditForm>
                            name="newBizIOId"
                            setValue={formMethods.setValue}
                            selectableMode="hasValueOnly"
                        />
                    </FormProvider>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400">
                            相対ターム:
                        </span>
                        <input
                            type="number"
                            className="w-20 bg-zinc-800 text-white border border-zinc-600 rounded px-2 py-1 text-sm"
                            value={newTermIndex}
                            onChange={(e) => setNewTermIndex(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAdd}
                        >
                            OK
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setIsAdding(false)}
                        >
                            キャンセル
                        </Button>
                    </div>
                </div>
            ) : (
                <Button size="small" onClick={() => setIsAdding(true)}>
                    <MaterialIcon codePoint={IconType.Add} className="mr-1" />
                    追加
                </Button>
            )}
        </DescriptionParts>
    );
};

/**
 * HyperParamIDs の編集：追加・削除
 */
const EditableHyperParamIDs = (props: {
    bizFunction: BizFunction;
    hyperMG: HyperParamManager;
}) => {
    const { bizFunction, hyperMG } = props;
    const [ids, setIds] = useState<string[]>([
        ...bizFunction.orderedHyperParamIDs,
    ]);

    const allParams = Array.from(hyperMG.values());

    const handleAdd = (paramId: string) => {
        bizFunction.orderedHyperParamIDs.push(paramId);
        setIds([...bizFunction.orderedHyperParamIDs]);
    };

    const handleRemove = (index: number) => {
        bizFunction.orderedHyperParamIDs.splice(index, 1);
        setIds([...bizFunction.orderedHyperParamIDs]);
    };

    return (
        <DescriptionParts label="HyperParam参照（hyper0, hyper1, ...）">
            {ids.map((paramId, index) => {
                const param = hyperMG.getByID(paramId);
                return (
                    <div
                        key={`${index}_${paramId}`}
                        className="flex items-center gap-2 mb-1"
                    >
                        <span className="text-xs text-zinc-400 w-16">
                            hyper{index}
                        </span>
                        {param ? (
                            <div className="flex-1 flex items-center border rounded-lg p-2">
                                <span>{param.name}</span>
                                <div className="ml-2">
                                    <HyperParamElemThumbnail
                                        elem={param.element}
                                    />
                                </div>
                            </div>
                        ) : (
                            <span className="flex-1 text-zinc-500 text-xs">
                                {paramId}
                            </span>
                        )}
                        <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemove(index)}
                        >
                            <MaterialIcon codePoint={IconType.Remove} />
                        </Button>
                    </div>
                );
            })}
            {allParams.length > 0 ? (
                <div className="mt-1">
                    <span className="text-xs text-zinc-400 mr-2">追加:</span>
                    {allParams.map((param) => (
                        <Button
                            key={param.id}
                            size="small"
                            variant="outlined"
                            className="mr-1 mb-1"
                            onClick={() => handleAdd(param.id)}
                        >
                            {param.name}
                        </Button>
                    ))}
                </div>
            ) : (
                <div className="text-xs text-zinc-400">
                    パラメータが未登録です
                </div>
            )}
        </DescriptionParts>
    );
};
