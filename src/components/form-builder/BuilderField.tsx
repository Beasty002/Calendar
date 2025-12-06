import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { Trash2, Plus, X, HelpCircle } from 'lucide-react';
import type { FormFieldInternal } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Assuming shadcn tooltip

interface BuilderFieldProps {
  field: FormFieldInternal;
  onUpdate: (id: string, updates: Partial<FormFieldInternal>) => void;
  onDelete: (id: string) => void;
}

// Helper to check if validation section should be shown
const hasValidationOptions = (field: FormFieldInternal): boolean => {
  // Text-based fields have length validation
  if (['text', 'textarea'].includes(field.type)) return true;
  // Number has min/max value
  if (field.type === 'number') return true;
  // Date has min/max date
  if (field.type === 'date') return true;
  // Checklist has selection count
  if (field.type === 'checklist') return true;
  // File has max size
  if (field.type === 'file') return true;
  // Required fields can have custom message
  if (field.required) return true;
  return false;
};

export const BuilderField: React.FC<BuilderFieldProps> = ({ field, onUpdate, onDelete }) => {
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

  // Helper to handle non-negative number input
  const handleNonNegativeInput = (value: string): number | undefined => {
    if (!value) return undefined;
    const num = parseInt(value);
    return num >= 0 ? num : 0;
  };

  return (
    <Card className="mb-4 relative group border-l-4 border-l-blue-500">
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
                <Label>Label</Label>
                <Input 
                    value={field.label} 
                    onChange={(e) => onUpdate(field.id, { label: e.target.value })} 
                    placeholder="Field Label"
                />
            </div>
            
            {(field.type === 'text' || field.type === 'textarea' || field.type === 'email' || field.type === 'number' || field.type === 'phone') && (
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
                <Label htmlFor={`required-${field.id}`} className="cursor-pointer">Required Field</Label>
            </div>
        </div>

        {/* Options Section for Select/Checklist/Radio */}
        {(field.type === 'select' || field.type === 'checklist' || field.type === 'radio') && (
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
        )}

        {/* Range Configuration */}
        {field.type === 'range' && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Range Settings</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Min</Label>
                <Input 
                  type="number"
                  value={field.min ?? 0}
                  onChange={(e) => onUpdate(field.id, { min: parseInt(e.target.value) || 0 })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max</Label>
                <Input 
                  type="number"
                  value={field.max ?? 100}
                  onChange={(e) => onUpdate(field.id, { max: parseInt(e.target.value) || 100 })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Step</Label>
                <Input 
                  type="number"
                  value={field.step ?? 1}
                  onChange={(e) => onUpdate(field.id, { step: parseInt(e.target.value) || 1 })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* File Type Selector for File Upload */}
        {field.type === 'file' && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4">
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
                                onChange={(e) => {
                                    onUpdate(field.id, { maxFiles: e.target.checked ? undefined : 1 });
                                }}
                            />
                            <label htmlFor={`unlimited-${field.id}`} className="text-sm cursor-pointer whitespace-nowrap">Unlimited</label>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Accepted File Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Images (jpg, png, gif)', value: 'image/*' },
                            { label: 'PDF (.pdf)', value: '.pdf' },
                            { label: 'Word (.doc, .docx)', value: '.doc,.docx' },
                            { label: 'Excel (.xls, .xlsx)', value: '.xls,.xlsx' },
                            { label: 'Text (.txt)', value: '.txt' },
                            { label: 'CSV (.csv)', value: '.csv' }
                        ].map((type) => (
                            <div key={type.value} className="flex items-center space-x-2">
                                <input 
                                    type="checkbox"
                                    id={`file-type-${field.id}-${type.value}`}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={(field.acceptedFileTypes || []).includes(type.value)}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        const currentTypes = field.acceptedFileTypes || [];
                                        if (checked) {
                                            onUpdate(field.id, { acceptedFileTypes: [...currentTypes, type.value] });
                                        } else {
                                            onUpdate(field.id, { acceptedFileTypes: currentTypes.filter(t => t !== type.value) });
                                        }
                                    }}
                                />
                                <label htmlFor={`file-type-${field.id}-${type.value}`} className="text-sm cursor-pointer">{type.label}</label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Validation Configuration Section - Only shown when there are validation options */}
        {hasValidationOptions(field) && (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md space-y-4">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Validation Rules</Label>
            
            {/* String Length Validation - only for text, textarea */}
            {(field.type === 'text' || field.type === 'textarea') && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Length</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={field.validation?.minLength ?? ''}
                    onChange={(e) => {
                      const val = handleNonNegativeInput(e.target.value);
                      onUpdate(field.id, { 
                        validation: { ...field.validation, minLength: val } 
                      });
                    }}
                    placeholder="No min"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Length</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={field.validation?.maxLength ?? ''}
                    onChange={(e) => {
                      const val = handleNonNegativeInput(e.target.value);
                      onUpdate(field.id, { 
                        validation: { ...field.validation, maxLength: val } 
                      });
                    }}
                    placeholder="No max"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Date Range Validation */}
            {field.type === 'date' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Date</Label>
                  <Input 
                    type="date"
                    value={field.validation?.minDate ?? ''}
                    onChange={(e) => {
                      onUpdate(field.id, { 
                        validation: { ...field.validation, minDate: e.target.value || undefined } 
                      });
                    }}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Date</Label>
                  <Input 
                    type="date"
                    value={field.validation?.maxDate ?? ''}
                    onChange={(e) => {
                      onUpdate(field.id, { 
                        validation: { ...field.validation, maxDate: e.target.value || undefined } 
                      });
                    }}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Number Range Validation */}
            {field.type === 'number' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Min Value</Label>
                    <Input 
                      type="number"
                      value={field.validation?.minValue ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined;
                        onUpdate(field.id, { 
                          validation: { ...field.validation, minValue: val } 
                        });
                      }}
                      placeholder="No min"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Value</Label>
                    <Input 
                      type="number"
                      value={field.validation?.maxValue ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined;
                        onUpdate(field.id, { 
                          validation: { ...field.validation, maxValue: val } 
                        });
                      }}
                      placeholder="No max"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`disable-spinners-${field.id}`}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={field.disableSpinners ?? false}
                    onChange={(e) => {
                      onUpdate(field.id, { disableSpinners: e.target.checked });
                    }}
                  />
                  <label htmlFor={`disable-spinners-${field.id}`} className="text-xs cursor-pointer">
                    Disable scroll &amp; increment/decrement buttons
                  </label>
                </div>
              </div>
            )}

            {/* Selection Count Validation - for checklist */}
            {field.type === 'checklist' && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Min Selections</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={field.validation?.minSelections ?? ''}
                    onChange={(e) => {
                      const val = handleNonNegativeInput(e.target.value);
                      onUpdate(field.id, { 
                        validation: { ...field.validation, minSelections: val } 
                      });
                    }}
                    placeholder="No min"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Max Selections</Label>
                  <Input 
                    type="number"
                    min="0"
                    value={field.validation?.maxSelections ?? ''}
                    onChange={(e) => {
                      const val = handleNonNegativeInput(e.target.value);
                      onUpdate(field.id, { 
                        validation: { ...field.validation, maxSelections: val } 
                      });
                    }}
                    placeholder="No max"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {/* File Size Validation - per file */}
            {field.type === 'file' && (
              <div className="space-y-1">
                <Label className="text-xs">Max File Size per File (KB)</Label>
                <Input 
                  type="number"
                  min="1"
                  value={field.validation?.maxFileSize ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Math.max(1, parseInt(e.target.value)) : undefined;
                    onUpdate(field.id, { 
                      validation: { ...field.validation, maxFileSize: val } 
                    });
                  }}
                  placeholder="No limit"
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">Applied to each individual file</p>
              </div>
            )}

            {/* Custom Required Message - for all required fields */}
            {field.required && (
              <div className="space-y-1">
                <Label className="text-xs">Custom Required Message</Label>
                <Input 
                  value={field.validation?.requiredMessage ?? ''}
                  onChange={(e) => onUpdate(field.id, { 
                    validation: { ...field.validation, requiredMessage: e.target.value || undefined } 
                  })}
                  placeholder="This field is required"
                  className="h-8 text-sm"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

