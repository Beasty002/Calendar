export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'date' 
  | 'file' 
  | 'checkbox' 
  | 'checklist' 
  | 'radio'
  | 'select'
  | 'range'
  | 'min_max';

export interface FormField {
  type: FieldType;
  label: string;
  placeholder?: string;
  tooltip?: string;
  required: boolean;
  options?: string[]; // For select/checklist/radio
  acceptedFileTypes?: string[]; // For file upload
  maxFiles?: number; // For file upload limit (1, 2, 3, or undefined for unlimited)
  min?: number; // For range/number
  max?: number; // For range/number
  step?: number; // For range/number
}

export interface FormFieldInternal extends FormField {
  id: string;
}

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  fields: FormFieldInternal[]; // Changed from FormField[] to preserve IDs
}
