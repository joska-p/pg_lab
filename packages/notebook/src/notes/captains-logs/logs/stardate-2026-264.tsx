import type { CaptainLog } from '../types';

export const log2026264: CaptainLog = {
    id: 'stardate-2026-264',
    stardate: '2026.264',
    date: '2026-09-21',

    details: [
        { label: 'Localisation', value: <>Atelier des mini-apps & Forge glaze3d</> },
        {
            label: 'Sujet',
            value: <>Rentrée de septembre — migrations en rafale et naissance de glaze3d</>,
        },
    ],
    content: (
        <>
            <p>
                Septembre a ouvert ses portes à une troupe d'immigrants. Le module{' '}
                <code>automa</code> a quitté son nid solo pour devenir un paquet à part entière :
                moteur, grilles, créatures et stores transplantés, imports <code>glaze</code>{' '}
                rééclatés en <code>core/render</code>, <code>core/time</code>,{' '}
                <code>core/geometry</code>, sans plus aucune trace de <code>core/types</code>{' '}
                orphelin. Le canvas <code>CellMesh</code> bat déjà au rythme de la simulation.
            </p>

            <p>
                <code>art-canvas</code> s'est installé pour de bon : chargement paresseux des
                expériences, transparence, boutons colorés, démonstrations dans l'environnement de
                développement, et un premier <code>ErrorBoundary</code> de garde.{' '}
                <code>mosaic-maker</code>, de son côté, a subi les critiques une à une : plans de
                migration écrits puis purgés, assets réorganisés en <code>src/assets</code> via{' '}
                <code>import.meta.glob</code>, navigation minimale par bouton Menu, et plusieurs
                passes de critique qui ont affûté l'interface.
            </p>

            <p>
                Parallèlement, <code>glaze3d</code> s'est forgé de toutes pièces — de S1 à S9 :
                objets, caméras, géométries sphères et cylindres, matériau Phong, renderer avec
                éclairage directionnel, contrôles d'orbite. Les démos moléculaires sont les
                premières à en profiter.
            </p>

            <p>
                <code>mol-demo</code> a posé ses atomes : parsing V2000 strict, facteurs de forme,
                maillages construits, viewer à contrôles d'orbite, puis un pattern de diffraction en
                WebGL2 calé sur la caméra, jusqu'à un profil GPU qui clôt le budget basse priorité
                sans effort. Un générateur de mini-apps est né au passage, standardisant la mise en
                cale des futurs vaisseaux.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
