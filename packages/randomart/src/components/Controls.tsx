import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { NumberField } from '@repo/ui/components/NumberField';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import type { ProvenanceCheck } from '../core/artwork/index.ts';
import { MAX_LOOP_MS, MIN_LOOP_MS } from '../core/artwork/index.ts';
import { MAX_DEPTH, MAX_NODES } from '../core/grammar/index.ts';
import {
    exportArtworkFile,
    exportGrammarFile,
    exportPng,
    importArtworkFile,
    importGrammarFile,
    newDistribution,
    newImage,
    parseDurationInput,
    resetGrammar,
    restoreEntry,
    setConstraints,
    setDuration,
    useActionError,
    useCanvas,
    useClockStore,
    useCompiledShader,
    useCurrentId,
    useDuration,
    useGrammar,
    useGrammarSummary,
    useHasClockStore,
    useHistory,
    useProvenanceCheck,
    useSeed,
    useShaderError,
} from '../stores/appStore';
import { Inspector } from './Inspector';

const PROVENANCE_LABELS: Record<ProvenanceCheck, string> = {
    none: 'No provenance: this artwork was made or edited by hand',
    matches: 'Regenerable: the seed replays the original grammar',
    differs: 'Not regenerable: the expression was edited after generation',
    'version-mismatch': 'Not replayable: made with another version of the generator',
};

export function Controls() {
    const summary = useGrammarSummary();
    const history = useHistory();
    const grammar = useGrammar();
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const shaderError = useShaderError();
    const actionError = useActionError();
    const seed = useSeed();
    const compiledShader = useCompiledShader();
    const currentId = useCurrentId();
    const duration = useDuration();
    const canvas = useCanvas();
    const provenanceCheck = useProvenanceCheck();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    // Without a time terminal (tsin/tcos) the expression is fixed: there is nothing to animate.
    const canAnimate = hasClockStore && compiledShader.animated;

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <Stack gap="6">
                <ControlSection title="randomart">
                    <Stack gap="3">
                        {/* ── Image ── */}
                        <ControlField label="Image">
                            <Stack gap="2">
                                <Button
                                    onClick={() => {
                                        newImage();
                                    }}
                                >
                                    New image
                                </Button>
                                <Text variant="muted">
                                    Seed: {seed} • {compiledShader.stats.nodes} nodes
                                </Text>
                            </Stack>
                        </ControlField>

                        {/* ── Grammar ── */}
                        <ControlField label="Grammar">
                            <Stack gap="2">
                                <Stack direction="horizontal" gap="2">
                                    <Button
                                        onClick={() => {
                                            newDistribution();
                                        }}
                                    >
                                        New weights
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            resetGrammar();
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            exportGrammarFile();
                                        }}
                                    >
                                        Export
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0];

                                            e.currentTarget.value = '';

                                            if (file) {
                                                void importGrammarFile(file);
                                            }
                                        }}
                                    />
                                </Stack>
                                <Text variant="muted">
                                    {summary.vocabularySize} operators • terminals{' '}
                                    {Math.round(summary.terminalShare * 100)}% • growth{' '}
                                    {summary.growth.toFixed(2)} •{' '}
                                    {summary.hasTime ? 'time ✓' : 'no time'}
                                </Text>
                                <Stack direction="horizontal" gap="2">
                                    <NumberField
                                        label="minDepth"
                                        min={1}
                                        max={MAX_DEPTH}
                                        value={grammar.constraints.minDepth}
                                        onValueChange={(value) => {
                                            // Raw value through: the store ignores non-finite
                                            // edits (F21) and the core repair clamps/rounds.
                                            setConstraints({ minDepth: value });
                                        }}
                                    />
                                    <NumberField
                                        label="maxDepth"
                                        min={1}
                                        max={MAX_DEPTH}
                                        value={grammar.constraints.maxDepth}
                                        onValueChange={(value) => {
                                            setConstraints({ maxDepth: value });
                                        }}
                                    />
                                    <NumberField
                                        label="maxNodes"
                                        min={1}
                                        max={MAX_NODES}
                                        value={grammar.constraints.maxNodes}
                                        onValueChange={(value) => {
                                            setConstraints({ maxNodes: value });
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </ControlField>

                        {/* ── History ── */}
                        <ControlField label="History">
                            <Stack direction="horizontal" gap="2">
                                {history.map((entry) => (
                                    <Button
                                        key={entry.id}
                                        color={entry.id === currentId ? 'aqua' : 'neutral'}
                                        onClick={() => {
                                            restoreEntry(entry.id);
                                        }}
                                    >
                                        {entry.seed} · {entry.nodes}
                                    </Button>
                                ))}
                            </Stack>
                        </ControlField>

                        {/* ── Playback ── */}
                        <ControlField label="Playback">
                            <Stack gap="2">
                                <Stack direction="horizontal" gap="2">
                                    <Button
                                        onClick={() => {
                                            clockStore.togglePlay();
                                        }}
                                        disabled={!canAnimate}
                                    >
                                        {isPlaying ? 'Pause' : 'Play'}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            clockStore.reset();
                                        }}
                                        disabled={!canAnimate}
                                    >
                                        Reset
                                    </Button>
                                </Stack>
                                <Stack direction="horizontal" gap="2">
                                    <Text variant="muted">Loop duration (s):</Text>
                                    {/* One concept, one bound set: the artwork render bounds
                                        ([0.5, 120] s — findings F19/F20 unified). */}
                                    <input
                                        type="number"
                                        min={MIN_LOOP_MS / 1000}
                                        max={MAX_LOOP_MS / 1000}
                                        step={0.5}
                                        defaultValue={duration}
                                        style={{ width: '4rem' }}
                                        onChange={(e) => {
                                            setDuration(parseDurationInput(e.currentTarget.value));
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </ControlField>

                        {/* ── Artwork ── */}
                        <ControlField label="Artwork">
                            <Stack gap="2">
                                <Stack direction="horizontal" gap="2">
                                    <Button
                                        onClick={() => {
                                            exportArtworkFile();
                                        }}
                                    >
                                        Export
                                    </Button>
                                    <input
                                        type="file"
                                        accept=".json,application/json"
                                        onChange={(e) => {
                                            const file = e.currentTarget.files?.[0];

                                            e.currentTarget.value = '';

                                            if (file) {
                                                void importArtworkFile(file);
                                            }
                                        }}
                                    />
                                </Stack>
                                <Text variant="muted">{PROVENANCE_LABELS[provenanceCheck]}</Text>
                            </Stack>
                        </ControlField>

                        {/* ── Export ── */}
                        <ControlField label="Export">
                            <Button
                                onClick={() => {
                                    void exportPng();
                                }}
                                disabled={!canvas}
                            >
                                Export PNG
                            </Button>
                        </ControlField>

                        {/* ── Status ── */}
                        {actionError ? (
                            <ControlField label="Error">
                                <Text>{actionError}</Text>
                            </ControlField>
                        ) : null}
                        {shaderError ? (
                            <ControlField label="Shader Error">
                                <Stack gap="1">
                                    <Text>
                                        [{shaderError.stage}] {shaderError.message}
                                    </Text>
                                </Stack>
                            </ControlField>
                        ) : (
                            <ControlField label="Shader Status">
                                <Text variant="muted">
                                    {compiledShader.animated
                                        ? 'Time-dependent expression: press Play'
                                        : 'No time operator: this image cannot animate'}
                                </Text>
                            </ControlField>
                        )}
                    </Stack>
                </ControlSection>

                <Inspector />
            </Stack>
        </ErrorBoundary>
    );
}
