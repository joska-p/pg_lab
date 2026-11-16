/*
 * Composant custom element pour l'expérience `home`.
 * Shell (stage + panel) en light DOM, contrôles basiques (sélecteur de fond).
 * Light DOM uniquement (pas de shadow DOM) : les CSS vars --pg-* de :root s'appliquent naturellement.
 * Aucun import React / zustand / StyleX.
 * Aucun fichier existant n'est modifié.
 */

import { PgElement } from '../../element.js';

const BACKGROUNDS: readonly { readonly value: string; readonly label: string }[] = [
    { value: 'lava-flow', label: 'Lava flow' },
    { value: 'auroral-fluid', label: 'Auroral fluid' },
    { value: 'thermal-magma', label: 'Thermal magma' },
];

export class PgHomeElement extends PgElement {
    static get observedAttributes(): string[] {
        return ['background'];
    }

    #panelWidth = 320;
    #dragging = false;

    render(): void {
        const rawBackground = this.state.background;
        const background = typeof rawBackground === 'string' ? rawBackground : 'lava-flow';

        this.innerHTML = '';
        this.className = 'pg-shell';

        // ---- Stage ----
        const stage = document.createElement('section');
        stage.className = `pg-shell__stage pg-bg--${background}`;
        stage.setAttribute('aria-label', 'home');

        // ---- Panel ----
        const panel = document.createElement('aside');
        panel.className = 'pg-shell__panel';
        panel.style.setProperty('--panel-width', `${this.#panelWidth}px`);

        // ---- Poignée de redimensionnement du panel ----
        const handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'pg-shell__handle';
        handle.setAttribute('aria-hidden', 'true');
        handle.tabIndex = -1;
        handle.textContent = '≶';

        let startX = 0;
        let startWidth = 0;

        const onPointerMove = (event: PointerEvent): void => {
            if (!this.#dragging) {
                return;
            }
            const width = Math.max(160, Math.min(600, startWidth + event.clientX - startX));
            this.#panelWidth = width;
            panel.style.setProperty('--panel-width', `${width}px`);
        };

        const onPointerEnd = (): void => {
            this.#dragging = false;
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerEnd);
            document.removeEventListener('pointercancel', onPointerEnd);
        };

        const onPointerDown = (event: PointerEvent): void => {
            if (event.button !== 0) {
                return;
            }
            const rect = panel.getBoundingClientRect();
            startX = event.clientX;
            startWidth = rect.width;
            this.#dragging = true;
            handle.setPointerCapture(event.pointerId);
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerEnd);
            document.addEventListener('pointercancel', onPointerEnd);
        };

        handle.addEventListener('pointerdown', onPointerDown);

        // ---- Contenu du panel ----
        const content = document.createElement('div');
        content.className = 'pg-shell__content';

        const heading = document.createElement('h2');
        heading.textContent = 'Home';

        const label = document.createElement('label');
        label.textContent = 'Fond';
        label.htmlFor = 'pg-home-background';

        const select = document.createElement('select');
        select.id = 'pg-home-background';
        select.name = 'background';
        select.value = background;
        for (const option of BACKGROUNDS) {
            const el = document.createElement('option');
            el.value = option.value;
            el.textContent = option.label;
            select.append(el);
        }

        select.addEventListener('change', (event: Event): void => {
            const target = event.target;
            if (!(target instanceof HTMLSelectElement)) {
                return;
            }
            this.setAttribute('background', target.value);
        });

        content.append(heading, label, select);

        panel.append(handle, content);

        this.append(stage, panel);
    }
}
