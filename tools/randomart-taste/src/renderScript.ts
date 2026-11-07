/**
 * Plain JavaScript evaluated inside the page. It stays a string on purpose: Playwright serializes
 * evaluated functions with `toString()`, and a TypeScript runner may inject helpers into them that
 * do not exist in the browser. Defines `window.__render(source, phases, size)`, which returns `{
 * ok: true, frames: base64[] }` (RGBA bytes per phase) or `{ ok: false, error }`.
 *
 * `String.raw` keeps the `\n` escapes of the GLSL source as written.
 */
export const RENDER_SCRIPT = String.raw`
(() => {
  const VERTEX = '#version 300 es\nprecision highp float;\nout vec2 vUv;\nvoid main() {\n  vec2 pos[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));\n  vUv = pos[gl_VertexID] * 0.5 + 0.5;\n  gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);\n}';
  let canvas = null;
  let gl = null;

  function context(size) {
    if (canvas === null) {
      canvas = document.createElement('canvas');
      gl = canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    }
    if (gl === null) {
      throw new Error('WebGL2 is not available');
    }
    canvas.width = size;
    canvas.height = size;
    return gl;
  }

  function stage(type, source, shaders) {
    const shader = gl.createShader(type);
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'shader compilation failed');
    }
    return shader;
  }

  function link(fragmentSource) {
    const shaders = [];
    const program = gl.createProgram();
    try {
      gl.attachShader(program, stage(gl.VERTEX_SHADER, VERTEX, shaders));
      gl.attachShader(program, stage(gl.FRAGMENT_SHADER, fragmentSource, shaders));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'program link failed');
      }
      return program;
    } catch (error) {
      gl.deleteProgram(program);
      throw error;
    } finally {
      for (const shader of shaders) {
        gl.deleteShader(shader);
      }
    }
  }

  function toBase64(bytes) {
    let binary = '';
    for (let start = 0; start < bytes.length; start += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(start, start + 0x8000));
    }
    return btoa(binary);
  }

  window.__render = (source, phases, size) => {
    try {
      context(size);
      const program = link(source);
      try {
        gl.useProgram(program);
        gl.viewport(0, 0, size, size);
        const location = gl.getUniformLocation(program, 'u_phase');
        const frames = [];
        for (const phase of phases) {
          gl.uniform1f(location, phase);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          const pixels = new Uint8Array(size * size * 4);
          gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          frames.push(toBase64(pixels));
        }
        return { ok: true, frames };
      } finally {
        gl.deleteProgram(program);
      }
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error) };
    }
  };
})()
`;
