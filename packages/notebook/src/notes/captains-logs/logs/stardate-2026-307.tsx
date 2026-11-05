import type { CaptainLog } from '../types';

export const log2026307: CaptainLog = {
    id: 'stardate-2026-307',
    stardate: '2026.307',
    date: '2026-11-03',

    details: [
        {
            label: 'Localisation',
            value: <>packages/randomart-vm, packages/randomart-ui, packages/randomart-core</>,
        },
        {
            label: 'Sujet',
            value: <>randomart-v2 — machine virtuelle, compilateur GLSL et présences</>,
        },
    ],
    content: (
        <>
            <p>
                Le 3, la seconde génération de randomart lève l'ancre. <code>randomart-vm</code> et{' '}
                <code>randomart-ui</code> rejoignent le playground ; l'UI migre sur{' '}
                <code>randomart-core</code> et l'ancien <code>randomart</code> est rebaptisé{' '}
                <code>randomart-v1</code>. Le compilateur GLSL passe en version 2, les shaders sont
                extraits en fichiers <code>.glsl</code> avec un popover de visualisation, et sept
                nouvelles grammaires de présets élargissent le répertoire visuel. Les poids de
                grammaire sont typés par <code>OperatorId</code>, et une suite de tests couvre
                génération, sérialisation et compilation. Le panneau se scinde en visages toy, lab
                et history. L'ancienne forge cède la place.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
