import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    RadioGroupProps,
} from '@mui/material';
import {
    Controller,
    ControllerRenderProps,
    FieldPath,
    FieldValues,
} from 'react-hook-form';

/**
 * RadioGroup w/ React Hook Form
 *
 * https://mui.com/material-ui/react-radio-button/
 * https://react-hook-form.com/api/usecontroller/controller
 */
type RadioGroupItem = {
    value: string | number;
    label: React.ReactNode;
};
const RadioGroupInput = <T extends FieldValues>({
    name,
    items,
    label,
}: {
    name: FieldPath<T>;
    items: Array<RadioGroupItem>;
    label?: string;
} & Omit<RadioGroupProps, keyof ControllerRenderProps>) => {
    return (
        <Controller
            name={name}
            render={({ field, fieldState }) => (
                <FormControl fullWidth error={fieldState.error ? true : false}>
                    <FormLabel id={`${name}_radio-buttons-group-label`}>
                        {label}
                    </FormLabel>
                    <RadioGroup
                        name={name}
                        value={field.value}
                        aria-labelledby={`${name}_radio-buttons-group-label`}
                    >
                        {items.map((item, index) => {
                            // add {...field} first to add onChange and not to overwrite others.
                            return (
                                <FormControlLabel
                                    {...field}
                                    value={item.value}
                                    label={item.label}
                                    key={index}
                                    control={<Radio></Radio>}
                                />
                            );
                        })}
                    </RadioGroup>
                    <FormHelperText>{fieldState.error?.message}</FormHelperText>
                </FormControl>
            )}
        />
    );
};
export default RadioGroupInput;
