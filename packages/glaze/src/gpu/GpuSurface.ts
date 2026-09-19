import { defaultCamera, type Camera } from "../core/Camera";
import { createClock, type Clock } from "../core/Clock";
import { FrameLoop } from "../core/FrameLoop";
import { createInputStore, type InputStore } from "../core/InputStore";
import {
  createCssColor,
  createDevicePixelRatio,
  createNonNegativeSeconds,
  createSeconds,
  toScreenPoint,
  type CssColor,
  type DevicePixelRatio,
  type FontSize,
  type FrameStep,
  type NonNegativeSeconds,
  type Point2D,
  type PositiveNumber,
  type ScreenPoint,
  type Seconds,
  type WorldPoint,
} from "../core/types";
import { ShapeBatcher } from "./batch/ShapeBatcher";
import { createProgram, type Program } from "./shader/Program";
import { createStandardUniformValues } from "./shader/setUniforms";
import { parseColor } from "./shapes/color";
import {
  DEFAULT_FONT_FAMILY,
  TextRasterizer,
  textFragmentSource,
  textUniforms,
} from "./shapes/TextRasterizer";
import { createStateBuffer, type StateBuffer } from "./StateBuffer";
import type { GpuSurfaceConfig } from "./types";
import type { DrawStyle, Rect, TextStyle } from "../cpu/shapes/types";

const buildStyle = (fill?: CssColor, stroke?: CssColor, lineWidth?: PositiveNumber): DrawStyle => ({
  ...(fill !== undefined ? { fill } : {}),
  ...(stroke !== undefined ? { stroke } : {}),
  ...(lineWidth !== undefined ? { lineWidth } : {}),
});

/**
 * WebGL2 surface sharing `CpuSurface`'s chainable, world-space drawing model. Context loss/restore
 * is handled internally.
 */
export class GpuSurface {
  /** Seconds since the frame loop started. */
  time: Seconds = createSeconds(0);
  /** Seconds since the previous frame. */
  deltaTime: NonNegativeSeconds = createNonNegativeSeconds(0);
  frameCount = 0;
  /** CSS pixels, not device pixels — multiply by `dpr` for the backing-buffer size. */
  width = 0;
  height = 0;
  readonly dpr: DevicePixelRatio;
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly camera: Camera;
  readonly input: InputStore;
  readonly clock: Clock;

  readonly #loop: FrameLoop;
  readonly #programs = new Set<Program>();
  readonly #buffers = new Set<StateBuffer>();
  readonly #batch: ShapeBatcher;
  #textRasterizer: TextRasterizer | null = null;
  #textProgram: Program | null = null;
  #cssWidth = 0;
  #cssHeight = 0;
  #lost = false;

