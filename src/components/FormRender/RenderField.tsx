import { FileUpload } from './FileUpload';
import type { FormFieldInternal } from './types';

import {
    FormLabel,
    useFormField,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldValue {
    value: string | boolean | string[] | FileList | null | Record<string, string>;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    name?: string;
    ref?: React.Ref<HTMLInputElement>;
}

interface RenderFieldProps {
    field: FormFieldInternal;
    formField: FormFieldValue;
}

export function RenderField({ field, formField }: RenderFieldProps) {
    const { error } = useFormField();
    const errCls = error ? 'border-destructive ring-destructive/20 ring-[3px]' : '';

    const inputProps = {
        placeholder: field.placeholder,
        ...formField,
        value: (formField.value as string) ?? '',
        className: errCls,
    };

    switch (field.type) {
        case 'textarea':
            return <Textarea {...inputProps} />;

        case 'select':
            return (
                <select
                    {...inputProps}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${errCls}`}
                >
                    <option value="" disabled>Select an option</option>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );

        case 'checkbox':
            return (
                <>
                    <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={!!formField.value}
                        onChange={formField.onChange as React.ChangeEventHandler<HTMLInputElement>}
                    />
                    <div className="leading-none">
                        <FormLabel>
                            {field.label}
                            {' '}
                            {field.required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        {field.tooltip && <p className="text-sm text-muted-foreground">{field.tooltip}</p>}
                    </div>
                </>
            );

        case 'checklist':
        case 'radio':
            return (
                <div className={`space-y-2 border p-4 rounded-md ${errCls}`}>
                    {field.options?.map((opt) => (
                        <label key={opt} htmlFor={`${field.type}-${opt}`} className="flex items-center gap-2 text-sm">
                            <input
                                id={`${field.type}-${opt}`}
                                type={field.type === 'checklist' ? 'checkbox' : 'radio'}
                                className="h-4 w-4"
                                checked={
                                    field.type === 'checklist'
                                        ? ((formField.value as string[]) || []).includes(opt)
                                        : formField.value === opt
                                }
                                onChange={(e) => {
                                    if (field.type === 'checklist') {
                                        const curr = (formField.value as string[]) || [];
                                        const newVal = e.target.checked
                                            ? [...curr, opt]
                                            : curr.filter((v: string) => v !== opt);
                                        formField.onChange(newVal);
                                    } else {
                                        formField.onChange(opt);
                                    }
                                }}
                            />
                            {opt}
                        </label>
                    ))}
                </div>
            );

        case 'file':
            return (
                <FileUpload
                    field={field}
                    formField={{
                        value: formField.value as FileList | null,
                        onChange: formField.onChange as (files: FileList) => void,
                    }}
                    hasError={!!error}
                />
            );

        case 'range':
            return (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>
                            Value:
                            {' '}
                            <span className="text-primary">{(formField.value as number) ?? field.min ?? 0}</span>
                        </span>
                        <span className="text-muted-foreground">
                            {field.min ?? 0}
                            {' '}
                            -
                            {' '}
                            {field.max ?? 100}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        value={(formField.value as number) ?? field.min ?? 0}
                        onChange={(e) => formField.onChange(Number(e.target.value))}
                        className="w-full accent-primary"
                    />
                </div>
            );

        case 'min_max':
            return (
                <div className="flex gap-4">
                    {['min', 'max'].map((k) => (
                        <div key={k} className="flex-1">
                            <Label className="text-xs text-muted-foreground capitalize">{k}</Label>
                            <Input
                                type="number"
                                placeholder={k}
                                value={(formField.value as Record<string, string>)?.[k] ?? ''}
                                onChange={(e) => formField.onChange({
                                    ...(formField.value as Record<string, string>),
                                    [k]: e.target.value,
                                })}
                            />
                        </div>
                    ))}
                </div>
            );

        case 'phone':
            return (
                <Input
                    type="tel"
                    {...inputProps}
                    onChange={(e) => {
                        let val = e.target.value;
                        if (val.startsWith(' ')) val = val.trimStart();
                        val = val.replace(/  +/g, ' ');
                        if (/^[0-9+\-\s()]*$/.test(val)) {
                            formField.onChange(val);
                        }
                    }}
                />
            );

        case 'number':
            return (
                <Input
                    type="number"
                    {...inputProps}
                    className={field.disableSpinners ? `[appearance:textfield] ${errCls}` : errCls}
                />
            );

        case 'date':
            return <Input type="date" {...inputProps} />;

        default:
            return <Input type="text" {...inputProps} />;
    }
}
