#!/usr/bin/env node
// Scaffold a new preconfigured app from tools/app-template.
// Usage: vp run new-app -- <name>   (e.g. vp run new-app -- website)
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "__APP_NAME__";
const SUBSTITUTED = ["package.json", "index.html", "README.md", "src/App.tsx"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2).filter((arg) => arg !== "--");
const name = args[0];

if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error("Usage: vp run new-app -- <name>  (lowercase letters, digits, dashes)");
  process.exit(1);
}

const target = join(root, "apps", name);
if (existsSync(target)) {
  console.error(`apps/${name} already exists.`);
  process.exit(1);
}

cpSync(join(root, "tools", "app-template"), target, { recursive: true });
for (const file of SUBSTITUTED) {
  const path = join(target, file);
  writeFileSync(path, readFileSync(path, "utf8").replaceAll(PLACEHOLDER, name));
}

console.log(`Created apps/${name} from tools/app-template.`);
console.log("Next steps:");
console.log("  vp install");
console.log(`  vp -C apps/${name} dev`);
