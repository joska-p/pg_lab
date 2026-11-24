import type { CaptainLog } from '../types';

export const log2026309: CaptainLog = {
    id: 'stardate-2026-309',
    stardate: '2026.309',
    date: '2026-11-05',

    details: [
        { label: 'Localisation', value: <>packages/randomart-ui</> },
        { label: 'Sujet', value: <>errorStore et le repli gracieux</> },
    ],
    content: (
        <>
            <p>
                Ce matin, le magasin d'erreurs tient ses promesses : <code>errorStore</code>
                garde désormais la liste des erreurs d'un lot, <code>shouldRender</code> est
                documenté dans <code>RandomArtCanvas</code>, et les composants encaissent les échecs
                avec un repli gracieux. Cinq nettoyages sans changement de comportement (T23)
                achèvent la semaine ; <code>shouldrender-investigation.md</code> est retiré des
                archives, <code>atlaspaths</code> disparaît du registre, et <code>knip.json</code>{' '}
                est ajusté. Le carnet est poli ; les affûtages de rendu peuvent reprendre.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
