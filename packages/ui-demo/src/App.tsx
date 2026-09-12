import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { color, radius, space, typography } from "@repo/ui/src/theme/tokens.stylex.ts";
import { palette } from "@repo/ui/src/theme/palette.stylex.ts";
import { lightTheme } from "@repo/ui/src/theme/themes.stylex.ts";
import { effects } from "@repo/ui/src/theme/effects.stylex.ts";
import { motion } from "@repo/ui/src/theme/consts.stylex.ts";
import { styles as ui } from "@repo/ui/src/theme/styles.ts";

const semanticColors: Array<[string, string, string]> = [
  ["primary", color.primary, palette.blue],
  ["primary background", color.primaryBackground, "background"],
  ["secondary", color.secondary, palette.green],
  ["secondary background", color.secondaryBackground, "background"],
  ["accent", color.accent, palette.pink],
  ["accent background", color.accentBackground, "background"],
  ["warning", color.warning, palette.orange],
  ["warning background", color.warningBackground, "background"],
  ["danger", color.danger, palette.red],
  ["danger background", color.dangerBackground, "background"],
];

const surfaces: Array<[string, string, string]> = [
  ["background", color.background, "page"],
  ["surface", color.surface, "base surface"],
  ["surface raised", color.surfaceRaised, "elevated"],
  ["surface sunken", color.surfaceSunken, "recessed"],
];

const content: Array<[string, string]> = [
  ["text", color.text],
  ["text muted", color.textMuted],
  ["text subtle", color.textSubtle],
];

const spacings: Array<[string, string, string]> = [
  ["1", space["1"], "2px"],
  ["2", space["2"], "4px"],
  ["3", space["3"], "6px"],
  ["4", space["4"], "8px"],
  ["5", space["5"], "12px"],
  ["6", space["6"], "16px"],
  ["7", space["7"], "20px"],
  ["8", space["8"], "24px"],
  ["9", space["9"], "32px"],
];

const radii: Array<[string, string]> = [
  ["sm", radius.sm],
  ["md", radius.md],
  ["lg", radius.lg],
];

