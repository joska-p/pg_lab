import { useState } from "react";
import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { borderWidth, radius, space } from "@repo/ui/tokens/layout.stylex";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { Checkbox } from "@repo/ui/components/Checkbox";
import { ColorField } from "@repo/ui/components/ColorField";
import { ControlField } from "@repo/ui/components/ControlField";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { ErrorBoundary } from "@repo/ui/components/ErrorBoundary";
import { Led } from "@repo/ui/components/Led";
import { NumberField } from "@repo/ui/components/NumberField";
import { RadioGroup } from "@repo/ui/components/RadioGroup";
import { Readout } from "@repo/ui/components/Readout";
import { SectionHeading } from "@repo/ui/components/SectionHeading";
import { Segmented } from "@repo/ui/components/Segmented";
import { Select } from "@repo/ui/components/Select";
import { Slider } from "@repo/ui/components/Slider";
import { Stack } from "@repo/ui/components/Stack";
import { Stage } from "@repo/ui/components/Stage";
import { Swatch } from "@repo/ui/components/Swatch";
import { Text } from "@repo/ui/components/Text";
import { TextArea } from "@repo/ui/components/TextArea";
import { TextInput } from "@repo/ui/components/TextInput";
import { Toggle } from "@repo/ui/components/Toggle";

// ─── Styles ───────────────────────────────────────────────────────────────────

