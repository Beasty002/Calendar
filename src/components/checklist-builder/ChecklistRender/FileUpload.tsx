import React from 'react';
import { CloudUpload } from 'lucide-react';
import { FilePreviewItem } from './FilePreview';
import type { ChecklistFieldInternal } from './types';

interface FileUploadProps {
    field: ChecklistFieldInternal;
    formField: {
        value: FileList | null;
        onChange: (files: FileList) => void;
    };
    hasError: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ field, formField, hasError }) => {
    const isFileAccepted = (file: File) => {
        const acceptedTypes = field.acceptedFileTypes || [];
        if (acceptedTypes.length === 0) return true;
        return acceptedTypes.some(type => {
            if (type.endsWith('/*')) {
                const mainType = type.split('/')[0];
                return file.type.startsWith(mainType + '/');
            }
            if (type.includes(',')) {
                return type.split(',').some(t => file.name.toLowerCase().endsWith(t.trim().toLowerCase()));
            }
            if (type.startsWith('.')) {
                return file.name.toLowerCase().endsWith(type.toLowerCase());
            }
            return file.type === type;
        });
    };

    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles?.length) return;

        const validFiles = Array.from(newFiles).filter(isFileAccepted);
        if (validFiles.length < newFiles.length) {
            alert(`Some files were rejected. Accepted types: ${field.acceptedFileTypes?.join(', ') || 'All'}`);
            if (validFiles.length === 0) return;
        }

        const existing = formField.value;
        const existingCount = existing?.length || 0;
        const totalCount = existingCount + validFiles.length;

        if (field.maxFiles && totalCount > field.maxFiles) {
            const remaining = field.maxFiles - existingCount;
            if (remaining <= 0) {
                alert(`Maximum ${field.maxFiles} file(s) allowed. Please remove existing files before adding new ones.`);
            } else {
                alert(`You can only add ${remaining} more file(s). Maximum limit is ${field.maxFiles} file(s).`);
            }
            return;
        }

        const dt = new DataTransfer();
        if (existing) Array.from(existing).forEach((f) => dt.items.add(f));
        validFiles.forEach((f) => dt.items.add(f));
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

    return (
        <div className="space-y-3">
            <div
                className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${hasError ? 'border-destructive' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addFiles(e.dataTransfer.files);
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
                <input
                    id={`file-input-${field.id}`}
                    type="file"
                    className="hidden"
                    accept={field.acceptedFileTypes?.length ? field.acceptedFileTypes.join(',') : undefined}
                    multiple={field.maxFiles !== 1}
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
            </div>

            {formField.value && formField.value.length > 0 && (
                <div className="space-y-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
                    <p className="text-xs font-semibold text-muted-foreground">Selected Files:</p>
                    {Array.from(formField.value).map((file, index) => (
                        <FilePreviewItem
                            key={`${index}-${file.name}`}
                            file={file}
                            onRemove={() => removeFile(index)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
