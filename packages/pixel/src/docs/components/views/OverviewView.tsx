import { Card } from '@repo/ui/components/Card';
import { Grid } from '@repo/ui/components/Grid';
import { Stack } from '@repo/ui/components/Stack';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { heading } from '@repo/ui/recipes/typography';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import { colors } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';

import { imageDataToUrl } from '../../imageLoader';
import { CodeBlock } from '../CodeBlock';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['8'],
    },
    heroTitle: {
        margin: 0,
        fontSize: typography.fontSize3xl,
        fontWeight: 900,
        fontFamily: typography.fontFamilySans,
    },
    heroPrimary: {
        color: colors.aurora,
    },
    heroDescription: {
        marginTop: space['2'],
        maxWidth: '48rem',
        opacity: 0.7,
    },
    apiGroupLabel: {
        marginBottom: space['1'],
    },
    apiEntry: {
        opacity: 0.6,
        fontSize: typography.fontSizeXs,
        fontFamily: typography.fontFamilyMono,
    },
    demoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
    },
    demoImage: {
        width: '5rem',
        flexShrink: 0,
    },
    img: {
        width: '100%',
        borderRadius: '0.25rem',
        borderWidth: '1px',
        borderStyle: 'solid' as const,
        borderColor: `color-mix(in oklab, ${surface.foreground} 15%, transparent)`,
    },
    demoCaption: {
        opacity: 0.55,
        fontSize: typography.fontSizeXs,
    },
});

interface OverviewViewProps {
    sourceData: ImageData | null;
}

function OverviewView({ sourceData }: OverviewViewProps) {
    return (
        <Grid columns="1" gap="4" {...stylex.props(styles.root)}>
            {/* Hero */}
            <div>
                <h1 {...stylex.props(styles.heroTitle)}>
                    <span {...stylex.props(styles.heroPrimary)}>@repo/</span>pixel
                </h1>
                <Text style={styles.heroDescription}>
                    TypeScript-first, browser-based image manipulation pipeline. Zero dependencies.
                    Chain built-in manipulations into reusable pipelines. Runs off the main thread
                    via a Web Worker pool for non-blocking UI.
                </Text>
            </div>

            {/* Why / Architecture cards */}
            <Grid columns="auto-fit" gap="4">
                <Card color="aurora" background="soft">
                    <h2 {...stylex.props(heading.level1)}>Why a Pipeline API?</h2>
                    <Text variant="muted">
                        Canvas 2D&apos;s built-in filters are limited, synchronous, and
                        single-purpose. For anything beyond basic brightness or blur you need direct
                        pixel access — which blocks the main thread. This pipeline gives you
                        composable, off-thread image processing with near-zero overhead, and without
                        leaving the browser.
                    </Text>
                </Card>

                <Card color="neutral" background="soft">
                    <Stack direction="vertical" gap="6">
                        <h3 {...stylex.props(heading.level3)}>Architecture</h3>
                        <Stack direction="vertical" gap="3">
                            <div {...stylex.props(heading.level3, styles.apiGroupLabel)}>pixel</div>
                            <Stack direction="vertical" gap="2">
                                <Text variant="muted">
                                    .run({'{'} sourceImageData, steps {'}'})
                                </Text>
                                <Text variant="muted">.manipulations</Text>
                                <Text variant="muted">.getManipulationsByAccess(type)</Text>
                                <Text variant="muted">.teardown()</Text>
                            </Stack>
                        </Stack>

                        <Stack direction="vertical" gap="3">
                            <div {...stylex.props(heading.level3, styles.apiGroupLabel)}>
                                Hidden internals
                            </div>
                            <Stack direction="vertical" gap="2">
                                <Text variant="muted">Web Worker pool (up to 4)</Text>
                                <Text variant="muted">Registry + FusionScheduler</Text>
                                <Text variant="muted">BufferManager (double-buffered)</Text>
                                <Text variant="muted">NeighborhoodTiling (512px tiles)</Text>
                            </Stack>
                        </Stack>
                        <Text variant="muted">
                            <strong>3 operation types:</strong> pixel (per-pixel transform),
                            neighborhood (convolution kernel), global (dimension-changing
                            transform).
                        </Text>
                    </Stack>
                </Card>
            </Grid>

            {/* Quick start: pixel facade */}
            <Card
                color="amber"
                background="soft"
                border="strong"
                {...stylex.props(
                    surfaceStyles({ color: 'amber', background: 'soft', border: 'strong' }),
                )}
            >
                <h3 {...stylex.props(heading.level2)}>pixel (recommended)</h3>
                <Text variant="muted">
                    Single entry point. Offloads to a Web Worker pool (up to
                    min(hardwareConcurrency, 4)). Built-in manipulations available automatically —
                    no registry setup needed.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nconst result = await pixel.run({\n  sourceImageData: sourceData,\n  steps: [\n    { id: "brightness", options: { value: 1.2 } },\n    { id: "sharpen", options: { strength: 1.5 } },\n    { id: "edge-detect" },\n  ]\n});\n\n// result[0]       → first step\n// result.at(-1)   → final result`}
                />
            </Card>

            {/* Browse manipulations */}
            <Card color="aurora" background="soft" border="strong">
                <h3 {...stylex.props(heading.level2)}>Browse available manipulations</h3>
                <Text variant="muted">
                    The facade provides a pre-built catalog of all manipulations with UI metadata,
                    filterable by access type.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\n// All manipulations\npixel.manipulations;\n\n// Filter by access type\nconst pixelManips = pixel.getManipulationsByAccess("pixel");\nconst neighborhood = pixel.getManipulationsByAccess("neighborhood");`}
                />
            </Card>

            {/* Teardown */}
            <Card color="purple" background="soft" border="strong">
                <h3 {...stylex.props(heading.level2)}>Teardown</h3>
                <Text variant="muted">
                    Terminate workers and clear the job queue. Call on app teardown. Idempotent.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nfunction App() {\n  useEffect(() => () => pixel.teardown(), []);\n  // ...\n}`}
                />
            </Card>

            {/* Demo image preview */}
            {sourceData && (
                <Card color="aqua" background="soft" border="subtle">
                    <div {...stylex.props(styles.demoRow)}>
                        <div {...stylex.props(styles.demoImage)}>
                            <p {...stylex.props(styles.demoCaption)}>Demo Image</p>
                            <img
                                src={imageDataToUrl(sourceData) ?? ''}
                                alt="demo"
                                style={{ imageRendering: 'pixelated' }}
                                {...stylex.props(styles.img)}
                            />
                        </div>
                        <Text variant="muted">
                            All manipulations in this documentation run against this source image.
                            Browse the sidebar to explore each endpoint.
                        </Text>
                    </div>
                </Card>
            )}
        </Grid>
    );
}

export { OverviewView };
