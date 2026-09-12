import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { motion } from "@repo/ui/src/theme/consts.stylex.ts";
import {
  blur,
  color,
  radius,
  shadow,
  space,
  typography,
} from "@repo/ui/src/theme/tokens.stylex.ts";
import { palette } from "@repo/ui/src/theme/palette.stylex.ts";
import { styles as ui } from "@repo/ui/src/theme/styles.ts";

const colors: Array<[string, string, string]> = [
  ["background", color.background, palette.bg0Hard],
  ["surface", color.surface, palette.bg0],
  ["surfaceElevated", color.surfaceElevated, palette.bg1],
  ["text", color.text, palette.fg1],
  ["textMuted", color.textMuted, palette.fg3],
  ["textDisabled", color.textDisabled, palette.bg4],
  ["border", color.border, palette.bg2],
  ["borderHover", color.borderHover, palette.bg3],
  ["borderActive", color.borderActive, palette.orangeActive],
  ["accent", color.accent, palette.orange],
  ["accentHover", color.accentHover, palette.orangeHover],
  ["accentActive", color.accentActive, palette.orangeActive],
  ["onAccent", color.onAccent, palette.black],
  ["success", color.success, palette.green],
  ["warning", color.warning, palette.yellow],
  ["error", color.error, palette.red],
];

const spacings: Array<[string, string, string]> = [
  ["xs", space.xs, "4px"],
  ["sm", space.sm, "8px"],
  ["md", space.md, "12px"],
  ["lg", space.lg, "16px"],
  ["xl", space.xl, "24px"],
];

const radii: Array<[string, string, string]> = [
  ["sm", radius.sm, "4px"],
  ["md", radius.md, "6px"],
  ["lg", radius.lg, "8px"],
];

