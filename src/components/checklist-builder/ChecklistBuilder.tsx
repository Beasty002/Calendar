import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { BuilderCanvas } from './BuilderCanvas';
import { v4 as uuidv4 } from 'uuid';
import type { FieldType, ChecklistFieldInternal, ChecklistSchema } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveChecklist, getChecklist } from './store';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChecklistViewer } from './ChecklistRender';

export const ChecklistBuilder: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [fields, setFields] = useState<ChecklistFieldInternal[]>([]);
    const [checklistName, setChecklistName] = useState("My New Checklist");
    const [checklistDescription, setChecklistDescription] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [checklistId, setChecklistId] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

    // Load existing checklist data if editing
    useEffect(() => {
        if (id) {
            const existingChecklist = getChecklist(id);
            if (existingChecklist) {
                setChecklistId(existingChecklist.id);
                setChecklistName(existingChecklist.name);
                setChecklistDescription(existingChecklist.description || "");
                setFields(existingChecklist.fields);
            }
        }
    }, [id]);

    const handleAddField = (type: FieldType) => {
        const newField: ChecklistFieldInternal = {
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

    const handleUpdateField = (id: string, updates: Partial<ChecklistFieldInternal>) => {
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
        const errors = new Set<string>();

        // Validate that all fields have non-empty labels
        const fieldsWithEmptyLabels = fields.filter(field => !field.label.trim());
        fieldsWithEmptyLabels.forEach(f => errors.add(f.id));

        // Validate that file fields have at least one accepted file type
        const fileFieldsWithoutTypes = fields.filter(
            field => field.type === 'file' && (!field.acceptedFileTypes || field.acceptedFileTypes.length === 0)
        );
        fileFieldsWithoutTypes.forEach(f => errors.add(f.id));

        if (errors.size > 0) {
            setFieldErrors(errors);

            if (fieldsWithEmptyLabels.length > 0 && fileFieldsWithoutTypes.length > 0) {
                toast.error(`Please fix validation errors: ${fieldsWithEmptyLabels.length} empty label(s), ${fileFieldsWithoutTypes.length} file field(s) without types.`);
            } else if (fieldsWithEmptyLabels.length > 0) {
                toast.error(`Please provide labels for all fields. ${fieldsWithEmptyLabels.length} field(s) have empty labels.`);
            } else {
                toast.error(`File upload fields must have at least one accepted file type. ${fileFieldsWithoutTypes.length} field(s) need file types.`);
            }
            return;
        }

        setFieldErrors(new Set());
        setIsPreviewOpen(true);
    };

    const handleConfirmSave = () => {
        // Keep field IDs - ChecklistViewer needs them to render fields
        const schema: ChecklistSchema = {
            id: checklistId || uuidv4(), // Use existing ID if editing, otherwise create new
            name: checklistName,
            description: checklistDescription,
            fields: fields // Keep the full fields with IDs
        };

        saveChecklist(schema);
        setIsPreviewOpen(false);
        navigate('/checklist-builder');
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-950 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/checklist-builder')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-xl font-semibold">Checklist Builder</h1>
                </div>
                <Button onClick={handleSaveClick}>
                    <Save size={16} className="mr-2" /> Save Checklist
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                <Sidebar onAddField={handleAddField} />

                {/* Canvas Area */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Checklist Header Card */}
                        <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                            <Input
                                value={checklistName}
                                onChange={(e) => setChecklistName(e.target.value)}
                                className="text-3xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 placeholder:text-gray-300 mb-2"
                                placeholder="Untitled Checklist"
                            />
                            <Input
                                value={checklistDescription}
                                onChange={(e) => setChecklistDescription(e.target.value)}
                                placeholder="Checklist description"
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
                        <DialogTitle>Checklist Preview</DialogTitle>
                        <DialogDescription>
                            This is how your checklist will look. Click confirm to save.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        <ChecklistViewer
                            schema={{
                                id: checklistId || 'preview',
                                name: checklistName,
                                description: checklistDescription,
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
