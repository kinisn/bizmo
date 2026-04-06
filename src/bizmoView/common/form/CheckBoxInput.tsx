import {
    Checkbox,
    CheckboxProps,
    FormControl,
    FormControlLabel,
    FormHelperText,
} from '@mui/material';
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

/**
 * Checkbox w/ React Hook Form
 *
 * https://mui.com/material-ui/react-checkbox/
 * https://react-hook-form.com/api/usecontroller/controller
 */
const CheckBoxInput = <T extends FieldValues>({
    name,
    label,
    ...props
}: {
    name: FieldPath<T>;
    label?: string;
} & Omit<CheckboxProps, keyof ControllerRenderProps>) => {
    return (
        <Controller
            name={name}
            render={({ field, fieldState }) => (
                <FormControl fullWidth error={fieldState.error ? true : false}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...field}
                                name={name}
                                checked={field.value}
                                {...props}
                            />
                        }
                        label={label}
                    />
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
            )}
        />
    );
};
export default CheckBoxInput;
