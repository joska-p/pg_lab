/*
 * Shell custom element: owns the pointer lifecycle of the resizable panel.
 * The stage/panel markup stays in light DOM (no shadow DOM, no re-rendering).
 */

const SHELL_TAG = 'pg-shell';
const PORTRAIT_QUERY = '(orientation: portrait)';
const MIN_PANEL_SIZE = 160;
const MAX_PANEL_SIZE = 600;

interface PanelDrag {
    vertical: boolean;
    pointerId: number;
    pointerStart: number;
    sizeStart: number;
}

export class PgShellElement extends HTMLElement {
    #panel: HTMLElement | null = null;
    #handle: HTMLElement | null = null;
    #drag: PanelDrag | null = null;

    #handlePointerDown = (event: PointerEvent): void => {
        const panel = this.#panel;
        const handle = this.#handle;

        if (!panel || !handle || event.button !== 0) {
            return;
        }

        const vertical = matchMedia(PORTRAIT_QUERY).matches;
        const bounds = panel.getBoundingClientRect();

        this.#drag = {
            vertical,
            pointerId: event.pointerId,
            pointerStart: vertical ? event.clientY : event.clientX,
            sizeStart: vertical ? bounds.height : bounds.width,
        };
        handle.setPointerCapture(event.pointerId);
        event.preventDefault();
    };

    #handlePointerMove = (event: PointerEvent): void => {
        const drag = this.#drag;
        const panel = this.#panel;

        if (!drag || !panel || event.pointerId !== drag.pointerId) {
            return;
        }

        const pointer = drag.vertical ? event.clientY : event.clientX;
        const requestedSize = drag.sizeStart + drag.pointerStart - pointer;
        const size = Math.max(MIN_PANEL_SIZE, Math.min(MAX_PANEL_SIZE, requestedSize));
        const property = drag.vertical ? '--panel-height' : '--panel-width';

        panel.style.setProperty(property, `${size}px`);
    };

    #handlePointerEnd = (event: PointerEvent): void => {
        const drag = this.#drag;

        if (drag && event.pointerId === drag.pointerId) {
            this.#drag = null;
        }
    };

    connectedCallback(): void {
        const panel = this.querySelector<HTMLElement>('.pg-shell__panel');
        const handle = this.querySelector<HTMLElement>('.pg-shell__handle');

        if (!panel || !handle) {
            return;
        }

        this.#panel = panel;
        this.#handle = handle;
        handle.addEventListener('pointerdown', this.#handlePointerDown);
        handle.addEventListener('pointermove', this.#handlePointerMove);
        handle.addEventListener('pointerup', this.#handlePointerEnd);
        handle.addEventListener('pointercancel', this.#handlePointerEnd);
        handle.addEventListener('lostpointercapture', this.#handlePointerEnd);
    }

    disconnectedCallback(): void {
        const handle = this.#handle;
        const drag = this.#drag;

        if (handle) {
            if (drag && handle.hasPointerCapture(drag.pointerId)) {
                handle.releasePointerCapture(drag.pointerId);
            }

            handle.removeEventListener('pointerdown', this.#handlePointerDown);
            handle.removeEventListener('pointermove', this.#handlePointerMove);
            handle.removeEventListener('pointerup', this.#handlePointerEnd);
            handle.removeEventListener('pointercancel', this.#handlePointerEnd);
            handle.removeEventListener('lostpointercapture', this.#handlePointerEnd);
        }

        this.#drag = null;
        this.#panel = null;
        this.#handle = null;
    }
}

export function defineShellElement(): void {
    if (!customElements.get(SHELL_TAG)) {
        customElements.define(SHELL_TAG, PgShellElement);
    }
}
