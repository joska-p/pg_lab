import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ColorField,
  ControlField,
  ControlPanel,
  ControlSection,
  ExperimentShell,
  NumberField,
  Page,
  RadioGroup,
  Readout,
  SectionHeading,
  Select,
  Segmented,
  Slider,
  Stack,
  Stage,
  Swatch,
  Text,
  TextArea,
  TextInput,
  Toggle,
} from "@repo/ui";

const BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "warning",
  "destructive",
  "muted",
] as const;

const WAVES = ["sine", "saw", "square", "triangle"] as const;
type Wave = (typeof WAVES)[number];

const FILTERS = ["lowpass", "highpass", "bandpass"] as const;
type Filter = (typeof FILTERS)[number];

const QUALITIES = [
  { value: "lo", label: "lo-fi" },
  { value: "hi", label: "hi-fi" },
] as const;
type Quality = (typeof QUALITIES)[number]["value"];

const TINTS = ["#83a598", "#d3869b", "#b8bb26", "#fe8019", "#8ec07c"] as const;

type Synth = {
  name: string;
  voices: number;
  wave: Wave;
  filter: Filter;
  cutoff: number;
  quality: Quality;
  tint: string;
  glide: boolean;
  mute: boolean;
  notes: string;
};

const DEFAULT_SYNTH: Synth = {
  name: "bass-01",
  voices: 8,
  wave: "saw",
  filter: "lowpass",
  cutoff: 62,
  quality: "hi",
  tint: "#83a598",
  glide: false,
  mute: false,
  notes: "",
};

function Hero() {
  return (
    <Stack gap={3}>
      <Stack direction="horizontal" gap={2} wrap>
        <Badge>dark</Badge>
        <Badge>compact</Badge>
        <Badge>tactile</Badge>
        <Badge>luminous</Badge>
      </Stack>
      <SectionHeading index="00" title="repo/ui" />
      <Text tone="muted">
        A small toolkit for creative mini-apps. Canvas first, panel second — and this page imports
        nothing but components.
      </Text>
    </Stack>
  );
}

function FakeSynth() {
  const [synth, setSynth] = useState<Synth>(DEFAULT_SYNTH);

  function patch(next: Partial<Synth>) {
    setSynth((current) => ({ ...current, ...next }));
  }

  function randomize() {
    setSynth((current) => ({
      ...current,
      voices: 1 + Math.floor(Math.random() * 16),
      cutoff: Math.floor(Math.random() * 101),
      wave: WAVES[Math.floor(Math.random() * WAVES.length)] ?? "saw",
      filter: FILTERS[Math.floor(Math.random() * FILTERS.length)] ?? "lowpass",
      tint: TINTS[Math.floor(Math.random() * TINTS.length)] ?? "#83a598",
      mute: false,
    }));
  }

  return (
    <Stack gap={3}>
      <SectionHeading index="01" title="fake app" />
      <ExperimentShell
        placement="docked"
        panel={
          <ControlPanel title="mini synth">
            <ControlSection title="voice">
              <TextInput
                label="name"
                value={synth.name}
                onValueChange={(name) => patch({ name })}
                placeholder="patch-01"
              />
              <NumberField
                label="voices"
                min={1}
                max={16}
                value={synth.voices}
                onValueChange={(voices) => patch({ voices })}
              />
              <Select
                label="wave"
                options={WAVES}
                value={synth.wave}
                onValueChange={(wave) => patch({ wave })}
              />
              <RadioGroup
                label="filter"
                options={FILTERS}
                value={synth.filter}
                onValueChange={(filter) => patch({ filter })}
              />
            </ControlSection>

            <ControlSection title="tone">
              <Slider
                label="cutoff"
                min={0}
                max={100}
                value={synth.cutoff}
                onValueChange={(cutoff) => patch({ cutoff })}
              />
              <Segmented<Quality>
                label="quality"
                options={QUALITIES}
                value={synth.quality}
                onValueChange={(quality) => patch({ quality })}
              />
              <ColorField
                label="tint"
                value={synth.tint}
                onValueChange={(tint) => patch({ tint })}
              />
              <Checkbox
                label="glide"
                checked={synth.glide}
                onCheckedChange={(glide) => patch({ glide })}
              />
              <Toggle
                label="mute"
                checked={synth.mute}
                onCheckedChange={(mute) => patch({ mute })}
              />
            </ControlSection>

            <ControlSection title="notes">
              <TextArea
                label="scribble"
                rows={2}
                value={synth.notes}
                onValueChange={(notes) => patch({ notes })}
                placeholder="how does it sound?"
              />
              <ControlField label="actions">
                <Stack direction="horizontal" gap={2} wrap>
                  <Button variant="secondary" onClick={randomize}>
                    randomize
                  </Button>
                  <Button variant="muted" onClick={() => setSynth(DEFAULT_SYNTH)}>
                    reset
                  </Button>
                </Stack>
              </ControlField>
              <Readout
                label="out"
                value={`${synth.wave} · ${synth.voices}v · ${synth.mute ? "muted" : "live"}`}
              />
            </ControlSection>
          </ControlPanel>
        }
      >
        <Stage label="synth stage">
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              background: `radial-gradient(120% 120% at 25% 20%, ${synth.tint}59, transparent 60%), linear-gradient(135deg, #14141b, #23232e)`,
              opacity: synth.mute ? 0.45 : 1,
              transition: "opacity 200ms",
            }}
          >
            <Readout
              label={synth.name}
              value={`${synth.wave} · ${synth.filter} · ${synth.cutoff}`}
            />
          </div>
        </Stage>
      </ExperimentShell>
    </Stack>
  );
}

