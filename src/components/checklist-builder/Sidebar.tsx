import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Type,
    Hash,
    Mail,
    Phone,
    Calendar,
    AlignLeft,
    FileUp,
    CheckSquare,
    List,
    ChevronDown,
    CircleDot,
    Sliders,
    ArrowLeftRight
} from 'lucide-react';
import type { FieldType } from './types';

interface SidebarProps {
    onAddField: (type: FieldType) => void;
}

const FIELD_CONFIG: { type: FieldType; label: string; icon: React.ElementType }[] = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'textarea', label: 'Text Area', icon: AlignLeft },
    { type: 'number', label: 'Number Input', icon: Hash },
    { type: 'email', label: 'Email Input', icon: Mail },
    { type: 'phone', label: 'Phone Input', icon: Phone },
    { type: 'date', label: 'Date Input', icon: Calendar },
    { type: 'file', label: 'File Upload', icon: FileUp },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'checklist', label: 'Checklist', icon: List },
    { type: 'radio', label: 'Radio Group', icon: CircleDot },
    { type: 'select', label: 'Select Dropdown', icon: ChevronDown },
    { type: 'range', label: 'Range Slider', icon: Sliders },
    { type: 'min_max', label: 'Min-Max Input', icon: ArrowLeftRight },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddField }) => {
    return (
        <Card className="w-64 h-full border-r rounded-none overflow-y-auto">
            <CardHeader>
                <CardTitle className="text-lg">Checklist Fields</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {FIELD_CONFIG.map(({ type, label, icon: Icon }) => (
                    <Button
                        key={type}
                        variant="outline"
                        className="justify-start gap-2"
                        onClick={() => onAddField(type)}
                    >
                        <Icon size={16} /> {label}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
};
