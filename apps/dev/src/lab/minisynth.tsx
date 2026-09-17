import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@repo/ui/components/Button";
import { Card } from "@repo/ui/components/Card";
import { ControlField } from "@repo/ui/components/ControlField";
import { Segmented } from "@repo/ui/components/Segmented";
import { Slider } from "@repo/ui/components/Slider";
import { Stack } from "@repo/ui/components/Stack";
import { TextInput } from "@repo/ui/components/TextInput";
import { ExperimentShell } from "@repo/ui/components/ExperimentShell";
import { Stage } from "@repo/ui/components/Stage";
import { Checkbox } from "@repo/ui/components/Checkbox";
import { ColorField } from "@repo/ui/components/ColorField";
import { ControlPanel } from "@repo/ui/components/ControlPanel";
import { ControlSection } from "@repo/ui/components/ControlSection";
import { NumberField } from "@repo/ui/components/NumberField";
import { RadioGroup } from "@repo/ui/components/RadioGroup";
import { Readout } from "@repo/ui/components/Readout";
import { SectionHeading } from "@repo/ui/components/SectionHeading";
import { Select } from "@repo/ui/components/Select";
import { Swatch } from "@repo/ui/components/Swatch";
import { Text } from "@repo/ui/components/Text";
import { TextArea } from "@repo/ui/components/TextArea";
import { Toggle } from "@repo/ui/components/Toggle";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { shadowColor } from "@repo/ui/tokens/shadows.stylex";
import { elevation } from "@repo/ui/effects/elevation.stylex";
import { glass } from "@repo/ui/effects/glass.stylex";
import { glow } from "@repo/ui/effects/glow.stylex";
import { interactiveBase } from "@repo/ui/foundations/interaction.stylex";
import { focusRing } from "@repo/ui/intents/focus.stylex";
import { pressable } from "@repo/ui/intents/pressable.stylex";
import { radius } from "@repo/ui/consts/radius.stylex";
import { borderWidth } from "@repo/ui/consts/borderWidth.stylex";
import { typography } from "@repo/ui/consts/typography.stylex";
import { motion } from "@repo/ui/consts/motion.stylex";
import { interaction } from "@repo/ui/consts/interaction.stylex";
import { space } from "@repo/ui/consts/spacing.stylex";

