import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChecklistFieldInternal } from '../types';
import { FILE_TYPE_OPTIONS } from './config';

interface FileSettingsProps {
    field: ChecklistFieldInternal;
    onUpdate: (id: string, updates: Partial<ChecklistFieldInternal>) => void;
}

export const FileSettings: React.FC<FileSettingsProps> = ({ field, onUpdate }) => {
    const handleFileTypeToggle = (typeValue: string, checked: boolean) => {
        const currentTypes = field.acceptedFileTypes || [];
        if (checked) {
            onUpdate(field.id, { acceptedFileTypes: [...currentTypes, typeValue] });
        } else {
            onUpdate(field.id, { acceptedFileTypes: currentTypes.filter((t) => t !== typeValue) });
        }
    };

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
