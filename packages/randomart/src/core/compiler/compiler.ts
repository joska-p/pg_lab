/**
 * Compiler.ts — Compatibility re-export layer.
 *
 * The naïve MP1·S4 compiler has been replaced by the modular MP3·S1+S2 compiler. This file
 * re-exports the public API from the new modules so that existing imports (including tests)
 * continue to work without changes.
 */

export { compile } from './compile.ts';
export { isAtom, isEnclosedInParens, wrapInput } from './format.ts';
