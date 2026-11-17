/*
 * Notebook experiment: the static markup owns every folio and every log.
 * Helpers only fill the panel mount points; updates stay targeted to
 * classList, hidden, textContent and control values.
 */

import { createSelect, createSlider, createToggle } from '../../ui/controls';
import type { SelectOption } from '../../ui/controls';
import { defineShellElement } from '../../ui/shell';
import { initTheme } from '../../ui/theme';

type NoteSlug = 'birth-of-complexity' | 'genese' | 'captains-logs';
type LogSortOrder = 'newest-first' | 'oldest-first';

const NOTE_SLUGS: readonly NoteSlug[] = ['birth-of-complexity', 'genese', 'captains-logs'];
const NOTE_OPTIONS: readonly SelectOption[] = [
    { value: 'birth-of-complexity', label: 'birth of complexity' },
    { value: 'genese', label: 'généalogie' },
    { value: 'captains-logs', label: 'captains logs' },
];
const NOTE_LABELS: Record<NoteSlug, string> = {
    'birth-of-complexity': 'birth of complexity',
    genese: 'généalogie',
    'captains-logs': 'captains logs',
};
const SORT_OPTIONS: readonly SelectOption[] = [
    { value: 'newest-first', label: "Récents d'abord" },
    { value: 'oldest-first', label: 'Anciens d’abord' },
];

const DEFAULT_NOTE: NoteSlug = 'captains-logs';
const DEFAULT_SORT: LogSortOrder = 'newest-first';
const NEWEST_CLASS = 'pg-logs--newest-first';
const COMPACT_CLASS = 'pg-logs--compact';

function isNoteSlug(value: string): value is NoteSlug {
    return NOTE_SLUGS.some((slug) => slug === value);
}

function isLogSortOrder(value: string): value is LogSortOrder {
    return value === 'newest-first' || value === 'oldest-first';
}

function required<T extends Element>(selector: string): T {
    const element = document.querySelector<T>(selector);

    if (!element) {
        throw new Error(`Notebook markup is incomplete: ${selector}`);
    }

    return element;
}

const noteSelect = createSelect(
    required<HTMLElement>('[data-control="note"]'),
    NOTE_OPTIONS,
    DEFAULT_NOTE,
);
const sortSelect = createSelect(
    required<HTMLElement>('[data-control="sort"]'),
    SORT_OPTIONS,
    DEFAULT_SORT,
);
const logControls = required<HTMLElement>('[data-log-controls]');
const logs = required<HTMLElement>('[data-logs]');
const logSections = [...logs.querySelectorAll<HTMLElement>('[data-log]')];
const limitSlider = createSlider(required<HTMLElement>('[data-control="limit"]'), {
    min: 1,
    max: logSections.length,
    step: 1,
    value: logSections.length,
});
const limitOutput = required<HTMLOutputElement>('[data-value="limit"]');
const metadataToggle = createToggle(required<HTMLElement>('[data-control="metadata"]'), true);
const status = required<HTMLElement>('[data-status]');

let currentNote: NoteSlug = DEFAULT_NOTE;

function visibleLogCount(): number {
    return logSections.reduce((count, section) => count + (section.hidden ? 0 : 1), 0);
}

function updateStatus(): void {
    const label = NOTE_LABELS[currentNote];

    status.textContent =
        currentNote === 'captains-logs'
            ? `Folio : ${label} — ${visibleLogCount()} entrées sur ${logSections.length}.`
            : `Folio : ${label}.`;
}

function selectNote(value: string): void {
    if (!isNoteSlug(value)) {
        return;
    }

    currentNote = value;

    for (const slug of NOTE_SLUGS) {
        required<HTMLElement>(`[data-note="${slug}"]`).hidden = slug !== value;
    }

    noteSelect.value = value;
    logControls.hidden = value !== 'captains-logs';
    updateStatus();
}

function applyLogView(): void {
    const order: LogSortOrder = isLogSortOrder(sortSelect.value) ? sortSelect.value : DEFAULT_SORT;
    const limit = Number(limitSlider.value);
    const total = logSections.length;

    logs.classList.toggle(NEWEST_CLASS, order === 'newest-first');
    logs.classList.toggle(COMPACT_CLASS, !metadataToggle.checked);

    for (const [index, section] of logSections.entries()) {
        const position = order === 'newest-first' ? total - index : index + 1;

        section.hidden = position > limit;
    }

    limitOutput.textContent = String(limit);
    updateStatus();
}

noteSelect.addEventListener('change', () => selectNote(noteSelect.value));
sortSelect.addEventListener('change', applyLogView);
limitSlider.addEventListener('input', applyLogView);
metadataToggle.addEventListener('change', applyLogView);

defineShellElement();
initTheme();
selectNote(noteSelect.value);
applyLogView();
