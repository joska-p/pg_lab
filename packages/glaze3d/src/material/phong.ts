export type ColorTuple = [number, number, number];

export interface PhongMaterialOptions {
  color?: number | ColorTuple;
  specular?: number | ColorTuple;
  shininess?: number;
}

export function parseColor(input: number | ColorTuple): ColorTuple {
  if (typeof input === "number") {
    const hex = Math.floor(input);
    return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
  }
  return [input[0], input[1], input[2]];
}

export class Material {}

export class PhongMaterial extends Material {
  color: ColorTuple;
  specular: ColorTuple;
  shininess: number;

  constructor(options: PhongMaterialOptions = {}) {
    super();
    this.color = parseColor(options.color ?? 0xffffff);
    this.specular = parseColor(options.specular ?? 0x111111);
    this.shininess = options.shininess ?? 30;
  }
}

// Escape hatch (spec section 5): a mesh can carry raw GLSL instead of a
// PhongMaterial. The renderer compiles it and binds the standard transform
// uniforms (uProjectionMatrix, uModelViewMatrix, uNormalMatrix) plus the
// position/normal attributes; any other uniform is the caller's business.
export class ShaderMaterial extends Material {
  vertexSource: string;
  fragmentSource: string;

  constructor(vertexSource: string, fragmentSource: string) {
    super();
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
  }
}
