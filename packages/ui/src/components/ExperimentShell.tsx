import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXStyles } from "@stylexjs/stylex";
import { elevation } from "../effects/elevation.stylex";
import { glass } from "../effects/glass.stylex";
import { colors } from "../tokens/colors.stylex";
import { shadowColor } from "../tokens/shadows.stylex";
import { layout } from "../consts/layout.stylex";
import { borderWidth } from "../consts/borderWidth.stylex";
import { radius } from "../consts/radius.stylex";
import { space } from "../consts/spacing.stylex";
import { zIndex } from "../consts/zIndex.stylex";
import { Button } from "./Button";

const TOGGLE_CLEARANCE = Number.parseFloat(layout.panelGap) * 2;

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
    borderRadius: radius.md,
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
    "@media (max-width: 720px)": {
      left: space["3"],
      right: space["3"],
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
    right: `calc(${layout.panelWidth} + ${TOGGLE_CLEARANCE}px)`,
    "@media (max-width: 720px)": {
      right: space["3"],
    },
    "@media (orientation: portrait)": {
      right: space["3"],
    },
  },
});

type ExperimentShellProps = {
  panel?: React.ReactNode;
  placement?: "docked" | "floating";
  panelVisible?: boolean;
  defaultVisible?: boolean;
  onTogglePanel?: (visible: boolean) => void;
  toggleLabel?: string;
  style?: StyleXStyles;
  children?: React.ReactNode;
};

export function ExperimentShell(props: ExperimentShellProps) {
  const {
    panel,
    placement = "docked",
    panelVisible,
    defaultVisible = true,
    onTogglePanel,
    toggleLabel = "panel",
    style,
    children,
  } = props;

  const panelId = useId();
  const [internal, setInternal] = useState(defaultVisible);
  const isControlled = panelVisible !== undefined;
  const visible = isControlled ? panelVisible : internal;

  function handleToggle() {
    const next = !visible;
    if (!isControlled) setInternal(next);
    onTogglePanel?.(next);
  }

  return (
    <div {...stylex.props(styles.base, style)}>
      <div {...stylex.props(styles.stageSlot)}>{children}</div>
      {panel ? (
        <div
          id={panelId}
          {...stylex.props(
            styles.panel,
            placement === "floating" ? styles.panelFloating : null,
            // Glass is reserved for floating UI over a backdrop (translucency
            // makes text contrast depend on what sits behind). Docked keeps a
            // solid ground + a raised cast so the panel still lifts off the
            // stage without compositing a 24px blur in normal flow.
            placement === "floating" ? glass.glass : elevation.raised,
            visible ? null : styles.hidden,
          )}
        >
          {panel}
        </div>
      ) : null}
      {panel ? (
        <div
          {...stylex.props(
            styles.toggle,
            placement === "floating" && visible ? styles.toggleClearOfFloatingPanel : null,
          )}
        >
          <Button
            variant="secondary"
            aria-expanded={visible}
            aria-controls={panelId}
            onClick={handleToggle}
          >
            {visible ? `hide ${toggleLabel}` : `show ${toggleLabel}`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
