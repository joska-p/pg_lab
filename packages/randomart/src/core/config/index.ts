import { CONFIG } from './config.ts';
import type { SizeProfileId } from './config.ts';

export { CONFIG, type SizeProfileId } from './config.ts';

/** Guard for the size registry: a profile id is content, an unknown one has no canonical repair. */
export function isSizeProfileId(value: unknown): value is SizeProfileId {
    return typeof value === 'string' && Object.hasOwn(CONFIG.grammar.sizeProfiles, value);
}
