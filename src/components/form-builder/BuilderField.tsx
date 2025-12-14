import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { Trash2, Plus, X, HelpCircle } from 'lucide-react';
import type { FormFieldInternal } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

type FieldType = FormFieldInternal['type'];

interface FieldConfig {
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

const FIELD_CONFIG: Record<FieldType, FieldConfig> = {
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
const FILE_TYPE_OPTIONS = [
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
// COMPONENT INTERFACES
// ============================================================================

interface BuilderFieldProps {
  field: FormFieldInternal;
  onUpdate: (id: string, updates: Partial<FormFieldInternal>) => void;
  onDelete: (id: string) => void;
  hasError?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getFieldConfig = (type: FieldType): FieldConfig =>
  FIELD_CONFIG[type] || FIELD_CONFIG.text;

const hasValidationOptions = (field: FormFieldInternal): boolean => {
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

const handleNonNegativeInput = (value: string): number | undefined => {
  if (!value) return undefined;
  const num = parseInt(value);
  return num >= 0 ? num : 0;
};

// ============================================================================
// BUILDER FIELD COMPONENT
// ============================================================================

export const BuilderField: React.FC<BuilderFieldProps> = ({ field, onUpdate, onDelete, hasError }) => {
  const config = getFieldConfig(field.type);

  // ----------------------------------------
  // Option Handlers (for select/radio/checklist)
  // ----------------------------------------
  const handleOptionAdd = () => {
    const currentOptions = field.options || [];
    onUpdate(field.id, { options: [...currentOptions, `Option ${currentOptions.length + 1}`] });
  };

  const handleOptionChange = (index: number, value: string) => {
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    onUpdate(field.id, { options: newOptions });
  };

  const handleOptionRemove = (index: number) => {
    const currentOptions = field.options || [];
    onUpdate(field.id, { options: currentOptions.filter((_, i) => i !== index) });
  };

  // ----------------------------------------
  // File Type Handler
  // ----------------------------------------
  const handleFileTypeToggle = (typeValue: string, checked: boolean) => {
    const currentTypes = field.acceptedFileTypes || [];
    if (checked) {
      onUpdate(field.id, { acceptedFileTypes: [...currentTypes, typeValue] });
    } else {
      onUpdate(field.id, { acceptedFileTypes: currentTypes.filter((t) => t !== typeValue) });
    }
  };

  // ----------------------------------------
  // Validation Handlers
  // ----------------------------------------
  const updateValidation = (updates: Partial<FormFieldInternal['validation']>) => {
    onUpdate(field.id, { validation: { ...field.validation, ...updates } });
  };

  // ============================================================================
  // RENDER SECTIONS
  // ============================================================================

  // Options Section (select, radio, checklist)
  const renderOptionsSection = () => {
    if (!config.hasOptions) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Options</Label>
          <Button variant="outline" size="sm" onClick={handleOptionAdd} className="h-7 text-xs">
            <Plus size={12} className="mr-1" /> Add Option
          </Button>
        </div>
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="h-8 text-sm"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOptionRemove(index)}>
                <X size={14} />
              </Button>
            </div>
          ))}
          {(!field.options || field.options.length === 0) && (
            <p className="text-xs text-muted-foreground italic">No options added.</p>
          )}
        </div>
      </div>
    );
  };

  // Range Settings Section (range field)
  const renderRangeSettings = () => {
    if (!config.hasRangeSettings) return null;

    const rangeFields = [
      { key: 'min', label: 'Min', defaultValue: 0 },
      { key: 'max', label: 'Max', defaultValue: 100 },
      { key: 'step', label: 'Step', defaultValue: 1 },
    ] as const;

    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Range Settings</Label>
        <div className="grid grid-cols-3 gap-2">
          {rangeFields.map(({ key, label, defaultValue }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                value={field[key] ?? defaultValue}
                onChange={(e) => onUpdate(field.id, { [key]: parseInt(e.target.value) || defaultValue })}
                className="h-8 text-sm"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // File Settings Section (file field)
  const renderFileSettings = () => {
    if (!config.hasFileSettings) return null;

    return (
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4">
        {/* Max Files */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Max Files</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              min="1"
              value={field.maxFiles || ''}
              onChange={(e) => {
                const value = e.target.value;
                onUpdate(field.id, { maxFiles: value ? parseInt(value) : undefined });
              }}
              placeholder="Unlimited"
              disabled={!field.maxFiles && field.maxFiles !== 0}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`unlimited-${field.id}`}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={!field.maxFiles && field.maxFiles !== 0}
                onChange={(e) => onUpdate(field.id, { maxFiles: e.target.checked ? undefined : 1 })}
              />
              <label htmlFor={`unlimited-${field.id}`} className="text-sm cursor-pointer whitespace-nowrap">
                Unlimited
              </label>
            </div>
          </div>
        </div>

        {/* Accepted File Types */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Accepted File Types</Label>
          <div className="grid grid-cols-2 gap-2">
            {FILE_TYPE_OPTIONS.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`file-type-${field.id}-${type.value}`}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={(field.acceptedFileTypes || []).includes(type.value)}
                  onChange={(e) => handleFileTypeToggle(type.value, e.target.checked)}
                />
                <label htmlFor={`file-type-${field.id}-${type.value}`} className="text-sm cursor-pointer">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Validation Section
  const renderValidationSection = () => {
    if (!hasValidationOptions(field)) return null;

    const { validation } = config;

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

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Card className={`mb-4 relative group border-l-4 ${hasError ? 'border-l-red-500 ring-2 ring-red-200' : 'border-l-blue-500'}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-50"
        onClick={() => onDelete(field.id)}
      >
        <Trash2 size={18} />
      </Button>

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {field.type}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Properties Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className={hasError ? 'text-red-500' : ''}>Label {hasError && <span className="text-red-500">*</span>}</Label>
            <Input
              value={field.label}
              onChange={(e) => onUpdate(field.id, { label: e.target.value })}
              placeholder="Field Label"
              className={hasError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {hasError && (
              <p className="text-xs text-red-500">Label is required</p>
            )}
          </div>

          {config.hasPlaceholder && (
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                placeholder="Placeholder text"
              />
            </div>
          )}
        </div>

        {/* Secondary Properties Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label>Tooltip (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={field.tooltip || ''}
                onChange={(e) => onUpdate(field.id, { tooltip: e.target.value })}
                placeholder="Help text for user"
              />
              {field.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle size={16} className="text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <Switch
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => onUpdate(field.id, { required: checked })}
            />
            <Label htmlFor={`required-${field.id}`} className="cursor-pointer">
              Required Field
            </Label>
          </div>
        </div>

        {/* Dynamic Sections based on field type */}
        {renderOptionsSection()}
        {renderRangeSettings()}
        {renderFileSettings()}
        {renderValidationSection()}
      </CardContent>
    </Card>
  );
};
