import type { CaptainLog } from '../types';

export const log2026241: CaptainLog = {
    id: 'stardate-2026-241',
    stardate: '2026.241',
    date: '2026-08-29',

    details: [
        { label: 'Localisation', value: <>Matrice de navigation Spirale</> },
        { label: 'Sujet', value: <>Une horloge faite de vide</> },
    ],
    content: (
        <>
            <p>
                Au cœur de la salle des commandes Spirale, la mécanique de l'horloge a été
                reconfigurée. Le nouveau <strong>null clock store</strong> permet à l'instrument de
                retenir son souffle — ni tic, ni tac — et <code>SpiraleControls</code> s'interface
                désormais avec un store capable de ne rien enregistrer, pour de vrai. Dans le vide
                entre deux battements, il y a immobilité ; le moteur se synchronise sans imposer de
                pouls.
            </p>

            <p>
                Les sentinelles d'ESLint ont par ailleurs été affûtées : les variables inutilisées
                déclenchent l'alarme plus sûrement, gardant les couloirs libres de code mort.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
