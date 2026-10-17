import { Button } from '@repo/ui/components/Button';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useEffect } from 'react';

import type { NotebookRating } from '../../core/notebook/index.ts';
import {
    initGalleryNotebook,
    keepCellAsArtwork,
    rateCandidateRow,
    setSelectedCell,
    setSelectedRowIndex,
    useGalleryActiveBatch,
    useGalleryBatches,
    useGalleryError,
    useGallerySelectedCell,
    useGallerySelectedRowIndex,
    useGallerySettings,
} from '../../stores/galleryStore';
import { buildLotView } from './lot';
import { Planche } from './Planche';

const RATINGS: readonly NotebookRating[] = [0, 1, 2, 3, 4, 5];

/**
 * The gallery stage: displays the current lot's planche centered inside the stage area whenever the
 * gallery mode is active, leaving the main live canvas (`Scene`) unmounted.
 *
 * Provides keyboard shortcuts:
 *
 * - 0–5: rates the selected candidate row
 * - ArrowUp / k: previous candidate row
 * - ArrowDown / j: next candidate row
 */
export function GalleryStage() {
    const { cellSize, filterFlats } = useGallerySettings();
    const batches = useGalleryBatches();
    const activeBatch = useGalleryActiveBatch();
    const selectedRowIndex = useGallerySelectedRowIndex();
    const selectedCell = useGallerySelectedCell();
    const error = useGalleryError();

    useEffect(() => {
        void initGalleryNotebook();
    }, []);

    const { rows } = buildLotView(batches, filterFlats);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (['0', '1', '2', '3', '4', '5'].includes(event.key)) {
                event.preventDefault();
                rateCandidateRow(selectedRowIndex, Number(event.key) as NotebookRating);
            } else if (event.key === 'ArrowUp' || event.key === 'k') {
                event.preventDefault();
                setSelectedRowIndex(Math.max(0, selectedRowIndex - 1));
            } else if (event.key === 'ArrowDown' || event.key === 'j') {
                event.preventDefault();
                if (activeBatch) {
                    setSelectedRowIndex(
                        Math.min(activeBatch.candidates.length - 1, selectedRowIndex + 1),
                    );
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedRowIndex, activeBatch]);

    if (batches.length === 0) {
        return (
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text variant="muted">
                    {error ?? 'No lot yet — press "New batch" in the Gallery panel.'}
                </Text>
            </div>
        );
    }

    const currentCandidate = activeBatch?.candidates[selectedRowIndex];

    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                gap: '0.75rem',
                overflow: 'auto',
            }}
        >
            <Planche
                rows={rows}
                cellSize={Number(cellSize)}
                selectedRowIndex={selectedRowIndex}
                selectedCell={selectedCell}
                onCellClick={(rowIndex, colIndex) => {
                    setSelectedCell({ rowIndex, colIndex });
                }}
            />

            {currentCandidate ? (
                <div
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <Stack direction="horizontal" gap="4">
                        <Text>
                            Row {selectedRowIndex + 1}
                            {selectedCell ? ` • Seed ${selectedCell.colIndex + 1}` : ''}
                        </Text>
                        <Stack direction="horizontal" gap="1">
                            {RATINGS.map((rating) => {
                                const isSelected = currentCandidate.rating === rating;
                                return (
                                    <Button
                                        key={rating}
                                        onClick={() => rateCandidateRow(selectedRowIndex, rating)}
                                    >
                                        {isSelected ? `★ ${rating}` : String(rating)}
                                    </Button>
                                );
                            })}
                        </Stack>
                        <Button onClick={keepCellAsArtwork}>Keep as artwork (Lab)</Button>
                    </Stack>
                </div>
            ) : null}
        </div>
    );
}
