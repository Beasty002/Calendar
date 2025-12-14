import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChecklistFieldInternal } from '../types';
import { getFieldConfig, handleNonNegativeInput, hasValidationOptions } from './config';

interface ValidationSectionProps {
    field: ChecklistFieldInternal;
    onUpdate: (id: string, updates: Partial<ChecklistFieldInternal>) => void;
}

export const ValidationSection: React.FC<ValidationSectionProps> = ({ field, onUpdate }) => {
    if (!hasValidationOptions(field)) return null;

    const config = getFieldConfig(field.type);
    const { validation } = config;

    const updateValidation = (updates: Partial<ChecklistFieldInternal['validation']>) => {
        onUpdate(field.id, { validation: { ...field.validation, ...updates } });
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Validation Rules</Label>

            {/* Min/Max Length (text, textarea) */}
            {validation.hasMinMaxLength && (
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { key: 'minLength' as const, label: 'Min Length', placeholder: 'No min' },
                        { key: 'maxLength' as const, label: 'Max Length', placeholder: 'No max' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key} className="space-y-1">
                            <Label className="text-xs">{label}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={field.validation?.[key] ?? ''}
                                onChange={(e) => updateValidation({ [key]: handleNonNegativeInput(e.target.value) })}
                                placeholder={placeholder}
                                className="h-8 text-sm"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Min/Max Date (date) */}
            {validation.hasMinMaxDate && (
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { key: 'minDate' as const, label: 'Min Date' },
                        { key: 'maxDate' as const, label: 'Max Date' },
                    ].map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                            <Label className="text-xs">{label}</Label>
                            <Input
                                type="date"
                                value={field.validation?.[key] ?? ''}
                                onChange={(e) => updateValidation({ [key]: e.target.value || undefined })}
                                className="h-8 text-sm"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Min/Max Value (number) */}
            {validation.hasMinMaxValue && (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { key: 'minValue' as const, label: 'Min Value', placeholder: 'No min' },
                            { key: 'maxValue' as const, label: 'Max Value', placeholder: 'No max' },
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} className="space-y-1">
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    type="number"
                                    value={field.validation?.[key] ?? ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? parseFloat(e.target.value) : undefined;
                                        updateValidation({ [key]: val });
                                    }}
                                    placeholder={placeholder}
                                    className="h-8 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                    {validation.hasDisableSpinners && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`disable-spinners-${field.id}`}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={field.disableSpinners ?? false}
                                onChange={(e) => onUpdate(field.id, { disableSpinners: e.target.checked })}
                            />
                            <label htmlFor={`disable-spinners-${field.id}`} className="text-xs cursor-pointer">
                                Disable scroll &amp; increment/decrement buttons
                            </label>
                        </div>
                    )}
                </div>
            )}

            {/* Min/Max Selections (checklist) */}
            {validation.hasMinMaxSelections && (
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { key: 'minSelections' as const, label: 'Min Selections', placeholder: 'No min' },
                        { key: 'maxSelections' as const, label: 'Max Selections', placeholder: 'No max' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key} className="space-y-1">
                            <Label className="text-xs">{label}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={field.validation?.[key] ?? ''}
                                onChange={(e) => updateValidation({ [key]: handleNonNegativeInput(e.target.value) })}
                                placeholder={placeholder}
                                className="h-8 text-sm"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Max File Size (file) */}
            {validation.hasMaxFileSize && (
                <div className="space-y-1">
                    <Label className="text-xs">Max File Size per File (KB)</Label>
                    <Input
                        type="number"
                        min="1"
                        value={field.validation?.maxFileSize ?? ''}
                        onChange={(e) => {
                            const val = e.target.value ? Math.max(1, parseInt(e.target.value)) : undefined;
                            updateValidation({ maxFileSize: val });
                        }}
                        placeholder="No limit"
                        className="h-8 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Applied to each individual file</p>
                </div>
            )}

            {/* Custom Required Message */}
            {field.required && (
                <div className="space-y-1">
                    <Label className="text-xs">Custom Required Message</Label>
                    <Input
                        value={field.validation?.requiredMessage ?? ''}
                        onChange={(e) => updateValidation({ requiredMessage: e.target.value || undefined })}
                        placeholder="This field is required"
                        className="h-8 text-sm"
                    />
                </div>
            )}
        </div>
    );
};
