import { Card } from '@repo/ui/components/Card';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { Text } from '@repo/ui/components/Text';
import { surfaceStyles } from '@repo/ui/recipes/surface';
import { space, typography } from '@repo/ui/tokens/const.stylex';
import { surface } from '@repo/ui/tokens/surface.stylex';
import * as stylex from '@stylexjs/stylex';

import { CodeBlock } from '../CodeBlock';
import { imageDataToUrl } from '../helpers';

const styles = stylex.create({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['8'],
    },
    header: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['2'],
    },
    title: {
        margin: 0,
        fontFamily: typography.fontFamilySans,
        fontSize: typography.fontSize3xl,
        fontWeight: typography.fontWeightBold,
        letterSpacing: typography.letterSpacingTight,
        color: surface.foreground,
    },
    titleBrand: {
        color: 'currentColor',
    },
    description: {
        margin: 0,
        maxWidth: '48ch',
        fontSize: typography.fontSizeMd,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    grid: {
        display: 'grid',
        gap: space['6'],
        gridTemplateColumns: '1fr',
        '@media (min-width: 1024px)': {
            gridTemplateColumns: 'repeat(3, 1fr)',
        },
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['3'],
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        padding: space['6'],
    },
    boxBorder: {
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    boxHeading: {
        margin: 0,
        fontSize: typography.fontSize2xl,
        fontWeight: typography.fontWeightBold,
        color: surface.foreground,
    },
    subText: {
        margin: 0,
        fontSize: typography.fontSizeSm,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    archGrid: {
        display: 'grid',
        gap: space['3'],
        gridTemplateColumns: '1fr',
        '@media (min-width: 640px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    archColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: space['1'],
    },
    archKey: {
        fontSize: typography.fontSizeSm,
        fontWeight: typography.fontWeightSemibold,
        color: surface.foreground,
    },
    archValue: {
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    note: {
        margin: 0,
        marginTop: space['2'],
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    noteStrong: {
        fontWeight: typography.fontWeightSemibold,
        color: surface.foreground,
    },
    demoBox: {
        display: 'flex',
        alignItems: 'center',
        gap: space['4'],
        borderRadius: '8px',
        borderWidth: '1px',
        borderStyle: 'solid',
        padding: space['4'],
    },
    demoBoxBorder: {
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${surface.foreground} 10%, transparent)`,
    },
    demoImage: {
        width: '80px',
        height: '80px',
        flexShrink: 0,
        borderRadius: '6px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `color-mix(in oklab, ${surface.foreground} 20%, transparent)`,
        imageRendering: 'pixelated',
    },
    demoLabel: {
        margin: 0,
        marginBottom: space['1'],
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
    demoText: {
        margin: 0,
        fontSize: typography.fontSizeXs,
        color: `color-mix(in oklab, ${surface.foreground} 60%, transparent)`,
    },
});

// Teintes d'accent par section, mappées sur le système ui.
const BOX_COLOR: Record<
    string,
    'neutral' | 'aurora' | 'solder' | 'purple' | 'amber' | 'aqua' | 'orange'
> = {
    why: 'purple',
    arch: 'neutral',
    pixel: 'aurora',
    browse: 'aqua',
    teardown: 'amber',
};

function OverviewView({ sourceData }: { sourceData: ImageData | null }) {
    return (
        <div {...stylex.props(styles.root)}>
            <div {...stylex.props(styles.header)}>
                <h1 {...stylex.props(styles.title)}>
                    <span {...stylex.props(styles.titleBrand)}>@repo/</span>pixel
                </h1>
                <p {...stylex.props(styles.description)}>
                    TypeScript-first, browser-based image manipulation pipeline. Zero dependencies.
                    Chain built-in manipulations into reusable pipelines. Runs off the main thread
                    via a Web Worker pool for non-blocking UI.
                </p>
            </div>

            <div {...stylex.props(styles.grid)}>
                <div
                    {...stylex.props(
                        styles.box,
                        styles.boxBorder,
                        surfaceStyles({
                            color: BOX_COLOR.why,
                            background: 'soft',
                            border: 'strong',
                            radius: 'md',
                        }),
                    )}
                >
                    <h2 {...stylex.props(styles.boxHeading)}>Why a Pipeline API?</h2>
                    <p {...stylex.props(styles.subText)}>
                        Canvas 2D&apos;s built-in filters are limited, synchronous, and
                        single-purpose. For anything beyond basic brightness or blur you need direct
                        pixel access — which blocks the main thread. This pipeline gives you
                        composable, off-thread image processing with near-zero overhead, and without
                        leaving the browser.
                    </p>
                </div>
                <div
                    {...stylex.props(
                        styles.box,
                        styles.boxBorder,
                        surfaceStyles({
                            color: BOX_COLOR.arch,
                            background: 'soft',
                            border: 'strong',
                            radius: 'md',
                        }),
                    )}
                >
                    <h3 {...stylex.props(styles.boxHeading)}>Architecture</h3>
                    <div {...stylex.props(styles.archGrid)}>
                        <div {...stylex.props(styles.archColumn)}>
                            <div {...stylex.props(styles.archKey)}>pixel</div>
                            <div {...stylex.props(styles.archColumn)}>
                                <div {...stylex.props(styles.archValue)}>
                                    {'.run({ sourceImageData, steps })'}
                                </div>
                                <div {...stylex.props(styles.archValue)}>.manipulations</div>
                                <div {...stylex.props(styles.archValue)}>
                                    .getManipulationsByAccess(type)
                                </div>
                                <div {...stylex.props(styles.archValue)}>.teardown()</div>
                            </div>
                        </div>
                        <div {...stylex.props(styles.archColumn)}>
                            <div {...stylex.props(styles.archKey)}>Hidden internals</div>
                            <div {...stylex.props(styles.archColumn)}>
                                <div {...stylex.props(styles.archValue)}>
                                    Web Worker pool (up to 4)
                                </div>
                                <div {...stylex.props(styles.archValue)}>
                                    Registry + FusionScheduler
                                </div>
                                <div {...stylex.props(styles.archValue)}>
                                    BufferManager (double-buffered)
                                </div>
                                <div {...stylex.props(styles.archValue)}>
                                    NeighborhoodTiling (512px tiles)
                                </div>
                            </div>
                        </div>
                    </div>
                    <p {...stylex.props(styles.note)}>
                        <span {...stylex.props(styles.noteStrong)}>3 operation types:</span> pixel
                        (per-pixel transform), neighborhood (convolution kernel), global
                        (dimension-changing transform).
                    </p>
                </div>
            </div>

            <Card color={BOX_COLOR.pixel} background="soft" border="strong" radius="md">
                <SectionHeading title="pixel (recommended)" color={BOX_COLOR.pixel} />
                <Text variant="muted">
                    Single entry point. Offloads to a Web Worker pool (up to{' '}
                    <span>min(hardwareConcurrency, 4)</span>). Built-in manipulations available
                    automatically — no registry setup needed.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nconst result = await pixel.run({\n  sourceImageData: sourceData,\n  steps: [\n    { id: "brightness", options: { value: 1.2 } },\n    { id: "sharpen", options: { strength: 1.5 } },\n    { id: "edge-detect" },\n  ]\n});\n\n// result[0]       → first step\n// result.at(-1)   → final result`}
                />
            </Card>

            <Card color={BOX_COLOR.browse} background="soft" border="strong" radius="md">
                <SectionHeading title="Browse available manipulations" color={BOX_COLOR.browse} />
                <Text variant="muted">
                    The facade provides a pre-built catalog of all manipulations with UI metadata,
                    filterable by access type.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\n// All manipulations\npixel.manipulations;\n\n// Filter by access type\nconst pixelManips = pixel.getManipulationsByAccess("pixel");\nconst neighborhood = pixel.getManipulationsByAccess("neighborhood");`}
                />
            </Card>

            <Card color={BOX_COLOR.teardown} background="soft" border="strong" radius="md">
                <SectionHeading title="Teardown" color={BOX_COLOR.teardown} />
                <Text variant="muted">
                    Terminate workers and clear the job queue. Call on app teardown. Idempotent.
                </Text>
                <CodeBlock
                    code={`import { pixel } from "@repo/pixel";\n\nfunction App() {\n  useEffect(() => () => pixel.teardown(), []);\n  // ...\n}`}
                />
            </Card>

            {sourceData && (
                <div
                    {...stylex.props(
                        styles.demoBox,
                        styles.demoBoxBorder,
                        surfaceStyles({
                            color: BOX_COLOR.arch,
                            background: 'soft',
                            border: 'strong',
                            radius: 'md',
                        }),
                    )}
                >
                    <p {...stylex.props(styles.demoLabel)}>Demo Image</p>
                    <img
                        src={imageDataToUrl(sourceData) ?? ''}
                        alt="demo"
                        {...stylex.props(styles.demoImage)}
                    />
                    <p {...stylex.props(styles.demoText)}>
                        All manipulations in this documentation run against this source image.
                        Browse the sidebar to explore each endpoint.
                    </p>
                </div>
            )}
        </div>
    );
}

export { OverviewView };
