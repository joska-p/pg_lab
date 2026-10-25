export function Note() {
    return (
        <div className="note-root">
            <h2>Captain's Log: Stardate 2026.238</h2>
            <p>
                <strong>Date:</strong> 2026-08-26 <strong>Localisation :</strong> Secteur de la
                Flotte de Composants <strong>Sujet :</strong> La grande migration —{' '}
                <code>@repo/ui</code> devient <code>@repo/tlc</code>
            </p>
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
            <hr />
            <h2>Captain's Log: Stardate 2026.240</h2>
            <p>
                <strong>Date:</strong> 2026-08-28 <strong>Localisation :</strong> Forge des Cartes &
                Raffinerie de Types <strong>Sujet :</strong> Variantes chromatiques du SciFiCard,
                consolidation des interfaces, restructuration Discovery
            </p>
            <p>
                L'armurier a équipé le <code>SciFiCard</code> de nouvelles{' '}
                <strong>variantes chromatiques</strong> et affiné son style — nos cartes de mission
                parlent désormais plusieurs teintes. En parallèle, une vague de refactoring a
                converti les définitions de types éparses en <strong>interfaces</strong> dans toute
                la flotte, unifiant le langage des contrats entre modules.
            </p>
            <p>
                L'état-major a aussi taillé dans l'atlas : les pages <strong>Discovery</strong>{' '}
                restructurées, le vaisseau amiral <code>PackageAppHost</code>, devenu redondant,
                décommissionné, les composants orphelins et les échafaudages de référence API
                largués dans le vide. La carte est plus courte, la route vers chaque secteur plus
                claire.
            </p>
            <p>
                <em>Journal clos.</em>
            </p>
            <hr />
            <h2>Captain's Log: Stardate 2026.241</h2>
            <p>
                <strong>Date:</strong> 2026-08-29 <strong>Localisation :</strong> Matrice de
                navigation Spirale <strong>Sujet :</strong> Une horloge faite de vide
            </p>
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
            <hr />
            <h2>Captain's Log: Stardate 2026.242</h2>
            <p>
                <strong>Date:</strong> 2026-08-30 <strong>Localisation :</strong> Secteur String Art
                — nouvelle découverte <strong>Sujet :</strong> Naissance d'un artisanat — le paquet{' '}
                <code>string-art</code>
            </p>
            <p>
                Un nouveau secteur est apparu sur les cartes : le paquet <strong>String Art</strong>{' '}
                a été mis sur cale, structure et composants essentiels posés. Le traitement d'image
                s'est refondu en utilitaires nets, la gestion d'upload réinventée, les routines de
                dessin canvas coulées dans leur forme. Le store a été élagué — l'état de surface
                inutilisé jeté par-dessus bord, les ponts allégés.
            </p>
            <p>
                Puis la division visuelle a livré toute une suite de{' '}
                <strong>génération de cartes graphiques</strong> et de styles — parce que tout
                artisanat digne de ce nom mérite de belles cartes de visite. Les fils sont tendus,
                les épingles plantées. Première lumière sur ce métier à tisser imminent.
            </p>
            <p>
                <em>Journal clos.</em>
            </p>
            <hr />
            <h2>Captain's Log: Stardate 2026.248</h2>
            <p>
                <strong>Date:</strong> 2026-09-05 <strong>Localisation :</strong> Baie de
                configuration du warp core <strong>Sujet :</strong> Soulever le lourd, en douceur
            </p>
            <p>
                L'ingénierie a accordé les bobines Vite selon une nouvelle{' '}
                <strong>stratégie d'optimisation des dépendances pour grandes bibliothèques</strong>
                . Les dépendances lourdes seront pré-bundlées plus vigoureusement, grattant quelques
                précieuses microsecondes à nos séquences de lancement. Un petit changement de config
                ; une foulée nettement plus souple.
            </p>
            <p>
                Le vaisseau ronronne. La migration tlc s'est posée, le métier à tisser String Art
                attend sa première œuvre, et le quadrant fractal continue de documenter ses propres
                mystères.
            </p>
            <p>
                <em>
                    Prochain objectif : tisser la première œuvre String Art complète, puis
                    poursuivre l'affûtage des pipes de rendu. Journal clos.
                </em>
            </p>
        </div>
    );
}
