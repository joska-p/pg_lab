import type { CaptainLog } from '../types';

export const log2026317: CaptainLog = {
    id: 'stardate-2026-317',
    stardate: '2026.317',
    date: '2026-11-13',

    details: [
        { label: 'Localisation', value: <>packages/glaze, packages/randomart-ui</> },
        { label: 'Sujet', value: <>Cibles de rendu et résurrection du contexte</> },
    ],
    content: (
        <>
            <p>
                Le 13, glaze apprend à peindre ailleurs que sur l'écran. <code>RenderTarget</code>{' '}
                et <code>RenderTargetPair</code> installent un FBO, une paire ping-pong, des hooks
                de destruction et une recréation automatique au réveil du contexte WebGL.{' '}
                <code>surface.createRenderTarget</code>, <code>renderProgramTo</code> et la prop{' '}
                <code>renderFrame</code> de <code>GpuCanvas</code> ouvrent la voie aux pipelines
                multi-passes ; les viewports physiques et CSS cessent de se confondre, et{' '}
                <code>StateBuffer</code> migre sur la paire.
            </p>

            <p>
                La phase P2 durcit les bords : options de clear et de blend, limites{' '}
                <code>MAX_TEXTURE_SIZE</code>, détection cross-realm des textures, restaurations
                isolées dans des blocs <code>try/catch</code>. Côté randomart-ui, la chaîne de
                post-processing branche <code>renderFrame</code> et le store déclenche une frame
                même en lecture en pause. 105 tests sur glaze, 41 sur l'UI, <code>vp check</code>{' '}
                propre sur 812 fichiers.
            </p>

            <p>
                <em>Journal clos.</em>
            </p>
        </>
    ),
};
