import { type z } from 'zod';

export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'phone'
    | 'date'
    | 'file'
    | 'checkbox'
    | 'checklist'
    | 'radio'
    | 'select'
    | 'range'
    | 'min_max';

export interface FieldValidation {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
    minValue?: number;
    maxValue?: number;
    minDate?: string;
    maxDate?: string;
    requiredMessage?: string;
    minSelections?: number;
    maxSelections?: number;
    maxFileSize?: number;
    customRule?: string;
}

export interface FormField {
    type: FieldType;
    label: string;
    placeholder?: string;
    tooltip?: string;
    required: boolean;
    options?: string[];
    acceptedFileTypes?: string[];
    maxFiles?: number;
    min?: number;
    max?: number;
    step?: number;
    disableSpinners?: boolean;
    validation?: FieldValidation;
}

export interface FormFieldInternal extends FormField {
    id: string;
}

export interface FormSchema {
    id: string;
    name: string;
    description?: string;
    fields: FormFieldInternal[];
}

export type SchemaBuilders = {
    [K in FieldType]: (field: FormFieldInternal) => z.ZodTypeAny;
};
