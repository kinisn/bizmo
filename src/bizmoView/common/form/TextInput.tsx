import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEventHandler } from 'react';
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
    RegisterOptions,
    useFormContext,
} from 'react-hook-form';

/**
 * TextField w/ React Hook Form
 *
 * https://mui.com/material-ui/react-text-field/
 * https://react-hook-form.com/api/usecontroller/controller
 */
const TextInput = <T extends FieldValues>({
    name,
    label,
    rules,
    onBlur,
    disabled,
    ...props
}: {
    name: FieldPath<T>;
    label?: string;
    rules?: Omit<
        RegisterOptions,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    onBlur?: ChangeEventHandler;
    disabled?: boolean;
} & Omit<TextFieldProps, keyof ControllerRenderProps>) => {
    const methods = useFormContext<T>();
    return (
        <Controller
            name={name}
            rules={rules}
            render={({ field, fieldState }) => {
                // field.onBlur() をCallしないと正しくValidationが行われない。
                const handleBlur = (e: any) => {
                    field.onBlur();
                    if (onBlur) onBlur(e);
                };
                return (
                    <TextField
                        {...field}
                        {...props}
                        fullWidth
                        label={label ?? name}
                        error={fieldState.error ? true : false}
                        helperText={fieldState.error?.message}
                        disabled={disabled}
                        onBlur={handleBlur}
                    />
                );
            }}
        />
    );
};
export default TextInput;
