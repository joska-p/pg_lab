import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import {
  Button,
  Card,
  Checkbox,
  ColorField,
  ControlField,
  ControlPanel,
  ControlSection,
  ExperimentShell,
  NumberField,
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
  ShellWrapper,
} from "@repo/ui";
import { effects } from "@repo/ui/behaviors/effects.stylex";
import { borderWidth, radius, space, typography } from "@repo/ui/theme/consts.stylex";
import { shadowColor } from "@repo/ui/theme/shadows.stylex";
import { colors } from "@repo/ui/theme/tokens.stylex";

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

// Hero and FakeSynth components are now obsolete as their logic is moved to App

const layoutStyles = stylex.create({
  // Two-up responsive grid: cards share a row on wide screens, stack below.
  half: {
    flex: "1 1 320px",
    minWidth: 0,
  },
});

const synthStyles = stylex.create({
  container: (tint: string, muted: boolean) => ({
    flex: 1,
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: space["6"],
    backgroundImage: `radial-gradient(120% 120% at 25% 20%, ${tint}59, transparent 60%), linear-gradient(135deg, #14141b, #23232e)`,
    opacity: muted ? 0.45 : 1,
    transition: "opacity 200ms",
    borderRadius: radius.md,
  }),
});

const tileStyles = stylex.create({
  base: {
    display: "flex",
    alignItems: "flex-end",
    flex: "1 1 160px",
    minHeight: 108,
    padding: space["3"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
  },
  cardBg: {
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  primaryBg: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    borderColor: colors.primary,
  },
  secondaryBg: {
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
    borderColor: colors.secondary,
  },
  mutedBg: {
    backgroundColor: colors.muted,
    color: colors.mutedForeground,
  },
  backdrop: {
    backgroundImage:
      "linear-gradient(135deg, #8ec07c59, #d3869b59), linear-gradient(135deg, #14141b, #23232e)",
  },
  glowText: {
    color: colors.accent,
  },
});

const tileTints = stylex.create({
  primary: { [shadowColor.color]: colors.primary },
  secondary: { [shadowColor.color]: colors.secondary },
  accent: { [shadowColor.color]: colors.accent },
  card: { [shadowColor.color]: colors.card },
  muted: { [shadowColor.color]: colors.muted },
});

function Tile({
  bg,
  tint,
  effect,
  label,
  children,
}: {
  bg?: StyleXStyles;
  tint?: StyleXStyles;
  effect?: StyleXStyles | StyleXStyles[];
  label: string;
  children?: React.ReactNode;
}) {
  const applied = Array.isArray(effect) ? effect : [effect];
  return (
    <div {...stylex.props(tileStyles.base, bg, tint, ...applied)}>
      {children}
      <span>{label}</span>
    </div>
  );
}

function Controls() {
  return (
    <Stack gap="3">
      <SectionHeading index="02" title="controls" />

      <Stack direction="horizontal" gap="4" wrap>
        <Card style={layoutStyles.half}>
          <ControlSection title="Button">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant}>
                  {variant}
                </Button>
              ))}
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </Stack>
          </ControlSection>
        </Card>

        <Card style={layoutStyles.half}>
          <ControlSection title="Slider">
            <Stack gap="8">
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

        <Card style={layoutStyles.half}>
          <ControlSection title="Toggle">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_VARIANTS.map((variant) => (
                <Toggle key={variant} label={variant} variant={variant} defaultChecked />
              ))}
              <Toggle label="off" />
              <Toggle label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card style={layoutStyles.half}>
          <ControlSection title="Checkbox">
            <Stack direction="horizontal" gap="8" wrap justify="between">
              {BUTTON_VARIANTS.map((variant) => (
                <Checkbox key={variant} label={variant} variant={variant} defaultChecked />
              ))}
              <Checkbox label="off" />
              <Checkbox label="disabled" disabled defaultChecked />
            </Stack>
          </ControlSection>
        </Card>

        <Card style={layoutStyles.half}>
          <ControlSection title="Segmented">
            <Stack gap="8" direction="horizontal" wrap justify="between">
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

        <Card style={layoutStyles.half}>
          <ControlSection title="Select">
            <Stack gap="8" direction="horizontal" wrap justify="between">
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

        <Card style={layoutStyles.half}>
          <ControlSection title="RadioGroup">
            <Stack gap="8" direction="horizontal" wrap justify="between">
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

        <Card style={layoutStyles.half}>
          <ControlSection title="TextInput">
            <Stack gap="8" direction="horizontal" wrap>
              {" "}
              justify="between"
              {BUTTON_VARIANTS.map((variant) => (
                <TextInput key={variant} label={variant} variant={variant} defaultValue={variant} />
              ))}
              <TextInput label="disabled" defaultValue="frozen" disabled />
            </Stack>
          </ControlSection>
        </Card>

        <Card style={layoutStyles.half}>
          <ControlSection title="NumberField">
            <Stack gap="8" direction="horizontal" wrap justify="between">
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

        <Card style={layoutStyles.half}>
          <ControlSection title="TextArea">
            <Stack gap="8" direction="horizontal" wrap justify="between">
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

        <Card style={layoutStyles.half}>
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
    <Stack gap="2">
      <SectionHeading index="03" title="foundations" />

      <Card>
        <ControlSection title="surfaces">
          <Stack direction="horizontal" gap="8" wrap>
            <Swatch variant="background" meta="app ground" />
            <Swatch variant="card" meta="raised" />
            <Swatch variant="popover" meta="floating" />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="elevation">
          <Stack direction="horizontal" gap="8" wrap>
            <Tile bg={tileStyles.cardBg} effect={effects.flat} label="flat · border only" />
            <Tile
              bg={tileStyles.primaryBg}
              tint={tileTints.primary}
              effect={effects.raised}
              label="raised · tinted"
            />
            <Tile
              bg={tileStyles.mutedBg}
              tint={tileTints.muted}
              effect={effects.sunken}
              label="sunken · inset"
            />
            <Tile
              bg={tileStyles.cardBg}
              tint={tileTints.accent}
              effect={effects.floating}
              label="floating"
            />
            <Tile
              bg={tileStyles.backdrop}
              tint={tileTints.card}
              effect={[effects.glass, effects.floating]}
              label="glass · over backdrop"
            />
            <Tile
              bg={tileStyles.secondaryBg}
              tint={tileTints.secondary}
              effect={effects.pressable}
              label="press me · rest / hover / active"
            />
            <Tile bg={tileStyles.cardBg} label="glow = state, not elevation">
              <span {...stylex.props(tileStyles.glowText, effects.glowSubtle)}>●&nbsp;</span>
            </Tile>
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="families">
          <Stack direction="horizontal" gap="8" wrap>
            <Swatch variant="primary" meta="primaryForeground" />
            <Swatch variant="secondary" meta="secondaryForeground" />
            <Swatch variant="accent" meta="accentForeground" />
            <Swatch variant="warning" meta="warningForeground" />
            <Swatch variant="destructive" meta="destructiveForeground" />
            <Swatch variant="muted" meta="mutedForeground" />
          </Stack>
        </ControlSection>
      </Card>

      <Card>
        <ControlSection title="type">
          <Text>Body copy stays compact and readable. No oversized headings.</Text>
          <Text variant="muted">Muted carries secondary information without competing.</Text>
        </ControlSection>
      </Card>
    </Stack>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === "system" ? "light dark" : theme;
  }, [theme]);

  return [theme, setTheme] as const;
}

