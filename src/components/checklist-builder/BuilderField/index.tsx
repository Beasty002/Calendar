import React from 'react';
import { Trash2, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChecklistFieldInternal } from '../types';
import { getFieldConfig } from './config';
import { OptionsSection } from './OptionsSection';
import { RangeSettings } from './RangeSettings';
import { FileSettings } from './FileSettings';
import { ValidationSection } from './ValidationSection';

interface BuilderFieldProps {
    field: ChecklistFieldInternal;
    onUpdate: (id: string, updates: Partial<ChecklistFieldInternal>) => void;
    onDelete: (id: string) => void;
    hasError?: boolean;
}

export const BuilderField: React.FC<BuilderFieldProps> = ({ field, onUpdate, onDelete, hasError }) => {
    const config = getFieldConfig(field.type);

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
                {config.hasOptions && <OptionsSection field={field} onUpdate={onUpdate} />}
                {config.hasRangeSettings && <RangeSettings field={field} onUpdate={onUpdate} />}
                {config.hasFileSettings && <FileSettings field={field} onUpdate={onUpdate} />}
                <ValidationSection field={field} onUpdate={onUpdate} />
            </CardContent>
        </Card>
    );
};
