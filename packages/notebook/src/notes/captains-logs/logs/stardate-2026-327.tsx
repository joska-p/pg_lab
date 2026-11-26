import type { CaptainLog } from '../types';

export const log2026327: CaptainLog = {
    id: 'stardate-2026-327',
    stardate: '2026.327',
    date: '2026-11-23',
    details: [
        { label: 'Localisation', value: <>packages/ui, apps/brouillon, apps/playground</> },
        { label: 'Sujet', value: <>Visuels legacy rapatriés, signaux allégés</> },
    ],
    content: (
        <>
            <p>
                Le 23 novembre, une petite flottille de visuels legacy traverse le vide pour
                rejoindre <code>packages/ui</code> : circuit, constellation, contour, glyph,
                lattice, orbit. <code>brouillon</code> leur offre un premier quai, et le registre
                commun leur donne enfin un langage partagé. Dans la foulée, l'interface du
                playground perd ses emoji, son marqueur d'expérience change de peau, et la carte
                home disparaît — moins de fanions, plus de signal.
            </p>

            <p>
                En parallèle, <code>Slider</code> et <code>Segmented</code> tentent un passage par{' '}
                <code>ui-sdk</code>. Une sonde, pas encore une installation : la question de savoir
                si cette abstraction mérite sa place reste ouverte, suspendue dans le champ des
                capteurs.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
