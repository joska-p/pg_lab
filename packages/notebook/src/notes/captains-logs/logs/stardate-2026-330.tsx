import type { CaptainLog } from '../types';

export const log2026330: CaptainLog = {
    id: 'stardate-2026-330',
    stardate: '2026.330',
    date: '2026-11-26',
    details: [
        {
            label: 'Localisation',
            value: (
                <>
                    apps/playground, packages/three-stage, packages/fracture, codex/docs,
                    pnpm-workspace.yaml
                </>
            ),
        },
        { label: 'Sujet', value: <>Routes clarifiées, coque allégée, nouvelle scène</> },
    ],
    content: (
        <>
            <p>
                Le 26 novembre, la navigation du playground est remise à plat. Les routes se
                séparent des expériences, une page 404 reprend les vaisseaux perdus, puis la
                composition des pages est unifiée sous un même <code>Page</code>. La documentation
                de domaine suit le mouvement, alignant les mots sur la structure que le code vient
                d'adopter.
            </p>

            <p>
                Le grand ménage Knip balaie exports et types morts, avec un handoff pour garder la
                trace du passage ; <code>fracture</code> en profite aussi. En parallèle,{' '}
                <code>three-stage</code> entre en scène, les icônes du site s'installent,
                l'indexation est désactivée, et quelques réglages de workspace stabilisent le pont.
                Le cap est plus net, et la coque un peu plus légère.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
