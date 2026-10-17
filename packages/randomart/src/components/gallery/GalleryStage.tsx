import { Text } from '@repo/ui/components/Text';

import { useGalleryBatches, useGalleryError, useGallerySettings } from '../../stores/galleryStore';
import { buildLotView } from './lot';
import { Planche } from './Planche';

/**
 * The gallery stage: displays the current lot's planche centered inside the stage area whenever the
 * gallery mode is active, leaving the main live canvas (`Scene`) unmounted.
 */
export function GalleryStage() {
    const { cellSize, filterFlats } = useGallerySettings();
    const batches = useGalleryBatches();
    const error = useGalleryError();

    const { rows } = buildLotView(batches, filterFlats);

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

    return (
        <div
            style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                overflow: 'auto',
            }}
        >
            <Planche rows={rows} cellSize={Number(cellSize)} />
        </div>
    );
}
