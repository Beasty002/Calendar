import {
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
    HelpCircle,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { RenderField } from './RenderField';
import type {
    FormFieldInternal,
    FormSchema,
} from './types';
import {
    buildZodSchema,
    getDefaultValue,
} from './utils';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { baseRequest } from '@/lib/base';

const ONBOARDING_API = '/case-management/checklist/onboarding/';

interface FormViewerProps {
    onSubmit?: (data: FormSubmitPayload) => void;
}

interface FormSubmitPayload {
    id?: string;
    name?: string;
    fields: Array<FormFieldInternal & { value: unknown }>;
    submittedAt: string;
}

export function FormViewer({ onSubmit }: FormViewerProps) {
    const [submitting, setSubmitting] = useState(false);

    const { data: formSchema, isLoading, error: fetchError } = useQuery<FormSchema>({
        queryKey: ['onboarding-form'],
        queryFn: async () => {
            const res = await baseRequest({ url: ONBOARDING_API, method: 'GET' });
            if (!res.ok) throw new Error('Failed to load form');
            return res.data;
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const fields = useMemo(() => formSchema?.fields || [], [formSchema?.fields]);

    const defaultValues = useMemo(
        () => Object.fromEntries(fields.map((f) => [f.id, getDefaultValue(f.type)])),
        [fields],
    );
    const zodSchema = useMemo(() => buildZodSchema(fields), [fields]);

    const form = useForm({
        resolver: zodResolver(zodSchema),
        defaultValues,
        mode: 'onSubmit',
    });

    useEffect(() => {
        if (fields.length > 0) {
            form.reset(defaultValues);
        }
    }, [defaultValues, fields.length, form]);

    const handleSubmit = async (data: Record<string, unknown>) => {
        setSubmitting(true);
        try {
            const payload: FormSubmitPayload = {
                id: formSchema?.id,
                name: formSchema?.name,
                fields: fields.map((f: FormFieldInternal) => ({
                    ...f,
                    value: f.type === 'file' && data[f.id] instanceof FileList
                        ? Array.from(data[f.id] as FileList).map((file: File) => ({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                        }))
                        : data[f.id],
                })),
                submittedAt: new Date().toISOString(),
            };
            onSubmit?.(payload);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (fetchError) {
        toast.error('Failed to load form. Please try again.');
        return <div className="text-center py-12 text-red-500">Failed to load form</div>;
    }

    if (!fields.length) {
        return <div className="text-center py-10 text-muted-foreground">No form fields</div>;
    }

    return (
        <div className="space-y-4">
            {formSchema?.description && (
                <p className="text-sm text-gray-500 text-center mb-4">{formSchema.description}</p>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {fields.map((field) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={field.id}
                            render={({ field: formField }) => (
                                <FormItem className={field.type === 'checkbox' ? 'flex items-start gap-3 p-4 border rounded-md' : ''}>
                                    {field.type !== 'checkbox' && (
                                        <div className="flex items-center gap-2">
                                            <FormLabel>
                                                {field.label}
                                                {' '}
                                                {field.required && <span className="text-red-500">*</span>}
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
                                    <FormControl>
                                        <RenderField field={field} formField={formField} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    );
}