function App() {
  const [theme, setTheme] = useTheme();
  const [synth, setSynth] = useState<Synth>(DEFAULT_SYNTH);
  const [panelPlacement, setPanelPlacement] = useState<"docked" | "floating">("floating");
  // ... existing state ...

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
    <ShellWrapper>
      <ExperimentShell
        placement={panelPlacement}
        panel={
          <ControlPanel title="Workspace">
            <ControlSection title="Theme">
              <Segmented<"light" | "dark" | "system">
                options={["light", "dark", "system"]}
                value={theme}
                onValueChange={setTheme}
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
              {/* Synth Controls extracted from FakeSynth */}
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
                <Stack direction="horizontal" gap="2" wrap>
                  <Button variant="secondary" onClick={randomizeSynth}>
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
        <Stage label="Workspace Stage">
          <Stack gap="2">
            <Stack gap="2">
              <SectionHeading index="00" title="repo/ui" />
              <Text variant="muted">
                A small toolkit for creative mini-apps. Canvas first, panel second — and this page
                imports nothing but components.
              </Text>
            </Stack>

            {/* Visual Part of Synth */}

            <div {...stylex.props(synthStyles.container(synth.tint, synth.mute))}>
              <Readout
                label={synth.name}
                value={`${synth.wave} · ${synth.filter} · ${synth.cutoff}`}
              />
            </div>

            <Controls />
            <Foundations />
            <Stack direction="horizontal" gap="2" wrap>
              <Text variant="muted">built on @repo/ui</Text>
              <Text variant="muted">components only · no raw values</Text>
            </Stack>
          </Stack>
        </Stage>
      </ExperimentShell>
    </ShellWrapper>
  );
}

export default App;
