import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { radius, space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, useState } from 'react';

import { MAX_RATING, MIN_RATING } from '../../core/notebook/index.ts';
import type { NotebookRating } from '../../core/notebook/index.ts';
import {
    initBenchNotebook,
    openSelectedInLab,
    rateCandidateRow,
    selectCell,
    stepCell,
    stepRow,
    toggleCandidateRating,
    useBenchActiveBatch,
    useBenchError,
    useBenchLot,
    useBenchSelectedColIndex,
    useBenchSelectedRowIndex,
    useBenchSettings,
} from '../../stores/benchStore.ts';
import { focusLotView } from './lot.ts';
import { fitGrid } from './planche.ts';
import { Planche } from './Planche.tsx';

const styles = stylex.create({
    // The stage owns the keyboard, so it is one focusable region: the shortcuts mean the same thing
    // from anywhere inside it, and typing in the panel can never rate a grammar by accident. The
    // focus is shown on the readout rather than as a ring around the whole stage, where a focus
    // outline would just look like a stray frame.
    stage: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        outline: 'none',
    },
    // The planche's viewport is not a layout: the lot is fitted inside it (sheet view) or scrolls
    // in it (row view). `container-type: size` is what lets the planche be capped by the stage
    // height without measuring anything in JS.
    viewport: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        overflow: 'auto',
        containerType: 'size',
    },
    empty: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    readout: {
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space['3'],
        paddingBlock: space['1'],
        paddingInline: space['3'],
        borderRadius: radius.sm,
        // "The keyboard acts on the bench": shown where the keys are advertised.
        outline: {
            default: '2px solid transparent',
            [stylex.when.ancestor(':focus-visible')]: `2px solid ${colors.aqua}`,
        },
    },
    // A rating is read as a shape before it is read as a digit.
    rating: {
        fontFamily: typography.fontFamilyMono,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: typography.letterSpacingWide,
        color: surface.foreground,
    },
    hint: {
        color: `color-mix(in oklab, ${surface.foreground} 65%, transparent)`,
        fontFamily: typography.fontFamilyMono,
        fontSize: typography.fontSizeXs,
    },
});

const RATINGS: readonly NotebookRating[] = [0, 1, 2, 3, 4, 5];

/** `★★★☆☆` — undefined is "not rated", not a zero. */
function stars(rating: number | undefined): string {
    if (rating === undefined) {
        return '☆'.repeat(MAX_RATING - MIN_RATING + 1);
    }

    return '★'.repeat(rating) + '☆'.repeat(MAX_RATING - rating);
}

/** Size of an element, kept in state; the element is a state too so late mounting is handled. */
function useElementSize(element: HTMLElement | null): { width: number; height: number } {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => {
            if (entry) {
                setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element]);

    return size;
}

/**
 * The bench stage: the planche, and nothing else. Every control lives in the panel, so the stage
 * has one job — showing the lot — and it keeps the keyboard while doing it.
 *
 * Shortcuts, active while the stage has focus (clicking the planche is enough):
 *
 * - 0–5: rates the current grammar (pressing the same digit again clears it)
 * - Backspace: clears the rating
 * - ↑/↓ or k/j: previous / next grammar
 * - ←/→ or h/l: previous / next seed
 * - Enter: opens the current cell in Lab
 */
