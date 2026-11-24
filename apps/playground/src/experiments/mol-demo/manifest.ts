import type { ExperimentMetadata } from '../../shell/types';
import { applyDroppedText } from './stores/moleculeStore';

export const experiment = {
    label: 'Mol Demo',
    summary:
        'Interactive 3D molecular lattice simulator paired with real-time X-ray scattering diffraction.',
    tint: 'aqua',
    mark: 'mol-demo',
    stageProps: {
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
    },
} satisfies ExperimentMetadata;
