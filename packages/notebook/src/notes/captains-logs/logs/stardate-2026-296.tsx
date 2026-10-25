import type { CaptainLog } from '../types';

export const log2026296: CaptainLog = {
    id: 'stardate-2026-296',
    stardate: '2026.296',
    date: '2026-10-23',

    details: [
        { label: 'Localisation', value: <>Forge randomart & Raffinerie des types</> },
        { label: 'Sujet', value: <>Randomart — grande forge, quantification et purification</> },
    ],
    content: (
        <>
            <p>
                <code>randomart</code> a été remis sur cale le 9 octobre. Un nouveau moteur sans
                état prend forme : catalogue de 19 opérateurs, expression, grammaire et générateur
                purs (MP1), puis un abaissement en DAG, la multiplicité des contextes et l'émission
                GLSL (MP2), enfin l'animation et la lecture (MP3). Les politiques de partage des
                contextes (none/shared/all), les contextes internés et l'isolation sont éprouvés par
                plus d'une centaine de tests.
            </p>

            <p>
                Puis le lot quantification : une grammaire unique par défaut remplace le couple
                static/animated, le temps revient dans les terminaux <code>x</code> et{' '}
                <code>y</code>, et la recette d'opérateur est partagée entre banc et labo. La
                grammaire devient un état de premier rang : quatre actions, historique de 30 pas,
                import/export JSON versionné, résumé dans le panneau.
            </p>

            <p>
                La purification suit : suppression des barrels morts, centralisation des types et
                constantes module par module, renommage des concepts (<code>color</code>,{' '}
                <code>CUSTOM_PRESET</code>), suppression des mots français résiduels, et un audit de
                cohérence dédié accompagné d'un skill de dry-refactoring.
            </p>

            <p>
                Le panneau se scinde en visages toy, lab et bench ; un composant <code>Grid</code>
                s'installe ; le pipeline couleur se documente dans son propre carnet. Les fondations
                techniques accompagnent le tout : passage à Vite+ renové, activation du lint
                import/react et conformité monorepo (15 octobre), puis React Router en HashRouter,
                configuration centralisée et compilateur Oxc React. Les tests fuzz (300 cas) et les
                dumps GLSL gardent la mécanique honnête.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
