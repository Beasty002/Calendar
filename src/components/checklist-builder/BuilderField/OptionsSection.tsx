import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ChecklistFieldInternal } from '../types';

interface OptionsSectionProps {
    field: ChecklistFieldInternal;
    onUpdate: (id: string, updates: Partial<ChecklistFieldInternal>) => void;
}

export const OptionsSection: React.FC<OptionsSectionProps> = ({ field, onUpdate }) => {
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
