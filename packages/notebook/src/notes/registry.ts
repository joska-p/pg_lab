import type { ComponentType } from 'react';

export interface NoteDefinition {
    readonly slug: string;
    readonly title: string;
    readonly description?: string;
    readonly date?: string;
    readonly tags?: readonly string[];
}

export const NOTES: readonly NoteDefinition[] = [
    {
        slug: 'le-voyage',
        title: 'Le voyage d’un clic',
        description:
            'Une intention, huit reconditionnements : le parcours d’un clic à travers les couches.',
        date: '2026-06-01',
        tags: ['interaction', 'systems'],
    },
    {
        slug: 'birth-of-complexity',
        title: 'The Emergence of Complexity',
        description: 'Simple arithmetic rules, unfolding into the complex numbers.',
        date: '2026-05-25',
        tags: ['math', 'philosophy'],
    },
    {
        slug: 'genese',
        title: 'Généalogie d’un Système',
        description: 'Hallucination collective : du bruit primordial à la structure.',
        date: '2026-06-28',
        tags: ['philosophy', 'generative-art'],
    },
    {
        slug: 'captains-log-sketchpads',
        title: 'Captain’s Log: Stardate 2026.231',
        description: 'Purge du codebase et déploiement des sketchpads.',
        date: '2026-08-18',
        tags: ['log'],
    },
    {
        slug: 'captains-log-spirale',
        title: 'Captain’s Log: Stardate 2026.238',
        description: 'Télémétrie TypeDoc, horloge Spirale, footer stellaire.',
        date: '2026-08-18',
        tags: ['log'],
    },
    {
        slug: 'captains-log-migration',
        title: 'Captain’s Log: Stardate 2026.248',
        description: 'Migration @repo/ui vers @repo/tlc, String Art, warp core.',
        date: '2026-09-05',
        tags: ['log'],
    },
];

export const NOTE_LOADERS: Readonly<Record<string, () => Promise<{ Note: ComponentType }>>> = {
    'le-voyage': () => import('./LeVoyage'),
    'birth-of-complexity': () => import('./BirthOfComplexity'),
    genese: () => import('./Genese'),
    'captains-log-sketchpads': () => import('./CaptainsLogSketchpads'),
    'captains-log-spirale': () => import('./CaptainsLogSpirale'),
    'captains-log-migration': () => import('./CaptainsLogMigration'),
};

export function loadNoteModule(slug: string): Promise<{ Note: ComponentType }> {
    const loader = NOTE_LOADERS[slug];
    if (!loader) {
        throw new Error(`Unknown note: ${slug}`);
    }
    return loader();
}

export function findNote(slug: string): NoteDefinition {
    return NOTES.find((note) => note.slug === slug) ?? NOTES[0];
}
