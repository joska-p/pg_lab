import type { CaptainLog } from '../types';

export const log2026272: CaptainLog = {
    id: 'stardate-2026-272',
    stardate: '2026.272',
    date: '2026-09-29',

    details: [
        { label: 'Localisation', value: <>Baie de configuration du monorepo</> },
        { label: 'Sujet', value: <>Socle Vite+ consolidé et exports uniformes</> },
    ],
    content: (
        <>
            <p>
                Fin septembre, le chantier a porté sur les fondations. Les exports des paquets ont
                été unifiés sous une condition <code>source → ./src</code>, avec des cartes
                d'exports explicites et <code>dist/</code> construit. Chaque module expose désormais{' '}
                <code>Scene</code> et <code>Controls</code> séparément, laissant le terrain de jeu
                recomposer menus et navigation par hash sans connaître les paquets.
            </p>

            <p>
                Le socle TypeScript s'est éclaté en bases app, node et lib ; le paquet{' '}
                <code>internal-config</code> abrite les présents partagés ; les conditions custom
                sont enfin respectées, sans plus obliger à builder les libs avant de typer
                l'application.
            </p>

            <p>
                La charte des règles s'est durcie : lint sur les imports et les hooks React,
                conditions workspace explicites, et un générateur de mini-apps aligné sur le modèle.{' '}
                <code>ui-next</code> a quitté son berceau pour devenir son propre paquet ; les cases
                à cocher sont des natives survolées par un hook <code>useTheme</code>, et le
                sélecteur de thème s'installe dans la coque.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
