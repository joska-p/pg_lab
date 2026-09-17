import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { colors } from "../tokens/colors.stylex";
import { borderWidth, layout, radius, space, zIndex } from "../tokens/layout.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { glass } from "../recipes/effects.stylex";
import { Button } from "./Button";

const styles = stylex.create({
  base: {
    position: "relative",
    display: "flex",
    flexDirection: {
      default: "row",
      "@media (max-width: 720px)": "column",
      "@media (orientation: portrait)": "column",
    },
    gap: space["3"],
    width: "100%",
    height: "100%",
    padding: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },

  stageSlot: {
    position: "relative",
    flex: 1,
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    overflowY: "auto",
  },

  panel: {
    display: "flex",
    flexDirection: "column",
    [shadowColor.color]: colors.card,
    width: layout.panelWidth,
    flexShrink: 0,
    minHeight: 0,
    maxHeight: "100%",
    overflowY: "auto",
    borderRadius: { default: radius.none, "@media (min-width: 1024px)": radius.md },
    borderWidth: borderWidth.hairline,
    borderStyle: "solid",
    borderColor: colors.border,
    backgroundColor: colors.card,
    color: colors.cardForeground,

    "@media (max-width: 720px)": {
      width: "auto",
      maxHeight: layout.panelMaxMobileHeight,
    },

    "@media (orientation: portrait)": {
      width: "auto",
      maxHeight: layout.panelMaxMobileHeight,
    },
  },

  panelFloating: {
    position: "absolute",
    top: space["3"],
    right: space["3"],
    bottom: space["3"],
    zIndex: zIndex.panel,
    width: layout.panelWidth,
    maxHeight: "none",
    borderRadius: radius.md,

    "@media (max-width: 720px)": {
      left: space["3"],
      top: "auto",
      bottom: space["3"],
      width: "auto",
      maxHeight: layout.panelMaxMobileHeight,
    },
  },

  hidden: {
    display: "none",
  },

  toggle: {
    position: "absolute",
    top: space["3"],
    right: space["3"],
    zIndex: zIndex.overlay,
  },

  toggleClearOfFloatingPanel: {
    right: `calc(${layout.panelWidth} + calc(${layout.panelGap} * 2))`,

    "@media (max-width: 720px)": {
      right: space["3"],
    },

    "@media (orientation: portrait)": {
      right: space["3"],
    },
  },
});

type ExperimentShellProps = {
  children: React.ReactNode;
  panel?: React.ReactNode;
  panelPlacement?: "docked" | "floating";
  style?: StyleXStyles;
};

export function ExperimentShell({
  children,
  panel,
  panelPlacement = "docked",
  style,
}: ExperimentShellProps) {
  const panelId = useId();
  const [panelVisible, setPanelVisible] = useState(true);

  const isFloating = panelPlacement === "floating";

  const panelStyle = [
    styles.panel,
    isFloating && styles.panelFloating,
    glass.glass,
    !panelVisible && styles.hidden,
  ];

  const toggleStyle = [
    styles.toggle,
    isFloating && panelVisible && styles.toggleClearOfFloatingPanel,
  ];

  return (
    <div {...stylex.props(styles.base, style)}>
      <div {...stylex.props(styles.stageSlot)}>{children}</div>

      {panel && (
        <>
          <div id={panelId} {...stylex.props(...panelStyle)}>
            {panel}
          </div>

          <div {...stylex.props(...toggleStyle)}>
            <Button
              aria-expanded={panelVisible}
              aria-controls={panelId}
              onClick={() => setPanelVisible((visible) => !visible)}
            >
              {panelVisible ? "hide panel" : "show panel"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
