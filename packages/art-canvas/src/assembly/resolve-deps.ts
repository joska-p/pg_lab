import { PREAMBLE_REGISTRY } from "./registries";

import type { ShaderModule, ShaderTemplate } from "../shaders/types";

export function resolveDeps(template: ShaderTemplate, activeModules: ShaderModule[]): string {
  const deps = Array.from(
    new Set([...(template.deps ?? []), ...activeModules.flatMap((m) => m.deps ?? [])]),
  );
  const preambleCode = deps.map((name) => PREAMBLE_REGISTRY[name]).join("\n");
  const moduleCode = Array.from(new Set(activeModules.map((m) => m.code))).join("\n");

  return preambleCode ? preambleCode + "\n" + moduleCode : moduleCode;
}