const styles = stylex.create({
  page: {
    minHeight: "100svh",
    backgroundColor: color.background,
    color: color.text,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeBody,
    lineHeight: typography.lineBody,
  },
  header: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: `${space.xl} ${space.xl} 0`,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: typography.weightSemibold,
    color: color.text,
  },
  tagline: {
    margin: `${space.xs} 0 0`,
    color: color.textMuted,
  },
  shell: {
    maxWidth: 1040,
    margin: "0 auto",
    padding: `0 ${space.xl} ${space.xl}`,
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  section: {
    backgroundColor: color.surface,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  sectionTitle: {
    display: "block",
    fontSize: typography.sizeLabel,
    fontWeight: typography.weightSemibold,
    color: color.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: space.lg,
  },
  swatchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: space.md,
  },
  swatch: (backgroundColor: string) => ({
    aspectRatio: "1 / 1",
    borderRadius: radius.md,
    backgroundColor,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderHover,
  }),
  swatchName: {
    display: "block",
    marginTop: space.sm,
    fontSize: typography.sizeValue,
    fontWeight: typography.weightMedium,
    color: color.text,
  },
  swatchHex: {
    display: "block",
    fontFamily: typography.fontMono,
    fontSize: typography.sizeCaption,
    color: color.textMuted,
  },
  spaceRow: {
    display: "flex",
    alignItems: "center",
    gap: space.md,
    marginBottom: space.md,
  },
  spaceBar: (width: string) => ({
    width,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: color.accent,
  }),
  spaceLabel: {
    width: 40,
    color: color.textMuted,
    fontFamily: typography.fontMono,
    fontSize: typography.sizeCaption,
  },
  radiusRow: {
    display: "flex",
    gap: space.xl,
  },
  radiusBox: (borderRadius: string) => ({
    width: 72,
    height: 72,
    borderRadius,
    backgroundColor: color.surfaceElevated,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.borderHover,
  }),
  typeRow: {
    marginBottom: space.sm,
  },
  typeLabel: {
    display: "block",
    fontSize: typography.sizeCaption,
    color: color.textMuted,
    fontFamily: typography.fontMono,
    marginBottom: 2,
  },
  typeBody: {
    fontFamily: typography.fontSans,
    fontSize: typography.sizeBody,
    fontWeight: typography.weightRegular,
    lineHeight: typography.lineBody,
  },
  typeLabelText: {
    fontFamily: typography.fontSans,
    fontSize: typography.sizeLabel,
    fontWeight: typography.weightSemibold,
    lineHeight: typography.lineLabel,
    color: color.text,
  },
  typeValue: {
    fontFamily: typography.fontMono,
    fontSize: typography.sizeValue,
    fontWeight: typography.weightRegular,
    lineHeight: typography.lineValue,
  },
  typeCaption: {
    fontFamily: typography.fontSans,
    fontSize: typography.sizeCaption,
    fontWeight: typography.weightRegular,
    lineHeight: typography.lineCaption,
    color: color.textMuted,
  },
  elevationRow: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  panel: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceElevated,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
  },
  panelShadow: {
    boxShadow: shadow.panel,
  },
  panelOverlay: {
    boxShadow: shadow.overlay,
    backdropFilter: blur.overlay,
  },
  panelTitle: {
    display: "block",
    fontSize: typography.sizeLabel,
    fontWeight: typography.weightSemibold,
    marginBottom: space.xs,
  },
  panelHint: {
    margin: 0,
    fontSize: typography.sizeValue,
    color: color.textMuted,
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.md,
    alignItems: "center",
  },
  button: {
    padding: `${space.sm} ${space.lg}`,
    borderRadius: radius.md,
    fontFamily: typography.fontSans,
    fontSize: typography.sizeBody,
    fontWeight: typography.weightMedium,
    borderWidth: "1px",
    borderStyle: "solid",
  },
  buttonPrimary: {
    backgroundColor: color.accent,
    borderColor: color.accentActive,
    color: color.onAccent,
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderColor: color.borderHover,
    color: color.text,
  },
  motionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.lg,
  },
  motionTag: {
    padding: `${space.xs} ${space.sm}`,
    borderRadius: radius.sm,
    backgroundColor: color.surfaceElevated,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: color.border,
    fontFamily: typography.fontMono,
    fontSize: typography.sizeCaption,
    color: color.textMuted,
  },
  swatchItem: {
    display: "flex",
    flexDirection: "column",
  },
  radiusItem: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    alignItems: "center",
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

  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <h1 {...stylex.props(styles.title)}>@repo/ui — theme demo</h1>
        <p {...stylex.props(styles.tagline)}>
          Gruvbox dark · compact & tactile creative-instrument visual language
        </p>
      </header>

      <main {...stylex.props(styles.shell)}>
        <Section title="Colors">
          <div {...stylex.props(styles.swatchGrid)}>
            {colors.map(([name, ref, hex]) => (
              <figure key={name} {...stylex.props(styles.swatchItem)}>
                <div {...stylex.props(styles.swatch(ref))} />
                <figcaption>
                  <span {...stylex.props(styles.swatchName)}>{name}</span>
                  <span {...stylex.props(styles.swatchHex)}>{hex}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section title="Spacing">
          {spacings.map(([name, ref, px]) => (
            <div key={name} {...stylex.props(styles.spaceRow)}>
              <span {...stylex.props(styles.spaceLabel)}>
                {name} ({px})
              </span>
              <div {...stylex.props(styles.spaceBar(ref))} />
            </div>
          ))}
        </Section>

        <Section title="Radius">
          <div {...stylex.props(styles.radiusRow)}>
            {radii.map(([name, ref, px]) => (
              <div key={name} {...stylex.props(styles.radiusItem)}>
                <div {...stylex.props(styles.radiusBox(ref))} />
                <span {...stylex.props(styles.swatchName)}>
                  {name} ({px})
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>body · 14px / 400</span>
            <p {...stylex.props(styles.typeBody)}>The quick brown fox jumps over the lazy dog</p>
          </div>
          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>label · 12px / 600</span>
            <p {...stylex.props(styles.typeLabelText)}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>value / mono · 12px</span>
            <p {...stylex.props(styles.typeValue)}>0x3F 0x2A mono metrics 0123456789</p>
          </div>
          <div {...stylex.props(styles.typeRow)}>
            <span {...stylex.props(styles.typeLabel)}>caption · 11px</span>
            <p {...stylex.props(styles.typeCaption)}>The quick brown fox jumps over the lazy dog</p>
          </div>
        </Section>

        <Section title="Elevation">
          <div {...stylex.props(styles.elevationRow)}>
            <div {...stylex.props(styles.panel, styles.panelShadow)}>
              <span {...stylex.props(styles.panelTitle)}>Panel</span>
              <p {...stylex.props(styles.panelHint)}>shadow.panel — dual-layer drop shadow below</p>
            </div>
            <div {...stylex.props(styles.panel, styles.panelOverlay)}>
              <span {...stylex.props(styles.panelTitle)}>Overlay</span>
              <p {...stylex.props(styles.panelHint)}>
                shadow.overlay + blur.overlay · elevated surface with blurred backdrop
              </p>
            </div>
          </div>
        </Section>

        <Section title="Interactive states">
          <div {...stylex.props(styles.buttonRow)}>
            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonPrimary)}
              onClick={() => setCount((c) => c + 1)}
            >
              Count is {count}
            </button>
            <button
              type="button"
              {...stylex.props(ui.interactive, ui.focusRing, styles.button, styles.buttonGhost)}
            >
              Ghost
            </button>
            <button
              type="button"
              disabled
              {...stylex.props(ui.interactive, ui.disabled, styles.button, styles.buttonGhost)}
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
