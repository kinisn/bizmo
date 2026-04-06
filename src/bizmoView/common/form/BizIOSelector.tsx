import {
    Button,
    Dialog,
    FormHelperText,
    TextFieldProps,
    Tooltip,
} from '@mui/material';
import { BizComponentGroupType } from 'bizmo/bizComponent/BizComponent';
import { BizIO } from 'bizmo/core/bizIO/single/BizIOs';
import {
    BizIOComponent,
    BizIOSelectableMode,
} from 'bizmoView/component/bizIOComponent/BizIOComponent';
import { BizIOComponentIcon } from 'bizmoView/component/bizIOComponent/icon/IconUtil';
import { useBizmo } from 'globalState/useBizmo';
import { t } from 'i18next';
import { Key, ReactNode, useState } from 'react';
import {
    ControllerRenderProps,
    FieldPath,
    FieldValues,
    PathValue,
    RegisterOptions,
    UseFormSetValue,
    useController,
} from 'react-hook-form';
import { BizIOExtData } from '../external/bizIOExtData';
import { IconType, MaterialIcon } from '../materialIcon';

type BizIOSelectorBaseProps<T extends FieldValues> = {
    name: FieldPath<T>;
    label?: string;
    rules?: Omit<
        RegisterOptions,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    selectableMode?: BizIOSelectableMode;
    keyID?: Key;
} & Omit<TextFieldProps, keyof ControllerRenderProps>;

export const BizIOSelector = <T extends FieldValues>({
    name,
    label,
    rules,
    setValue,
    selectableMode = 'hasValueOnly',
    keyID,
    readOnly = false,
}:
    | ({
          setValue: UseFormSetValue<T>;
          readOnly?: false;
      } & BizIOSelectorBaseProps<T>)
    | ({
          setValue?: UseFormSetValue<T>;
          readOnly: true;
      } & BizIOSelectorBaseProps<T>)) => {
    const bizComp = useBizmo().bizComponent();
    if (!bizComp) {
        return <></>;
    }

    const { field, fieldState } = useController({ name, rules });
    const selectedBizIO = bizComp.db.selectById(field.value);

    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const selectHandler = (bizIO: BizIO) => {
        setOpen(false);
        if (setValue) {
            setValue(name, bizIO.id as PathValue<T, FieldPath<T>>, {
                shouldValidate: true,
            });
        }
    };

    // BizActorSelectorの場合は

    return (
        <div>
            <input {...field} key={keyID} type="hidden" />
            <SelectedDescription
                label={label}
                header={<SelectedHeader bizIO={selectedBizIO} />}
                error={fieldState.error ? true : false}
                open={open}
                handleOpen={handleOpen}
            />
            <FormHelperText
                className="ml-3 mt-1"
                error={fieldState.error ? true : false}
            >
                {fieldState.error?.message}
            </FormHelperText>

            <Dialog open={open} maxWidth="lg" onClose={handleClose}>
                <div className="bg-zinc-900 border-2 rounded border-zinc-400">
                    <div className="p-4 rounded bg-black flex items-center">
                        <div className="flex flex-row items-center">
                            <div className="text-lg mr-4">
                                {readOnly
                                    ? t('BizIOSelector.detailOfElement')
                                    : t('BizIOSelector.selectElement')}
                            </div>
                            {!readOnly && selectableMode !== 'all' && (
                                <div className="rounded-full bg-zinc-600 p-2 text-xs">
                                    {selectableMode == 'hasValueOnly'
                                        ? t('BizIOSelector.hasOwnValue')
                                        : t('BizIOSelector.bizActorOnly')}
                                </div>
                            )}
                        </div>
                        <div className="grow flex justify-end">
                            <Tooltip title={t('common.label.close')}>
                                <Button onClick={handleClose}>
                                    <MaterialIcon codePoint={IconType.Close} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="px-4 pb-4 rounded-lg">
                        {readOnly ? (
                            <BizIOComponent
                                componentMode={'viewer'}
                                rootCollection={bizComp}
                                selectedBizIO={selectedBizIO ?? bizComp}
                            ></BizIOComponent>
                        ) : (
                            <BizIOComponent
                                componentMode={'selector'}
                                rootCollection={bizComp}
                                selectHandler={selectHandler}
                                selectedBizIO={selectedBizIO ?? bizComp}
                                selectableMode={selectableMode}
                            ></BizIOComponent>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

const SelectedHeader = (props: {
    bizIO?: BizIO<BizIOExtData, BizComponentGroupType>;
}) => {
    const { bizIO } = props;
    const selectedHeader = bizIO ? (
        <div className="flex items-center grow">
            <BizIOComponentIcon bizIO={bizIO} />
            <div className="ml-4 grow text-xl">{bizIO.name}</div>
        </div>
    ) : (
        <div className="ml-4 grow italic">{t('common.label.notSelected')}</div>
    );
    return <>{selectedHeader}</>;
};

const SelectedDescription = (props: {
    label?: string;
    header: ReactNode;
    error: boolean;
    open: boolean;
    handleOpen: () => void;
}) => {
    const { label, header, error, open, handleOpen } = props;
    return (
        <div className="relative mt-3">
            <div
                className={`block w-full rounded-lg border ${
                    error
                        ? 'border-red-500 border-2'
                        : open
                          ? 'border-sky-300 border-2'
                          : 'border-zinc-600 hover:border-white'
                }`}
            >
                <div
                    className={`cursor-pointer rounded-lg flex items-center p-4 ${
                        open ? 'bg-zinc-800' : 'bg-zinc-900'
                    }`}
                    onClick={handleOpen}
                >
                    {header}
                </div>
            </div>
            {label && (
                <span
                    className={`absolute scale-75 -top-3 z-1 origin-[0] px-2 left-1 bg-zinc-900 ${
                        error
                            ? 'text-red-500'
                            : open
                              ? 'text-sky-300'
                              : 'text-zinc-300'
                    }`}
                >
                    {label}
                </span>
            )}
        </div>
    );
};

export const SelectedBizIOPopupDescription = (props: {
    label: string;
    targetBizIO: BizIO<BizIOExtData, BizComponentGroupType>;
}) => {
    const { label, targetBizIO } = props;
    const bizComp = useBizmo().bizComponent();
    if (!bizComp) {
        return <></>;
    }
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    return (
        <div>
            <SelectedDescription
                label={label}
                header={<SelectedHeader bizIO={targetBizIO} />}
                error={false}
                open={open}
                handleOpen={handleOpen}
            />
            <Dialog open={open} maxWidth="lg" onClose={handleClose}>
                <div className="bg-zinc-900 border-2 rounded border-zinc-400">
                    <div className="p-4 rounded bg-black flex items-center">
                        <div className="text-lg">
                            {t('BizIOSelector.detailOfElement')}
                        </div>
                        <div className="grow flex justify-end">
                            <Tooltip title={t('common.label.close')}>
                                <Button onClick={handleClose}>
                                    <MaterialIcon codePoint={IconType.Close} />
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                    <div className="px-4 pb-4 rounded-lg">
                        <BizIOComponent
                            componentMode={'viewer'}
                            rootCollection={bizComp}
                            selectedBizIO={targetBizIO}
                        ></BizIOComponent>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};
