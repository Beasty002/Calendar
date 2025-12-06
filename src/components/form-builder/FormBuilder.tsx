import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BuilderCanvas } from './BuilderCanvas';
import { v4 as uuidv4 } from 'uuid';
import type { FieldType, FormFieldInternal, FormSchema } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveForm, getForm } from './store';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormViewer } from './FormViewer';

export const FormBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fields, setFields] = useState<FormFieldInternal[]>([]);
  const [formName, setFormName] = useState("My New Form");
  const [formDescription, setFormDescription] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // Load existing form data if editing
  useEffect(() => {
    if (id) {
      const existingForm = getForm(id);
      if (existingForm) {
        setFormId(existingForm.id);
        setFormName(existingForm.name);
        setFormDescription(existingForm.description || "");
        setFields(existingForm.fields);
      }
    }
  }, [id]);

  const handleAddField = (type: FieldType) => {
    const newField: FormFieldInternal = {
      id: `field_${uuidv4()}`,
      type,
      label: '',
      placeholder: '',
      required: false,
      options: (type === 'select' || type === 'checklist' || type === 'radio') ? ['Option 1', 'Option 2'] : undefined
    };
    setFields([...fields, newField]);
  };

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleUpdateField = (id: string, updates: Partial<FormFieldInternal>) => {
    setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
    // Clear error for this field if label is being updated with a non-empty value
    if (updates.label && updates.label.trim()) {
      setFieldErrors(prev => {
        const newErrors = new Set(prev);
        newErrors.delete(id);
        return newErrors;
      });
    }
  };


  const handleSaveClick = () => {
    // Validate that all fields have non-empty labels
    const fieldsWithEmptyLabels = fields.filter(field => !field.label.trim());
    
    if (fieldsWithEmptyLabels.length > 0) {
      // Set the field IDs that have errors
      setFieldErrors(new Set(fieldsWithEmptyLabels.map(f => f.id)));
      toast.error(`Please provide labels for all fields. ${fieldsWithEmptyLabels.length} field(s) have empty labels.`);
      return;
    }
    
    setFieldErrors(new Set());
    setIsPreviewOpen(true);
  };

  const handleConfirmSave = () => {
    // Keep field IDs - FormViewer needs them to render fields
    const schema: FormSchema = {
      id: formId || uuidv4(), // Use existing ID if editing, otherwise create new
      name: formName,
      description: formDescription,
      fields: fields // Keep the full fields with IDs
    };
    
    saveForm(schema);
    setIsPreviewOpen(false);
    navigate('/form-builder');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-950 z-10">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/form-builder')}>
                <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Form Builder</h1>
        </div>
        <Button onClick={handleSaveClick}>
            <Save size={16} className="mr-2" /> Save Form
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onAddField={handleAddField} />
        
        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Form Header Card */}
                <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                    <Input 
                        value={formName} 
                        onChange={(e) => setFormName(e.target.value)} 
                        className="text-3xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-gray-300 mb-2"
                        placeholder="Untitled Form"
                    />
                    <Input 
                        value={formDescription} 
                        onChange={(e) => setFormDescription(e.target.value)} 
                        placeholder="Form description"
                        className="text-base text-muted-foreground border-none shadow-none p-0 h-auto focus-visible:ring-0"
                    />
                </div>

                <BuilderCanvas 
                    fields={fields} 
                    onUpdateField={handleUpdateField} 
                    onDeleteField={handleDeleteField}
                    fieldErrors={fieldErrors}
                />
            </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-auto max-h-[95dvh] flex flex-col p-0 gap-0 overflow-hidden" >
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Form Preview</DialogTitle>
            <DialogDescription>
              This is how your form will look. Click confirm to save.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
             <FormViewer 
                schema={{
                  id: formId || 'preview',
                  name: formName,
                  description: formDescription,
                  fields: fields
                }}
             />
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50 dark:bg-gray-900/50">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSave}>Confirm & Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
