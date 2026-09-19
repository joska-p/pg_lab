import { posterize } from "../shaders/modules/effects/posterize";
import { lineSdf } from "../shaders/modules/shapes/lineSdf";
import { noiseField } from "../shaders/modules/shapes/noiseField";
import { sdBox } from "../shaders/modules/shapes/sdBox";
import { circleSdf } from "../shaders/modules/shapes/sdCircle";
import { truchet } from "../shaders/modules/shapes/truchet";
import { voronoiModule } from "../shaders/modules/shapes/voronoi";
import { domainWarp } from "../shaders/modules/space/domainWarp";
import { flowField } from "../shaders/modules/space/flowField";
import { kaleidoscope } from "../shaders/modules/space/kaleidoscope";
import { mouseAttractor } from "../shaders/modules/space/mouseAttractor";
import { polarCoords } from "../shaders/modules/space/polarCoords";
import { repeatSpace } from "../shaders/modules/space/repeatSpace";
import { rotate2d } from "../shaders/modules/space/rotate2d";
import { twirl } from "../shaders/modules/space/twirl";
import fbmPreamble from "../shaders/preamble/fbm.glsl?raw";
import noisePreamble from "../shaders/preamble/noise2d.glsl?raw";
import { ClassicTemplate } from "../shaders/templates/classic";
import { DirectNoiseTemplate } from "../shaders/templates/DirectNoiseTemplate";
import { SinglePassTemplate } from "../shaders/templates/SinglePassTemplate";

import type { ShaderModule, ShaderTemplate } from "../shaders/types";

export const PREAMBLE_REGISTRY: Record<string, string> = {
  noise2d: noisePreamble,
  fbm: fbmPreamble,
};

export const SPACE_REGISTRY: ShaderModule[] = [
  domainWarp,
  flowField,
  rotate2d,
  repeatSpace,
  polarCoords,
  mouseAttractor,
  twirl,
  kaleidoscope,
];

export const SHAPE_REGISTRY: ShaderModule[] = [
  voronoiModule,
  noiseField,
  sdBox,
  circleSdf,
  truchet,
  lineSdf,
];

export const TEMPLATE_REGISTRY: ShaderTemplate[] = [
  ClassicTemplate,
  DirectNoiseTemplate,
  SinglePassTemplate,
];

export const EFFECT_REGISTRY: ShaderModule[] = [posterize];
