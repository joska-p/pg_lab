import type { CaptainLog } from '../types';

export const log2026319: CaptainLog = {
    id: 'stardate-2026-319',
    stardate: '2026.319',
    date: '2026-11-15',

    details: [
        {
            label: 'Localisation',
            value: (
                <>
                    packages/surface, art-canvas, automa, fracture, randomart-ui, string-art,
                    oeis-signal
                </>
            ),
        },
        { label: 'Sujet', value: <>Surface, la couche unique</> },
    ],
    content: (
        <>
            <p>
                Du 14 au 15 novembre, le nom glaze s'efface au profit de <code>surface</code>. La
                bibliothèque apparaît dans art-canvas, puis gagne automa, fracture, randomart-ui,
                string-art et oeis-signal. <code>GpuSurface</code> et <code>GpuCanvas</code>{' '}
                succèdent à l'ancienne API ; une horloge no-op et un magasin de lecture commun
                évitent les casts, tandis que <code>renderFrame</code>,{' '}
                <code>usePlayback.reset()</code>, <code>Camera2D</code> et les hooks de caméra
                complètent l'outillage.
            </p>

            <p>
                La porte de rendu et le suivi des ressources tiennent la route, les erreurs de
                restauration restent cantonnées, puis <code>CpuSurface</code> et{' '}
                <code>CpuCanvas</code> donnent un second visage à la couche. Le 15, glaze est rayé
                des dépendances et le dossier supprimé : la traversée est close.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
