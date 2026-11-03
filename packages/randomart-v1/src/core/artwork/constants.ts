/** Render settings bounds. */
export const MIN_RENDER_SIZE = 1;
export const MAX_RENDER_SIZE = 8_192;
/** Loop duration accepted by the render contract (ms); UI range and import clamp share it. */
export const MIN_LOOP_MS = 500;
export const MAX_LOOP_MS = 120_000;
export const MAX_TITLE_LENGTH = 200;

/** Artwork file format. */
export const ARTWORK_FILE_FORMAT = 'random-art';
export const ARTWORK_FILE_VERSION = 1;
/** Import guard: checked before any `JSON.parse`. */
export const MAX_ARTWORK_FILE_LENGTH = 1_000_000;
