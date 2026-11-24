import type { CaptainLog } from '../types';

export const log2026240: CaptainLog = {
    id: 'stardate-2026-240',
    stardate: '2026.240',
    date: '2026-08-28',

    details: [
        { label: 'Localisation', value: <>Forge des Cartes & Raffinerie de Types</> },
        {
            label: 'Sujet',
            value: (
                <>
                    Variantes chromatiques du SciFiCard, consolidation des interfaces,
                    restructuration Discovery
                </>
            ),
        },
    ],
    content: (
        <>
            <p>
                L'armurier a équipé le <code>SciFiCard</code> de nouvelles{' '}
                <strong>variantes chromatiques</strong> et affiné son style — nos cartes de mission
                parlent désormais plusieurs teintes. En parallèle, une vague de refactoring a
                converti les définitions de types éparses en <strong>interfaces</strong> dans toute
                la flotte, unifiant le langage des contrats entre modules.
            </p>

            <p>
                L'état-major a aussi taillé dans l'atlas : les pages <strong>Discovery</strong>{' '}
                restructurées, le vaisseau amiral <code>PackageAppHost</code>, devenu redondant,
                décommissionné, les composants orphelins et les échafaudages de référence API
                largués dans le vide. La carte est plus courte, la route vers chaque secteur plus
                claire.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
