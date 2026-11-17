/*
 * Native control helpers for static experiment panels.
 * The HTML keeps the shell, the sections and the labels; these functions only
 * fill an explicit mount point with a single input. They never rebuild markup.
 */

export interface SelectOption {
    value: string;
    label: string;
}

export function createSelect(
    mount: HTMLElement,
    options: readonly SelectOption[],
    value: string,
): HTMLSelectElement {
    const select = document.createElement('select');

    for (const option of options) {
        const element = document.createElement('option');

        element.value = option.value;
        element.textContent = option.label;
        select.append(element);
    }

    select.value = value;
    mount.append(select);

    return select;
}

export interface SliderOptions {
    min: number;
    max: number;
    step: number;
    value: number;
}

export function createSlider(mount: HTMLElement, options: SliderOptions): HTMLInputElement {
    const slider = document.createElement('input');

    slider.type = 'range';
    slider.min = String(options.min);
    slider.max = String(options.max);
    slider.step = String(options.step);
    slider.value = String(options.value);
    mount.append(slider);

    return slider;
}

export function createToggle(mount: HTMLElement, checked: boolean): HTMLInputElement {
    const toggle = document.createElement('input');

    toggle.type = 'checkbox';
    toggle.checked = checked;
    mount.append(toggle);

    return toggle;
}

export function createTextInput(mount: HTMLElement, value: string): HTMLInputElement {
    const input = document.createElement('input');

    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.value = value;
    mount.append(input);

    return input;
}

export function createTextArea(mount: HTMLElement, value: string): HTMLTextAreaElement {
    const area = document.createElement('textarea');

    area.rows = 2;
    area.spellcheck = false;
    area.value = value;
    mount.append(area);

    return area;
}