const styles = stylex.create({
  page: {
    minHeight: "100svh",
    backgroundColor: color.background,
    color: color.text,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineNormal,
    transition: "background-color 200ms ease, color 200ms ease",
  },

  header: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: `${space["8"]} ${space["8"]} ${space["4"]}`,
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: space["6"],
  },

  title: {
    margin: 0,
    fontSize: typography.sizeXxl,
    fontWeight: typography.weightSemibold,
    color: color.text,
  },

  tagline: {
    margin: `${space["2"]} 0 0`,
    color: color.textMuted,
    maxWidth: 640,
  },

  themeToggle: {
    flexShrink: 0,
    padding: `${space["2"]} ${space["4"]}`,
    borderRadius: radius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    backgroundColor: color.surface,
    color: color.text,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    cursor: "pointer",
  },

  shell: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: `0 ${space["8"]} ${space["8"]}`,
    display: "flex",
    flexDirection: "column",
    gap: space["6"],
  },

  section: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: space["6"],
  },

  sectionTitle: {
    display: "block",
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    color: color.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space["6"],
  },

  swatchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: space["5"],
  },

  swatchItem: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  swatch: (backgroundColor: string) => ({
    aspectRatio: "1 / 1",
    borderRadius: radius.md,
    backgroundColor,
  }),

  swatchBackground: (backgroundColor: string) => ({
    aspectRatio: "2 / 1",
    borderRadius: radius.md,
    backgroundColor,
  }),

  swatchName: {
    display: "block",
    marginTop: space["3"],
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    color: color.text,
  },

  swatchValue: {
    display: "block",
    marginTop: 2,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeSm,
    color: color.textMuted,
  },

  surfaceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: space["4"],
  },

  surface: (backgroundColor: string) => ({
    minHeight: 120,
    padding: space["5"],
    borderRadius: radius.md,
    backgroundColor,
  }),

  surfaceLabel: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    color: color.textMuted,
  },

  surfaceDescription: {
    margin: `${space["2"]} 0 0`,
    color: color.text,
  },

  contentStack: {
    display: "flex",
    flexDirection: "column",
    gap: space["4"],
  },

  contentRow: {
    display: "flex",
    alignItems: "baseline",
    gap: space["6"],
  },

  contentLabel: {
    width: 100,
    flexShrink: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    color: color.textMuted,
  },

  colorBackground: (backgroundColor: string) => ({
    backgroundColor,
    padding: `${space["3"]} ${space["4"]}`,
    borderRadius: radius.sm,
  }),

  semanticText: (foregroundColor: string) => ({
    color: foregroundColor,
    fontWeight: typography.weightMedium,
  }),

  spaceRow: {
    display: "flex",
    alignItems: "center",
    gap: space["4"],
    marginBottom: space["3"],
  },

  spaceLabel: {
    width: 100,
    flexShrink: 0,
    color: color.textMuted,
    fontFamily: typography.fontFamily,
    fontSize: typography.sizeMd,
  },

  spaceBar: (width: string) => ({
    width,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: color.primary,
  }),

  radiusRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["8"],
  },

  radiusItem: {
    display: "flex",
    flexDirection: "column",
    gap: space["3"],
    alignItems: "center",
  },

  radiusBox: (borderRadius: string) => ({
    width: 72,
    height: 72,
    borderRadius,
    backgroundColor: color.surfaceRaised,
  }),

  typeRow: {
    marginBottom: space["5"],
  },

  typeLabel: {
    display: "block",
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    color: color.textMuted,
    marginBottom: space["2"],
  },

  typeBody: {
    margin: 0,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightNormal,
    lineHeight: typography.lineNormal,
  },

  typeLabelText: {
    margin: 0,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightSemibold,
    lineHeight: typography.lineNormal,
  },

  typeValue: {
    margin: 0,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    lineHeight: typography.lineNormal,
  },

  typeCaption: {
    margin: 0,
    fontSize: typography.sizeMd,
    color: color.textMuted,
  },

  elevationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: space["5"],
  },

  panel: {
    minHeight: 100,
    padding: space["5"],
    borderRadius: radius.md,
    backgroundColor: color.surfaceRaised,
  },

  panelTitle: {
    display: "block",
    fontWeight: typography.weightSemibold,
    marginBottom: space["2"],
  },

  panelHint: {
    margin: 0,
    fontSize: typography.sizeSm,
    color: color.textMuted,
  },

  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["3"],
    alignItems: "center",
  },

  button: {
    padding: `${space["3"]} ${space["5"]}`,
    borderRadius: radius.md,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    fontWeight: typography.weightMedium,
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: "pointer",
  },

  buttonPrimary: {
    backgroundColor: color.primary,
    borderColor: "transparent",
    color: color.onPrimary,
  },

  buttonSecondary: {
    backgroundColor: color.secondary,
    borderColor: "transparent",
    color: color.onSecondary,
  },

  buttonAccent: {
    backgroundColor: color.accent,
    borderColor: "transparent",
    color: color.onAccent,
  },

  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: color.border,
    color: color.text,
  },

  buttonWarning: {
    backgroundColor: color.warning,
    borderColor: "transparent",
    color: color.onWarning,
  },

  buttonDanger: {
    backgroundColor: color.danger,
    borderColor: "transparent",
    color: color.onDanger,
  },

  glowPrimary: {
    color: color.primary,
  },

  glowAccent: {
    color: color.accent,
  },

  glowWarning: {
    color: color.warning,
  },

  glowDemo: {
    display: "flex",
    alignItems: "center",
    gap: space["6"],
    flexWrap: "wrap",
  },

  glowOrb: {
    width: 48,
    height: 48,
    borderRadius: "50%",
  },

  glowBlue: {
    backgroundColor: color.primary,
    color: color.primary,
  },

  glowPink: {
    backgroundColor: color.accent,
    color: color.accent,
  },

  glowOrange: {
    backgroundColor: color.warning,
    color: color.warning,
  },

  motionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space["2"],
    marginTop: space["6"],
  },

  motionTag: {
    padding: `${space["2"]} ${space["3"]}`,
    borderRadius: radius.sm,
    backgroundColor: color.surfaceRaised,
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.sizeMd,
    color: color.textMuted,
  },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section {...stylex.props(styles.section)}>
      <span {...stylex.props(styles.sectionTitle)}>{title}</span>
      {children}
    </section>
  );
}

