import { z } from 'zod';
import type { FieldType, ChecklistFieldInternal } from './types';

// Schema builders for each field type
type SchemaBuilders = {
  [K in FieldType]: (field: ChecklistFieldInternal) => z.ZodTypeAny;
};

const getStringSchema = (field: ChecklistFieldInternal): z.ZodTypeAny => {
  const v = field.validation || {};
  let schema = z.string();
  if (v.minLength) schema = schema.min(v.minLength, `Minimum ${v.minLength} characters`);
  if (v.maxLength) schema = schema.max(v.maxLength, `Maximum ${v.maxLength} characters`);
  return field.required
    ? schema.min(1, v.requiredMessage || 'This field is required')
    : schema.optional().or(z.literal(''));
};

export const schemaBuilders: SchemaBuilders = {
  text: getStringSchema,
  textarea: getStringSchema,

  email: (field) => {
    const v = field.validation || {};
    const emailSchema = z.string().email(v.patternMessage || 'Invalid email address');
    return field.required
      ? emailSchema.min(1, v.requiredMessage || 'This field is required')
      : emailSchema.optional().or(z.literal(''));
  },

  phone: (field) => {
    const v = field.validation || {};
    const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
    const phoneSchema = z.string().regex(phoneRegex, v.patternMessage || 'Invalid phone number');
    return field.required
      ? phoneSchema.min(1, v.requiredMessage || 'This field is required')
      : phoneSchema.optional().or(z.literal(''));
  },

  number: (field) => {
    const v = field.validation || {};
    let numSchema = z.coerce.number();
    if (v.minValue !== undefined) numSchema = numSchema.min(v.minValue, `Minimum value is ${v.minValue}`);
    if (v.maxValue !== undefined) numSchema = numSchema.max(v.maxValue, `Maximum value is ${v.maxValue}`);
    return field.required ? numSchema : z.union([numSchema, z.literal('')]);
  },

  date: (field) => {
    const v = field.validation || {};
    let dateSchema = z.string();
    if (v.minDate) {
      dateSchema = dateSchema.refine(
        (val) => !val || val >= v.minDate!,
        `Date must be on or after ${v.minDate}`
      );
    }
    if (v.maxDate) {
      dateSchema = dateSchema.refine(
        (val) => !val || val <= v.maxDate!,
        `Date must be on or before ${v.maxDate}`
      );
    }
    return field.required
      ? dateSchema.min(1, v.requiredMessage || 'This field is required')
      : dateSchema.optional().or(z.literal(''));
  },

  checkbox: (field) => {
    const v = field.validation || {};
    return field.required
      ? z.boolean().refine((val) => val === true, { message: v.requiredMessage || 'Required' })
      : z.boolean();
  },

  checklist: (field) => {
    const v = field.validation || {};
    let arrSchema = z.array(z.string());
    const minSel = v.minSelections ?? (field.required ? 1 : 0);
    if (minSel > 0) arrSchema = arrSchema.min(minSel, v.requiredMessage || `Select at least ${minSel} option(s)`);
    if (v.maxSelections) arrSchema = arrSchema.max(v.maxSelections, `Select at most ${v.maxSelections} option(s)`);
    return arrSchema;
  },

  radio: (field) => {
    const v = field.validation || {};
    return field.required
      ? z.string().min(1, v.requiredMessage || 'Please select an option')
      : z.string().optional().or(z.literal(''));
  },

  select: (field) => schemaBuilders.radio(field),

  range: () => z.number(),

  min_max: () => z.object({ min: z.string(), max: z.string() }),

  file: (field) => {
    const v = field.validation || {};
    let fileSchema: z.ZodTypeAny = z.any();

    if (field.required) {
      fileSchema = fileSchema.refine(
        (val: unknown) => {
          const files = val as FileList | null | undefined;
          return files && files.length > 0;
        },
        v.requiredMessage || 'This field is required' 
      );
    }

    if (field.maxFiles) {
      fileSchema = fileSchema.refine(
        (val: unknown) => {
          const files = val as FileList | null | undefined;
          return !files || files.length <= field.maxFiles!;
        },
        `Maximum ${field.maxFiles} file(s) allowed`
      );
    }

    if (v.maxFileSize) {
      fileSchema = fileSchema.refine(
        (val: unknown) => {
          const files = val as FileList | null | undefined;
          if (!files || files.length === 0) return true;
          for (let i = 0; i < files.length; i++) {
            if (files[i].size > v.maxFileSize! * 1024) return false;
          }
          return true;
        },
        `File exceeds ${v.maxFileSize} KB limit`
      );
    }

    return fileSchema;
  },
};

export const buildZodSchema = (fields: ChecklistFieldInternal[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  fields.forEach((field) => {
    if (field.id) {
      shape[field.id] = (schemaBuilders[field.type] || (() => z.any()))(field);
    }
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
