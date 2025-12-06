import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, Copy, Check, ArrowLeft, CloudUpload } from 'lucide-react';
import type { FormFieldInternal, FormSchema } from './types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { getForm } from './store';

// Build Zod schema dynamically from field configurations
const buildZodSchema = (fields: FormFieldInternal[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    const fieldId = field.id;
    if (!fieldId) return;

    const v = field.validation || {};
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'textarea': {
        let strSchema = z.string();
        if (v.minLength !== undefined && v.minLength >= 0) {
          strSchema = strSchema.min(v.minLength, `Minimum ${v.minLength} characters required`);
        }
        if (v.maxLength !== undefined && v.maxLength >= 0) {
          strSchema = strSchema.max(v.maxLength, `Maximum ${v.maxLength} characters allowed`);
        }
        fieldSchema = field.required 
          ? strSchema.min(1, v.requiredMessage || 'This field is required')
          : strSchema.optional().or(z.literal(''));
        break;
      }

      case 'email': {
        const emailSchema = z.string().email(v.patternMessage || 'Invalid email address');
        fieldSchema = field.required 
          ? emailSchema.min(1, v.requiredMessage || 'This field is required')
          : emailSchema.optional().or(z.literal(''));
        break;
      }

      case 'phone': {
        const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
        const phoneSchema = z.string().regex(phoneRegex, v.patternMessage || 'Invalid phone number');
        fieldSchema = field.required 
          ? phoneSchema.min(1, v.requiredMessage || 'This field is required')
          : phoneSchema.optional().or(z.literal(''));
        break;
      }

      case 'number': {
        let numSchema = z.coerce.number();
        if (v.minValue !== undefined) {
          numSchema = numSchema.min(v.minValue, `Minimum value is ${v.minValue}`);
        }
        if (v.maxValue !== undefined) {
          numSchema = numSchema.max(v.maxValue, `Maximum value is ${v.maxValue}`);
        }
        fieldSchema = field.required 
          ? numSchema
          : z.union([numSchema, z.literal('')]);
        break;
      }

      case 'date': {
        let dateSchema = z.string();
        if (v.minDate) {
          dateSchema = dateSchema.refine(
            (val) => !val || val >= v.minDate!,
            `Date must be on or after ${v.minDate}`
          );
        }
        if (v.maxDate) {
          dateSchema = dateSchema.refine(
            (val) => !val || val <= v.maxDate!,
            `Date must be on or before ${v.maxDate}`
          );
        }
        fieldSchema = field.required 
          ? dateSchema.min(1, v.requiredMessage || 'This field is required')
          : dateSchema.optional().or(z.literal(''));
        break;
      }

      case 'checkbox': {
        const requiredMsg = v.requiredMessage || 'Required';
        fieldSchema = field.required 
          ? z.boolean().refine(val => val === true, { message: requiredMsg })
          : z.boolean();
        break;
      }

      case 'checklist': {
        let arrSchema = z.array(z.string());
        const minSel = v.minSelections ?? (field.required ? 1 : 0);
        if (minSel > 0) {
          arrSchema = arrSchema.min(minSel, v.requiredMessage || `Select at least ${minSel} option(s)`);
        }
        if (v.maxSelections !== undefined) {
          arrSchema = arrSchema.max(v.maxSelections, `Select at most ${v.maxSelections} option(s)`);
        }
        fieldSchema = arrSchema;
        break;
      }

      case 'radio':
      case 'select': {
        const selectSchema = z.string();
        fieldSchema = field.required 
          ? selectSchema.min(1, v.requiredMessage || 'Please select an option')
          : selectSchema.optional().or(z.literal(''));
        break;
      }

      case 'range': {
        fieldSchema = z.number();
        break;
      }

      case 'min_max': {
        fieldSchema = z.object({
          min: z.string(),
          max: z.string()
        });
        break;
      }

      case 'file': {
        // File validation is handled separately via custom validation
        // because Zod doesn't natively support FileList
        fieldSchema = z.any();
        break;
      }

      default:
        fieldSchema = z.any();
    }

    schemaShape[fieldId] = fieldSchema;
  });

  return z.object(schemaShape);
};

interface FormViewerProps {
  schema?: FormSchema; 
  fields?: FormFieldInternal[]; 
  onSubmit?: (data: any) => void;
}

