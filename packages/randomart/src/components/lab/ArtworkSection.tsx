import { Button } from '@repo/ui/components/Button';
import { FileInput } from '@repo/ui/components/FileInput';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';

import type { ProvenanceCheck } from '../../core/artwork/index.ts';
import {
    exportArtworkFile,
    exportPng,
    importArtworkFile,
    useCanvas,
    useProvenanceCheck,
} from '../../stores/appStore';

const PROVENANCE_LABELS: Record<ProvenanceCheck, string> = {
    none: 'No provenance: this artwork was made or edited by hand',
    matches: 'Regenerable: the seed replays the original grammar',
    differs: 'Not regenerable: the expression was edited after generation',
    'version-mismatch': 'Not replayable: made with another version of the generator',
};

/**
 * Artwork & IO: raster image export (PNG), full artwork serialization (.json), and generation
 * provenance verification.
 */
export function ArtworkSection() {
    const canvas = useCanvas();
    const provenanceCheck = useProvenanceCheck();

    return (
        <Stack gap="3">
            <Button
                onClick={() => {
                    void exportPng();
                }}
                disabled={!canvas}
            >
                Export PNG
            </Button>
            <Stack gap="2">
                <Stack direction="horizontal" gap="2">
                    <Button
                        onClick={() => {
                            exportArtworkFile();
                        }}
                    >
                        Export JSON
                    </Button>
                    <FileInput
                        accept=".json,application/json"
                        onFile={(file) => {
                            void importArtworkFile(file);
                        }}
                    >
                        Import JSON
                    </FileInput>
                </Stack>
                <Text variant="muted">{PROVENANCE_LABELS[provenanceCheck]}</Text>
            </Stack>
        </Stack>
    );
}
