import { Button } from '@repo/ui/components/Button';
import { Checkbox } from '@repo/ui/components/Checkbox';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { FileInput } from '@repo/ui/components/FileInput';
import { Grid } from '@repo/ui/components/Grid';
import { NumberField } from '@repo/ui/components/NumberField';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { Text } from '@repo/ui/components/Text';

import type { NotebookRating } from '../../bench/notebook/rating';
import type { NotebookBatch } from '../../bench/notebook/types';
import {
    setBenchCellSize,
    setBenchCount,
    setBenchDimFlats,
    setBenchSeeds,
    setBenchView,
    useBenchSettings,
} from '../../stores/bench/benchSettingsStore';
import {
    BENCH_VIEWS,
    CELL_SIZES,
    MAX_BENCH_COUNT,
    MAX_BENCH_SEEDS,
} from '../../stores/bench/constants';
import {
    drawBenchBatch,
    importNotebook,
    openSelectedInLab,
    rateCandidateRow,
    redrawBench,
    removeActiveBatch,
    selectBatch,
    stepRow,
    toggleCandidateRating,
    useBenchError,
    useBenchLot,
    useBenchSelectedColIndex,
    useBenchSelectedRowIndex,
} from '../../stores/bench/lotStore';
import {
    exportNotebookFile,
    useBenchActiveBatch,
    useBenchNotebook,
} from '../../stores/bench/notebookStore';
import type { BenchView } from '../../stores/bench/types';

const RATINGS: readonly NotebookRating[] = [0, 1, 2, 3, 4, 5];

const VIEW_LABELS: Record<BenchView, string> = {
    planche: 'Planche',
    focus: 'Focus',
};

const VIEW_OPTIONS = BENCH_VIEWS.map((value) => ({ value, label: VIEW_LABELS[value] }));

