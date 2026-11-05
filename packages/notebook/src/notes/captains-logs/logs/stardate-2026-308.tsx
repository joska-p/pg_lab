import type { CaptainLog } from '../types';

export const log2026308: CaptainLog = {
    id: 'stardate-2026-308',
    stardate: '2026.308',
    date: '2026-11-04',

    details: [
        {
            label: 'Localisation',
            value: (
                <>
                    Tout le monorepo — glaze3d, sequencer, pixel, pixel-manipulator, mol-demo, radu,
                    smith-tutte ; randomart tenu à l'écart
                </>
            ),
        },
        {
            label: 'Sujet',
            value: <>noUncheckedIndexedAccess, un paquet à la fois</>,
        },
    ],
    content: (
        <>
            <p>
                Le 4, la politique de strictness TypeScript déferle sur le vaisseau.
                <code>noUncheckedIndexedAccess</code> s'active paquet après paquet : glaze3d
                (vérificateur, rendu, tests, mat4), sequencer, pixel, pixel-manipulator, mol-demo,
                radu et smith-tutte passent au crible. randomart fait figure d'exception : ses accès
                indexés sont resserrés dans les tests et le core, mais le flag lui reste interdit
                pour l'instant — « sauf randomart pour l'instant ».
            </p>

            <p>
                Au même poste, randomart-core dote ses constructeurs unary, binary et ternary d'une
                vérification d'arité, <code>toSrgb</code> passe sous test, et le magasin
                monolithique cède la place à quatre échoppes dédiées : artwork, surface, playback et
                error. L'export PNG devient une commande hors écran via <code>OffscreenCanvas</code>
                .
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