function App() {
  const [count, setCount] = useState(0);
  const [light, setLight] = useState(false);

  return (
    <div {...stylex.props(styles.page, light && lightTheme)}>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.headerRow)}>
          <div>
            <h1 {...stylex.props(styles.title)}>@repo/ui — theme demo</h1>

            <p {...stylex.props(styles.tagline)}>
              Gruvbox-inspired creative toolkit · dark first · subtle & expressive
            </p>
          </div>

          <button
            type="button"
            {...stylex.props(styles.themeToggle)}
            onClick={() => setLight((value) => !value)}
          >
            {light ? "Dark theme" : "Light theme"}
          </button>
        </div>
      </header>

      <main {...stylex.props(styles.shell)}>
        <Section title="Semantic colors">
          <div {...stylex.props(styles.swatchGrid)}>
            {semanticColors.map(([name, ref, value]) => (
              <figure key={name} {...stylex.props(styles.swatchItem)}>
                <div
                  {...stylex.props(
                    name.includes("background") ? styles.swatchBackground(ref) : styles.swatch(ref),
                  )}
                />

                <figcaption>
                  <span {...stylex.props(styles.swatchName)}>{name}</span>

                  <span {...stylex.props(styles.swatchValue)}>{value}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title="Surfaces">
          <div {...stylex.props(styles.surfaceGrid)}>
            {surfaces.map(([name, ref, description]) => (
              <div key={name} {...stylex.props(styles.surface(ref))}>
                <span {...stylex.props(styles.surfaceLabel)}>{name}</span>

                <p {...stylex.props(styles.surfaceDescription)}>{description}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Content">
          <div {...stylex.props(styles.contentStack)}>
            {content.map(([name, ref]) => (
              <div key={name} {...stylex.props(styles.contentRow)}>
                <span {...stylex.props(styles.contentLabel)}>{name}</span>

                <span {...stylex.props(styles.semanticText(ref))}>
                  The quick brown fox jumps over the lazy dog
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing">
          {spacings.map(([name, ref, px]) => (
            <div key={name} {...stylex.props(styles.spaceRow)}>
              <span {...stylex.props(styles.spaceLabel)}>
                {name} · {px}
              </span>

              <div {...stylex.props(styles.spaceBar(ref))} />
            </div>
          ))}
        </Section>

        <Section title="Radius">
          <div {...stylex.props(styles.radiusRow)}>
            {radii.map(([name, ref]) => (
              <div key={name} {...stylex.props(styles.radiusItem)}>
                <div {...stylex.props(styles.radiusBox(ref))} />

                <span {...stylex.props(styles.swatchValue)}>{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>body</span>

            <p {...stylex.props(styles.typeBody)}>The quick brown fox jumps over the lazy dog</p>
          </div>

          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>label</span>

            <p {...stylex.props(styles.typeLabelText)}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>value / mono</span>

            <p {...stylex.props(styles.typeValue)}>0x3F 0x2A · fractal iteration · 0123456789</p>
          </div>

          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>caption</span>

            <p {...stylex.props(styles.typeCaption)}>
              Small supporting information should remain quiet.
            </p>
          </div>
        </Section>

        <Section title="Elevation">
          <div {...stylex.props(styles.elevationGrid)}>
            <div {...stylex.props(styles.panel, effects.raised)}>
              <span {...stylex.props(styles.panelTitle)}>Panel</span>

              <p {...stylex.props(styles.panelHint)}>Depth without a visible border.</p>
            </div>

            <div {...stylex.props(styles.panel, effects.floating)}>
              <span {...stylex.props(styles.panelTitle)}>Overlay</span>

              <p {...stylex.props(styles.panelHint)}>
                A stronger elevation treatment for floating UI.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Glow">
          <div {...stylex.props(styles.glowDemo)}>
            <div {...stylex.props(styles.glowOrb, styles.glowBlue, effects.glow)} />

            <div {...stylex.props(styles.glowOrb, styles.glowPink, effects.glow)} />

            <div {...stylex.props(styles.glowOrb, styles.glowOrange, effects.glow)} />

            <span {...stylex.props(styles.panelHint)}>
              Glow follows the element's current color.
            </span>
          </div>
        </Section>

        <Section title="Interactive states">
          <div {...stylex.props(styles.buttonRow)}>
            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonPrimary)}
              onClick={() => setCount((value) => value + 1)}
            >
              Count is {count}
            </button>

            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonSecondary)}
            >
              Secondary
            </button>

            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonAccent)}
            >
              Accent
            </button>

            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonGhost)}
            >
              Ghost
            </button>

            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonWarning)}
            >
              Warning
            </button>

            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonDanger)}
            >
              Danger
            </button>

            <button
              type="button"
              disabled
              {...stylex.props(ui.disabled, styles.button, styles.buttonGhost)}
            >
              Disabled
            </button>
          </div>

          <div {...stylex.props(styles.motionRow)}>
            <span {...stylex.props(styles.motionTag)}>{motion.durationFast} fast</span>

            <span {...stylex.props(styles.motionTag)}>{motion.durationNormal} normal</span>

            <span {...stylex.props(styles.motionTag)}>{motion.durationSlow} slow</span>

            <span {...stylex.props(styles.motionTag)}>out {motion.easingOut}</span>

            <span {...stylex.props(styles.motionTag)}>in-out {motion.easingInOut}</span>
          </div>
        </Section>
      </main>
    </div>
  );
}

export default App;
