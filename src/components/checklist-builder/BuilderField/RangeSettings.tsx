import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChecklistFieldInternal } from '../types';

interface RangeSettingsProps {
    field: ChecklistFieldInternal;
    onUpdate: (id: string, updates: Partial<ChecklistFieldInternal>) => void;
}

export const RangeSettings: React.FC<RangeSettingsProps> = ({ field, onUpdate }) => {
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
