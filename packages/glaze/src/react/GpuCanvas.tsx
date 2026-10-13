import { useEffect, useRef } from 'react';

import type { Program } from '../gpu/shader/Program';
import { createInteractionAdapter } from './interactions';
import { swapProgram } from './programSwap';
import { createGpuStack } from './surfaceStack';
import type { GpuCanvasProps } from './types';
import { useLatest } from './useLatest';
import { useNodeResource } from './useNodeResource';

/**
 * Affiche un <canvas> et dessine dedans avec le GPU grâce à un shader.
 *
 * Ce composant est le "chef d'orchestre" : il ne dessine pas lui-même, il met en place les pièces
 * (surface GPU, programme shader, boucle d'animation) et les fait travailler ensemble.
 */
export function GpuCanvas({
    // ── Le shader ──────────────────────────────────────────────

    /** Code du shader de fragment : il décide de la couleur de chaque pixel. */
    fragmentShader,
    /**
     * Code du shader de sommet : il décide de la position des formes. Optionnel, une valeur par
     * défaut est utilisée sinon.
     */
    vertexShader,
    /**
     * Appelée après chaque tentative de compilation. Reçoit l'erreur si le shader est refusé
     * (sinon, pas d'erreur).
     */
    onShaderError,

    // ── Le dessin à chaque image ──────────────────────────────

    /**
     * Fonction qui renvoie les valeurs à envoyer au shader (temps, couleurs, position de souris...)
     * pour chaque image.
     */
    uniforms,
    /**
     * Fonction qui répond "oui" ou "non" : doit-on dessiner cette image ? Sert à économiser du
     * travail. Si absente, on dessine toujours.
     */
    shouldRender,
    /**
     * Appelée à chaque image, après le dessin. Pratique pour du code à toi qui doit suivre
     * l'animation.
     */
    onFrame,

    // ── Les informations renvoyées à l'extérieur ──────────────

    /** Appelée une seule fois quand la surface GPU est prête. Te donne accès à la surface. */
    onMount,
    /** Appelée quand l'horloge interne est prête. Te donne accès au "store" qui contient le temps. */
    onClockStore,

    // ── Interactions et apparence ─────────────────────────────

    /** Réglages des gestes de l'utilisateur sur le canvas (clic, glisser, zoom...). */
    canvasInteractions,
    /** Classe CSS appliquée sur le <canvas>. */
    className,
    /** Styles CSS ajoutés (ils passent après les styles par défaut, donc ils peuvent les remplacer). */
    style,

    // Tout le reste : options de création de la surface GPU (lues UNE SEULE FOIS, à la création).
    ...surfaceOptions
}: GpuCanvasProps) {
    // ─────────────────────────────────────────────────────────────
    // 1. Les "boîtes" qui retiennent la dernière valeur des props
    // ─────────────────────────────────────────────────────────────
    // Ces props changent souvent d'identité sans que leur sens change. Les mettre dans des boîtes
    // évite de relancer les effets pour rien. Les effets plus bas lisent le contenu des boîtes.
    const uniformsRef = useLatest(uniforms);
    const shouldRenderRef = useLatest(shouldRender);
    const onFrameRef = useLatest(onFrame);
    const onShaderErrorRef = useLatest(onShaderError);
    const onMountRef = useLatest(onMount);
    const onClockStoreRef = useLatest(onClockStore);
    const gesturesRef = useLatest(createInteractionAdapter(canvasInteractions));

    // ─────────────────────────────────────────────────────────────
    // 2. La "pile" GPU : tout ce qu'il faut pour dessiner sur le canvas
    // ─────────────────────────────────────────────────────────────
    // `stack` reste vide (null) tant que le canvas n'est pas affiché à l'écran,
    // puis il est créé. Il est détruit automatiquement quand le canvas disparaît.
    const { ref: canvasRef, resource: stack } = useNodeResource((canvas: HTMLCanvasElement) =>
        createGpuStack(canvas, surfaceOptions, () => gesturesRef.current),
    );

    // Le shader actuellement utilisé pour dessiner (null tant qu'il n'y en a pas).
    const programRef = useRef<Program | null>(null);

    // ─────────────────────────────────────────────────────────────
    // 3. Nettoyage du shader quand la surface change
    // ─────────────────────────────────────────────────────────────
    // L'ancien shader appartient à l'ancienne surface : on le détruit quand elle disparaît.
    // IMPORTANT : cet effet ne dépend que de `stack`. Il ne se déclenche donc PAS quand on change
    // juste le texte du shader. C'est ce qui permet de garder l'ancien shader si le nouveau est refusé.
    // (Il est placé avant l'effet de compilation pour que le nettoyage passe en premier.)
    useEffect(() => {
        if (!stack) {
            return;
        }

        return () => {
            programRef.current?.destroy();
            programRef.current = null;
        };
    }, [stack]);

    // ─────────────────────────────────────────────────────────────
    // 4. Compilation du shader
    // ─────────────────────────────────────────────────────────────
    // Se relance quand le code du shader change. Un shader refusé n'est pas grave :
    // l'ancien continue de tourner, et on prévient via `onShaderError`.
    useEffect(() => {
        if (!stack || !fragmentShader) {
            return;
        }

        const error = swapProgram(
            programRef,
            stack.surface.tryCreateProgram(fragmentShader, vertexShader),
        );

        onShaderErrorRef.current?.(error);
    }, [fragmentShader, vertexShader, stack, onShaderErrorRef]);

    // ─────────────────────────────────────────────────────────────
    // 5. Prévenir l'extérieur que la surface est prête
    // ─────────────────────────────────────────────────────────────
    // Ne se relance que quand la surface change, pas quand les fonctions `onMount` / `onClockStore`
    // changent. (En développement, React peut l'appeler deux fois : c'est normal.)
    useEffect(() => {
        if (!stack) {
            return;
        }

        onMountRef.current?.(stack.surface);
        onClockStoreRef.current?.(stack.clockStore);
    }, [stack, onMountRef, onClockStoreRef]);

    // ─────────────────────────────────────────────────────────────
    // 6. La boucle d'animation : appelée à chaque image
    // ─────────────────────────────────────────────────────────────
    // On ne branche la boucle que si elle sert à quelque chose :
    // soit on dessine un shader, soit l'extérieur veut suivre chaque image.
    const needsFrameLoop = onFrame !== undefined || fragmentShader !== undefined;

    useEffect(() => {
        if (!stack || !needsFrameLoop) {
            return;
        }

        // `onFrame` renvoie une fonction pour se débrancher : React l'appelle tout seul
        // quand il faut arrêter la boucle.
        return stack.surface.onFrame((frame) => {
            const program = programRef.current;
            const shouldRender = shouldRenderRef.current;

            // On dessine seulement s'il y a un shader ET que `shouldRender` est d'accord (ou absent).
            if (program && (!shouldRender || shouldRender(frame))) {
                program.setUniforms(uniformsRef.current?.(frame) ?? {});
                frame.renderProgram(program);
            }

            onFrameRef.current?.(frame);
        });
    }, [stack, needsFrameLoop, shouldRenderRef, uniformsRef, onFrameRef]);

    // ─────────────────────────────────────────────────────────────
    // 7. Ce qui s'affiche à l'écran
    // ─────────────────────────────────────────────────────────────
    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                // Par défaut le canvas remplit son parent.
                width: '100%',
                height: '100%',
                display: 'block',
                // Empêche le navigateur de scroller/zoomer à la place de nos gestes.
                touchAction: 'none',
                ...style,
            }}
        />
    );
}
