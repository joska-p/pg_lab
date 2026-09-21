import * as stylex from "@stylexjs/stylex";
import { Stack } from "@repo/ui/components/Stack";
import { Stage } from "@repo/ui/components/Stage";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { borderWidth, radius, space } from "@repo/ui/tokens/layout.stylex";
import { typography } from "@repo/ui/tokens/typography.stylex";
import { shadowColor, shadows } from "@repo/ui/tokens/shadows.stylex";
import { fx, glass } from "@repo/ui/recipes/effects.stylex";
import { FAMILIES, type LabFamilyName } from "./families";
import { Key, Chip, LabField, MaterialScene, Led as LabLed } from "./experimental";

// ─── Lab-local custom recipes ─────────────────────────────────────────────────
// These are deliberate non-tokens: probes for recurring patterns.
// If a shape keeps coming back → candidate for @repo/ui.

/** Probe: a full-bleed light field behind a glass surface. */
const lightFieldStyles = stylex.create({
  scene: {
    position: "relative",
    minHeight: "100%",
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    overflow: "hidden",
  },
  ground: {
    position: "absolute",
    inset: 0,
    backgroundColor: colors.card,
  },
  bleedLayer: {
    position: "absolute",
    inset: "-40px",
    pointerEvents: "none",
  },
  blob: (color: string, left: string, top: string, size: string) => ({
    position: "absolute",
    left,
    top,
    width: size,
    height: size,
    borderRadius: radius.full,
    backgroundImage: `radial-gradient(circle at 50% 50%, ${color}, transparent 70%)`,
    filter: `blur(${fx.blurLg})`,
  }),
  content: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    padding: space["4"],
    minHeight: "100%",
    justifyContent: "space-between",
  },
});

/** Probe: a glass HUD card floating above a light field. */
const hudStyles = stylex.create({
  base: {
    display: "inline-flex",
    flexDirection: "column",
    gap: space["1"],
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: `color-mix(in oklab, ${colors.border} 80%, transparent)`,
    [shadowColor.color]: colors.card,
    alignSelf: "flex-end",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: space["2"],
  },
  label: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase" as const,
    color: colors.mutedForeground,
  },
  value: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    color: colors.foreground,
    fontWeight: typography.fontWeightSemibold,
  },
});

