import { useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";

import { colors, radius, space, typography } from "@repo/ui/theme/tokens.stylex.ts";
import { borderWidth, motion } from "@repo/ui/theme/consts.stylex.ts";
import { effects } from "@repo/ui/theme/effects.stylex.ts";
import { primitives } from "@repo/ui/primitives/interactive.stylex.ts";
import { Slider } from "@repo/ui/components/Slider";
import { Toggle } from "@repo/ui/components/Toggle";
import { ColorField } from "@repo/ui/components/ColorField";
import { Segmented } from "@repo/ui/components/Segmented";

const ICONS = ["soft", "firm", "crisp"] as const;

const styles = stylex.create({
  page: {
    minHeight: "100vh",
    backgroundColor: colors.background,
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
    fontWeight: typography.fontWeightRegular,
    lineHeight: typography.lineHeightNormal,
  },

  container: {
    maxWidth: 1024,
    marginInline: "auto",
    paddingInline: space["6"],
    paddingTop: space["8"],
    paddingBottom: space["16"],
    display: "flex",
    flexDirection: "column",
    gap: space["8"],
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
  },

  headerRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space["4"],
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSize3xl,
    fontWeight: typography.fontWeightBold,
    letterSpacing: typography.letterSpacingTight,
  },

  titleAccent: {
    color: colors.accent,
  },

  metaRow: {
    display: "flex",
    gap: space["2"],
    flexWrap: "wrap",
  },

  metaChip: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
    paddingBlock: 2,
    paddingInline: space["2"],
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },

  intro: {
    margin: 0,
    maxWidth: "62ch",
    color: colors.mutedForeground,
    fontSize: typography.fontSizeSm,
  },

  code: {
    fontFamily: typography.fontFamilyMono,
    color: colors.foreground,
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: space["6"],
    paddingTop: space["6"],
    borderTopWidth: borderWidth.hairline,
    borderTopStyle: "solid",
    borderTopColor: colors.border,
  },

  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  sectionLed: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
  },

  sectionIndex: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  sectionTitle: {
    margin: 0,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },

  block: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
  },

  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["4"],
  },

  surface: {
    flex: 1,
    minWidth: 180,
    display: "flex",
    flexDirection: "column",
    gap: space["2"],
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },

  surfaceName: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },

  surfaceSample: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightSemibold,
  },

  surfaceBg: { backgroundColor: colors.background, color: colors.foreground },
  surfaceCard: { backgroundColor: colors.card, color: colors.cardForeground },
  surfacePopover: { backgroundColor: colors.popover, color: colors.popoverForeground },

  textFace: {
    flex: 1,
    minWidth: 200,
    minHeight: 76,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: space["3"],
    padding: space["3"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },

  textLabel: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  textSample: {
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeXl,
    fontWeight: typography.fontWeightSemibold,
  },

  textOnBg: { backgroundColor: colors.background, color: colors.foreground },
  textOnMuted: { backgroundColor: colors.muted, color: colors.mutedForeground },
  textMutedOnBg: { backgroundColor: colors.background, color: colors.mutedForeground },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: space["3"],
  },

  family: {
    minHeight: 88,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: space["2"],
    padding: space["3"],
    borderRadius: radius.md,
  },

  familyName: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
  },

  familySample: {
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.fontWeightSemibold,
  },

  familyMeta: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    opacity: 0.8,
  },

  familyPrimary: { backgroundColor: colors.primary, color: colors.primaryForeground },
  familySecondary: { backgroundColor: colors.secondary, color: colors.secondaryForeground },
  familyAccent: { backgroundColor: colors.accent, color: colors.accentForeground },
  familyWarning: { backgroundColor: colors.warning, color: colors.warningForeground },
  familySuccess: { backgroundColor: colors.success, color: colors.successForeground },
  familyDestructive: { backgroundColor: colors.destructive, color: colors.destructiveForeground },

  spacingList: { display: "flex", flexDirection: "column", gap: space["2"] },

  spacingRow: {
    display: "flex",
    alignItems: "center",
    gap: space["3"],
  },

  spacingKey: {
    width: space["6"],
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  spacingValue: {
    minWidth: space["8"],
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  spacingBar: (width: string) => ({
    display: "inline-block",
    height: 8,
    width,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  }),

  radiusList: { display: "flex", flexWrap: "wrap", gap: space["4"] },

  radiusTile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space["2"],
  },

  radiusChip: (value: string) => ({
    display: "inline-block",
    width: 64,
    height: 64,
    borderRadius: value,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  }),

  radiusName: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  radiusValue: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.foreground,
  },

  borderRow: { display: "flex", flexWrap: "wrap", gap: space["3"] },

  borderSample: {
    flex: 1,
    minWidth: 130,
    minHeight: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: space["2"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  borderOnBg: { backgroundColor: colors.background },
  borderOnCard: { backgroundColor: colors.card, color: colors.cardForeground },
  borderOnPopover: { backgroundColor: colors.popover, color: colors.popoverForeground },

  inputField: {
    flex: 1,
    minWidth: 130,
    minHeight: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: space["2"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.input,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.foreground,
  },

  ringChip: {
    flex: 1,
    minWidth: 130,
    minHeight: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
    padding: space["2"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  ringDot: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.ring,
    color: colors.ring,
  },

  effectTile: {
    flex: 1,
    minWidth: 110,
    minHeight: 104,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: space["2"],
    padding: space["3"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  effectTilePopover: { backgroundColor: colors.popover },

  effectName: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
    color: colors.foreground,
  },

  effectNote: {
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  glowDot: {
    display: "inline-block",
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    color: colors.accent,
  },

  motionBox: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  motionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space["3"],
    flexWrap: "wrap",
  },

  motionHint: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  motionRow: {
    display: "flex",
    alignItems: "center",
    gap: space["4"],
  },

  motionMeta: {
    width: 132,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },

  motionName: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    color: colors.mutedForeground,
  },

  motionTrack: {
    flex: 1,
    minWidth: 96,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.muted,
    overflow: "hidden",
  },

  motionBar: {
    display: "inline-block",
    height: "100%",
    width: "0%",
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    transitionProperty: "width",
    transitionTimingFunction: motion.easingOut,
  },

  motionBarFast: { width: "100%", transitionDuration: motion.durationFast },
  motionBarNormal: { width: "100%", transitionDuration: motion.durationNormal },
  motionBarSlow: { width: "100%", transitionDuration: motion.durationSlow },

  chipRow: { display: "flex", flexWrap: "wrap", gap: space["2"] },

  chip: {
    paddingBlock: space["1"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.foreground,
    fontFamily: typography.fontFamilySans,
    fontSize: typography.fontSizeSm,
    fontWeight: typography.fontWeightMedium,
  },

  readout: {
    display: "inline-flex",
    alignItems: "center",
    gap: space["3"],
    paddingBlock: space["1"],
    paddingInline: space["3"],
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  instrument: {
    display: "grid",
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 760px)": "1fr 1fr",
    },
    gap: space["5"],
  },

  controls: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: space["5"],
    padding: space["2"],
  },

  canvas: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: space["5"],
    minHeight: 280,
    padding: space["6"],
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
  },

  canvasCaption: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    letterSpacing: typography.letterSpacingWide,
    textTransform: "uppercase",
    color: colors.mutedForeground,
  },

  orbBase: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: "transparent",
    transitionProperty: "transform, box-shadow, color, background-color, border-color",
    transitionDuration: motion.durationNormal,
    transitionTimingFunction: motion.easingOut,
  },

  orbOutline: {
    backgroundColor: "transparent",
    borderColor: "currentColor",
  },

  orbAureole: {
    boxShadow:
      "0 0 24px color-mix(in srgb, currentColor 40%, transparent), 0 0 0 1px color-mix(in srgb, currentColor 30%, transparent)",
  },

  orbFill: (color: string) => ({ backgroundColor: color, color }),
  orbScale: (scale: number) => ({ transform: `scale(${scale})` }),

  statesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: space["4"],
  },

  statePanel: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    padding: space["4"],
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
  },

  stateBody: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    gap: space["4"],
    flexWrap: "wrap",
    paddingTop: space["5"],
    borderTopWidth: borderWidth.hairline,
    borderTopStyle: "solid",
    borderTopColor: colors.border,
  },
});

