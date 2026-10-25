import type { CaptainLog } from '../types';

export const log2026265: CaptainLog = {
    id: 'stardate-2026-265',
    stardate: '2026.265',
    date: '2026-09-22',

    details: [
        { label: 'Localisation', value: <>Secteur Fracture & Salle des machines automa</> },
        { label: 'Sujet', value: <>Précision infinie et contrôles à visages multiples</> },
    ],
    content: (
        <>
            <p>
                Le secteur <code>Fracture</code> a livré une réécriture complète du navigateur
                Mandelbrot. Quatre microscopes de précision — naïf f32, double-split, perturbation
                et référence partagée — cohabitent désormais. Chaque module porte son store complet
                et auto-suffisant ; plus aucun emprunt entre eux.
            </p>

            <p>
                Les shaders ont été portés avec un diff sémantique nul ; les surfaces{' '}
                <code>GpuSurface</code> et les caméras partagées synchronisent les variations. Les
                paramètres d'orbite (zooms jusqu'à 1e15) et les presets de points remarquables font
                de chaque module un poste d'observation autonome.
            </p>

            <p>
                Côté <code>automa</code>, les sections de contrôle — Edit, Rule, Creature — ont été
                refaites selon la même recette, avec six familles colorées pour distinguer les
                commandes. Le monorepo respire mieux, et les builds paresseux découpent proprement
                les chunks lourds.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
