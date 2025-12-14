export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone'
  | 'date' 
  | 'file' 
  | 'checkbox' 
  | 'checklist' 
  | 'radio'
  | 'select'
  | 'range'
  | 'min_max';

// Validation configuration for checklist fields
export interface FieldValidation {
  // String validations
  minLength?: number;
  maxLength?: number;
  pattern?: string; // Regex pattern
  patternMessage?: string; // Custom message for pattern mismatch
  
  // Number validations
  minValue?: number;
  maxValue?: number;
  
  // Date validations
  minDate?: string; // ISO date string (YYYY-MM-DD)
  maxDate?: string; // ISO date string (YYYY-MM-DD)
  
  // Custom error messages
  requiredMessage?: string;
  
  // Checklist/select validations
  minSelections?: number;
  maxSelections?: number;
  
  // File validations
  maxFileSize?: number; // in KB per file
  
  // Custom validation (for advanced use)
  customRule?: string; // Description of custom rule
}

export interface ChecklistField {
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
  disableSpinners?: boolean; // For number - disable scroll/increment buttons
  
  // Validation configuration
  validation?: FieldValidation;
}

export interface ChecklistFieldInternal extends ChecklistField {
  id: string;
}

export interface ChecklistSchema {
  id: string;
  name: string;
  description?: string;
  fields: ChecklistFieldInternal[]; // Changed from ChecklistField[] to preserve IDs
}
