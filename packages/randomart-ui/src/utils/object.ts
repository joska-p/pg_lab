/**
 * Task-58 : copie volontaire (2 copies max documentées) pour garder les packages indépendants.
 * L'autre copie se trouve dans apps/playground/src/utils/object.ts. Ne pas mutualiser en helper
 * partagé : chaque package garde sa propre copie.
 *
 * Safe: utilisé uniquement sur des objets littéraux dont on maîtrise les clés.
 */
export function typedKeys<T extends object>(obj: T): (keyof T)[] {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(obj) as (keyof T)[];
}
