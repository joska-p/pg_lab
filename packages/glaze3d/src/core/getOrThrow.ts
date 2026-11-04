/**
 * Lit l'élément à l'indice `index` d'un tableau typé ou d'un `Array`.
 *
 * `noUncheckedIndexedAccess` rend les lectures par index `T | undefined`. Dans glaze3d, les
 * lectures en cause portent sur des buffers de longueur fixe garantie (matrice 16, couleur 3,
 * tableau de 4 lumières, géométries générées). L'absence est donc une erreur de programmation : on
 * lève une erreur claire plutôt que de propager `undefined` ou d'inventer une valeur par défaut.
 *
 * `ArrayLike<T>` couvre à la fois `Array<T>` et les `TypedArray` (`Float32Array`, `Uint16Array`, …)
 * qui ne sont pas des `ReadonlyArray`.
 */
export function getOrThrow<T>(array: ArrayLike<T>, index: number): T {
    const value = array[index];
    if (value === undefined) {
        throw new Error(`glaze3d: index ${index} is out of bounds (length ${array.length})`);
    }
    return value;
}