function Controls() {
  return (
    <Stack gap={3}>
      <SectionHeading index="02" title="controls" />

      <Card>
        <ControlSection title="Button">
          <Stack direction="horizontal" gap={2} wrap>
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </Stack>
          <Stack direction="horizontal" gap={2} wrap>
            <Button>default</Button>
            <Button loading>loading</Button>
            <Button disabled>disabled</Button>
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="Slider">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <Slider
                key={variant}
                label={variant}
                variant={variant}
                min={0}
                max={100}
                defaultValue={62}
              />
            ))}
            <Slider label="disabled" min={0} max={100} defaultValue={40} disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="Toggle">
          <Stack direction="horizontal" gap={3} wrap>
            {BUTTON_VARIANTS.map((variant) => (
              <Toggle key={variant} label={variant} variant={variant} defaultChecked />
            ))}
          </Stack>
          <Toggle label="off" />
          <Toggle label="disabled" disabled defaultChecked />
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="Checkbox">
          <Stack direction="horizontal" gap={3} wrap>
            {BUTTON_VARIANTS.map((variant) => (
              <Checkbox key={variant} label={variant} variant={variant} defaultChecked />
            ))}
          </Stack>
          <Checkbox label="off" />
          <Checkbox label="disabled" disabled defaultChecked />
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="Segmented">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <Segmented
                key={variant}
                label={variant}
                variant={variant}
                options={["one", "two"]}
                defaultValue="two"
              />
            ))}
            <Segmented label="disabled" options={["one", "two"]} defaultValue="one" disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="Select">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <Select
                key={variant}
                label={variant}
                variant={variant}
                options={["one", "two"]}
                defaultValue="two"
              />
            ))}
            <Select label="disabled" options={["one", "two"]} defaultValue="one" disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="RadioGroup">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <RadioGroup
                key={variant}
                label={variant}
                variant={variant}
                options={["one", "two"]}
                defaultValue="two"
              />
            ))}
            <RadioGroup label="disabled" options={["one", "two"]} defaultValue="one" disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="TextInput">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <TextInput key={variant} label={variant} variant={variant} defaultValue={variant} />
            ))}
            <TextInput label="disabled" defaultValue="frozen" disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="NumberField">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <NumberField
                key={variant}
                label={variant}
                variant={variant}
                min={0}
                max={100}
                defaultValue={62}
              />
            ))}
            <NumberField label="disabled" min={0} max={100} defaultValue={40} disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="TextArea">
          <Stack gap={3}>
            {BUTTON_VARIANTS.map((variant) => (
              <TextArea
                key={variant}
                label={variant}
                variant={variant}
                rows={2}
                defaultValue={variant}
              />
            ))}
            <TextArea label="disabled" defaultValue="frozen" disabled />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="ColorField">
          <ColorField label="warm tint" defaultValue="#b8bb26" />
          <ColorField label="disabled" disabled defaultValue="#d3869b" />
        </ControlSection>
      </Card>
    </Stack>
  );
}

function Foundations() {
  return (
    <Stack gap={3}>
      <SectionHeading index="03" title="foundations" />

      <Card>
        <ControlSection title="surfaces">
          <Stack direction="horizontal" gap={3} wrap>
            <Swatch swatch="background" meta="app ground" />
            <Swatch swatch="card" meta="raised" />
            <Swatch swatch="popover" meta="floating" />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="families">
          <Stack direction="horizontal" gap={3} wrap>
            <Swatch swatch="primary" meta="primaryForeground" />
            <Swatch swatch="secondary" meta="secondaryForeground" />
            <Swatch swatch="accent" meta="accentForeground" />
            <Swatch swatch="warning" meta="warningForeground" />
            <Swatch swatch="success" meta="successForeground" />
            <Swatch swatch="destructive" meta="destructiveForeground" />
            <Swatch swatch="muted" meta="mutedForeground" />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="type">
          <Text>Body copy stays compact and readable. No oversized headings.</Text>
          <Text tone="muted">Muted carries secondary information without competing.</Text>
        </ControlSection>
      </Card>
    </Stack>
  );
}

function App() {
  return (
    <Page>
      <Hero />
      <FakeSynth />
      <Controls />
      <Foundations />
      <Stack direction="horizontal" gap={4} wrap>
        <Text tone="muted">built on @repo/ui</Text>
        <Text tone="muted">components only · no raw values</Text>
      </Stack>
    </Page>
  );
}

export default App;