const SPACING_ENTRIES = [
  ["1", "4px"],
  ["2", "8px"],
  ["3", "12px"],
  ["4", "16px"],
  ["5", "20px"],
  ["6", "24px"],
  ["8", "32px"],
  ["10", "40px"],
  ["12", "48px"],
  ["16", "64px"],
] as const;

const RADIUS_ENTRIES = [
  ["none", "0px"],
  ["sm", "4px"],
  ["md", "6px"],
  ["lg", "8px"],
  ["xl", "12px"],
  ["full", "9999px"],
] as const;

const FAMILIES = [
  ["primary", "primaryForeground", styles.familyPrimary],
  ["secondary", "secondaryForeground", styles.familySecondary],
  ["accent", "accentForeground", styles.familyAccent],
  ["warning", "warningForeground", styles.familyWarning],
  ["success", "successForeground", styles.familySuccess],
  ["destructive", "destructiveForeground", styles.familyDestructive],
] as const;

type SectionProps = {
  index: string;
  title: string;
  children: ReactNode;
};

function Section({ index, title, children }: SectionProps) {
  return (
    <section {...stylex.props(styles.section)}>
      <div {...stylex.props(styles.sectionHead)}>
        <span aria-hidden {...stylex.props(styles.sectionLed, effects.glowSubtle)} />
        <span {...stylex.props(styles.sectionIndex)}>{index}</span>
        <h2 {...stylex.props(styles.sectionTitle)}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

type BlockProps = {
  title: string;
  children: ReactNode;
};

function Block({ title, children }: BlockProps) {
  return (
    <div {...stylex.props(styles.block)}>
      <span {...stylex.props(primitives.label)}>{title}</span>
      {children}
    </div>
  );
}

function MetaChip({ label }: { label: string }) {
  return <span {...stylex.props(styles.metaChip)}>{label}</span>;
}

type SurfaceTileProps = {
  name: string;
  style: StyleXStyles;
  shadow?: StyleXStyles;
};

function SurfaceTile({ name, style, shadow }: SurfaceTileProps) {
  return (
    <div {...stylex.props(styles.surface, shadow, style)}>
      <span {...stylex.props(styles.surfaceName)}>{name}</span>
      <span {...stylex.props(styles.surfaceSample)}>Aa 0123</span>
    </div>
  );
}

type TextFaceProps = {
  name: string;
  sample: string;
  style: StyleXStyles;
};

function TextFace({ name, sample, style }: TextFaceProps) {
  return (
    <div {...stylex.props(styles.textFace, style)}>
      <span {...stylex.props(styles.textLabel)}>{name}</span>
      <span aria-hidden {...stylex.props(styles.textSample)}>
        {sample}
      </span>
    </div>
  );
}

type FamilyTileProps = {
  name: string;
  meta: string;
  style: StyleXStyles;
};

function FamilyTile({ name, meta, style }: FamilyTileProps) {
  return (
    <div {...stylex.props(styles.family, style)}>
      <span {...stylex.props(styles.familyName)}>{name}</span>
      <span aria-hidden {...stylex.props(styles.familySample)}>
        Aa
      </span>
      <span {...stylex.props(styles.familyMeta)}>{meta}</span>
    </div>
  );
}

type EffectTileProps = {
  name: string;
  note: string;
  style?: StyleXStyles;
  shadow?: StyleXStyles;
};

function EffectTile({ name, note, style, shadow }: EffectTileProps) {
  return (
    <div {...stylex.props(styles.effectTile, shadow, style)}>
      <span {...stylex.props(styles.effectName)}>{name}</span>
      <span {...stylex.props(styles.effectNote)}>{note}</span>
    </div>
  );
}

type GlowTileProps = {
  name: string;
  note: string;
  glow: StyleXStyles;
};

function GlowTile({ name, note, glow }: GlowTileProps) {
  return (
    <div {...stylex.props(styles.effectTile)}>
      <span aria-hidden {...stylex.props(styles.glowDot, glow)} />
      <span {...stylex.props(styles.effectName)}>{name}</span>
      <span {...stylex.props(styles.effectNote)}>{note}</span>
    </div>
  );
}

function MotionDemo() {
  const [run, setRun] = useState(false);

  const rows = [
    { name: "durationFast", value: "120ms", bar: styles.motionBarFast },
    { name: "durationNormal", value: "200ms", bar: styles.motionBarNormal },
    { name: "durationSlow", value: "320ms", bar: styles.motionBarSlow },
  ] as const;

  return (
    <div {...stylex.props(styles.motionBox)}>
      <div {...stylex.props(styles.motionHead)}>
        <button
          type="button"
          onClick={() => setRun((value) => !value)}
          {...stylex.props(styles.chip, primitives.interactive, primitives.focusRing)}
        >
          {run ? "reset" : "run"}
        </button>
        <span {...stylex.props(styles.motionHint)}>transition · width · easingOut</span>
      </div>
      {rows.map((row) => (
        <div key={row.name} {...stylex.props(styles.motionRow)}>
          <div {...stylex.props(styles.motionMeta)}>
            <span {...stylex.props(styles.motionName)}>{row.name}</span>
            <span {...stylex.props(styles.motionHint)}>{row.value}</span>
          </div>
          <div {...stylex.props(styles.motionTrack)}>
            <span aria-hidden {...stylex.props(styles.motionBar, run ? row.bar : null)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipGroup() {
  const [choice, setChoice] = useState<string>("soft");

  return (
    <div {...stylex.props(styles.chipRow)}>
      {ICONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setChoice(option)}
          {...stylex.props(
            styles.chip,
            primitives.interactive,
            primitives.focusRing,
            choice === option ? primitives.selected : null,
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function HoldToggle() {
  const [on, setOn] = useState(false);
  const [held, setHeld] = useState(false);

  function hold() {
    setHeld(true);
  }

  function release() {
    setHeld(false);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((value) => !value)}
      onPointerDown={hold}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onKeyDown={(event: ReactKeyboardEvent) => {
        if (event.key === " ") hold();
      }}
      onKeyUp={(event: ReactKeyboardEvent) => {
        if (event.key === " ") release();
      }}
      {...stylex.props(
        styles.chip,
        primitives.interactive,
        primitives.focusRing,
        on ? primitives.selected : null,
        held ? primitives.active : null,
      )}
    >
      {on ? "on" : "off"}
    </button>
  );
}

type Mode = "solid" | "outline" | "aureole";

const MODES = [
  { value: "solid", label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "aureole", label: "Aureole" },
] as const satisfies ReadonlyArray<{ value: Mode; label: string }>;

function InstrumentDemo() {
  const [color, setColor] = useState("#83a598");
  const [mode, setMode] = useState<Mode>("outline");
  const [glow, setGlow] = useState(true);
  const [scale, setScale] = useState(1);

  return (
    <div {...stylex.props(styles.instrument)}>
      <div {...stylex.props(styles.controls)}>
        <ColorField label="orb color" value={color} onValueChange={setColor} />
        <Segmented<Mode> label="mode" options={MODES} value={mode} onValueChange={setMode} />
        <Toggle label="glow" checked={glow} onCheckedChange={setGlow} />
        <Slider
          label="scale"
          min={0.5}
          max={1.8}
          step={0.01}
          value={scale}
          onValueChange={setScale}
        />
      </div>

      <div {...stylex.props(styles.canvas)}>
        <span {...stylex.props(styles.canvasCaption)}>live · instrument</span>
        <div
          aria-hidden
          {...stylex.props(
            styles.orbBase,
            mode === "outline" ? styles.orbOutline : null,
            mode === "aureole" ? styles.orbAureole : null,
            styles.orbFill(color),
            styles.orbScale(scale),
            glow ? effects.glow : null,
          )}
        />
        <span {...stylex.props(primitives.value)}>
          {color.toUpperCase()} · {mode.toUpperCase()} · {scale.toFixed(2)} × · GLOW{" "}
          {glow ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );
}

type StatePanelProps = {
  title: string;
  children: ReactNode;
};

function StatePanel({ title, children }: StatePanelProps) {
  return (
    <div {...stylex.props(styles.statePanel)}>
      <span {...stylex.props(primitives.label)}>{title}</span>
      <div {...stylex.props(styles.stateBody)}>{children}</div>
    </div>
  );
}

function App() {
  return (
    <div {...stylex.props(styles.page)}>
      <main {...stylex.props(styles.container)}>
        <header {...stylex.props(styles.header)}>
          <div {...stylex.props(styles.headerRow)}>
            <h1 {...stylex.props(styles.title)}>
              repo/<span {...stylex.props(styles.titleAccent)}>ui</span>
            </h1>
            <div {...stylex.props(styles.metaRow)}>
              <MetaChip label="dark" />
              <MetaChip label="compact" />
              <MetaChip label="tactile" />
              <MetaChip label="luminous" />
            </div>
          </div>
          <p {...stylex.props(styles.intro)}>
            Visual inventory of the <code {...stylex.props(styles.code)}>@repo/ui</code> design
            language — semantic tokens, shared interaction primitives, and the four core widgets.
          </p>
        </header>

        <Section index="01" title="theme foundation">
          <Block title="surfaces">
            <div {...stylex.props(styles.row)}>
              <SurfaceTile name="background" style={styles.surfaceBg} />
              <SurfaceTile name="card" style={styles.surfaceCard} shadow={effects.raised} />
              <SurfaceTile name="popover" style={styles.surfacePopover} shadow={effects.floating} />
            </div>
          </Block>

          <Block title="text levels">
            <div {...stylex.props(styles.row)}>
              <TextFace name="foreground" sample="Fg" style={styles.textOnBg} />
              <TextFace name="muted" sample="Mute" style={styles.textOnMuted} />
              <TextFace name="mutedForeground" sample="Mute" style={styles.textMutedOnBg} />
            </div>
          </Block>

          <Block title="color families">
            <div {...stylex.props(styles.grid)}>
              {FAMILIES.map(([name, meta, familyStyle]) => (
                <FamilyTile key={name} name={name} meta={meta} style={familyStyle} />
              ))}
            </div>
          </Block>

          <Block title="spacing scale">
            <div {...stylex.props(styles.spacingList)}>
              {SPACING_ENTRIES.map(([key, px]) => (
                <div key={key} {...stylex.props(styles.spacingRow)}>
                  <span {...stylex.props(styles.spacingKey)}>{key}</span>
                  <span aria-hidden {...stylex.props(styles.spacingBar(px))} />
                  <span {...stylex.props(styles.spacingValue)}>{px}</span>
                </div>
              ))}
            </div>
          </Block>

          <Block title="radius scale">
            <div {...stylex.props(styles.radiusList)}>
              {RADIUS_ENTRIES.map(([name, px]) => (
                <div key={name} {...stylex.props(styles.radiusTile)}>
                  <span aria-hidden {...stylex.props(styles.radiusChip(px))} />
                  <span {...stylex.props(styles.radiusName)}>{name}</span>
                  <span {...stylex.props(styles.radiusValue)}>{name === "full" ? "∞" : px}</span>
                </div>
              ))}
            </div>
          </Block>

          <Block title="border · effects">
            <div {...stylex.props(styles.borderRow)}>
              <div {...stylex.props(styles.borderSample, styles.borderOnBg)}>border · bg</div>
              <div {...stylex.props(styles.borderSample, styles.borderOnCard)}>border · card</div>
              <div {...stylex.props(styles.borderSample, styles.borderOnPopover)}>
                border · popover
              </div>
              <div {...stylex.props(styles.inputField)}>input</div>
              <div {...stylex.props(styles.ringChip)}>
                <span aria-hidden {...stylex.props(styles.ringDot, effects.glowSubtle)} />
                ring
              </div>
            </div>
            <div {...stylex.props(styles.row)}>
              <EffectTile name="raised" note="soft depth" shadow={effects.raised} />
              <EffectTile
                name="floating"
                note="detached layer"
                style={styles.effectTilePopover}
                shadow={effects.floating}
              />
              <GlowTile name="glow · subtle" note="hint of light" glow={effects.glowSubtle} />
              <GlowTile name="glow" note="active energy" glow={effects.glow} />
              <GlowTile name="glow · strong" note="selection" glow={effects.glowStrong} />
            </div>
          </Block>

          <Block title="motion durations">
            <MotionDemo />
          </Block>
        </Section>

        <Section index="02" title="shared primitives">
          <Block title="interactive · focusRing · selected">
            <ChipGroup />
          </Block>

          <Block title="active (press & hold)">
            <div {...stylex.props(styles.row)}>
              <HoldToggle />
              <span {...stylex.props(primitives.label)}>
                pointer-down lights the border · click toggles selected
              </span>
            </div>
          </Block>

          <Block title="disabled">
            <div {...stylex.props(styles.chipRow)}>
              <button
                type="button"
                disabled
                {...stylex.props(
                  styles.chip,
                  primitives.interactive,
                  primitives.focusRing,
                  primitives.disabled,
                )}
              >
                unavailable
              </button>
              <Toggle label="hold" disabled defaultChecked />
              <Slider label="gain" min={0} max={100} defaultValue={40} disabled />
            </div>
          </Block>

          <Block title="label · value">
            <div {...stylex.props(styles.readout)}>
              <span {...stylex.props(primitives.label)}>samplerate</span>
              <span {...stylex.props(primitives.value)}>48 kHz</span>
            </div>
          </Block>
        </Section>

        <Section index="03" title="widgets">
          <Block title="live instrument">
            <InstrumentDemo />
          </Block>

          <Block title="default & disabled states">
            <div {...stylex.props(styles.statesGrid)}>
              <StatePanel title="Slider — default">
                <Slider label="gain" min={0} max={100} defaultValue={62} />
              </StatePanel>
              <StatePanel title="Slider — disabled">
                <Slider label="gain" min={0} max={100} defaultValue={40} disabled />
              </StatePanel>
              <StatePanel title="Toggle — default">
                <Toggle label="hold" defaultChecked />
                <Toggle label="mute" />
              </StatePanel>
              <StatePanel title="Toggle — disabled">
                <Toggle label="hold" disabled defaultChecked />
              </StatePanel>
              <StatePanel title="ColorField — default">
                <ColorField label="warm tint" defaultValue="#b8bb26" />
              </StatePanel>
              <StatePanel title="ColorField — disabled">
                <ColorField label="warm tint" disabled defaultValue="#d3869b" />
              </StatePanel>
              <StatePanel title="Segmented — default">
                <Segmented
                  label="blend"
                  options={["multiply", "screen", "overlay"]}
                  defaultValue="overlay"
                />
              </StatePanel>
              <StatePanel title="Segmented — disabled">
                <Segmented
                  label="blend"
                  options={["multiply", "screen", "overlay"]}
                  defaultValue="screen"
                  disabled
                />
              </StatePanel>
            </div>
          </Block>
        </Section>

        <footer {...stylex.props(styles.footer)}>
          <span {...stylex.props(styles.motionHint)}>built on @repo/ui</span>
          <span {...stylex.props(styles.motionHint)}>semantic tokens only · no raw values</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
