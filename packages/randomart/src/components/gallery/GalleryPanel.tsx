import { Button } from '@repo/ui/components/Button';
import { Checkbox } from '@repo/ui/components/Checkbox';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { FileInput } from '@repo/ui/components/FileInput';
import { NumberField } from '@repo/ui/components/NumberField';
import { Select } from '@repo/ui/components/Select';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';

import type { NotebookRating } from '../../core/notebook/index.ts';
import {
    CELL_SIZES,
    exportNotebookFile,
    importNotebookFile,
    keepCellAsArtwork,
    newGalleryBatch,
    rateCandidateRow,
    redrawGallery,
    selectBatch,
    setGalleryCellSize,
    setGalleryCount,
    setGalleryFilterFlats,
    setGallerySeeds,
    setSelectedRowIndex,
    useGalleryActiveBatch,
    useGalleryBatches,
    useGalleryError,
    useGalleryNotebook,
    useGallerySelectedRowIndex,
    useGallerySettings,
} from '../../stores/galleryStore';
import { buildLotView } from './lot';

const RATINGS: readonly NotebookRating[] = [0, 1, 2, 3, 4, 5];

export function GalleryPanel() {
    const { count, seedsPerGrammar, cellSize, filterFlats, baseSeed } = useGallerySettings();
    const batches = useGalleryBatches();
    const notebook = useGalleryNotebook();
    const activeBatch = useGalleryActiveBatch();
    const selectedRowIndex = useGallerySelectedRowIndex();
    const error = useGalleryError();

    const { cells, failed, hidden } = buildLotView(batches, filterFlats);

    const activeCandidate = activeBatch?.candidates[selectedRowIndex];

    return (
        <ControlSection title="Gallery">
            <Stack gap="4">
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

                <ControlField label="Notebook">
                    <Stack gap="2">
                        {notebook.batches.length > 0 ? (
                            <Select
                                label="Batch"
                                value={activeBatch?.id ?? notebook.batches[0]?.id ?? ''}
                                options={notebook.batches.map((batch, index) => ({
                                    value: batch.id,
                                    label: `Batch ${index + 1} (${batch.candidates.length} candidates)`,
                                }))}
                                onValueChange={selectBatch}
                            />
                        ) : null}

                        <Stack direction="horizontal" gap="2">
                            <Button
                                onClick={exportNotebookFile}
                                disabled={notebook.batches.length === 0}
                            >
                                Export JSON
                            </Button>
                            <FileInput
                                accept=".json,application/json"
                                onFile={(file) => {
                                    void importNotebookFile(file);
                                }}
                            >
                                Import JSON
                            </FileInput>
                        </Stack>
                        <Text variant="muted">
                            {notebook.batches.length} batch(es) saved in local notebook
                        </Text>
                    </Stack>
                </ControlField>

                {activeCandidate ? (
                    <ControlField label={`Row ${selectedRowIndex + 1} Rating`}>
                        <Stack gap="2">
                            <Stack direction="horizontal" gap="1">
                                {RATINGS.map((rating) => {
                                    const isSelected = activeCandidate.rating === rating;
                                    return (
                                        <Button
                                            key={rating}
                                            onClick={() =>
                                                rateCandidateRow(
                                                    selectedRowIndex,
                                                    isSelected ? undefined : rating,
                                                )
                                            }
                                        >
                                            {isSelected ? `★ ${rating}` : String(rating)}
                                        </Button>
                                    );
                                })}
                            </Stack>

                            <Stack direction="horizontal" gap="2">
                                <Button onClick={keepCellAsArtwork}>Keep as artwork</Button>
                                <Button
                                    onClick={() =>
                                        setSelectedRowIndex(
                                            (selectedRowIndex + 1) %
                                                (activeBatch?.candidates.length ?? 1),
                                        )
                                    }
                                >
                                    Next row
                                </Button>
                            </Stack>

                            <Text variant="muted">
                                Shortcuts: Keys 0–5 to rate • ↑/↓ or j/k to navigate
                            </Text>
                        </Stack>
                    </ControlField>
                ) : null}

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

                {error ? (
                    <ControlField label="Error">
                        <Text>{error}</Text>
                    </ControlField>
                ) : null}
            </Stack>
        </ControlSection>
    );
}