const leadStyles = stylex.create({
  container: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["2"],
    paddingBlock: space["1"],
    paddingInline: space["2"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.input,
    width: "fit-content",
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────

const ALL_FAMILIES = [
  "aurora",
  "solder",
  "neon-violet",
  "amber",
  "error",
  "aqua",
  "orange",
] as const;

const WAVES = ["sine", "saw", "square", "triangle"] as const;
type Wave = (typeof WAVES)[number];

const FILTERS = ["lowpass", "highpass", "bandpass"] as const;
type Filter = (typeof FILTERS)[number];

const TINTS = ["#83a598", "#d3869b", "#b8bb26", "#fe8019", "#8ec07c"] as const;

type Synth = {
  name: string;
  voices: number;
  wave: Wave;
  filter: Filter;
  cutoff: number;
  tint: string;
  glide: boolean;
  mute: boolean;
};

const DEFAULT_SYNTH: Synth = {
  name: "bass-01",
  voices: 8,
  wave: "saw",
  filter: "lowpass",
  cutoff: 62,
  tint: "#83a598",
  glide: false,
  mute: false,
};

// ─── Section 00 · Live Demo ───────────────────────────────────────────────────

type LiveDemoProps = {
  synth: Synth;
  onPatch: (next: Partial<Synth>) => void;
  onRandomize: () => void;
  onReset: () => void;
};

function LiveDemo({ synth, onPatch, onRandomize, onReset }: LiveDemoProps) {
  return (
    <Stack gap="8">
      <SectionHeading index="00" title="live · demo" />

      <Card variant="raised">
        <ControlSection title="Mini Synth">
          <TextInput label="name" value={synth.name} onValueChange={(name) => onPatch({ name })} />
          <NumberField
            label="voices"
            min={1}
            max={16}
            value={synth.voices}
            onValueChange={(voices) => onPatch({ voices })}
          />
          <Select
            label="wave"
            options={WAVES}
            value={synth.wave}
            onValueChange={(wave) => onPatch({ wave })}
          />
          <RadioGroup
            label="filter"
            options={FILTERS}
            value={synth.filter}
            onValueChange={(filter) => onPatch({ filter })}
          />
          <Slider
            label="cutoff"
            min={0}
            max={100}
            value={synth.cutoff}
            onValueChange={(cutoff) => onPatch({ cutoff })}
          />
          <ColorField label="tint" value={synth.tint} onValueChange={(tint) => onPatch({ tint })} />
          <Checkbox
            label="glide"
            checked={synth.glide}
            onCheckedChange={(glide) => onPatch({ glide })}
          />
          <Toggle label="mute" checked={synth.mute} onCheckedChange={(mute) => onPatch({ mute })} />
          <ControlField label="actions">
            <Stack direction="horizontal" gap="8" wrap>
              <Button onClick={onRandomize}>randomize</Button>
              <Button onClick={onReset}>reset</Button>
            </Stack>
          </ControlField>
          <Readout
            label="out"
            value={`${synth.wave} · ${synth.voices}v · ${synth.mute ? "muted" : "live"}`}
          />
        </ControlSection>
      </Card>
    </Stack>
  );
}

// ─── Section 01 · Cards ───────────────────────────────────────────────────────

const CARD_VARIANTS = ["surface", "raised", "sunken"] as const;

function CardsSection() {
  return (
    <Stack gap="8">
      <SectionHeading index="01" title="cards" />
      <Stack direction="horizontal" gap="8" wrap>
        {CARD_VARIANTS.map((variant) => (
          <Card key={variant} variant={variant}>
            <ControlSection title={variant}>
              <Segmented label="level" options={["1", "2", "3"]} defaultValue="2" family="amber" />
              <Readout label="gain" value="+6 dB" />
            </ControlSection>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

// ─── Section 02 · Controls ────────────────────────────────────────────────────

function ControlsSection() {
  return (
    <Stack gap="8">
      <SectionHeading index="02" title="controls" />
      <Stack direction="vertical" gap="8" wrap>
        <Card variant="surface">
          <ControlSection title="Button">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <Button key={f} family={f}>
                  {f}
                </Button>
              ))}
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Slider">
            <Stack gap="8">
              {ALL_FAMILIES.map((f) => (
                <Slider key={f} label={f} family={f} min={0} max={100} defaultValue={62} />
              ))}
              <Slider label="disabled" min={0} max={100} defaultValue={40} disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Toggle">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <Toggle key={f} label={f} family={f} defaultChecked />
              ))}
              <Toggle label="off" />
              <Toggle label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Checkbox">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <Checkbox key={f} label={f} family={f} defaultChecked />
              ))}
              <Checkbox label="off" />
              <Checkbox label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Segmented">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <Segmented
                  key={f}
                  label={f}
                  family={f}
                  options={["one", "two"]}
                  defaultValue="two"
                />
              ))}
              <Segmented label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Select">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <Select key={f} label={f} family={f} options={["one", "two"]} defaultValue="two" />
              ))}
              <Select label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="RadioGroup">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <RadioGroup
                  key={f}
                  label={f}
                  family={f}
                  options={["one", "two"]}
                  defaultValue="two"
                />
              ))}
              <RadioGroup label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="TextInput">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <TextInput key={f} label={f} family={f} defaultValue={f} />
              ))}
              <TextInput label="disabled" defaultValue="frozen" disabled />
              <TextInput
                label="invalid"
                invalid
                errorMessage="missing value — enter a valid patch name"
                defaultValue="bass-01"
              />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="NumberField">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <NumberField key={f} label={f} family={f} min={0} max={100} defaultValue={62} />
              ))}
              <NumberField label="disabled" min={0} max={100} defaultValue={40} disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="TextArea">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {ALL_FAMILIES.map((f) => (
                <TextArea key={f} label={f} family={f} rows={2} defaultValue={f} />
              ))}
              <TextArea label="disabled" defaultValue="frozen" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="ColorField">
            <ColorField label="warm tint" defaultValue="#b8bb26" />
            <ColorField label="disabled" disabled defaultValue="#d3869b" />
          </ControlSection>
        </Card>
      </Stack>
    </Stack>
  );
}

// ─── Section 03 · Display ─────────────────────────────────────────────────────

