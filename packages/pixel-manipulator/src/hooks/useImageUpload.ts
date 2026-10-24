import { useState } from 'react';

import { readFileAsImageData } from '../core/file-reader';
import { clearImageSource, setImageSource } from '../stores/manipulator/actions';

function useImageUpload() {
    const [fileName, setFileName] = useState<string | undefined>(undefined);

    async function processFile(file: File) {
        if (!file.type.startsWith('image/')) {
            return;
        }

        setFileName(file.name);

        try {
            const imageData = await readFileAsImageData(file);

            setImageSource({
                id: 'source',
                name: 'source',
                description: 'image source',
                imageData,
            });
        } catch (err) {
            console.error('Failed to process image data:', err);
        }
    }

    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        void processFile(file);
    }

    function handleFileDrop(file: File) {
        void processFile(file);
    }

    function clearImage() {
        setFileName(undefined);
        clearImageSource();
    }

    return { handleImageUpload, handleFileDrop, clearImage, fileName };
}

export { useImageUpload };
