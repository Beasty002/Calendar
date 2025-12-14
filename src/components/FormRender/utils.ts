import { z } from 'zod';

import type {
    FieldType,
    FormFieldInternal,
    SchemaBuilders,
} from './types';

const getStringSchema = (field: FormFieldInternal): z.ZodTypeAny => {
    const v = field.validation || {};
    let schema = z.string();
    if (v.minLength) schema = schema.min(v.minLength, `Minimum ${v.minLength} characters`);
    if (v.maxLength) schema = schema.max(v.maxLength, `Maximum ${v.maxLength} characters`);
    return field.required
        ? schema.min(1, v.requiredMessage || 'This field is required.')
        : schema.optional().or(z.literal(''));
};

export const schemaBuilders: SchemaBuilders = {
    text: getStringSchema,
    textarea: getStringSchema,
    email: (field) => {
        const v = field.validation || {};
        if (field.required) {
            return z.string()
                .min(1, v.requiredMessage || 'This field is required.')
                .email(v.patternMessage || 'Invalid email');
        }
        return z.string().email(v.patternMessage || 'Invalid email').optional().or(z.literal(''));
    },
    phone: (field) => {
        const v = field.validation || {};
        if (field.required) {
            return z.string()
                .min(1, v.requiredMessage || 'This field is required.')
                .regex(/^\+?[0-9\s\-()]{7,20}$/, v.patternMessage || 'Invalid phone');
        }
        return z.string()
            .regex(/^\+?[0-9\s\-()]{7,20}$/, v.patternMessage || 'Invalid phone')
            .optional()
            .or(z.literal(''));
    },
    number: (field) => {
        const v = field.validation || {};
        let schema = z.coerce.number();
        if (v.minValue !== undefined) schema = schema.min(v.minValue);
        if (v.maxValue !== undefined) schema = schema.max(v.maxValue);
        return field.required ? schema : z.union([schema, z.literal('')]);
    },
    date: (field) => {
        const v = field.validation || {};
        return field.required
            ? z.string().min(1, v.requiredMessage || 'This field is required.')
            : z.string().optional().or(z.literal(''));
    },
    checkbox: (field) => {
        const v = field.validation || {};
        return field.required
            ? z.boolean().refine((val) => val, { message: v.requiredMessage || 'This field is required.' })
            : z.boolean();
    },
    checklist: (field) => {
        const v = field.validation || {};
        const minSel = v.minSelections ?? (field.required ? 1 : 0);
        let schema = z.array(z.string());
        if (minSel > 0) schema = schema.min(minSel, `Select at least ${minSel}`);
        if (v.maxSelections) schema = schema.max(v.maxSelections);
        return schema;
    },
    radio: (field) => {
        const v = field.validation || {};
        return field.required
            ? z.string().min(1, v.requiredMessage || 'Select an option')
            : z.string().optional();
    },
    select: (field) => schemaBuilders.radio(field),
    range: () => z.number(),
    min_max: () => z.object({ min: z.string(), max: z.string() }),
    file: (field) => {
        const v = field.validation || {};
        let schema: z.ZodTypeAny = z.any();
        if (field.required) {
            schema = schema.refine(
                (val: FileList) => val?.length > 0,
                v.requiredMessage || 'This field is required.',
            );
        }
        return schema;
    },
};

export const buildZodSchema = (fields: FormFieldInternal[]) => {
    const shape: Record<string, z.ZodTypeAny> = {};
    fields.forEach((f) => {
        if (f.id) shape[f.id] = (schemaBuilders[f.type] || (() => z.any()))(f);
    });
    return z.object(shape);
};

type DefaultValueType = boolean | string[] | number | Record<string, string> | string;

export const getDefaultValue = (type: FieldType): DefaultValueType => {
    const defaults: Partial<Record<FieldType, DefaultValueType>> = {
        checkbox: false,
        checklist: [],
        range: 0,
        min_max: { min: '', max: '' },
    };
    return defaults[type] ?? '';
};
