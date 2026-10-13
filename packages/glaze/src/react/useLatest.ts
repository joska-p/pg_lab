import { useLayoutEffect, useRef } from 'react';

/**
 * Petit outil : garde toujours la DERNIÈRE valeur reçue dans une "boîte" (ref).
 *
 * Pourquoi ? Certaines valeurs (fonctions passées en props, par exemple) changent à chaque
 * affichage du composant. Si on les met directement dans un useEffect, l'effet se relance à chaque
 * fois, ce qu'on veut éviter. En passant par cette boîte, l'effet lit toujours la valeur la plus
 * récente SANS avoir besoin de se relancer.
 */
export function useLatest<T>(value: T) {
    const ref = useRef(value);

    // On met la boîte à jour juste après chaque affichage.
    useLayoutEffect(() => {
        ref.current = value;
    });

    return ref;
}
