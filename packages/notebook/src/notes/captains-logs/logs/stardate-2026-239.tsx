import type { CaptainLog } from '../types';

export const log2026239: CaptainLog = {
    id: 'stardate-2026-239',
    stardate: '2026.239',
    date: '2026-08-27',

    details: [
        { label: 'Localisation', value: <>Secteur de la Flotte de Composants</> },
        {
            label: 'Sujet',
            value: (
                <>
                    La grande migration — <code>@repo/ui</code> devient <code>@repo/tlc</code>
                </>
            ),
        },
    ],
    content: (
        <>
            <p>
                L'équipage a exécuté une migration d'une envergure biblique. En une nuit, toute la
                constellation de composants a déménagé de <code>@repo/ui</code> vers un nouveau
                registre :{' '}
                <strong>
                    <code>@repo/tlc</code>
                </strong>
                . Imports réacheminés à travers chaque paquet et chaque application, variables de
                thème mises à jour, l'ancien chantier naval rebaptisé dans les registres éternels.
                Ce qui était <code>ui</code> s'appelle désormais <code>tlc</code> — du code tendre,
                forgé avec soin.
            </p>

            <p>
                En chemin, l'ingénierie a taillé de nouveaux instruments : <code>Card</code>,{' '}
                <code>ErrorBoundary</code>, et toute une famille de composants de formulaire pilotés
                par un <code>FieldContext</code> tout neuf. <code>Checkbox</code>,{' '}
                <code>Toggle</code>, <code>Select</code>, <code>Slider</code>,{' '}
                <code>ColorField</code> — tous reconstruits pour l'accessibilité et la cohérence,
                pendant que <code>NumberField</code> partait en douce retraite. Le pont est plus
                propre, plus clair dans la voix, plus léger dans la friction.
            </p>

            <p>
                Le même jour, le renseignement a livré un dossier dense : une comparaison complète
                des implémentations <strong>Mandelbrot perturbé</strong>, avec recommandations
                distillées pour la suite du voyage. Le quadrant fractal se documente à mesure ; les
                cartes s'affinent.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