  constructor(config: GpuSurfaceConfig) {
    const gl = config.canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    });

    if (!gl) throw new Error("Glaze: WebGL2 not supported");

    this.canvas = config.canvas;
    this.gl = gl;
    this.camera = config.camera ?? defaultCamera();
    this.dpr = config.dpr ?? createDevicePixelRatio(1);
    this.clock = config.clock ?? createClock(config.clockOptions);
    this.input = createInputStore();
    this.input.attach(this.canvas);
    this.#batch = new ShapeBatcher({
      gl,
      camera: this.camera,
      getViewport: () => ({ width: this.#cssWidth, height: this.#cssHeight }),
    });
    this.#loop = new FrameLoop(this.#frameStep);

    this.#configureState();
    this.#resize();
    this.canvas.addEventListener("webglcontextlost", this.#onContextLost);
    this.canvas.addEventListener("webglcontextrestored", this.#onContextRestored);
  }

  get isRunning(): boolean {
    return this.#loop.isRunning;
  }

  /** Pointer position in world coordinates (camera-transformed). */
  get pointer(): WorldPoint {
    return this.camera.screenToWorld(toScreenPoint(this.input.pointer));
  }

  screenToWorld(point: Point2D): WorldPoint {
    return this.camera.screenToWorld(toScreenPoint(point));
  }

  worldToScreen(point: WorldPoint): ScreenPoint {
    return this.camera.worldToScreen(point);
  }

  /** Creates a program owned by this surface: destroyed with it, recompiled on context restore. */
  createProgram(fragmentSource: string, vertexSource?: string): Program {
    const program = createProgram(this.gl, fragmentSource, vertexSource);

    this.#programs.add(program);

    return program;
  }

  /** Creates a StateBuffer owned by this surface: destroyed with it, resized on context restore. */
  createStateBuffer(width: number, height: number): StateBuffer {
    const buffer = createStateBuffer(this.gl, width, height);

    this.#buffers.add(buffer);

    return buffer;
  }

  renderProgram(program: Program): this {
    this.#flushBatch();

    if (this.#lost) return this;

    program.setUniforms(
      createStandardUniformValues(
        this.width,
        this.height,
        this.dpr,
        this.input.pointer,
        this.camera,
        this.time,
        this.clock.time,
      ),
    );
    program.render();

    return this;
  }

  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fill?: CssColor,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this;
  rect(rect: Rect, style?: DrawStyle): this;
  rect(
    xOrRect: number | Rect,
    yOrStyle?: number | DrawStyle,
    w = 0,
    h = 0,
    fill?: CssColor,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this {
    if (typeof xOrRect === "number") {
      this.#drawRect(
        { x: xOrRect, y: yOrStyle as number, w, h },
        buildStyle(fill, stroke, lineWidth),
      );
    } else {
      this.#drawRect(xOrRect, yOrStyle as DrawStyle | undefined);
    }

    return this;
  }

  circle(
    x: number,
    y: number,
    radius: number,
    fill?: CssColor,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this;
  circle(center: Point2D, radius: number, style?: DrawStyle): this;
  circle(
    xOrCenter: number | Point2D,
    yOrRadius: number,
    radiusOrStyle?: number | DrawStyle,
    fill?: CssColor,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this {
    if (typeof xOrCenter === "number") {
      this.#drawCircle(
        { x: xOrCenter, y: yOrRadius },
        radiusOrStyle as number,
        buildStyle(fill, stroke, lineWidth),
      );
    } else {
      this.#drawCircle(xOrCenter, yOrRadius, radiusOrStyle as DrawStyle | undefined);
    }

    return this;
  }

  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this;
  line(a: Point2D, b: Point2D, style?: DrawStyle): this;
  line(
    x1OrA: number | Point2D,
    y1OrB: number | Point2D,
    x2OrStyle?: number | DrawStyle,
    y2 = 0,
    stroke?: CssColor,
    lineWidth?: PositiveNumber,
  ): this {
    if (typeof x1OrA === "number") {
      this.#drawLine(
        { x: x1OrA, y: y1OrB as number },
        { x: x2OrStyle as number, y: y2 },
        buildStyle(undefined, stroke, lineWidth),
      );
    } else {
      this.#drawLine(x1OrA, y1OrB as Point2D, x2OrStyle as DrawStyle | undefined);
    }

    return this;
  }

  text(text: string, x: number, y: number, fill?: CssColor, fontSize?: FontSize): this;
  text(text: string, x: number, y: number, style: TextStyle): this;
  text(text: string, position: Point2D, style: TextStyle): this;
  text(
    text: string,
    xOrPosition: number | Point2D,
    yOrStyle: number | TextStyle,
    fillOrStyle?: CssColor | TextStyle,
    fontSize?: FontSize,
  ): this {
    if (typeof xOrPosition === "number") {
      if (typeof fillOrStyle === "object") {
        this.#drawText(text, xOrPosition, yOrStyle as number, fillOrStyle);
      } else {
        this.#drawText(text, xOrPosition, yOrStyle as number, {
          ...(fillOrStyle !== undefined ? { fill: fillOrStyle } : {}),
          ...(fontSize !== undefined ? { fontSize } : {}),
        });
      }
    } else {
      this.#drawText(text, xOrPosition.x, xOrPosition.y, yOrStyle as TextStyle);
    }

    return this;
  }

  /** Clears the framebuffer with a CSS color — same signature as `CpuSurface.clear`. */
  clear(color?: CssColor): this {
    this.#flushBatch();

    if (this.#lost) return this;

    const { r, g, b, a } = parseColor(color ?? createCssColor("#000000"));

    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    return this;
  }

  /** Subscribes to the frame loop; the rAF loop runs while at least one subscription is live. */
  onFrame(callback: (surface: this) => void): () => void {
    const wrapped = (): void => {
      callback(this);
    };

    return this.#loop.subscribe(wrapped);
  }

  destroy(): void {
    this.#loop.dispose();
    this.input.destroy();
    this.canvas.removeEventListener("webglcontextlost", this.#onContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.#onContextRestored);

    for (const program of this.#programs) program.destroy();

    this.#programs.clear();

    for (const buffer of this.#buffers) buffer.destroy();

    this.#buffers.clear();
    this.#textProgram = null;
    this.#batch.destroy();
    this.#textRasterizer?.destroy();
    this.#textRasterizer = null;
  }

  #drawCircle(center: Point2D, radius: number, style?: DrawStyle): void {
    if (this.#lost) return;

    this.#batch.drawCircle(center, radius, style ?? {});
  }

  #drawRect(rect: Rect, style?: DrawStyle): void {
    if (this.#lost) return;

    this.#batch.drawRect(rect, style ?? {});
  }

  #drawLine(a: Point2D, b: Point2D, style?: DrawStyle): void {
    if (this.#lost) return;

    this.#batch.drawLine(a, b, style ?? {});
  }

  #drawText(text: string, x: number, y: number, style: TextStyle): void {
    if (this.#lost || text.length === 0) return;

    this.#flushBatch();
    const rasterizer = (this.#textRasterizer ??= new TextRasterizer(this.gl));
    const size = style.fontSize ?? 16;
    const font = `${String(size)}px ${style.fontFamily ?? DEFAULT_FONT_FAMILY}`;
    const { texture, width, height } = rasterizer.get(text, font, size);
    const program = this.#getTextProgram();

    program.setUniforms(textUniforms({ x, y }, width, height, size, texture, style));
    this.renderProgram(program);
  }

  #getTextProgram(): Program {
    if (this.#textProgram === null) {
      this.#textProgram = this.createProgram(textFragmentSource);
    }

    return this.#textProgram;
  }

  #configureState(): void {
    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }

  #resize(): void {
    this.#cssWidth = Math.max(1, this.canvas.clientWidth);
    this.#cssHeight = Math.max(1, this.canvas.clientHeight);
    const deviceWidth = Math.round(this.#cssWidth * this.dpr);
    const deviceHeight = Math.round(this.#cssHeight * this.dpr);

    if (this.canvas.width !== deviceWidth) this.canvas.width = deviceWidth;

    if (this.canvas.height !== deviceHeight) this.canvas.height = deviceHeight;

    this.gl.viewport(0, 0, deviceWidth, deviceHeight);
  }

  #flushBatch(): void {
    if (this.#lost) return;

    this.#batch.flush();
  }

  #onContextLost = (event: Event): void => {
    event.preventDefault();
    this.#lost = true;
  };

  #onContextRestored = (): void => {
    this.#lost = false;
    this.#configureState();
    this.#resize();
    this.#textRasterizer?.clear();
    this.#batch.reinitialize();

    for (const program of this.#programs) program.reinitialize();

    for (const buffer of this.#buffers) buffer.resize(buffer.width, buffer.height);
  };

  #frameStep: FrameStep = (time, deltaTime, frameToken): void => {
    this.#resize();
    this.frameCount++;
    this.time = time;
    this.deltaTime = deltaTime;
    this.width = this.#cssWidth;
    this.height = this.#cssHeight;
    this.clock.update(deltaTime);

    this.#loop.runFrameSubscribers();
    this.#flushBatch();
    this.input.endFrame(frameToken);
  };
}

export function createGpuSurface(config: GpuSurfaceConfig): GpuSurface {
  return new GpuSurface(config);
}