const RenderField = ({ field, formField }: { field: FormFieldInternal; formField: any }) => {
  switch (field.type) {
    case 'textarea':
      return <Textarea placeholder={field.placeholder} {...formField} value={formField.value as string ?? ''} />;
      
    case 'select':
      return (
        <select 
            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...formField} 
            value={formField.value as string ?? ''}
        >
            <option value="" disabled>Select an option</option>
            {field.options?.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
      );
      
    case 'checkbox':
      return (
        <>
            <input 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                checked={!!formField.value}
                onChange={formField.onChange}
                onBlur={formField.onBlur}
                ref={formField.ref}
            />
            <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-normal">{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                {field.tooltip && <p className="text-sm text-muted-foreground">{field.tooltip}</p>}
            </div>
        </>
      );
      
    case 'checklist':
      return (
        <div className="space-y-2 border p-4 rounded-md">
            {field.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                    <input 
                        type="checkbox"
                        className="h-4 w-4"
                        value={opt}
                        checked={(formField.value as string[] || []).includes(opt)}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            const currentVal = (formField.value as string[]) || [];
                            if (checked) {
                                formField.onChange([...currentVal, opt]);
                            } else {
                                formField.onChange(currentVal.filter(v => v !== opt));
                            }
                        }}
                    />
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</label>
                </div>
            ))}
        </div>
      );
      
    case 'radio':
      return (
        <div className="space-y-2 border p-4 rounded-md">
            {field.options?.map((opt, i) => (
                <div key={i} className="flex items-center space-x-2">
                    <input 
                        type="radio"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        value={opt}
                        checked={formField.value === opt}
                        onChange={() => formField.onChange(opt)}
                    />
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</label>
                </div>
            ))}
        </div>
      );
      
    case 'file':
      return (
        <div className="space-y-3">
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const newFiles = e.dataTransfer.files;
              if (!newFiles || newFiles.length === 0) return;
              
              const existingFiles = formField.value as FileList | null;
              const existingCount = existingFiles ? existingFiles.length : 0;
              const newCount = newFiles.length;
              const totalCount = existingCount + newCount;
              
              // Check if adding new files would exceed the limit
              if (field.maxFiles && totalCount > field.maxFiles) {
                const remaining = field.maxFiles - existingCount;
                if (remaining <= 0) {
                  alert(`Maximum ${field.maxFiles} file(s) allowed. Please remove existing files before adding new ones.`);
                } else {
                  alert(`You can only add ${remaining} more file(s). Maximum limit is ${field.maxFiles} file(s).`);
                }
                return;
              }
              
              // Accumulate files
              const dt = new DataTransfer();
              
              // Add existing files
              if (existingFiles) {
                Array.from(existingFiles).forEach(file => dt.items.add(file));
              }
              
              // Add new files
              Array.from(newFiles).forEach(file => dt.items.add(file));
              
              formField.onChange(dt.files);
            }}
            onClick={() => {
              document.getElementById(`file-input-${field.id}`)?.click();
            }}
          >
            <CloudUpload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {field.acceptedFileTypes?.length ? field.acceptedFileTypes.join(', ') : 'Any file'} 
              {field.maxFiles ? ` • Max ${field.maxFiles} ${field.maxFiles === 1 ? 'file' : 'files'}` : ''}
              {field.validation?.maxFileSize ? ` • Max ${field.validation.maxFileSize >= 1024 ? `${(field.validation.maxFileSize / 1024).toFixed(1)} MB` : `${field.validation.maxFileSize} KB`} per file` : ''}
            </p>
            <Input 
                id={`file-input-${field.id}`}
                type="file" 
                className="hidden"
                accept={field.acceptedFileTypes?.join(',')}
                multiple={field.maxFiles !== 1}
                value={undefined} 
                onChange={(e) => {
                    const newFiles = e.target.files;
                    if (!newFiles || newFiles.length === 0) return;
                    
                    const existingFiles = formField.value as FileList | null;
                    const existingCount = existingFiles ? existingFiles.length : 0;
                    const newCount = newFiles.length;
                    const totalCount = existingCount + newCount;
                    
                    // Check if adding new files would exceed the limit
                    if (field.maxFiles && totalCount > field.maxFiles) {
                      const remaining = field.maxFiles - existingCount;
                      if (remaining <= 0) {
                        alert(`Maximum ${field.maxFiles} file(s) allowed. Please remove existing files before adding new ones.`);
                      } else {
                        alert(`You can only add ${remaining} more file(s). Maximum limit is ${field.maxFiles} file(s).`);
                      }
                      e.target.value = ''; // Reset input
                      return;
                    }
                    
                    // Accumulate files
                    const dt = new DataTransfer();
                    
                    // Add existing files
                    if (existingFiles) {
                      Array.from(existingFiles).forEach(file => dt.items.add(file));
                    }
                    
                    // Add new files
                    Array.from(newFiles).forEach(file => dt.items.add(file));
                    
                    formField.onChange(dt.files);
                    e.target.value = ''; // Reset input to allow selecting same file again
                }}
            />
          </div>

          {formField.value && (formField.value as FileList).length > 0 && (
            <div className="space-y-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
              <p className="text-xs font-semibold text-muted-foreground">Selected Files:</p>
              {Array.from(formField.value as FileList).map((file, index) => {
                const isImage = file.type.startsWith('image/');
                const fileUrl = isImage ? URL.createObjectURL(file) : null;
                
                return (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-950 rounded border">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                      {isImage && fileUrl ? (
                        <img src={fileUrl} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const dt = new DataTransfer();
                        const files = formField.value as FileList;
                        Array.from(files).forEach((f, i) => {
                          if (i !== index) dt.items.add(f);
                        });
                        formField.onChange(dt.files);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
      
    case 'range':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Value: <span className="text-primary">{formField.value ?? field.min ?? 0}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Range: {field.min ?? 0} - {field.max ?? 100}
            </span>
          </div>
          <input
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            {...formField}
            value={formField.value ?? field.min ?? 0}
            onChange={(e) => formField.onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
          />
        </div>
      );
      
    case 'min_max':
      return (
        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Min</Label>
            <Input
              type="number"
              placeholder="Min"
              value={(formField.value as any)?.min ?? ''}
              onChange={(e) => {
                const current = (formField.value as any) || {};
                formField.onChange({ ...current, min: e.target.value });
              }}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-muted-foreground">Max</Label>
            <Input
              type="number"
              placeholder="Max"
              value={(formField.value as any)?.max ?? ''}
              onChange={(e) => {
                const current = (formField.value as any) || {};
                formField.onChange({ ...current, max: e.target.value });
              }}
            />
          </div>
        </div>
      );
      
    default:
      // Handle number input with optional spinner disable
      if (field.type === 'number') {
        return (
          <Input 
            type="number"
            placeholder={field.placeholder} 
            {...formField} 
            value={formField.value as string | number | readonly string[] | undefined ?? ''}
            className={field.disableSpinners ? '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''}
            onWheel={field.disableSpinners ? (e) => (e.target as HTMLInputElement).blur() : undefined}
          />
        );
      }
      
      return (
        <Input 
            type={field.type === 'date' ? 'date' : field.type === 'phone' ? 'tel' : 'text'} 
            placeholder={field.placeholder} 
            {...formField} 
            value={formField.value as string | number | readonly string[] | undefined ?? ''}
        />
      );
  }
};

export const FormViewer: React.FC<FormViewerProps> = ({ schema, fields: propFields, onSubmit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadedSchema, setLoadedSchema] = useState<FormSchema | null>(null);
  const [copied, setCopied] = useState(false);

  // Load form from storage if ID is provided
  useEffect(() => {
    if (id) {
      const form = getForm(id);
      if (form) {
        setLoadedSchema(form);
      }
    }
  }, [id]);

  // Use loaded schema if available, otherwise use props
  const activeSchema = loadedSchema || schema;
  const fields = activeSchema?.fields || propFields || [];
  const formTitle = activeSchema?.name || "Untitled Form";
  const formDescription = activeSchema?.description || "";

  // Calculate default values
  const defaultValues: Record<string, any> = useMemo(() => {
    const values: Record<string, any> = {};
    fields.forEach(field => {
        const fieldId = field.id || (field as any).id;
        if (!fieldId) return;
        
        if (field.type === 'checkbox') {
            values[fieldId] = false;
        } else if (field.type === 'checklist') {
            values[fieldId] = [];
        } else if (field.type === 'range') {
            values[fieldId] = field.min ?? 0;
        } else if (field.type === 'min_max') {
            values[fieldId] = { min: '', max: '' };
        } else {
            values[fieldId] = "";
        }
    });
    return values;
  }, [fields]);

  // Build Zod schema from field configurations
  const zodSchema = useMemo(() => buildZodSchema(fields), [fields]);

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
    mode: "onChange"
  });

  // Reset form when fields change (when schema loads)
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleFormSubmit = (data: any) => {
    // Build payload with form schema and field values
    const fieldsWithValues = fields.map(field => {
      const fieldId = field.id || (field as any).id;
      let value = fieldId ? data[fieldId] : undefined;
      
      // Handle file type - convert FileList to file info array
      if (field.type === 'file' && value instanceof FileList) {
        value = Array.from(value).map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }));
      }
      
      // Return field with value
      return {
        ...field,
        value: value
      };
    });

    const payload = {
      id: activeSchema?.id || 'form_submission',
      name: formTitle,
      description: formDescription,
      fields: fieldsWithValues,
      submittedAt: new Date().toISOString()
    };

    console.log("Form Submitted:", payload);
    if (onSubmit) {
        onSubmit(payload);
    } else {
        alert("Form submitted successfully!\n" + JSON.stringify(payload, null, 2));
    }
  };

  const handleCopyJson = () => {
    // If schema is provided, copy that. If not, construct it from fields.
    const jsonToCopy = activeSchema ? activeSchema : {
        id: "generated_id",
        name: formTitle,
        description: formDescription,
        fields: fields.map(({ id, ...rest }: any) => rest) // Strip ID if copying from raw fields
    };
    
    navigator.clipboard.writeText(JSON.stringify(jsonToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show error if form not found when loading from URL
  if (id && !loadedSchema) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground mb-4">Form not found</p>
            <Button onClick={() => navigate('/form-builder')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Forms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      {id && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/form-builder')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Forms
        </Button>
      )}
      <Card className="w-full shadow-lg relative mb-8">
      <Button 
        variant="outline" 
        size="sm" 
        className="absolute top-4 right-4"
        onClick={handleCopyJson}
      >
        {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
        {copied ? "Copied" : "Copy JSON"}
      </Button>

      <CardHeader>
        <CardTitle className="text-2xl">{formTitle}</CardTitle>
        {formDescription && <CardDescription>{formDescription}</CardDescription>}
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            This form has no fields.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              {fields.map((field) => {
                 const fieldId = (field as any).id;
                 if (!fieldId) return null;

                 // File validation rules (Zod doesn't handle FileList natively)
                 const fileRules: any = {};
                 if (field.type === 'file') {
                     const v = field.validation || {};
                     const requiredMsg = v.requiredMessage || "This field is required";
                     const validators: ((val: FileList) => true | string)[] = [];
                     
                     if (field.maxFiles) {
                       validators.push((val: FileList) => (!val || val.length <= field.maxFiles!) || `Maximum ${field.maxFiles} file(s) allowed`);
                     }
                     if (v.maxFileSize) {
                       validators.push((val: FileList) => {
                         if (!val || val.length === 0) return true;
                         for (let i = 0; i < val.length; i++) {
                           if (val[i].size > v.maxFileSize! * 1024) {
                             return `File "${val[i].name}" exceeds ${v.maxFileSize} KB limit`;
                           }
                         }
                         return true;
                       });
                     }
                     
                     fileRules.validate = (val: FileList) => {
                       if (!val || val.length === 0) {
                         return field.required ? requiredMsg : true;
                       }
                       for (const validator of validators) {
                         const result = validator(val);
                         if (result !== true) return result;
                       }
                       return true;
                     };
                 }

                 return (
                <FormField
                    key={fieldId}
                    control={form.control}
                    name={fieldId}
                    rules={field.type === 'file' ? fileRules : undefined}
                    render={({ field: formField }) => (
                      <FormItem className={field.type === 'checkbox' ? 'flex flex-col space-y-2 p-4 border rounded-md' : ''}>
                        {field.type === 'checkbox' && (
                          <div className="flex flex-row items-start space-x-3">
                            <RenderField field={field} formField={formField} />
                          </div>
                        )}
                        {field.type !== 'checkbox' && (
                            <div className="flex items-center gap-2">
                                <FormLabel className="text-base">{field.label} {field.required && <span className="text-red-500">*</span>}</FormLabel>
                                {field.tooltip && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle size={14} className="text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{field.tooltip}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        )}
                        
                        {field.type !== 'checkbox' && (
                          <FormControl>
                            <RenderField field={field} formField={formField} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 );
              })}
              <Button type="submit" className="w-full">Submit</Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
