import type { ChecklistFieldInternal } from '../types';

// ============================================================================
// FIELD CONFIGURATION TYPES
// ============================================================================

export type FieldType = ChecklistFieldInternal['type'];

export interface FieldConfig {
    hasPlaceholder: boolean;
    hasOptions: boolean;
    hasRangeSettings: boolean;
    hasFileSettings: boolean;
    validation: {
        hasMinMaxLength: boolean;
        hasMinMaxValue: boolean;
        hasMinMaxDate: boolean;
        hasMinMaxSelections: boolean;
        hasMaxFileSize: boolean;
        hasDisableSpinners: boolean;
    };
}

// ============================================================================
// FIELD CONFIGURATIONS
// ============================================================================

export const FIELD_CONFIG: Record<FieldType, FieldConfig> = {
    text: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: true,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    textarea: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: true,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    email: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    phone: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    number: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: true,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: true,
        },
    },
    date: {
        hasPlaceholder: false,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: true,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    select: {
        hasPlaceholder: false,
        hasOptions: true,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    radio: {
        hasPlaceholder: false,
        hasOptions: true,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    checklist: {
        hasPlaceholder: false,
        hasOptions: true,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: true,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    range: {
        hasPlaceholder: false,
        hasOptions: false,
        hasRangeSettings: true,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    file: {
        hasPlaceholder: false,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: true,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: true,
            hasDisableSpinners: false,
        },
    },
    checkbox: {
        hasPlaceholder: false,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: false,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
    min_max: {
        hasPlaceholder: true,
        hasOptions: false,
        hasRangeSettings: false,
        hasFileSettings: false,
        validation: {
            hasMinMaxLength: false,
            hasMinMaxValue: true,
            hasMinMaxDate: false,
            hasMinMaxSelections: false,
            hasMaxFileSize: false,
            hasDisableSpinners: false,
        },
    },
};

// File type options for file upload fields
export const FILE_TYPE_OPTIONS = [
    { label: 'Images (jpg, png, gif)', value: 'image/*' },
    { label: 'Video (mp4, webm)', value: 'video/*' },
    { label: 'Audio (mp3, wav)', value: 'audio/*' },
    { label: 'PDF (.pdf)', value: '.pdf' },
    { label: 'Word (.doc, .docx)', value: '.doc,.docx' },
    { label: 'Excel (.xls, .xlsx)', value: '.xls,.xlsx' },
    { label: 'Text (.txt)', value: '.txt' },
    { label: 'CSV (.csv)', value: '.csv' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getFieldConfig = (type: FieldType): FieldConfig =>
    FIELD_CONFIG[type] || FIELD_CONFIG.text;

export const hasValidationOptions = (field: ChecklistFieldInternal): boolean => {
    const config = getFieldConfig(field.type);
    const { validation } = config;
    return (
        validation.hasMinMaxLength ||
        validation.hasMinMaxValue ||
        validation.hasMinMaxDate ||
        validation.hasMinMaxSelections ||
        validation.hasMaxFileSize ||
        field.required
    );
};

export const handleNonNegativeInput = (value: string): number | undefined => {
    if (!value) return undefined;
    const num = parseInt(value);
    return num >= 0 ? num : 0;
};