/** Probe: a matte instrument rail — no fill, color only on the mark. */
const railStyles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
    paddingBlock: space["2"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    [shadowColor.color]: colors.card,
    boxShadow: shadows.rest,
  },
  label: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
    flex: 1,
  },
  value: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeSm,
    color: colors.foreground,
  },
  dot: (color: string) => ({
    width: "7px",
    height: "7px",
    borderRadius: radius.full,
    backgroundColor: color,
    flexShrink: 0,
    filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} ${color})`,
  }),
});

/** Probe: a pulsing status ring. */
const pulseStyles = stylex.create({
  ring: (color: string) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: `color-mix(in oklab, ${color} 50%, transparent)`,
    backgroundColor: `color-mix(in oklab, ${color} 12%, ${colors.card})`,
    color,
  }),
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: radius.full,
    backgroundColor: "currentColor",
    filter: `drop-shadow(0 0 ${fx.glowSubtleBlur} currentColor)`,
  },
});

// ─── Study header ─────────────────────────────────────────────────────────────

const studyStyles = stylex.create({
  head: {
    display: "flex",
    alignItems: "baseline",
    gap: space["3"],
    paddingBottom: space["3"],
    borderBottomWidth: borderWidth.hairline,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    marginBottom: space["3"],
  },
  index: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
  title: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase" as const,
    color: colors.foreground,
  },
  aim: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
  note: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },
});

type StudyProps = {
  index: string;
  name: string;
  aim: string;
  accent: LabFamilyName;
  children: React.ReactNode;
};

function Study({ index, name, aim, accent, children }: StudyProps) {
  return (
    <div>
      <div {...stylex.props(studyStyles.head)}>
        <LabLed color={FAMILIES[accent].base} live />
        <span {...stylex.props(studyStyles.index)}>{index}</span>
        <h2 {...stylex.props(studyStyles.title)}>{name}</h2>
        <span {...stylex.props(studyStyles.aim)}>— {aim}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Lab header ───────────────────────────────────────────────────────────────

const headerStyles = stylex.create({
  base: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space["3"],
  },
  title: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeMd,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase" as const,
  },
  subtitle: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
    flex: 1,
  },
});

// ─── Probes ───────────────────────────────────────────────────────────────────

function LightFieldProbe() {
  const amber = FAMILIES.amber.base;
  const aqua = FAMILIES.aqua.base;
  const violet = FAMILIES.violet.base;

  return (
    <div {...stylex.props(lightFieldStyles.scene)}>
      <div {...stylex.props(lightFieldStyles.ground)} />
      <div {...stylex.props(lightFieldStyles.bleedLayer)}>
        <span {...stylex.props(lightFieldStyles.blob(amber, "5%", "10%", "70%"))} />
        <span {...stylex.props(lightFieldStyles.blob(aqua, "50%", "40%", "55%"))} />
        <span {...stylex.props(lightFieldStyles.blob(violet, "25%", "55%", "35%"))} />
      </div>
      <div {...stylex.props(lightFieldStyles.content)}>
        <div {...stylex.props(railStyles.base)}>
          <span {...stylex.props(railStyles.dot(amber))} />
          <span {...stylex.props(railStyles.label)}>level</span>
          <span {...stylex.props(railStyles.value)}>+6.2 dB</span>
        </div>
        <div {...stylex.props(glass.glass, hudStyles.base)}>
          <div {...stylex.props(hudStyles.row)}>
            <span {...stylex.props(railStyles.dot(aqua))} />
            <span {...stylex.props(hudStyles.label)}>monitor</span>
            <span {...stylex.props(hudStyles.value)}>0.620</span>
          </div>
          <div {...stylex.props(hudStyles.row)}>
            <span {...stylex.props(railStyles.dot(violet))} />
            <span {...stylex.props(hudStyles.label)}>route</span>
            <span {...stylex.props(hudStyles.value)}>bus-2</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PULSE_FAMILIES = [
  "amber",
  "aqua",
  "violet",
  "green",
  "red",
] as const satisfies LabFamilyName[];

function PulseProbe() {
  return (
    <Stack direction="horizontal" gap="8" wrap>
      {PULSE_FAMILIES.map((fam) => (
        <div key={fam} {...stylex.props(pulseStyles.ring(FAMILIES[fam].base))}>
          <span {...stylex.props(pulseStyles.dot)} />
        </div>
      ))}
    </Stack>
  );
}

const RAIL_PARAMS = [
  { label: "cutoff", value: "6.2 kHz", family: "violet" },
  { label: "resonance", value: "62%", family: "orange" },
  { label: "drive", value: "+24 dB", family: "amber" },
  { label: "level", value: "−6 dB", family: "green" },
] as const satisfies { label: string; value: string; family: LabFamilyName }[];

function RailProbe() {
  return (
    <Stack gap="2">
      {RAIL_PARAMS.map(({ label, value, family }) => (
        <div key={label} {...stylex.props(railStyles.base)}>
          <span {...stylex.props(railStyles.dot(FAMILIES[family].base))} />
          <span {...stylex.props(railStyles.label)}>{label}</span>
          <span {...stylex.props(railStyles.value)}>{value}</span>
        </div>
      ))}
    </Stack>
  );
}

function KeyChipProbe() {
  return (
    <Stack gap="4">
      <Stack direction="horizontal" gap="8" wrap>
        <Key label="run" family="green" live lead />
        <Key label="record" family="red" />
        <Key label="plot" family="aqua" />
        <Key label="save" />
      </Stack>
      <Stack direction="horizontal" gap="8" wrap>
        <Chip label="live · 48k" family="green" live />
        <Chip label="aqua" family="aqua" />
        <Chip label="violet" family="violet" />
        <Chip label="orange" family="orange" />
        <Chip label="neutral" />
      </Stack>
      <p {...stylex.props(studyStyles.note)}>
        key: matte face, color on the LED — chip: stroke + text carry the hue
      </p>
    </Stack>
  );
}

// ─── LabStage ─────────────────────────────────────────────────────────────────
// Exported: only the Stage content. ExperimentShell + panel live in App.tsx.

export function LabStage() {
  return (
    <Stage label="Visual Laboratory">
      <Stack gap="10">
        {/* Header */}
        <div {...stylex.props(headerStyles.base)}>
          <LabLed color={FAMILIES.amber.base} live />
          <h1 {...stylex.props(headerStyles.title)}>visual laboratory</h1>
          <span {...stylex.props(headerStyles.subtitle)}>
            custom recipes · app-local probes · same tokens
          </span>
        </div>

        <Study index="01" name="material" accent="amber" aim="light under, glass above">
          <LightFieldProbe />
        </Study>

        <Study
          index="02"
          name="status"
          accent="green"
          aim="the ring is the state, nothing else changes"
        >
          <PulseProbe />
        </Study>

        <Study
          index="03"
          name="parameter"
          accent="violet"
          aim="the rail reads a parameter, not a role"
        >
          <RailProbe />
        </Study>

        <Study
          index="04"
          name="action · tag"
          accent="aqua"
          aim="matte key + LED mark, hue = meaning"
        >
          <KeyChipProbe />
        </Study>

        <Study
          index="05"
          name="field"
          accent="orange"
          aim="one well, one contact ring, data sits outside"
        >
          <Stack gap="4">
            <LabField label="patch name" family="green" live defaultValue="bass-01" />
            <LabField label="routing" defaultValue="bus-2" />
            <LabField label="note" placeholder="——— empty ———" />
            <p {...stylex.props(studyStyles.note)}>
              the well stays matte — the family chip + LED live in the label row
            </p>
          </Stack>
        </Study>

        <Study index="06" name="scene" accent="red" aim="composed from previous probes">
          <Stack gap="4">
            <MaterialScene />
            <p {...stylex.props(studyStyles.note)}>
              same material probe assembled from the under/over grammar
            </p>
          </Stack>
        </Study>
      </Stack>
    </Stage>
  );
}
