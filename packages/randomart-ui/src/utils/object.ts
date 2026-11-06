export function typedKeys<T extends object>(obj: T): (keyof T)[] {
    // Safe: utilisé uniquement sur des objets littéraux dont on maîtrise les clés.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return Object.keys(obj) as (keyof T)[];
}
