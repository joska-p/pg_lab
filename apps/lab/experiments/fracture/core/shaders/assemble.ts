// Concatenate ?raw GLSL chunks + a body into a complete fragment shader.
// Prepends the ES 3.00 version pragma and default float precision so bodies
// and chunks stay pragma-free and shareable.
export function assemble(...parts: string[]): string {
    return `#version 300 es\nprecision highp float;\n${parts.join('\n')}`;
}
