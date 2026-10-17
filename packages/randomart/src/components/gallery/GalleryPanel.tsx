import { Button } from '@repo/ui/components/Button';
import { Checkbox } from '@repo/ui/components/Checkbox';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { NumberField } from '@repo/ui/components/NumberField';
import { Select } from '@repo/ui/components/Select';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';

import {
    CELL_SIZES,
    newGalleryBatch,
    redrawGallery,
    setGalleryCellSize,
    setGalleryCount,
    setGalleryFilterFlats,
    setGallerySeeds,
    useGalleryBatches,
    useGalleryError,
    useGallerySettings,
} from '../../stores/galleryStore';
import { buildLotView } from './lot';

export function GalleryPanel() {
    const { count, seedsPerGrammar, cellSize, filterFlats, baseSeed } = useGallerySettings();
    const batches = useGalleryBatches();
    const error = useGalleryError();

    const { cells, failed, hidden } = buildLotView(batches, filterFlats);

    return (
        <ControlSection title="Gallery">
            <Stack gap="3">
                <ControlField label="Lot">
                    <Stack gap="2">
                        <Stack direction="horizontal" gap="2">
                            <NumberField
                                label="grammars"
                                min={1}
                                max={16}
                                value={count}
                                onValueChange={setGalleryCount}
                            />
                            <NumberField
                                label="seeds"
                                min={1}
                                max={16}
                                value={seedsPerGrammar}
                                onValueChange={setGallerySeeds}
                            />
                            <Select
                                label="cell"
                                value={cellSize}
                                options={CELL_SIZES.map((size) => ({
                                    value: size,
                                    label: `${size} px`,
                                }))}
                                onValueChange={setGalleryCellSize}
                            />
                        </Stack>
                        <Stack direction="horizontal" gap="2">
                            <Button onClick={newGalleryBatch}>New batch</Button>
                            <Button onClick={redrawGallery}>Redraw</Button>
                        </Stack>
                        <Text variant="muted">
                            Seed {baseSeed} • {cells} cells • {failed} failed
                        </Text>
                    </Stack>
                </ControlField>

                <ControlField label="Filter">
                    <Stack gap="2">
                        <Checkbox
                            label="Hide flat cells"
                            checked={filterFlats}
                            onCheckedChange={setGalleryFilterFlats}
                        />
                        <Text variant="muted">
                            {filterFlats
                                ? `${hidden} flat cell(s) hidden`
                                : 'A flat cell is a constant field: the grammar collapsed.'}
                        </Text>
                    </Stack>
                </ControlField>

                <Text variant="muted">The lot is rendered in the stage.</Text>

                {error ? (
                    <ControlField label="Error">
                        <Text>{error}</Text>
                    </ControlField>
                ) : null}
            </Stack>
        </ControlSection>
    );
}
