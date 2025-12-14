import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router-dom';
import { HelpCircle, Copy, Check, ArrowLeft } from 'lucide-react';

import { RenderField, type FormFieldValue } from './RenderField';
import type { ChecklistFieldInternal, ChecklistSchema } from './types';
import { buildZodSchema, getDefaultValue } from './utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getChecklist } from '@/components/checklist-builder/store';

interface ChecklistViewerProps {
    schema?: ChecklistSchema;
    onSubmit?: (data: ChecklistSubmitPayload) => void;
}

interface ChecklistSubmitPayload {
    id: string;
    name: string;
    description?: string;
    fields: Array<ChecklistFieldInternal & { value: unknown }>;
    submittedAt: string;
}

export const ChecklistViewer: React.FC<ChecklistViewerProps> = ({ schema, onSubmit }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loadedSchema, setLoadedSchema] = useState<ChecklistSchema | null>(null);
    const [copied, setCopied] = useState(false);

    // Load checklist from storage if ID is provided
    useEffect(() => {
        if (id) {
            const checklist = getChecklist(id);
            if (checklist) {
                setLoadedSchema(checklist);
            }
        }
    }, [id]);

    // Prioritize schema prop (for preview/editing), fall back to loaded schema (for standalone view)
    const activeSchema = schema || loadedSchema;
    const fields = activeSchema?.fields || [];
    const checklistTitle = activeSchema?.name || "Untitled Checklist";
    const checklistDescription = activeSchema?.description || "";

    // Calculate default values
    const defaultValues = useMemo(() => {
        const values: Record<string, unknown> = {};
        fields.forEach(field => {
            if (field.id) {
                values[field.id] = getDefaultValue(field.type);
            }
        });
        return values;
    }, [fields]);

    // Build Zod schema from field configurations
    const zodSchema = useMemo(() => buildZodSchema(fields), [fields]);

    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues,
        mode: "onSubmit"
    });

    // Reset form when fields change (when schema loads)
    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form]);

    const handleFormSubmit = (data: Record<string, unknown>) => {
        // Build payload with checklist schema and field values
        const fieldsWithValues = fields.map(field => {
            let value = field.id ? data[field.id] : undefined;

            // Handle file type - convert FileList to file info array
            if (field.type === 'file' && value instanceof FileList) {
                value = Array.from(value).map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }));
            }

            return {
                ...field,
                value: value
            };
        });

        const payload: ChecklistSubmitPayload = {
            id: activeSchema?.id || 'checklist_submission',
            name: checklistTitle,
            description: checklistDescription,
            fields: fieldsWithValues,
            submittedAt: new Date().toISOString()
        };

        console.log("Checklist Submitted:", payload);
        if (onSubmit) {
            onSubmit(payload);
        } else {
            alert("Checklist submitted successfully!\n" + JSON.stringify(payload, null, 2));
        }
    };

    const handleCopyJson = () => {
        const jsonToCopy = activeSchema ? activeSchema : {
            id: "generated_id",
            name: checklistTitle,
            description: checklistDescription,
            fields: fields
        };

        navigator.clipboard.writeText(JSON.stringify(jsonToCopy, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Show error if checklist not found when loading from URL
    if (id && !loadedSchema) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64">
                        <p className="text-muted-foreground mb-4">Checklist not found</p>
                        <Button onClick={() => navigate('/checklist-builder')}>
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Checklists
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
                    onClick={() => navigate('/checklist-builder')}
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Checklists
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
                    <CardTitle className="text-2xl">{checklistTitle}</CardTitle>
                    {checklistDescription && <CardDescription>{checklistDescription}</CardDescription>}
                </CardHeader>
                <CardContent>
                    {fields.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            This checklist has no fields.
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                                {fields.map((field) => {
                                    if (!field.id) return null;

                                    return (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={field.id}
                                            render={({ field: formField }) => (
                                                <FormItem className={field.type === 'checkbox' ? 'flex flex-col space-y-2 p-4 border rounded-md' : ''}>
                                                    {field.type === 'checkbox' && (
                                                        <div className="flex flex-row items-start space-x-3">
                                                            <RenderField field={field} formField={formField as unknown as FormFieldValue} />
                                                        </div>
                                                    )}
                                                    {field.type !== 'checkbox' && (
                                                        <div className="flex items-center gap-2">
                                                            <FormLabel className="text-base">
                                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                                            </FormLabel>
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
                                                            <RenderField field={field} formField={formField as unknown as FormFieldValue} />
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

// Default export for convenience
export default ChecklistViewer;
