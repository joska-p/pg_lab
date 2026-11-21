import type { CaptainLog } from '../types';

export const log2026321: CaptainLog = {
    id: 'stardate-2026-321',
    stardate: '2026.321',
    date: '2026-11-17',

    details: [
        { label: 'Localisation', value: <>randomart-core, randomart-ui, playground/lab</> },
        { label: 'Sujet', value: <>Shadertoy dans la valise, le laboratoire à quai</> },
    ],
    content: (
        <>
            <p>
                Le 16, le compilateur parle Shadertoy : <code>randomart-core</code> émet un GLSL
                natif, l'UI le rend et le copie, le temps devient un <code>iTime</code> continu et
                la durée de boucle disparaît. Les opérateurs <code>smooth min</code> et{' '}
                <code>smooth max</code> ainsi que les passes de post-processing rejoignent le moteur
                ; Vite+ passe en 1.6.0.
            </p>

            <p>
                Le 17, le laboratoire prend son quartier. Un socle Vite unique, un générateur de
                pages statiques, un custom element de base et un design system CSS natif posent les
                fondations. Les sessions 2 à 7 livrent les tranches verticales home et palette,
                regroupent core et gpu sous <code>lib/surface</code>, puis les paliers A, B et C. La
                journée s'achève en six sessions de design — fondation, home, art-canvas, palette,
                lab — pour donner au vaisseau une tenue.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
