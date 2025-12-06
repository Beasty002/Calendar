import React from 'react';
import { BuilderField } from './BuilderField';
import type { FormFieldInternal } from './types';

interface BuilderCanvasProps {
  fields: FormFieldInternal[];
  onUpdateField: (id: string, updates: Partial<FormFieldInternal>) => void;
  onDeleteField: (id: string) => void;
  fieldErrors?: Set<string>;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ fields, onUpdateField, onDeleteField, fieldErrors }) => {
  if (fields.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed rounded-lg p-10 bg-gray-50/50 dark:bg-gray-900/50">
        <p className="text-lg font-medium">Your form is empty</p>
        <p className="text-sm">Click a field type on the left to add it to your form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {fields.map((field) => (
        <BuilderField 
          key={field.id} 
          field={field} 
          onUpdate={onUpdateField} 
          onDelete={onDeleteField}
          hasError={fieldErrors?.has(field.id) ?? false}
        />
      ))}
    </div>
  );
};
