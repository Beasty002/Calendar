import React from 'react';
import { FileUpload } from './FileUpload';
import type { ChecklistFieldInternal } from './types';
import { FormLabel, useFormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface FormFieldValue {
    value: string | boolean | string[] | FileList | null | number | Record<string, string>;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    name?: string;
    ref?: React.Ref<HTMLInputElement>;
}

interface RenderFieldProps {
    field: ChecklistFieldInternal;
    formField: FormFieldValue;
}

export const RenderField: React.FC<RenderFieldProps> = ({ field, formField }) => {
    const { error } = useFormField();
    const errorClasses = error ? 'border-destructive ring-destructive/20 ring-[3px]' : '';

    switch (field.type) {
        case 'textarea': {
            const { ref: _ref, ...restFormField } = formField;
            return (
                <Textarea
                    placeholder={field.placeholder}
                    {...restFormField}
                    value={(formField.value as string) ?? ''}
                    className={errorClasses}
                />
            );
        }

        case 'select': {
            const { ref: _ref, ...restFormField } = formField;
            return (
                <select
                    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errorClasses}`}
                    {...restFormField}
                    value={(formField.value as string) ?? ''}
                    onChange={(e) => formField.onChange(e.target.value)}
                >
                    <option value="" disabled>Select an option</option>
                    {field.options?.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }

        case 'checkbox':
            return (
                <>
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                        checked={!!formField.value}
                        onChange={formField.onChange as React.ChangeEventHandler<HTMLInputElement>}
                        onBlur={formField.onBlur}
                        ref={formField.ref}
                    />
                    <div className="space-y-1 leading-none">
                        <FormLabel className="text-base font-normal">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </FormLabel>
                        {field.tooltip && <p className="text-sm text-muted-foreground">{field.tooltip}</p>}
                    </div>
                </>
            );

        case 'checklist':
            return (
                <div className={`space-y-2 border p-4 rounded-md ${errorClasses}`}>
                    {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="h-4 w-4"
                                value={opt}
                                checked={((formField.value as string[]) || []).includes(opt)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    const currentVal = (formField.value as string[]) || [];
                                    if (checked) {
                                        formField.onChange([...currentVal, opt]);
                                    } else {
                                        formField.onChange(currentVal.filter(v => v !== opt));
                                    }
                                }}
                            />
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {opt}
                            </label>
                        </div>
                    ))}
                </div>
            );

        case 'radio':
            return (
                <div className={`space-y-2 border p-4 rounded-md ${errorClasses}`}>
                    {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                className="h-4 w-4 text-primary focus:ring-primary"
                                value={opt}
                                checked={formField.value === opt}
                                onChange={() => formField.onChange(opt)}
                            />
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {opt}
                            </label>
                        </div>
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
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            Value: <span className="text-primary">{(formField.value as number) ?? field.min ?? 0}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                            Range: {field.min ?? 0} - {field.max ?? 100}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                        value={(formField.value as number) ?? field.min ?? 0}
                        onChange={(e) => formField.onChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                    />
                </div>
            );

        case 'min_max':
            return (
                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Min</Label>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={(formField.value as Record<string, string>)?.min ?? ''}
                            onChange={(e) => {
                                const current = (formField.value as Record<string, string>) || {};
                                formField.onChange({ ...current, min: e.target.value });
                            }}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Max</Label>
                        <Input
                            type="number"
                            placeholder="Max"
                            value={(formField.value as Record<string, string>)?.max ?? ''}
                            onChange={(e) => {
                                const current = (formField.value as Record<string, string>) || {};
                                formField.onChange({ ...current, max: e.target.value });
                            }}
                        />
                    </div>
                </div>
            );

        case 'phone':
            return (
                <Input
                    type="tel"
                    placeholder={field.placeholder}
                    {...formField}
                    value={(formField.value as string) ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^[0-9+\-\s()]*$/.test(val)) {
                            formField.onChange(val);
                        }
                    }}
                />
            );

        case 'number':
            return (
                <Input
                    type="number"
                    placeholder={field.placeholder}
                    {...formField}
                    value={(formField.value as string | number) ?? ''}
                    className={field.disableSpinners ? `[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errorClasses}` : errorClasses}
                    onWheel={field.disableSpinners ? (e) => (e.target as HTMLInputElement).blur() : undefined}
                />
            );

        case 'date':
            return (
                <Input
                    type="date"
                    placeholder={field.placeholder}
                    {...formField}
                    value={(formField.value as string) ?? ''}
                />
            );

        default:
            return (
                <Input
                    type="text"
                    placeholder={field.placeholder}
                    {...formField}
                    value={(formField.value as string) ?? ''}
                />
            );
    }
};