export function BenchStage() {
    const { cellSize, view, dimFlats } = useBenchSettings();
    const lot = useBenchLot();
    const activeBatch = useBenchActiveBatch();
    const selectedRowIndex = useBenchSelectedRowIndex();
    const selectedColIndex = useBenchSelectedColIndex();
    const error = useBenchError();
    const stageRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState<HTMLDivElement | null>(null);
    const viewportSize = useElementSize(viewport);

    useEffect(() => {
        void initBenchNotebook();
    }, []);

    // Entering the bench hands the keyboard over: the planche is what the keys act on.
    useEffect(() => {
        stageRef.current?.focus();
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.metaKey || event.ctrlKey || event.altKey) {
            return;
        }

        const digit = Number(event.key);

        // `Number(' ')` is 0: only a real digit key rates, never Space or another blank key.
        if (/^\d$/.test(event.key) && RATINGS.includes(digit as NotebookRating)) {
            event.preventDefault();
            toggleCandidateRating(selectedRowIndex, digit as NotebookRating);
            return;
        }

        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                rateCandidateRow(selectedRowIndex, undefined);
                break;
            case 'ArrowUp':
            case 'k':
                event.preventDefault();
                stepRow(-1);
                break;
            case 'ArrowDown':
            case 'j':
                event.preventDefault();
                stepRow(1);
                break;
            case 'ArrowLeft':
            case 'h':
                event.preventDefault();
                stepCell(-1);
                break;
            case 'ArrowRight':
            case 'l':
                event.preventDefault();
                stepCell(1);
                break;
            case 'Enter':
                event.preventDefault();
                openSelectedInLab();
                break;
            default:
                break;
        }
    };

    if (lot.grammarCount === 0) {
        return (
            <div ref={stageRef} tabIndex={0} aria-label="Bench" {...stylex.props(styles.stage)}>
                <div {...stylex.props(styles.empty)}>
                    <Text variant="muted">
                        {error ?? 'No lot yet — press "New batch" in the Bench panel.'}
                    </Text>
                </div>
            </div>
        );
    }

    const candidate = activeBatch?.candidates[selectedRowIndex];
    const seedCount = lot.rows[selectedRowIndex]?.length ?? 0;
    const isFocus = view === 'focus';
    const focusColumns = fitGrid(seedCount, viewportSize.width, viewportSize.height);
    const shown = isFocus ? focusLotView(lot, selectedRowIndex, focusColumns) : lot;
    const shownRow = isFocus ? Math.floor(selectedColIndex / focusColumns) : selectedRowIndex;
    const shownCol = isFocus ? selectedColIndex % focusColumns : selectedColIndex;

    const counters = [
        `${String(lot.cellCount)} cells`,
        lot.flatCount > 0 ? `${String(lot.flatCount)} flat` : null,
        lot.failedCount > 0 ? `${String(lot.failedCount)} failed` : null,
        error,
    ].filter((part): part is string => part !== null);

    return (
        <div
            ref={stageRef}
            tabIndex={0}
            aria-label="Bench"
            onKeyDown={handleKeyDown}
            {...stylex.props(styles.stage)}
        >
            <div ref={setViewport} {...stylex.props(styles.viewport)}>
                <Planche
                    lot={shown}
                    cellSize={Number(cellSize)}
                    view={view}
                    dimFlats={dimFlats}
                    selectedRowIndex={shownRow}
                    selectedColIndex={shownCol}
                    onCellClick={(rowIndex, colIndex) => {
                        if (isFocus) {
                            selectCell(selectedRowIndex, rowIndex * focusColumns + colIndex);
                        } else {
                            selectCell(rowIndex, colIndex);
                        }
                    }}
                />
            </div>

            <div
                {...stylex.props(
                    styles.readout,
                    surfaceStyles({ background: 'soft', border: 'none' }),
                )}
            >
                <Stack direction="horizontal" gap="4">
                    <Text>{`grammar ${String(selectedRowIndex + 1)}/${String(lot.grammarCount)}`}</Text>
                    <Text>{`seed ${String(selectedColIndex + 1)}/${String(seedCount)}`}</Text>{' '}
                    <span {...stylex.props(styles.rating)}>
                        {`${stars(candidate?.rating)} ${candidate?.rating === undefined ? 'not rated' : String(candidate.rating)}`}
                    </span>
                </Stack>

                <span {...stylex.props(styles.hint)}>
                    {`${counters.join(' · ')} — 0–5 rate · ←→ seeds · ↑↓ grammars · ⏎ Lab`}
                </span>
            </div>
        </div>
    );
}
