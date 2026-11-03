import { createDefaultCatalog } from './Catalog';

/**
 * The app-wide catalog: `Operator` instances probe their multiplicities once, at construction, so
 * every consumer shares this single instance. The domain (grammar, generator, serialization, bench)
 * imports it directly; only the catalog and compiler layers (`Catalog`, `createNode`, `compile`…)
 * take a catalog as a parameter, so tests can inject a custom one.
 */
export const catalog = createDefaultCatalog();
