import type { ParamDescriptor } from './types';

// Valeur résolue d'un descripteur de paramètre, selon son type déclaré.
export type ParamValue<D extends ParamDescriptor> = D extends { type: 'number' }
    ? number
    : D extends { type: 'string' }
      ? string
      : D extends { type: 'boolean' }
        ? boolean
        : D extends { type: 'color' }
          ? string
          : never;

/**
 * Lit un paramètre brut (`Record<string, unknown>`) en appliquant le garde `typeof` adapté et le
 * `default` du descripteur lorsque la valeur est absente ou de type incompatible.
 *
 * Une seule suppression `as` (ici, justifiée par le narrowing sur `descriptor.type`) centralise
 * tous les casts de paramètres des layers.
 */
export function readParam<D extends ParamDescriptor>(descriptor: D, raw: unknown): ParamValue<D> {
    switch (descriptor.type) {
        case 'number': {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return (typeof raw === 'number' ? raw : descriptor.default) as ParamValue<D>;
        }
        case 'string': {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return (typeof raw === 'string' ? raw : descriptor.default) as ParamValue<D>;
        }
        case 'boolean': {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return (typeof raw === 'boolean' ? raw : descriptor.default) as ParamValue<D>;
        }
        case 'color': {
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            return (typeof raw === 'string' ? raw : descriptor.default) as ParamValue<D>;
        }
    }
}
