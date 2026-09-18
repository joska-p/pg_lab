import * as stylex from "@stylexjs/stylex";
import { colors } from "@repo/ui/tokens/colors.stylex";
import { radius, space } from "@repo/ui/tokens/layout.stylex";
import { typography } from "@repo/ui/tokens/typography.stylex";
import { focusRing, interactive } from "@repo/ui/recipes/interaction.stylex";
import { fieldText } from "@repo/ui/recipes/typography.stylex";
import { initialPalette, initialTileSet } from "../../core/constants";
import { toggleTileInSet } from "../../stores/mosaic/actions";
import { useTileSet } from "../../stores/mosaic/selectors";
import { Tile } from "../Tile";

const TILE_COLORS: [string, string, string, string, string] = [
  "--color-0",
  "--color-1",
  "--color-2",
  "--color-3",
  "--color-4",
];

const TILE_GRID_STYLE = {
  ...initialPalette,
  "--tile-size": "32px",
} as React.CSSProperties;

const displayNames: Record<string, string> = {
  CornerCircles: "Corner",
  Diamond: "Diamond",
  MiddleCircle: "Middle",
  OppositeCircles: "Opposite",
  Rainbow: "Rainbow",
  Square: "Square",
  Triangles: "Triangles",
  Cube: "Cube",
};

const styles = stylex.create({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    alignItems: "center",
    justifyContent: "center",
    gap: space["4"],
    paddingInline: space["2"],
    paddingBlock: space["4"],
  },

  option: {
    display: "grid",
    justifyItems: "center",
    gap: space["2"],
    appearance: "none",
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.sm,
    backgroundColor: "transparent",
    color: colors.foreground,
  },

  dimmed: {
    opacity: 0.65,
  },

  ring: {
    boxShadow: `0 0 0 3px ${colors.ring}`,
  },

  label: {
    fontFamily: typography.fontFamilyMono,
    fontSize: typography.fontSizeXs,
    display: "none",
    "@media (min-width: 640px)": {
      display: "inline",
    },
  },
});

function TileSetControls() {
  const tileSet = useTileSet();

  return (
    <div {...stylex.props(styles.grid)} style={TILE_GRID_STYLE}>
      {initialTileSet.map((tileName) => {
        const selected = tileSet.includes(tileName);

        return (
          <button
            key={tileName}
            type="button"
            aria-label={tileName}
            aria-pressed={selected}
            onClick={() => {
              toggleTileInSet(tileName);
            }}
            {...stylex.props(
              styles.option,
              interactive.base,
              focusRing.base,
              selected ? styles.ring : styles.dimmed,
            )}
          >
            <Tile name={tileName} colors={TILE_COLORS} rotation="--rotation-0" />
            <span {...stylex.props(styles.label, fieldText.label)}>{displayNames[tileName]}</span>
          </button>
        );
      })}
    </div>
  );
}

export { TileSetControls };
