import { Badge } from '@repo/ui/components/Badge';
import { Button } from '@repo/ui/components/Button';
import { Card } from '@repo/ui/components/Card';
import { Checkbox } from '@repo/ui/components/Checkbox';
import { ColorField } from '@repo/ui/components/ColorField';
import { ControlField } from '@repo/ui/components/ControlField';
import { ControlPanel } from '@repo/ui/components/ControlPanel';
import { ControlSection } from '@repo/ui/components/ControlSection';
import { ErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { ExperimentShell } from '@repo/ui/components/ExperimentShell';
import { Led } from '@repo/ui/components/Led';
import { NumberField } from '@repo/ui/components/NumberField';
import { RadioGroup } from '@repo/ui/components/RadioGroup';
import { Readout } from '@repo/ui/components/Readout';
import { SectionHeading } from '@repo/ui/components/SectionHeading';
import { Segmented } from '@repo/ui/components/Segmented';
import { Select } from '@repo/ui/components/Select';
import { ShellWrapper } from '@repo/ui/components/ShellWrapper';
import { Slider } from '@repo/ui/components/Slider';
import { Stack } from '@repo/ui/components/Stack';
import { Stage } from '@repo/ui/components/Stage';
import { Swatch } from '@repo/ui/components/Swatch';
import { TextInput } from '@repo/ui/components/TextInput';
import { Toggle } from '@repo/ui/components/Toggle';
import { useTheme, type Theme } from '@repo/ui/hooks/useTheme';
import type { Background, Borders, Elevation, Radius } from '@repo/ui/recipes/surface';
import type { ColorNames } from '@repo/ui/tokens/tint.stylex';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

const ALL_COLORS: readonly ColorNames[] = [
    'neutral',
    'aurora',
    'solder',
    'purple',
    'amber',
    'error',
    'aqua',
    'orange',
];

const styles = stylex.create({
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    controlsGrid: {
        display: 'grid',
        gridTemplateColumns: {
            default: 'repeat(auto-fit, minmax(280px, 1fr))',
        },
        gap: '16px',
    },
    swatchGrid: {
        display: 'grid',
        gridTemplateColumns: {
            default: 'repeat(auto-fill, minmax(140px, 1fr))',
        },
        gap: '12px',
    },
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
});

export function App() {
    const [theme, setTheme] = useTheme();
    const [panelPlacement, setPanelPlacement] = useState<'docked' | 'floating'>('docked');

    // Surface Studio state (live interactive card testing)
    const [activeColor, setActiveColor] = useState<ColorNames>('aurora');
    const [activeBg, setActiveBg] = useState<Background>('soft');
    const [activeBorder, setActiveBorder] = useState<Borders>('subtle');
    const [activeRadius, setActiveRadius] = useState<Radius>('md');
    const [activeElevation, setActiveElevation] = useState<Elevation>('raised');
    const [isDisabled, setIsDisabled] = useState(false);

    // Interactive form values
    const [sliderVal, setSliderVal] = useState(64);
    const [speedVal, setSpeedVal] = useState(1.2);
    const [toggleVal, setToggleVal] = useState(true);
    const [checkboxVal, setCheckboxVal] = useState(true);
    const [radioVal, setRadioVal] = useState('balanced');
    const [numberVal, setNumberVal] = useState(42);
    const [textVal, setTextVal] = useState('kernel_frag_atlas');
    const [colorHex, setColorHex] = useState('#34d399');

    return (
        <ErrorBoundary showStack={import.meta.env.DEV}>
            <ShellWrapper>
                <ExperimentShell
                    panelPlacement={panelPlacement}
                    panel={
                        <ControlPanel label="Laboratory Workbench Controls">
                            <ControlSection title="Environment & Shell">
                                <Select
                                    label="Theme"
                                    value={theme}
                                    onValueChange={(val) => setTheme(val as Theme)}
                                    options={[
                                        { value: 'system', label: 'System' },
                                        { value: 'light', label: 'Light' },
                                        { value: 'dark', label: 'Dark' },
                                    ]}
                                />
                                <Segmented
                                    label="Panel Placement"
                                    value={panelPlacement}
                                    onValueChange={(val) =>
                                        setPanelPlacement(val as 'docked' | 'floating')
                                    }
                                    options={[
                                        { value: 'docked', label: 'Docked' },
                                        { value: 'floating', label: 'Floating' },
                                    ]}
                                />
                                <Toggle
                                    label="Simulate Disabled State"
                                    checked={isDisabled}
                                    onCheckedChange={setIsDisabled}
                                />
                            </ControlSection>

                            <ControlSection title="Live Surface Studio">
                                <Select
                                    label="Surface Color"
                                    value={activeColor}
                                    onValueChange={(val) => setActiveColor(val as ColorNames)}
                                    options={ALL_COLORS.map((c) => ({ value: c, label: c }))}
                                />
                                <Segmented
                                    label="Background"
                                    value={activeBg}
                                    onValueChange={(val) => setActiveBg(val as Background)}
                                    options={[
                                        { value: 'solid', label: 'Solid' },
                                        { value: 'soft', label: 'Soft' },
                                        { value: 'none', label: 'None' },
                                    ]}
                                />
                                <Segmented
                                    label="Border"
                                    value={activeBorder}
                                    onValueChange={(val) => setActiveBorder(val as Borders)}
                                    options={[
                                        { value: 'none', label: 'None' },
                                        { value: 'subtle', label: 'Subtle' },
                                        { value: 'strong', label: 'Strong' },
                                    ]}
                                />
                                <Segmented
                                    label="Radius"
                                    value={activeRadius}
                                    onValueChange={(val) => setActiveRadius(val as Radius)}
                                    options={[
                                        { value: 'none', label: '0' },
                                        { value: 'sm', label: 'SM' },
                                        { value: 'md', label: 'MD' },
                                        { value: 'lg', label: 'LG' },
                                        { value: 'full', label: 'Full' },
                                    ]}
                                />
                                <Segmented
                                    label="Elevation"
                                    value={activeElevation}
                                    onValueChange={(val) => setActiveElevation(val as Elevation)}
                                    options={[
                                        { value: 'flat', label: 'Flat' },
                                        { value: 'raised', label: 'Raised' },
                                        { value: 'sunken', label: 'Sunken' },
                                    ]}
                                />
                            </ControlSection>

                            <ControlSection title="Lab Parameters">
                                <Slider
                                    label="Compute Load"
                                    min={0}
                                    max={100}
                                    value={sliderVal}
                                    onValueChange={setSliderVal}
                                    color={activeColor}
                                />
                                <Toggle
                                    label="GPGPU Double-Buffer"
                                    checked={toggleVal}
                                    onCheckedChange={setToggleVal}
                                    color={activeColor}
                                />
                                <NumberField
                                    label="Iteration Cycles"
                                    min={1}
                                    max={1000}
                                    value={numberVal}
                                    onValueChange={setNumberVal}
                                />
                            </ControlSection>

                            <ControlSection title="System Diagnostics">
                                <Stack direction="vertical" gap="2">
                                    <Readout
                                        label="PIPELINE"
                                        value="SYNCHRONIZED"
                                        color="solder"
                                        background="soft"
                                    />
                                    <Readout
                                        label="BACKDROP"
                                        value="DARK VEIL"
                                        color="aqua"
                                        background="soft"
                                    />
                                </Stack>
                            </ControlSection>
                        </ControlPanel>
                    }
                >
                    <Stage label="Component Workbench Stage">
                        {/* Section 1: Live Composition Studio */}
                        <Card
                            color={activeColor}
                            background={activeBg}
                            border={activeBorder}
                            radius={activeRadius}
                            elevation={activeElevation}
                        >
                            <div {...stylex.props(styles.cardContent)}>
                                <SectionHeading
                                    index="01"
                                    title="Live Surface Composition Studio"
                                    color={activeColor}
                                />
                                <Stack direction="horizontal" gap="3">
                                    <Badge color={activeColor} background="solid">
                                        Color: {activeColor}
                                    </Badge>
                                    <Badge color={activeColor} background="soft">
                                        Bg: {activeBg}
                                    </Badge>
                                    <Badge color={activeColor} border="subtle">
                                        Radius: {activeRadius}
                                    </Badge>
                                    <Badge color={activeColor} elevation="raised">
                                        Elevation: {activeElevation}
                                    </Badge>
                                    <div {...stylex.props(styles.statusRow)}>
                                        <Led color={activeColor} live={true} />
                                        <Readout
                                            label="LED"
                                            value="ONLINE"
                                            color={activeColor}
                                            background="soft"
                                        />
                                    </div>
                                </Stack>

                                <Stack direction="horizontal" gap="3">
                                    <Button
                                        color={activeColor}
                                        background="solid"
                                        radius={activeRadius}
                                        elevation={activeElevation}
                                        disabled={isDisabled}
                                    >
                                        Solid Action
                                    </Button>
                                    <Button
                                        color={activeColor}
                                        background="soft"
                                        border={activeBorder}
                                        radius={activeRadius}
                                        disabled={isDisabled}
                                    >
                                        Soft Action
                                    </Button>
                                    <Button
                                        color={activeColor}
                                        background="none"
                                        border={activeBorder}
                                        radius={activeRadius}
                                        disabled={isDisabled}
                                    >
                                        Ghost Action
                                    </Button>
                                    <Button
                                        color="error"
                                        background="soft"
                                        border="subtle"
                                        radius={activeRadius}
                                        disabled={isDisabled}
                                    >
                                        Reset Settings
                                    </Button>
                                </Stack>

                                <Stack direction="horizontal" gap="3">
                                    <Readout
                                        label="ACTIVE VALUE"
                                        value={`${sliderVal}%`}
                                        color={activeColor}
                                    />
                                    <Readout
                                        label="SEED"
                                        value={`0x${numberVal.toString(16).toUpperCase()}`}
                                        color="neutral"
                                    />
                                    <Readout
                                        label="SYNC"
                                        value={toggleVal ? 'LOCKED' : 'FREE'}
                                        color={toggleVal ? 'solder' : 'amber'}
                                    />
                                </Stack>
                            </div>
                        </Card>

                        {/* Section 2: Buttons & States Matrix */}
                        <Card color="neutral" background="soft" border="subtle" radius="md">
                            <div {...stylex.props(styles.cardContent)}>
                                <SectionHeading
                                    index="02"
                                    title="Button Palette & Surface Variants"
                                    color="aurora"
                                />

                                <ControlField label="Solid Palette (Action Primary)">
                                    <Stack direction="horizontal" gap="2">
                                        {ALL_COLORS.map((col) => (
                                            <Button
                                                key={col}
                                                color={col}
                                                background="solid"
                                                disabled={isDisabled}
                                            >
                                                {col}
                                            </Button>
                                        ))}
                                    </Stack>
                                </ControlField>

                                <ControlField label="Soft Palette (Action Secondary / Chips)">
                                    <Stack direction="horizontal" gap="2">
                                        {ALL_COLORS.map((col) => (
                                            <Button
                                                key={col}
                                                color={col}
                                                background="soft"
                                                border="subtle"
                                                disabled={isDisabled}
                                            >
                                                {col}
                                            </Button>
                                        ))}
                                    </Stack>
                                </ControlField>

                                <ControlField label="Ghost & Outlined Palette">
                                    <Stack direction="horizontal" gap="2">
                                        {ALL_COLORS.map((col) => (
                                            <Button
                                                key={col}
                                                color={col}
                                                background="none"
                                                border="strong"
                                                disabled={isDisabled}
                                            >
                                                {col}
                                            </Button>
                                        ))}
                                    </Stack>
                                </ControlField>
                            </div>
                        </Card>

                        {/* Section 3: Input Controls & Sliders */}
                        <Card color="neutral" background="soft" border="subtle" radius="md">
                            <div {...stylex.props(styles.cardContent)}>
                                <SectionHeading
                                    index="03"
                                    title="Sliders, Toggles & Interactive Inputs"
                                    color="solder"
                                />

                                <div {...stylex.props(styles.controlsGrid)}>
                                    <Slider
                                        label="Modulation Frequency"
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={sliderVal}
                                        onValueChange={setSliderVal}
                                        color="aqua"
                                        disabled={isDisabled}
                                    />
                                    <Slider
                                        label="Angular Velocity"
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        value={speedVal}
                                        onValueChange={setSpeedVal}
                                        color="purple"
                                        disabled={isDisabled}
                                    />
                                    <NumberField
                                        label="Buffer Allocation (MB)"
                                        min={8}
                                        max={512}
                                        step={8}
                                        value={numberVal}
                                        onValueChange={setNumberVal}
                                        disabled={isDisabled}
                                    />
                                    <ColorField
                                        label="Palette Master Tint"
                                        value={colorHex}
                                        onValueChange={setColorHex}
                                        color="aqua"
                                        live={true}
                                        disabled={isDisabled}
                                    />
                                </div>

                                <div {...stylex.props(styles.controlsGrid)}>
                                    <Toggle
                                        label="Hardware Tessellation Shader"
                                        checked={toggleVal}
                                        onCheckedChange={setToggleVal}
                                        color="solder"
                                        disabled={isDisabled}
                                    />
                                    <Toggle
                                        label="Chromatic Aberration Post-Pass"
                                        defaultChecked={false}
                                        color="purple"
                                        disabled={isDisabled}
                                    />
                                    <Checkbox
                                        label="Multi-Sample Anti-Aliasing (MSAA 4x)"
                                        checked={checkboxVal}
                                        onCheckedChange={setCheckboxVal}
                                        color="aurora"
                                        disabled={isDisabled}
                                    />
                                    <Checkbox
                                        label="Anisotropic Texture Filtering"
                                        defaultChecked={true}
                                        color="neutral"
                                        disabled={isDisabled}
                                    />
                                </div>

                                <div {...stylex.props(styles.controlsGrid)}>
                                    <RadioGroup
                                        label="Precision Target"
                                        options={[
                                            { value: 'performance', label: '16-bit Float (Fast)' },
                                            { value: 'balanced', label: '32-bit Float (Standard)' },
                                            { value: 'cinematic', label: '64-bit IEEE Double' },
                                        ]}
                                        value={radioVal}
                                        onValueChange={setRadioVal}
                                        color="amber"
                                        disabled={isDisabled}
                                    />
                                    <Segmented
                                        label="Render Mode Pipeline"
                                        options={[
                                            { value: 'wire', label: 'Wireframe' },
                                            { value: 'shaded', label: 'Shaded' },
                                            { value: 'gpgpu', label: 'GPGPU State' },
                                        ]}
                                        defaultValue="shaded"
                                        color="aqua"
                                        disabled={isDisabled}
                                    />
                                </div>

                                <div {...stylex.props(styles.controlsGrid)}>
                                    <TextInput
                                        label="GLSL Entry Identifier"
                                        value={textVal}
                                        onValueChange={setTextVal}
                                        disabled={isDisabled}
                                    />
                                    <TextInput
                                        label="Fault Injection Test"
                                        defaultValue="err_overflow_matrix"
                                        invalid={true}
                                        errorMessage="Index out of range in vertex layout stream"
                                        disabled={isDisabled}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* Section 4: Readouts, Status & Leds */}
                        <Card color="neutral" background="soft" border="subtle" radius="md">
                            <div {...stylex.props(styles.cardContent)}>
                                <SectionHeading
                                    index="04"
                                    title="Telemetry Readouts & Status Indicators"
                                    color="amber"
                                />

                                <ControlField label="Diagnostic Metrics Bar">
                                    <Stack direction="horizontal" gap="3">
                                        <Readout
                                            label="FPS"
                                            value="59.98"
                                            color="solder"
                                            background="solid"
                                        />
                                        <Readout
                                            label="GPGPU CYCLES"
                                            value={`${sliderVal * 120} /s`}
                                            color="aqua"
                                            background="soft"
                                        />
                                        <Readout
                                            label="VRAM USE"
                                            value={`${numberVal * 2.4} MB`}
                                            color="neutral"
                                            background="soft"
                                        />
                                        <Readout
                                            label="UNIFORM STATE"
                                            value={radioVal.toUpperCase()}
                                            color="amber"
                                            background="soft"
                                        />
                                        <Readout
                                            label="PASS TIMING"
                                            value={`${(speedVal * 4.2).toFixed(2)} ms`}
                                            color="purple"
                                            background="soft"
                                        />
                                    </Stack>
                                </ControlField>

                                <ControlField label="LED Hardware Status Array">
                                    <Stack direction="horizontal" gap="4">
                                        {ALL_COLORS.map((col) => (
                                            <div key={col} {...stylex.props(styles.statusRow)}>
                                                <Led
                                                    color={col}
                                                    live={col === 'solder' || col === 'aqua'}
                                                />
                                                <Badge
                                                    color={col}
                                                    background="none"
                                                    border="subtle"
                                                >
                                                    {col}
                                                </Badge>
                                            </div>
                                        ))}
                                    </Stack>
                                </ControlField>
                            </div>
                        </Card>

                        {/* Section 5: Design Tokens & Palette Swatches */}
                        <Card color="neutral" background="soft" border="subtle" radius="md">
                            <div {...stylex.props(styles.cardContent)}>
                                <SectionHeading
                                    index="05"
                                    title="Palette Tokens & Surface Recipes"
                                    color="purple"
                                />

                                <div {...stylex.props(styles.swatchGrid)}>
                                    {ALL_COLORS.map((col) => (
                                        <Swatch
                                            key={col}
                                            color={col}
                                            background="solid"
                                            border="strong"
                                            radius="sm"
                                            name={col}
                                            meta="Solid / Strong"
                                        />
                                    ))}
                                    {ALL_COLORS.map((col) => (
                                        <Swatch
                                            key={`${col}-soft`}
                                            color={col}
                                            background="soft"
                                            border="subtle"
                                            radius="sm"
                                            name={`${col} soft`}
                                            meta="Soft / Subtle"
                                        />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </Stage>
                </ExperimentShell>
            </ShellWrapper>
        </ErrorBoundary>
    );
}
