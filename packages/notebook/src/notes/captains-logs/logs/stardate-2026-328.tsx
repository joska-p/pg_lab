import type { CaptainLog } from '../types';

export const log2026328: CaptainLog = {
    id: 'stardate-2026-328',
    stardate: '2026.328',
    date: '2026-11-24',
    details: [
        {
            label: 'Localisation',
            value: <>apps/playground, apps/brouillon, codex/docs, .github/workflows</>,
        },
        { label: 'Sujet', value: <>Le Workbench trouve sa forme, les sondes reviennent</> },
    ],
    content: (
        <>
            <p>
                Le 24 novembre, le vaisseau se redessine de l'intérieur. La décision de forme du{' '}
                <strong>Workbench</strong> est consignée dans un ADR, le vocabulaire s'aligne, et
                les expériences quittent leurs anciens couloirs pour se ranger dans des dossiers
                appartenant à l'app. <code>Scratchpad</code> prend son nom définitif, les idées
                dormantes se réduisent à de simples notes, et la configuration Vite partagée est
                scindée pour que chaque paquet sache ce qu'il doit au socle commun.
            </p>

            <p>
                Dans <code>brouillon</code>, le pipeline de Randomart gagne une description
                détaillée : le flux, de la graine à l'image, devient lisible sans devoir ouvrir la
                soute moteur. Côté outillage, une volée de skills Mat débarque,{' '}
                <code>vp ready</code> entre puis sort du CI, et les reverts sur <code>Slider</code>{' '}
                et <code>Segmented</code> referment la parenthèse <code>ui-sdk</code> ouverte la
                veille. Certaines orbites ne se gagnent qu'après un aller-retour.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
