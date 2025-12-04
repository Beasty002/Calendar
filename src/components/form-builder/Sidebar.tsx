import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Type, 
  Hash, 
  Mail, 
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

export const Sidebar: React.FC<SidebarProps> = ({ onAddField }) => {
  return (
    <Card className="w-64 h-full border-r rounded-none overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Form Fields</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('text')}>
          <Type size={16} /> Text Input
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('textarea')}>
          <AlignLeft size={16} /> Text Area
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('number')}>
          <Hash size={16} /> Number Input
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('email')}>
          <Mail size={16} /> Email Input
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('date')}>
          <Calendar size={16} /> Date Input
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('file')}>
          <FileUp size={16} /> File Upload
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('checkbox')}>
          <CheckSquare size={16} /> Checkbox
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('checklist')}>
          <List size={16} /> Checklist
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('radio')}>
          <CircleDot size={16} /> Radio Group
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('select')}>
          <ChevronDown size={16} /> Select Dropdown
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('range')}>
          <Sliders size={16} /> Range Slider
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => onAddField('min_max')}>
          <ArrowLeftRight size={16} /> Min-Max Input
        </Button>
      </CardContent>
    </Card>
  );
};
