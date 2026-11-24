import type { CaptainLog } from '../types';

export const log2026299: CaptainLog = {
    id: 'stardate-2026-299',
    stardate: '2026.299',
    date: '2026-10-26',

    details: [
        { label: 'Localisation', value: <>Secteur ui — playground et carnet de bord</> },
        { label: 'Sujet', value: <>Le basculeur de thème fait son entrée</> },
    ],
    content: (
        <>
            <p>
                Le 26, un seul commit colore la journée, mais il colore juste : un composant{' '}
                <code>ThemeToggle</code> débarque dans <code>packages/ui</code>, branche sur le
                panneau de contrôle, l'application de playground et le carnet de bord, avec une
                teinte dédiée dans <code>tokens/const.stylex.ts</code>. Une anomalie isolée dans le
                flux, qui donne déjà au vaisseau un interrupteur entre le jour et la nuit.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
