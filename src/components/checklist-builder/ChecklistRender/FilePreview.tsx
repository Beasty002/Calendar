import React, { useState, useEffect } from 'react';
import { FileText, FileVideo, Music } from 'lucide-react';

interface FilePreviewItemProps {
    file: File;
    onRemove: () => void;
}

export const FilePreviewItem: React.FC<FilePreviewItemProps> = ({ file, onRemove }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        let url: string | null = null;
        if (file) {
            url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [file]);

    const renderPreview = () => {
        if (!previewUrl) return null;

        if (file.type.startsWith('image/')) {
            return (
                <a href={previewUrl} target="_blank" rel="noreferrer" className="block cursor-zoom-in">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                </a>
            );
        }

        if (file.type.startsWith('video/')) {
            return (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <FileVideo className="text-blue-500 w-6 h-6" />
                </div>
            );
        }

        if (file.type.startsWith('audio/')) {
            return (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <Music className="text-purple-500 w-6 h-6" />
                </div>
            );
        }

        if (file.type === 'application/pdf') {
            return (
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <FileText className="text-red-500 w-6 h-6" />
                </div>
            );
        }

        return (
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                <FileText className="text-gray-400 w-6 h-6" />
            </div>
        );
    };

    return (
        <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-950 rounded border">
            {renderPreview()}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className='flex items-center justify-between mt-1'>
                    <p className="text-xs text-muted-foreground mr-2">
                        {(file.size / 1024).toFixed(1)} KB
                    </p>
                </div>

                {/* Inline Players for Media */}
                {previewUrl && file.type.startsWith('video/') && (
                    <div className='mt-2'>
                        <video src={previewUrl} controls className="w-full max-h-48 rounded" />
                    </div>
                )}
                {previewUrl && file.type.startsWith('audio/') && (
                    <div className='mt-2'>
                        <audio src={previewUrl} controls className="w-full" />
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="flex-shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 self-start"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};
