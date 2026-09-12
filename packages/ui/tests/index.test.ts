import { expect, test } from "vite-plus/test";
import { color, styles } from "../src/index.ts";

test("public entry exposes theme tokens", () => {
  expect(color.background).toBeDefined();
  expect(styles.interactive).toBeDefined();
});
