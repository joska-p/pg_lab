import { describeImage } from '../../core/analysis/index.ts';
import type { RgbImage } from '../../core/analysis/index.ts';
import type { RenderedBatch } from '../../renderer/index.ts';
import type { PlancheRow } from './planche';

export const FLAT_SHARE_THRESHOLD = 0.9;

export function isFlat(image: RgbImage, threshold = FLAT_SHARE_THRESHOLD): boolean {
    return describeImage(image).flatShare >= threshold;
}

export interface LotView {
    readonly rows: readonly PlancheRow[];
    readonly cells: number;
    readonly failed: number;
    readonly hidden: number;
}

/** Prepares the planche rows and computes counters from rendered batches. Pure. */
export function buildLotView(batches: readonly RenderedBatch[], filterFlats: boolean): LotView {
    let cells = 0;
    let failed = 0;
    let hidden = 0;

    const rows = batches.map((batch) =>
        batch.cells.map((cell) => {
            cells++;

            if (!cell.image) {
                failed++;

                return null;
            }

            if (filterFlats && isFlat(cell.image)) {
                hidden++;

                return null;
            }

            return cell.image;
        }),
    );

    return { rows, cells, failed, hidden };
}
