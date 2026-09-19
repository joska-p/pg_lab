import * as stylex from "@stylexjs/stylex";
import { Button } from "@repo/ui/components/Button";
import { Slider } from "@repo/ui/components/Slider";
import { space } from "@repo/ui/tokens/layout.stylex";
import { useSyncExternalStore } from "react";

import { setGap, useClockStore, useGap, useHasClockStore } from "./store";

const styles = stylex.create({
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: space["2"],
  },
});

function SpiraleControls() {
  const gap = useGap();
  const clockStore = useClockStore();
  const hasClockStore = useHasClockStore();

  const isPlaying = useSyncExternalStore(
    (onStoreChange) => clockStore.subscribe(onStoreChange),
    () => clockStore.getIsPlaying(),
  );

  return (
    <div {...stylex.props(styles.actions)}>
      <Button
        onClick={() => {
          clockStore.togglePlay();
        }}
        disabled={!hasClockStore}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Slider label="Gap" value={gap} onValueChange={setGap} min={0.01} max={0.5} step={0.01} />
    </div>
  );
}

export { SpiraleControls };
