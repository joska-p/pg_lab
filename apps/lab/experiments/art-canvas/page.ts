/*
 * Shared bootstrap for the six static art-canvas pages.
 *
 * The markup stays in each HTML file; this helper only wires the shell, theme,
 * status/error regions, playback button and the single WebGL program lifecycle.
 */

import type { UniformValue } from '../../lib/surface/gpu/index';
import { GpuStage } from '../../ui/gpu-stage';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';

export interface ArtPageOptions {
    fragment: string;
    uniforms?: () => Record<string, UniformValue>;
    autoplay?: boolean;
}

export function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Art canvas markup is incomplete: ${selector}`);
    }

    return element;
}

export function initArtPage(options: ArtPageOptions): GpuStage | null {
    defineShellElement();
    initTheme();

    const errorBox = required<HTMLElement>('[data-error]');
    const status = required<HTMLElement>('[data-status]');
    const playButton = document.querySelector<HTMLButtonElement>('[data-play-toggle]');

    let stage: GpuStage;
    try {
        stage = new GpuStage(required<HTMLCanvasElement>('[data-canvas]'), {
            fragment: options.fragment,
            uniforms: options.uniforms,
            onError: (message) => {
                errorBox.textContent = message;
                errorBox.hidden = false;
                status.textContent = 'Erreur de shader.';
            },
            onReady: () => {
                errorBox.textContent = '';
                errorBox.hidden = true;
                status.textContent = 'Rendu prêt.';
            },
        });
    } catch {
        errorBox.textContent = 'WebGL2 n’est pas disponible dans ce navigateur.';
        errorBox.hidden = false;
        status.textContent = 'Rendu indisponible.';
        return null;
    }

    const syncPlayButton = (): void => {
        if (!playButton) {
            return;
        }

        playButton.textContent = stage.isPlaying ? 'Pause' : 'Lecture';
        playButton.dataset.playing = String(stage.isPlaying);
    };

    playButton?.addEventListener('click', () => {
        stage.setPlaying(!stage.isPlaying);
        syncPlayButton();
        status.textContent = stage.isPlaying ? 'Lecture en cours.' : 'Lecture en pause.';
    });

    window.addEventListener('pagehide', () => stage.destroy(), { once: true });

    stage.setPlaying(options.autoplay ?? true);
    syncPlayButton();
    return stage;
}