/** Locale-independent stamp: a lot is identified by when it was drawn, not by its list position. */
function batchStamp(createdAt: string): string {
    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return createdAt;
    }

    // "MM-DD HH:MM" in the user's own timezone: showing a lot drawn at 13:45 as "11:45" would lie.
    const pad = (value: number) => String(value).padStart(2, '0');

    return [
        `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    ].join(' ');
}

function batchLabel(batch: NotebookBatch): string {
    const rated = batch.candidates.filter((candidate) => candidate.rating !== undefined).length;

    return `${batchStamp(batch.createdAt)} · ${String(rated)}/${String(batch.candidates.length)} rated`;
}

/**
 * The bench panel: everything that _decides_ what to look at or how to judge it.
 *
 * The split with the stage is deliberate — the panel holds every control, the stage only shows the
 * planche. Rating follows the same rule as the data model: a note belongs to a **grammar** (a row,
 * one candidate), never to a single seed; the seeds of a row are views of one grammar.
 */
export function BenchPanel() {
    const { count, seedsPerGrammar, cellSize, view, dimFlats, baseSeed } = useBenchSettings();
    const notebook = useBenchNotebook();
    const activeBatch = useBenchActiveBatch();
    const selectedRowIndex = useBenchSelectedRowIndex();
    const selectedColIndex = useBenchSelectedColIndex();
    const lot = useBenchLot();
    const error = useBenchError();

    const candidates = activeBatch?.candidates ?? [];
    const selected = candidates[selectedRowIndex];
    const rated = candidates.filter((candidate) => candidate.rating !== undefined).length;
    const lastRow = Math.max(0, candidates.length - 1);

    return (
        <Grid columns="1" gap="8">
            <ControlSection title="lot">
                <Grid columns="2" gap="2">
                    <NumberField
                        label="grammars"
                        min={1}
                        max={MAX_BENCH_COUNT}
                        value={count}
                        onValueChange={setBenchCount}
                    />
                    <NumberField
                        label="seeds"
                        min={1}
                        max={MAX_BENCH_SEEDS}
                        value={seedsPerGrammar}
                        onValueChange={setBenchSeeds}
                    />
                </Grid>

                <Select
                    label="render size"
                    value={cellSize}
                    options={CELL_SIZES.map((size) => ({ value: size, label: `${size} px` }))}
                    onValueChange={setBenchCellSize}
                />

                <Grid columns="2" gap="2">
                    <Button color="aqua" onClick={drawBenchBatch}>
                        New batch
                    </Button>
                    <Button onClick={redrawBench} disabled={!activeBatch}>
                        Redraw
                    </Button>
                </Grid>

                <Text variant="muted">
                    {`seed ${String(baseSeed)} · ${String(count)} × ${String(seedsPerGrammar)} = ${String(count * seedsPerGrammar)} images`}
                </Text>
            </ControlSection>

            <ControlSection title="notebook">
                {notebook.batches.length > 0 ? (
                    <>
                        <Select
                            label={`${String(notebook.batches.length)} batch(es)`}
                            value={activeBatch?.id ?? ''}
                            options={notebook.batches.map((batch) => ({
                                value: batch.id,
                                label: batchLabel(batch),
                            }))}
                            onValueChange={selectBatch}
                        />
                        <Grid columns="2" gap="2">
                            <Button onClick={exportNotebookFile}>Export JSON</Button>
                            <Button
                                color="error"
                                onClick={removeActiveBatch}
                                disabled={!activeBatch}
                            >
                                Delete batch
                            </Button>
                        </Grid>
                    </>
                ) : (
                    <Text variant="muted">
                        The notebook is empty: a drawn lot is appended here automatically.
                    </Text>
                )}

                <FileInput
                    accept=".json,application/json"
                    onFile={(file) => {
                        void importNotebook(file);
                    }}
                >
                    Import JSON
                </FileInput>
            </ControlSection>

            {activeBatch && selected ? (
                <ControlSection title="rating">
                    <Text variant="muted">
                        {`grammar ${String(selectedRowIndex + 1)} of ${String(candidates.length)} — the rating covers the grammar, not one seed`}
                    </Text>

                    <Grid columns="6" gap="1">
                        {RATINGS.map((rating) => (
                            <Button
                                key={rating}
                                color={selected.rating === rating ? 'aqua' : 'neutral'}
                                aria-pressed={selected.rating === rating}
                                onClick={() => {
                                    toggleCandidateRating(selectedRowIndex, rating);
                                }}
                            >
                                {String(rating)}
                            </Button>
                        ))}
                    </Grid>

                    <Grid columns="3" gap="2">
                        <Button
                            onClick={() => {
                                stepRow(-1);
                            }}
                            disabled={selectedRowIndex === 0}
                        >
                            ← Prev
                        </Button>
                        <Button
                            onClick={() => {
                                stepRow(1);
                            }}
                            disabled={selectedRowIndex >= lastRow}
                        >
                            Next →
                        </Button>
                        <Button
                            onClick={() => {
                                rateCandidateRow(selectedRowIndex, undefined);
                            }}
                            disabled={selected.rating === undefined}
                        >
                            Clear
                        </Button>
                    </Grid>

                    <Button
                        onClick={openSelectedInLab}
                    >{`Open in Lab (seed ${String(selectedColIndex + 1)})`}</Button>

                    <Text variant="muted">
                        {`${String(rated)} of ${String(candidates.length)} rated · 0–5 to rate, same digit clears`}
                    </Text>
                </ControlSection>
            ) : null}

            <ControlSection title="display">
                <Segmented<BenchView>
                    label="view"
                    value={view}
                    options={VIEW_OPTIONS}
                    onValueChange={setBenchView}
                />

                <Checkbox
                    label="Dim collapsed cells"
                    checked={dimFlats}
                    onCheckedChange={setBenchDimFlats}
                />

                <Text variant="muted">
                    {dimFlats
                        ? `${String(lot.flatCount)} of ${String(lot.cellCount)} cells are flat and dimmed`
                        : `${String(lot.flatCount)} of ${String(lot.cellCount)} cells are flat — a constant field means the grammar collapsed`}
                </Text>
            </ControlSection>

            {error ? (
                <ControlSection title="error">
                    <Text>{error}</Text>
                </ControlSection>
            ) : null}
        </Grid>
    );
}
