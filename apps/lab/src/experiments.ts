/*
 * Registre des expériences pg_lab.
 * Une entrée par expérience ; chaque entrée génère sa page statique exp/<id>/index.html.
 * Aucun fichier existant n'est modifié.
 */

export interface Experiment {
    id: string;
    title: string;
    entry: string; // chemin du point d'entrée JS compilé, relatif à apps/lab/dist/
}

export const experiments: readonly Experiment[] = [
    {
        id: 'test',
        title: 'Témoin',
        entry: 'exp/test/main.js',
    },
];
