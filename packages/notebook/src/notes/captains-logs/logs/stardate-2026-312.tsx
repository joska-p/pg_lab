import type { CaptainLog } from '../types';

export const log2026312: CaptainLog = {
    id: 'stardate-2026-312',
    stardate: '2026.312',
    date: '2026-11-08',

    details: [
        { label: 'Localisation', value: <>Tout le monorepo — puis le devcontainer</> },
        { label: 'Sujet', value: <>La traque des assertions non sûres</> },
    ],
    content: (
        <>
            <p>
                Du 6 au 8 novembre, le lint lève un pavillon rouge :{' '}
                <code>typescript/no-unsafe-type-assertion</code> passe d'un avertissement à une
                erreur. Les équipages de glaze3d, sequencer, automa, pixel, pixel-manip,
                randomart-ui, palette, fracture, art-canvas, playground, mosaic-maker, notebook et
                randomart-core démontent leurs casts un à un. Les marques trop pointues se replient
                sur <code>PositiveNumber</code> et <code>PositiveInteger</code>,{' '}
                <code>typedKeys</code> se contente de deux copies volontaires et documentées, et les
                registres de palette, de grammaire et d'expériences se dérivent de tableaux validés.
            </p>

            <p>
                Le 8, le vaisseau déménage dans un devcontainer ; le réseau passe en mode{' '}
                <code>--net=host</code>, l'audit quitte la CI et le handoff change de tiroir. Le
                protocole, révisé puis vérifié, tient désormais sans dérogation.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