function DisplaySection() {
  return (
    <Stack gap="8">
      <SectionHeading index="03" title="display" />
      <Stack direction="horizontal" gap="8" wrap>
        <Card variant="surface">
          <ControlSection title="Badge">
            <Stack direction="horizontal" gap="8" wrap>
              {ALL_FAMILIES.map((f) => (
                <Badge key={f} family={f}>
                  {f}
                </Badge>
              ))}
              <Badge family="solder" live>
                live
              </Badge>
              <Badge>neutral</Badge>
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Led">
            <Stack direction="horizontal" gap="8" wrap>
              {ALL_FAMILIES.map((f) => (
                <Stack key={f} direction="horizontal" gap="3">
                  <Led color={f} />
                  <Led color={f} live />
                  <Led color={f} off />
                </Stack>
              ))}
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Readout">
            <Readout label="cutoff" value="62 Hz" />
            <Readout label="wave" value="saw · 8v" />
            <Readout label="status" value="live · running" />
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="Text">
            <Text>Body copy stays compact and readable. No oversized headings.</Text>
            <Text variant="muted">Muted carries secondary information without competing.</Text>
          </ControlSection>
        </Card>
      </Stack>
    </Stack>
  );
}

// ─── Section 04 · Foundations ────────────────────────────────────────────────

function FoundationsSection() {
  return (
    <Stack gap="8">
      <SectionHeading index="04" title="foundations" />
      <Stack direction="horizontal" gap="8" wrap>
        <Card variant="surface">
          <ControlSection title="surfaces">
            <Stack direction="horizontal" gap="8" wrap>
              <Swatch variant="background" meta="app ground" />
              <Swatch variant="card" meta="raised" />
              <Swatch variant="popover" meta="floating" />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface">
          <ControlSection title="families">
            <Stack direction="horizontal" gap="8" wrap>
              {ALL_FAMILIES.map((f) => (
                <Stack key={f} direction="horizontal" gap="3" wrap>
                  <Swatch variant={f} meta={`${f} base`} />
                  <Swatch variant={f} tension="strong" meta={`${f} strong`} />
                </Stack>
              ))}
            </Stack>
          </ControlSection>
        </Card>
      </Stack>
    </Stack>
  );
}

// ─── Section 05 · Resilience ──────────────────────────────────────────────────

function ThrowOnRender({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("demo crash — the boundary caught it");
  return <Readout label="status" value="stable · nothing thrown" />;
}

function CrashDemo({ title, fallback }: { title: string; fallback?: ReactNode }) {
  const [crashed, setCrashed] = useState(false);
  const [runId, setRunId] = useState(0);

  return (
    <Card variant="surface">
      <ControlSection title={title}>
        <ErrorBoundary key={runId} fallback={fallback} showStack={false}>
          <ThrowOnRender shouldThrow={crashed} />
        </ErrorBoundary>
        <Stack direction="horizontal" gap="8" wrap>
          <Button onClick={() => setCrashed(true)}>throw</Button>
          <Button
            onClick={() => {
              setCrashed(false);
              setRunId((id) => id + 1);
            }}
          >
            reset
          </Button>
        </Stack>
      </ControlSection>
    </Card>
  );
}

function ResilienceSection() {
  return (
    <Stack gap="8">
      <SectionHeading index="05" title="resilience" />
      <Stack direction="horizontal" gap="8" wrap>
        <CrashDemo title="ErrorBoundary · default" />
        <CrashDemo
          title="ErrorBoundary · fallback"
          fallback={<Readout label="out" value="custom fallback — patched" />}
        />
      </Stack>
    </Stack>
  );
}

// ─── ShowcaseStage ────────────────────────────────────────────────────────────
// Exported: only the Stage content. ExperimentShell + panel live in App.tsx.

export function ShowcaseStage(_props: { synth?: undefined }) {
  const [synth, setSynth] = useState<Synth>(DEFAULT_SYNTH);

  function patchSynth(next: Partial<Synth>) {
    setSynth((current) => ({ ...current, ...next }));
  }

  function randomizeSynth() {
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
    <Stage label="@repo/ui · component inventory">
      <Stack gap="16">
        <div {...stylex.props(leadStyles.container)}>
          <Led color="neon-violet" live />
          <Text variant="muted">Inventory of @repo/ui — components only, no raw values.</Text>
        </div>

        <LiveDemo
          synth={synth}
          onPatch={patchSynth}
          onRandomize={randomizeSynth}
          onReset={() => setSynth(DEFAULT_SYNTH)}
        />
        <CardsSection />
        <ControlsSection />
        <DisplaySection />
        <FoundationsSection />
        <ResilienceSection />
      </Stack>
    </Stage>
  );
}
