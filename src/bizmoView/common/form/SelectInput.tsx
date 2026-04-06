import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { ChangeEventHandler } from 'react';
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

/**
 * Select w/ React Hook Form
 *
 * https://mui.com/material-ui/react-text-field/
 * https://react-hook-form.com/api/usecontroller/controller
 */
export type SelectItem = {
    value: string | number;
    label: React.ReactNode;
    disabled?: boolean;
};
const SelectInput = <T extends FieldValues>({
    name,
    items,
    label,
    onBlur,
    disabled,
    ...props
}: {
    name: FieldPath<T>;
    items: Array<SelectItem>;
    label?: string;
    onBlur?: ChangeEventHandler;
    disabled?: boolean;
} & Omit<TextFieldProps, keyof ControllerRenderProps>) => {
    return (
        <Controller
            name={name}
            render={({ field, fieldState }) => {
                const handleBlur = (e: any) => {
                    field.onBlur();
                    if (onBlur) onBlur(e);
                };
                return (
                    <TextField
                        {...field}
                        {...props}
                        select={true}
                        fullWidth={true}
                        label={label}
                        error={fieldState.error ? true : false}
                        helperText={fieldState.error?.message}
                        onBlur={handleBlur}
                        disabled={disabled}
                    >
                        {items.map((item, index) => (
                            <MenuItem
                                value={item.value}
                                key={index}
                                //disabled={item.disabled}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </TextField>
                );
            }}
        />
    );
};
export default SelectInput;
