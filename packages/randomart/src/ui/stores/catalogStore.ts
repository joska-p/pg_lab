import { createDefaultCatalog } from '../../core/catalog/Catalog';

/**
 * The app-wide catalog: `Operator` instances probe their multiplicities once, at construction, so
 * every consumer must share this single instance.
 */
export const catalog = createDefaultCatalog();
