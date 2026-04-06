import {
    DatePickerProps,
    DatePicker as MUIDatePicker,
} from '@mui/x-date-pickers';
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

/**
 * DatePicker w/ React Hook Form
 *
 * https://mui.com/x/react-date-pickers/date-picker/
 * https://react-hook-form.com/api/usecontroller/controller
 */
export const DatePickerInput = <T extends FieldValues>({
    name,
    label,
    inputFormat,
    ...props
}: {
    name: FieldPath<T>;
    label?: string;
    inputFormat?: string;
} & Omit<
    DatePickerProps<Date>,
    keyof ControllerRenderProps | 'renderInput' | 'inputFormat' | 'mask'
>) => {
    return (
        <Controller
            name={name}
            render={({ field, fieldState }) => (
                <MUIDatePicker
                    label={label}
                    slotProps={{
                        textField: {
                            error: fieldState.error ? true : false,
                            helperText: fieldState.error?.message,
                        }
                    }}
                    format={inputFormat ?? 'YYYY/MM/DD'}
                    {...field}
                    {...props}
                />
            )}
        />
    );
};