const BUTTON_FAMILIES = [
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

const layoutStyles = stylex.create({
  half: {
    flex: "1 1 320px",
    minWidth: 0,
  },
});

const elevationTileStyles = stylex.create({
  base: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: space["2"],
    flex: "1 1 160px",
    minHeight: "120px",
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    boxSizing: "border-box",
    backgroundColor: colors.card,
    color: colors.cardForeground,
    [shadowColor.color]: colors.card,
  },
  primary: {
    [shadowColor.color]: colors.primary,
    backgroundColor: colors.primary,
    color: colors.foreground,
  },
  secondary: {
    [shadowColor.color]: colors.secondary,
    backgroundColor: colors.secondary,
    color: colors.foreground,
  },
  muted: {
    [shadowColor.color]: colors.muted,
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
  backdrop: {
    [shadowColor.color]: colors.card,
    backgroundColor: colors.background,
    backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${colors.muted} 35%, transparent), color-mix(in oklab, ${colors.accent} 35%, transparent)), linear-gradient(135deg, ${colors.background}, ${colors.card})`,
    color: colors.cardForeground,
  },
  labelRow: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
  dot: {
    flexShrink: 0,
    width: "7px",
    height: "7px",
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
  },
});

const synthCanvasStyles = stylex.create({
  base: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    padding: space["8"],
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    boxSizing: "border-box",
    backgroundColor: colors.background,
    transitionProperty: "opacity",
    transitionDuration: motion.durationNormal,
    transitionTimingFunction: motion.easingOut,
  },
  canvas: (color: string) => ({
    [shadowColor.color]: color,
    backgroundImage: `radial-gradient(120% 120% at 25% 20%, ${color}59, transparent 60%), linear-gradient(135deg, ${colors.background}, ${colors.card})`,
    color: colors.cardForeground,
  }),
  muted: {
    opacity: interaction.disabledOpacity,
  },
});

const CARD_VARIANTS = ["surface", "raised", "sunken"] as const;

function CardShowcase() {
  return (
    <Stack gap="8">
      <SectionHeading index="01" title="cards" />

      <Stack direction="horizontal" gap="8" wrap>
        {CARD_VARIANTS.map((variant) => (
          <Card key={variant} variant={variant} style={layoutStyles.half}>
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

function Controls() {
  return (
    <Stack gap="8">
      <SectionHeading index="02" title="controls" />

      <Stack direction="horizontal" gap="8" wrap>
        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Button">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <Button key={family} family={family}>
                  {family}
                </Button>
              ))}
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Slider">
            <Stack gap="8">
              {BUTTON_FAMILIES.map((family) => (
                <Slider
                  key={family}
                  label={family}
                  family={family}
                  min={0}
                  max={100}
                  defaultValue={62}
                />
              ))}
              <Slider label="disabled" min={0} max={100} defaultValue={40} disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Toggle">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <Toggle key={family} label={family} family={family} defaultChecked />
              ))}
              <Toggle label="off" />
              <Toggle label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Checkbox">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <Checkbox key={family} label={family} family={family} defaultChecked />
              ))}
              <Checkbox label="off" />
              <Checkbox label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Segmented">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <Segmented
                  key={family}
                  label={family}
                  family={family}
                  options={["one", "two"]}
                  defaultValue="two"
                />
              ))}
              <Segmented label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="Select">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <Select
                  key={family}
                  label={family}
                  family={family}
                  options={["one", "two"]}
                  defaultValue="two"
                />
              ))}
              <Select label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="RadioGroup">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <RadioGroup
                  key={family}
                  label={family}
                  family={family}
                  options={["one", "two"]}
                  defaultValue="two"
                />
              ))}
              <RadioGroup label="disabled" options={["one", "two"]} defaultValue="one" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="TextInput">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <TextInput key={family} label={family} family={family} defaultValue={family} />
              ))}
              <TextInput label="disabled" defaultValue="frozen" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="NumberField">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <NumberField
                  key={family}
                  label={family}
                  family={family}
                  min={0}
                  max={100}
                  defaultValue={62}
                />
              ))}
              <NumberField label="disabled" min={0} max={100} defaultValue={40} disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="TextArea">
            <Stack gap="8" direction="horizontal" wrap justify="between">
              {BUTTON_FAMILIES.map((family) => (
                <TextArea
                  key={family}
                  label={family}
                  family={family}
                  rows={2}
                  defaultValue={family}
                />
              ))}
              <TextArea label="disabled" defaultValue="frozen" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card variant="surface" style={layoutStyles.half}>
          <ControlSection title="ColorField">
            <ColorField label="warm tint" defaultValue="#b8bb26" />
            <ColorField label="disabled" disabled defaultValue="#d3869b" />
          </ControlSection>
        </Card>
      </Stack>
    </Stack>
  );
}

function Foundations() {
  return (
    <Stack gap="8">
      <SectionHeading index="03" title="foundations" />

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
        <ControlSection title="elevation">
          <Stack direction="horizontal" gap="8" wrap>
            <div {...stylex.props(elevationTileStyles.base, elevation.flat)}>
              <span {...stylex.props(elevationTileStyles.labelRow)}>flat · border only</span>
            </div>
            <div
              {...stylex.props(
                elevationTileStyles.base,
                elevationTileStyles.primary,
                elevation.raised,
              )}
            >
              <span {...stylex.props(elevationTileStyles.labelRow)}>raised · tinted</span>
            </div>
            <div
              {...stylex.props(
                elevationTileStyles.base,
                elevationTileStyles.muted,
                elevation.sunken,
              )}
            >
              <span {...stylex.props(elevationTileStyles.labelRow)}>sunken · inset</span>
            </div>
            <div {...stylex.props(elevationTileStyles.base, elevation.floating)}>
              <span {...stylex.props(elevationTileStyles.labelRow)}>floating</span>
            </div>
            <div
              {...stylex.props(elevationTileStyles.base, elevationTileStyles.backdrop, glass.glass)}
            >
              <span {...stylex.props(elevationTileStyles.labelRow)}>glass · over backdrop</span>
            </div>
            <button
              type="button"
              {...stylex.props(
                elevationTileStyles.base,
                elevationTileStyles.secondary,
                interactiveBase.base,
                focusRing.base,
                pressable.base,
              )}
            >
              <span {...stylex.props(elevationTileStyles.labelRow)}>
                press me · rest / hover / active
              </span>
            </button>
            <div {...stylex.props(elevationTileStyles.base, elevation.flat)}>
              <span {...stylex.props(elevationTileStyles.labelRow)}>
                <span aria-hidden {...stylex.props(elevationTileStyles.dot, glow.glowSubtle)} />
                glow = state, not elevation
              </span>
            </div>
          </Stack>
        </ControlSection>
      </Card>

      <Card variant="surface">
        <ControlSection title="families">
          <Stack direction="horizontal" gap="8" wrap>
            <Swatch variant="aurora" meta="aurora base" />
            <Swatch variant="aurora" tension="strong" meta="aurora strong" />
            <Swatch variant="solder" meta="solder base" />
            <Swatch variant="solder" tension="strong" meta="solder strong" />
            <Swatch variant="neon-violet" meta="neon-violet base" />
            <Swatch variant="neon-violet" tension="strong" meta="neon-violet strong" />
            <Swatch variant="amber" meta="amber base" />
            <Swatch variant="amber" tension="strong" meta="amber strong" />
            <Swatch variant="error" meta="error base" />
            <Swatch variant="error" tension="strong" meta="error strong" />
            <Swatch variant="aqua" meta="aqua base" />
            <Swatch variant="aqua" tension="strong" meta="aqua strong" />
            <Swatch variant="orange" meta="orange base" />
            <Swatch variant="orange" tension="strong" meta="orange strong" />
          </Stack>
        </ControlSection>
      </Card>

      <Card variant="surface">
        <ControlSection title="type">
          <Text>Body copy stays compact and readable. No oversized headings.</Text>
          <Text variant="muted">Muted carries secondary information without competing.</Text>
        </ControlSection>
      </Card>
    </Stack>
  );
}

type MiniSynthProps = {
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
};

export function MiniSynth({ theme, onThemeChange }: MiniSynthProps) {
  const [synth, setSynth] = useState<Synth>(DEFAULT_SYNTH);
  const [panelPlacement, setPanelPlacement] = useState<"docked" | "floating">("docked");

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
    <ExperimentShell
      panelPlacement={panelPlacement}
      panel={
        <ControlPanel title="Workspace">
          <ControlSection title="Theme">
            <Segmented<"light" | "dark" | "system">
              options={["light", "dark", "system"]}
              value={theme}
              onValueChange={onThemeChange}
            />
          </ControlSection>

          <ControlSection title="Panel Settings">
            <Segmented<"docked" | "floating">
              options={["docked", "floating"]}
              value={panelPlacement}
              onValueChange={setPanelPlacement}
            />
          </ControlSection>

          <ControlSection title="Mini Synth">
            <TextInput
              label="name"
              value={synth.name}
              onValueChange={(name) => patchSynth({ name })}
            />
            <NumberField
              label="voices"
              min={1}
              max={16}
              value={synth.voices}
              onValueChange={(voices) => patchSynth({ voices })}
            />
            <Select
              label="wave"
              options={WAVES}
              value={synth.wave}
              onValueChange={(wave) => patchSynth({ wave })}
            />
            <RadioGroup
              label="filter"
              options={FILTERS}
              value={synth.filter}
              onValueChange={(filter) => patchSynth({ filter })}
            />
            <Slider
              label="cutoff"
              min={0}
              max={100}
              value={synth.cutoff}
              onValueChange={(cutoff) => patchSynth({ cutoff })}
            />
            <Segmented<Quality>
              label="quality"
              options={QUALITIES}
              value={synth.quality}
              onValueChange={(quality) => patchSynth({ quality })}
            />
            <ColorField
              label="tint"
              value={synth.tint}
              onValueChange={(tint) => patchSynth({ tint })}
            />
            <Checkbox
              label="glide"
              checked={synth.glide}
              onCheckedChange={(glide) => patchSynth({ glide })}
            />
            <Toggle
              label="mute"
              checked={synth.mute}
              onCheckedChange={(mute) => patchSynth({ mute })}
            />
            <TextArea
              label="scribble"
              rows={2}
              value={synth.notes}
              onValueChange={(notes) => patchSynth({ notes })}
            />
            <ControlField label="actions">
              <Stack direction="horizontal" gap="8" wrap>
                <Button onClick={randomizeSynth}>randomize</Button>
                <Button onClick={() => setSynth(DEFAULT_SYNTH)}>reset</Button>
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
      <Stage label="Workspace Stage">
        <Stack gap="8">
          <Stack gap="8">
            <SectionHeading index="00" title="repo/ui" />
            <Text variant="muted">
              A small toolkit for creative mini-apps. Canvas first, panel second — and this page
              imports nothing but components.
            </Text>
          </Stack>

          {/* Synth canvas: colored by the live synth state. */}

          <div
            {...stylex.props(
              synthCanvasStyles.base,
              synthCanvasStyles.canvas(synth.tint),
              synth.mute ? synthCanvasStyles.muted : null,
            )}
          >
            <Readout
              label={synth.name}
              value={`${synth.wave} · ${synth.filter} · ${synth.cutoff}`}
            />
          </div>

          <CardShowcase />

          <Controls />
          <Foundations />
          <Stack direction="horizontal" gap="8" wrap>
            <Text variant="muted">built on @repo/ui</Text>
            <Text variant="muted">components only · no raw values</Text>
          </Stack>
        </Stack>
      </Stage>
    </ExperimentShell>
  );
}
