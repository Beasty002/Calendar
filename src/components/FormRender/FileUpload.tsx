import { CloudUpload } from 'lucide-react';
import { toast } from 'sonner';

import type { FormFieldInternal } from './types';

import { Input } from '@/components/ui/input';

interface FileUploadProps {
    field: FormFieldInternal;
    formField: {
        value: FileList | null;
        onChange: (files: FileList) => void;
    };
    hasError: boolean;
}

export function FileUpload({ field, formField, hasError }: FileUploadProps) {
    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles?.length) return;
        const existing = formField.value;
        if (field.maxFiles && (existing?.length || 0) + newFiles.length > field.maxFiles) {
            toast.warning(`Maximum ${field.maxFiles} file(s) allowed`);
            return;
        }
        const dt = new DataTransfer();
        if (existing) Array.from(existing).forEach((f) => dt.items.add(f));
        Array.from(newFiles).forEach((f) => dt.items.add(f));
        formField.onChange(dt.files);
    };

    const removeFile = (index: number) => {
        const dt = new DataTransfer();
        if (formField.value) {
            Array.from(formField.value).forEach((f, i) => {
                if (i !== index) dt.items.add(f);
            });
        }
        formField.onChange(dt.files);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById(`file-${field.id}`)?.click();
        }
    };

    return (
        <div className="space-y-3">
            <div
                role="button"
                tabIndex={0}
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 ${hasError ? 'border-destructive' : 'border-gray-300'}`}
                onClick={() => document.getElementById(`file-${field.id}`)?.click()}
                onKeyDown={handleKeyDown}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            >
                <CloudUpload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">
                    {field.acceptedFileTypes?.join(', ') || 'Any file'}
                    {field.maxFiles && ` • Max ${field.maxFiles} file(s)`}
                </p>
                <Input
                    id={`file-${field.id}`}
                    type="file"
                    className="hidden"
                    accept={field.acceptedFileTypes?.join(',')}
                    multiple={field.maxFiles !== 1}
                    onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                />
            </div>
            {formField.value && formField.value.length > 0 && (
                <div className="space-y-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                    {Array.from(formField.value).map((file) => (
                        <div key={file.name + file.size} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-950 rounded border">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <CloudUpload className="w-6 h-6 text-gray-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)}
                                    {' '}
                                    KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(
                                    Array.from(formField.value || []).indexOf(file),
                                )}
                                className="p-1 text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
