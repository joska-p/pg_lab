/*
 * Home experiment: augment the static shell with targeted DOM updates.
 * The select value and the shell's data-background are the only state;
 * no markup is ever rebuilt.
 */

import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';

const BACKGROUND_LABELS: Readonly<Record<string, string>> = {
    'lava-flow': 'Lava flow',
    'auroral-fluid': 'Auroral fluid',
    'thermal-magma': 'Thermal magma',
};
const BACKGROUND_CLASSES = Object.keys(BACKGROUND_LABELS).map((value) => `pg-bg--${value}`);
const DEFAULT_BACKGROUND = 'lava-flow';

const shell = document.querySelector<HTMLElement>('pg-shell');
const stage = document.querySelector<HTMLElement>('.pg-shell__stage');
const backgroundSelect = document.querySelector<HTMLSelectElement>('#pg-home-background');
const status = document.querySelector<HTMLElement>('[data-background-status]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-background-reset]');

if (!shell || !stage || !backgroundSelect || !status || !resetButton) {
    throw new Error('Home markup is incomplete.');
}

const selectBackground = (value: string): void => {
    if (!Object.hasOwn(BACKGROUND_LABELS, value)) {
        return;
    }

    backgroundSelect.value = value;
    stage.classList.remove(...BACKGROUND_CLASSES);
    stage.classList.add(`pg-bg--${value}`);
    shell.dataset.background = value;
    status.textContent = `Fond : ${BACKGROUND_LABELS[value]}`;
};

selectBackground(shell.dataset.background ?? backgroundSelect.value);

backgroundSelect.addEventListener('change', () => {
    selectBackground(backgroundSelect.value);
});

resetButton.addEventListener('click', () => {
    selectBackground(DEFAULT_BACKGROUND);
});

defineShellElement();
initTheme();
