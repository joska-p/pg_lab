import type { CaptainLog } from '../types';

export const log2026329: CaptainLog = {
    id: 'stardate-2026-329',
    stardate: '2026.329',
    date: '2026-11-25',
    details: [
        {
            label: 'Localisation',
            value: <>codex/docs, packages/*/tsconfig*, apps/playground, automa, pixel</>,
        },
        { label: 'Sujet', value: <>État des lieux, fondations resserrées</> },
    ],
    content: (
        <>
            <p>
                Le 25 novembre commence par un inventaire sans complaisance. Un document d'« état
                des lieux » cartographie l'architecture du dépôt, puis les <code>tsconfig</code>{' '}
                sont repris en profondeur pour clarifier la frontière entre app, nœud et paquet. Le
                template se met à jour, les docs obsolètes quittent le bord, et le terrain gagne en
                lisibilité avant la prochaine manœuvre.
            </p>

            <p>
                Les corrections suivent le même instinct de netteté : dépendances circulaires
                brisées dans <code>automa</code> et <code>pixel</code>, worker d'image ajusté,
                actions masquées sur mobile, hero et résumés d'expériences réécrits. Rien de
                spectaculaire, mais le vaisseau répond mieux quand on le sollicite.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
