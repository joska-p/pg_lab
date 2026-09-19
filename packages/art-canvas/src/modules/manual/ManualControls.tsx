import * as stylex from "@stylexjs/stylex";
import { Button } from "@repo/ui/components/Button";
import { Slider } from "@repo/ui/components/Slider";
import { space } from "@repo/ui/tokens/layout.stylex";

import {
  setChroma,
  setDivisions,
  setIsPlaying,
  setLightness,
  useChroma,
  useDivisions,
  useIsPlaying,
  useLightness,
} from "./store";

const styles = stylex.create({
  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: space["2"],
  },
});

function ManualControls() {
  const divisions = useDivisions();
  const chroma = useChroma();
  const lightness = useLightness();
  const isPlaying = useIsPlaying();

  function handlePlay() {
    setIsPlaying(!isPlaying);
  }

  return (
    <>
      <Slider
        label="Divisions"
        value={divisions}
        onValueChange={setDivisions}
        min={1}
        max={100}
        step={1}
      />
      <Slider
        label="Chroma"
        value={chroma}
        onValueChange={setChroma}
        min={0}
        max={0.4}
        step={0.01}
      />
      <Slider
        label="Lightness"
        value={lightness}
        onValueChange={setLightness}
        min={0}
        max={1}
        step={0.1}
      />
      <div {...stylex.props(styles.actions)}>
        <Button onClick={handlePlay}>{isPlaying ? "Stop" : "Play"}</Button>
      </div>
    </>
  );
}

export { ManualControls };
