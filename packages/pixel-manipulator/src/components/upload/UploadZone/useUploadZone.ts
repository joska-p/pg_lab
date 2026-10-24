import { useRef, useState } from 'react';

import { useImageUpload } from '../../../hooks/useImageUpload';
import { useImageSource } from '../../../stores/manipulator/selectors';

export function useUploadZone() {
    const { handleImageUpload, handleFileDrop, clearImage, fileName } = useImageUpload();
    const imageSource = useImageSource();
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;

        if (e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;

        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        const { files } = e.dataTransfer;

        if (files.length > 0) {
            handleFileDrop(files[0]);
        }
    };

    return {
        imageSource,
        fileName,
        isDragging,
        inputRef,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop,
        handleImageUpload,
        clearImage,
    };
}
