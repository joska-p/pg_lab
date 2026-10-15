import { Button } from '@repo/ui/components/Button';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { useSyncExternalStore } from 'react';

import {
    exportGrammarFile,
    exportPng,
    importGrammarFile,
    newDistribution,
    newGrammar,
    newImage,
    newVocabulary,
    parseDurationInput,
    resetGrammar,
    restoreEntry,
    setDuration,
    useActionError,
    useCanvas,
    useClockStore,
    useCompiledShader,
    useCurrentId,
    useDuration,
    useGrammarSummary,
    useHasClockStore,
    useHistory,
    useSeed,
    useShaderError,
} from '../stores/appStore';

export function Controls() {
    const clockStore = useClockStore();
    const hasClockStore = useHasClockStore();
    const shaderError = useShaderError();
    const actionError = useActionError();
    const seed = useSeed();
    const compiledShader = useCompiledShader();
    const summary = useGrammarSummary();
    const history = useHistory();
    const currentId = useCurrentId();
    const duration = useDuration();
    const canvas = useCanvas();

    const isPlaying = useSyncExternalStore(
        (onStoreChange) => clockStore.subscribe(onStoreChange),
        () => clockStore.getIsPlaying(),
    );

    // Without a time terminal (tsin/tcos) the expression is fixed: there is nothing to animate.
    const canAnimate = hasClockStore && compiledShader.animated;

    return (
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
                                    newVocabulary();
                                }}
                            >
                                New vocabulary
                            </Button>
                            <Button
                                onClick={() => {
                                    newGrammar();
                                }}
                            >
                                New grammar
                            </Button>
                        </Stack>
                        <Stack direction="horizontal" gap="2">
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
                        </Stack>
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
                        <Text variant="muted">
                            {summary.operators} operators • terminals{' '}
                            {Math.round(summary.terminalShare * 100)}% • growth{' '}
                            {summary.growth.toFixed(2)} • {summary.hasTime ? 'time ✓' : 'no time'}
                        </Text>
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
                            <input
                                type="number"
                                min={1}
                                max={60}
                                step={1}
                                defaultValue={duration}
                                style={{ width: '4rem' }}
                                onChange={(e) => {
                                    setDuration(parseDurationInput(e.currentTarget.value));
                                }}
                            />
                        </Stack>
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
    );
}
