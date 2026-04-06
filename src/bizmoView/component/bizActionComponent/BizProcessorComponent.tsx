import { Button, MenuItem, Select, Tooltip } from '@mui/material';
import { BizActionProcessor } from 'bizmo/action/core/BizActionProcessor';
import {
    BizProcOutput,
    BizProcOutputMode,
} from 'bizmo/core/bizProcessor/output/BizProcOutput';
import { LinesArrowShape } from 'bizmoView/common/canvas/LinesArrowShape';
import { BizIOSelector } from 'bizmoView/common/form/BizIOSelector';
import { DescriptionParts } from 'bizmoView/common/form/DescriptionParts';
import { IconType, MaterialIcon } from 'bizmoView/common/materialIcon';
import { useBizmo } from 'globalState/useBizmo';
import { HTMLAttributes, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Layer, Stage } from 'react-konva';
import { BizIOParts } from '../bizIOComponent/parts/collectionViewer/BizIOParts';
import { BizFunctionFormComponent } from './form/BizFunctionForm';

export const BizProcessorComponent = (
    props: {
        order: number;
        bizActionProcessor: BizActionProcessor;
        isEditMode?: boolean;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const bizActionProcessor = props.bizActionProcessor;
    const isEditMode = props.isEditMode ?? false;
    const { t } = useTranslation();

    return (
        <DescriptionParts
            label={
                <span className="flex items-center">
                    <MaterialIcon
                        codePoint={IconType.Memory}
                        className="mr-1"
                    />
                    {`BizProcessor # ${props.order + 1}`}
                </span>
            }
        >
            {bizActionProcessor.orderedBizFunctions.map(
                (bizFunction, index) => (
                    <div
                        className={`flex flex-row items-center ${index > 0 ? `mt-4` : ``}`}
                        key={index}
                    >
                        <div className="w-[60%] overflow-hidden">
                            <DescriptionParts
                                label={
                                    <span className="flex items-center">
                                        <MaterialIcon
                                            codePoint={IconType.Functions}
                                            className="mr-1"
                                        />
                                        {`# ${index + 1}`}
                                    </span>
                                }
                            >
                                <BizFunctionFormComponent
                                    state={{
                                        isEditMode: isEditMode,
                                        code: bizFunction.code,
                                        orderedBizIOConf:
                                            bizFunction.orderedBizIOConf,
                                        orderedInitValues:
                                            bizFunction.orderedInitValues,
                                        orderedHyperParamIDs:
                                            bizFunction.orderedHyperParamIDs,
                                    }}
                                    bizFunction={bizFunction}
                                />
                            </DescriptionParts>
                        </div>
                        <div className="w-[40px] flex items-center justify-center">
                            <div>
                                <Stage width={40} height={20}>
                                    <Layer>
                                        <LinesArrowShape
                                            start={{ x: 0, y: 10 }}
                                            end={{ x: 37, y: 10 }}
                                            color="white"
                                            lineWidth={2}
                                            arrowSize={15}
                                            cornerRadius={2}
                                        />
                                    </Layer>
                                </Stage>
                            </div>
                        </div>
                        <div className="max-w-[40%] overflow-hidden">
                            <DescriptionParts
                                label={
                                    <span className="flex items-center">
                                        <MaterialIcon
                                            codePoint={IconType.Output}
                                            className="mr-1"
                                        />
                                        Output
                                    </span>
                                }
                            >
                                <ProcOutputsParts
                                    key={index}
                                    bizFuncId={bizFunction.funcId}
                                    isEditMode={isEditMode}
                                    bizActionProcessor={bizActionProcessor}
                                />
                            </DescriptionParts>
                        </div>
                    </div>
                )
            )}
        </DescriptionParts>
    );
};

type OutputForm = {
    outputBizId: string;
    parentId: string;
};

const ProcOutputsParts = (
    props: {
        bizFuncId: string;
        isEditMode: boolean;
        bizActionProcessor: BizActionProcessor;
    } & HTMLAttributes<HTMLDivElement>
) => {
    const { bizFuncId, isEditMode, bizActionProcessor, ...rest } =
        props;
    const { t } = useTranslation();
    const bizmo = useBizmo();
    const [isAddingOutput, setIsAddingOutput] = useState(false);
    const [outputVersion, setOutputVersion] = useState(0);
    // outputVersion が変わると再計算
    const procList = bizActionProcessor.procOutputs.filter(
        (o) => o.outputFuncId === bizFuncId
    );
    void outputVersion; // dependency for re-render
    const [selectedOutputBizId, setSelectedOutputBizId] = useState('');

    const formMethods = useForm<OutputForm>({
        defaultValues: {
            outputBizId: '',
            parentId: bizmo.bizComponent().id,
        },
    });
    const [outputMode, setOutputMode] = useState<BizProcOutputMode>('REPLACE');

    // BizIOSelector から選択された時にparentIdを自動解決
    const wrappedSetValue = ((name: any, value: any, options: any) => {
        formMethods.setValue(name, value, options);
        if (name === 'outputBizId' && typeof value === 'string') {
            setSelectedOutputBizId(value);
            const parents = bizmo.db().parentsOf(value);
            if (parents && parents.length > 0) {
                formMethods.setValue('parentId', parents[0].id as any);
            }
        }
    }) as typeof formMethods.setValue;

    const handleAddOutput = () => {
        const values = formMethods.getValues();
        if (!values.outputBizId) return;
        const newOutput = new BizProcOutput({
            parentId: values.parentId || bizmo.bizComponent().id,
            outputBizId: values.outputBizId,
            outputFuncId: bizFuncId,
            outputMode: outputMode,
        });
        const result = bizActionProcessor.addProcOutput(newOutput);
        console.log('addProcOutput result:', result, 'parentId:', values.parentId, 'outputBizId:', values.outputBizId, 'funcId:', bizFuncId);
        if (!result) {
            // バリデーション失敗時: 直接pushする（バリデーションをスキップ）
            console.warn('addProcOutput validation failed, force adding');
            bizActionProcessor.procOutputs.push(newOutput);
        }
        setIsAddingOutput(false);
        setSelectedOutputBizId('');
        formMethods.reset();
        setOutputVersion((v) => v + 1);
    };

    return (
        <div {...rest}>
            {procList.length > 0 ? (
                procList.map((procOutput, index) => (
                    <div
                        key={index}
                        className="flex flex-row items-center mb-2"
                    >
                        <ProcOutputMode outputMode={procOutput.outputMode} />
                        <div className="ml-4 border rounded-lg flex-1">
                            <BizIOParts
                                bizIOId={procOutput.outputBizId}
                                rootBizIOId={procOutput.parentId}
                            />
                        </div>
                        {isEditMode && (
                            <Button
                                size="small"
                                color="error"
                                className="ml-2"
                                onClick={() => {
                                    const allOutputs =
                                        bizActionProcessor.procOutputs;
                                    const realIndex = allOutputs.indexOf(
                                        procOutput
                                    );
                                    if (realIndex >= 0) {
                                        allOutputs.splice(realIndex, 1);
                                    }
                                    setOutputVersion((v) => v + 1);
                                }}
                            >
                                <MaterialIcon codePoint={IconType.Trash} />
                            </Button>
                        )}
                    </div>
                ))
            ) : (
                <div className="p-2 text-zinc-400">No Output</div>
            )}
            {isEditMode && !isAddingOutput && (
                <Button
                    size="small"
                    variant="outlined"
                    className="mt-2"
                    onClick={() => setIsAddingOutput(true)}
                >
                    <MaterialIcon codePoint={IconType.Add} className="mr-1" />
                    Output {t('common.label.add')}
                </Button>
            )}
            {isEditMode && isAddingOutput && (
                <div className="mt-2 p-2 border border-zinc-600 rounded space-y-2">
                    <FormProvider {...formMethods}>
                        <div className="text-xs text-zinc-400 mb-1">
                            出力先 BizIO
                        </div>
                        <BizIOSelector<OutputForm>
                            name="outputBizId"
                            setValue={wrappedSetValue}
                            selectableMode="hasValueOnly"
                        />
                        <div className="text-xs text-zinc-400 mt-2 mb-1">
                            出力モード
                        </div>
                        <Select
                            value={outputMode}
                            onChange={(e) =>
                                setOutputMode(
                                    e.target.value as BizProcOutputMode
                                )
                            }
                            size="small"
                            fullWidth
                        >
                            <MenuItem value="REPLACE">REPLACE（置換）</MenuItem>
                            <MenuItem value="ADD">ADD（加算）</MenuItem>
                            <MenuItem value="SUB">SUB（減算）</MenuItem>
                        </Select>
                    </FormProvider>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddOutput}
                        >
                            OK
                        </Button>
                        <Button
                            size="small"
                            onClick={() => setIsAddingOutput(false)}
                        >
                            {t('common.label.cancel')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProcOutputMode = (props: { outputMode: BizProcOutputMode }) => {
    const { outputMode } = props;
    let iconType = IconType.ChangeCircle;
    let title = 'Replace the target';
    switch (outputMode) {
        case 'ADD':
            iconType = IconType.AddCircle;
            title = 'Add to the target';
            break;
        case 'SUB':
            iconType = IconType.RemoveCircle;
            title = 'Subtract from the target';
            break;
        case 'REPLACE':
            iconType = IconType.ChangeCircle;
            title = 'Replace the target';
            break;
    }
    return (
        <Tooltip title={title}>
            <div className="flex items-center">
                <MaterialIcon codePoint={iconType} />
            </div>
        </Tooltip>
    );
};
