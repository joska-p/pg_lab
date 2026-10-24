import type { PixelData } from './pixel-data';
import type { Registry } from './registry';

// ─── UI Metadata ──────────────────────────────────────────────────────────────

export interface ArgDefinition {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
}

export interface ManipulationUIMetadata {
    name: string;
    description: string;
    longDescription: string;
    defaultArgs: Record<string, number>;
    argDefinitions: ArgDefinition[];
}

// ─── Manipulation Function Parameters ────────────────────────────────────────

export interface PixelParameters<Options> {
    options: Options;
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export interface NeighborhoodParameters<Options> {
    options: Options;
    source: Uint8ClampedArray;
    destination: Uint8ClampedArray;
    width: number;
    height: number;
}

export interface WholeImageParameters<Options> {
    options: Options;
    imageData: PixelData;
}

// ─── Manipulation Function Signatures ────────────────────────────────────────

export type PixelFunction<
    Options = any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
> = (parameters: PixelParameters<Options>) => [number, number, number, number];

export type NeighborhoodFunction<
    Options = any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
> = (parameters: NeighborhoodParameters<Options>) => void;

export type WholeImageFunction<
    Options = any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
> = (parameters: WholeImageParameters<Options>) => PixelData;

// ─── Manipulation Definition ─────────────────────────────────────────────────

/**
 * The `options` property is never read at runtime: it only carries the option type so the manifest
 * can derive the typed `Step` union.
 */
export type ManipulationDefinition<
    Options = any /* eslint-disable-line @typescript-eslint/no-explicit-any */,
> = {
    id: string;
    options?: Options;
    ui: ManipulationUIMetadata;
} & (
    | { access: 'pixel'; execute: PixelFunction<Options> }
    | {
          access: 'neighborhood';
          radius: number;
          execute: NeighborhoodFunction<Options>;
      }
    | { access: 'global'; execute: WholeImageFunction<Options> }
);

// ─── Pipeline Types ──────────────────────────────────────────────────────────

export interface PipelineContext {
    registry: Registry;
    maximumPixels: number;
}
