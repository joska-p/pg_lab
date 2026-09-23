import { useRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

import { MolCanvas } from './components/MolCanvas';
import { PatternCanvas } from './components/PatternCanvas';
import type { ViewerHandle } from './lib/pattern/viewer';
import { applyDroppedText } from './stores/moleculeStore';

export const stageProps: Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'aria-label'> = {
    title: 'Drop a .mol/.sdf file here to load it',
    onDragOver: (e) => {
        e.preventDefault();
    },
    onDrop: (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result;
            if (typeof text !== 'string') {
                console.error('mol-demo: failed to read .mol file: empty result');
                return;
            }
            try {
                applyDroppedText(text, file.name);
            } catch (err) {
                console.error('mol-demo: failed to parse .mol file:', err);
            }
        };
        reader.readAsText(file);
    },
};

export function Scene() {
    const viewerRef = useRef<ViewerHandle>({
        camera: null,
        controls: null,
        requestPatternDraw: null,
    });

    return (
        <>
            <PatternCanvas viewerRef={viewerRef} />
            <MolCanvas viewerRef={viewerRef} />
        </>
    );
}
