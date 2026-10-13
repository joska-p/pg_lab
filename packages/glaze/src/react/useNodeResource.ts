import { useEffect, useState } from 'react';

import type { StackDisposable } from './stackTypes';
import { useLatest } from './useLatest';

/**
 * Crée une ressource quand un élément du DOM apparaît à l'écran, et la détruit quand il disparaît.
 *
 * - `create` : la fonction qui fabrique la ressource à partir de l'élément (ici, le canvas). Elle
 *   peut changer à chaque affichage sans conséquence : seul l'élément décide quand on crée ou
 *   détruit la ressource.
 *
 * Renvoie :
 *
 * - `ref` : à donner à l'élément (`<canvas ref={ref} />`) pour qu'il soit repéré.
 * - `resource` : la ressource, ou `null` tant qu'elle n'est pas prête.
 *
 * La ressource est un "état" et non une ref : les effets de ceux qui l'utilisent se relancent donc
 * tout seuls au moment où elle devient disponible. Pas besoin de deviner l'ordre dans lequel les
 * choses se mettent en place.
 */
export function useNodeResource<N extends Element, R extends StackDisposable>(
    create: (node: N) => R,
) {
    // L'élément du DOM (null tant qu'il n'est pas affiché).
    const [node, setNode] = useState<N | null>(null);

    // La ressource créée à partir de cet élément (null tant qu'elle n'existe pas).
    const [resource, setResource] = useState<R | null>(null);

    // Garde la dernière version de `create`, sans que son changement relance l'effet ci-dessous.
    const createRef = useLatest(create);

    useEffect(() => {
        // Pas d'élément à l'écran : rien à créer.
        if (!node) {
            return;
        }

        const created = createRef.current(node);

        setResource(created);

        // Quand l'élément disparaît (ou change), on libère proprement la ressource.
        return () => {
            created.dispose();
            setResource(null);
        };
    }, [node, createRef]);

    return { ref: setNode, resource };
}
