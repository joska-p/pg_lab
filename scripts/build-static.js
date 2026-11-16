#!/usr/bin/env node
/*
 * Générateur de pages statiques pour pg_lab.
 * - Lit le registre d'expériences (apps/lab/src/experiments.ts) compilé par tsc.
 * * Émet apps/lab/index.html + apps/lab/exp/<id>/index.html.
 * - Les fichiers HTML référencent le CSS natif (src/css/theme.css) et le point
 *   d'entrée JS compilé (dist/<entry>) par des chemins relatifs.
 * - Ne modifie aucun fichier existant du repo : écrit uniquement des sorties de build.
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT, '..', '..');
const LAB = resolve(ROOT, 'apps', 'lab');
const TSCONFIG = resolve(LAB, 'tsconfig.json');
const TSC_BIN = resolve(ROOT, 'node_modules', '.bin', 'tsc');

const CSS_TARGET = 'src/css/theme.css';

// 1. Compile les sources TypeScript en JS (tsc seul, pas de bundler).
//    Sortie : apps/lab/dist/ (rootDir: src, outDir: dist).
execSync(`"${TSC_BIN}" -p "${TSCONFIG}"`, {
    cwd: ROOT,
    stdio: 'inherit',
});

// 2. Lit le registre d'expériences compilé.
const { experiments } = await import(resolve(LAB, 'dist', 'experiments.js'));

/**
 * Calcule le chemin relatif depuis une page générée vers une cible située sous apps/lab/. Ex:
 * depuis "exp/test/index.html" vers "src/css/theme.css" donne "../../src/css/theme.css".
 */
function relToLab(fromRelPath, target) {
    const segments = fromRelPath.split('/');
    segments.pop(); // retire le nom de fichier
    const depth = segments.filter(Boolean).length;
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    return prefix + target;
}

function pageHtml({ title, body, css, module }) {
    return `<!DOCTYPE html>
<html lang="fr" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="${css}">
    ${module ? `<script type="module" src="${module}"></script>` : ''}
</head>
<body>${body}</body>
</html>`;
}

const pages = [];

// Page index à la racine du lab : liste des expériences.
pages.push({
    rel: 'index.html',
    title: 'pg_lab',
    css: relToLab('index.html', CSS_TARGET),
    body: `
        <h1>pg_lab</h1>
        <nav>
            <ul>
                ${experiments
                    .map((exp) => `<li><a href="exp/${exp.id}/">${exp.title}</a></li>`)
                    .join('')}
            </ul>
        </nav>
        <p>
            Site statique généré par
            <code>scripts/build-static.js</code>
            (tsc seul, pas de bundler, pas de React).
        </p>
    `,
    module: undefined,
});

// Une page par expérience : exp/<id>/index.html.
for (const exp of experiments) {
    const rel = `exp/${exp.id}/index.html`;
    pages.push({
        rel,
        title: `pg_lab — ${exp.title}`,
        css: relToLab(rel, CSS_TARGET),
        body: `<pg-${exp.id}></pg-${exp.id}>`,
        module: relToLab(rel, `dist/${exp.entry}`),
    });
}

for (const page of pages) {
    const dest = resolve(LAB, page.rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, pageHtml(page), 'utf8');
}

console.log(`Build statique terminé : ${pages.length} page(s) générée(s) dans ${LAB}`);
