#!/usr/bin/env node
/**
 * Banned vocabulary and naming patterns (conventions §2.1, §12.4).
 *
 * Scans the randomart sources for words and shapes the convention removed or renamed, so the rule
 * cannot silently come back. Each rule carries the replacement or the reason, so the fix is
 * mechanical. The list is deliberately small: a rule earns its place only when it is unambiguous.
 *
 * Usage: node tools/lint/banned-words.mjs [root...] (default: packages/randomart) Exit code is
 * non-zero when a rule matches, so `vp run audit` fails on a regression.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

const DEFAULT_ROOTS = ['packages/randomart'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs']);
const IGNORED_DIRECTORIES = new Set(['node_modules', 'dist', '.shaders']);

/**
 * A rule is a regular expression plus the sentence to show next to the match.
 *
 * `allow` lets a rule tolerate a known-good token (a global API, an external name) without
 * weakening the rule for the rest of the tree.
 */
const RULES = [
    {
        id: 'color',
        pattern: /\bcolour(s|ed|ful|fulness)?\b/gi,
        message: 'Use `color`, not `colour` (conventions §2.1.1, one concept one word).',
    },
    {
        id: 'catalog',
        pattern: /\bcatalogue(s)?\b/gi,
        message: 'Use `catalog`, not `catalogue` (conventions §2.1.1).',
    },
    {
        id: 'config',
        pattern: /\bTUNING\b/,
        message: '`TUNING` was renamed to `CONFIG` (codex/notes/randomart-config-knobs.md).',
    },
    {
        id: 'memo',
        pattern: /\buseMemo\b|\buseCallback\b|React\.memo\b/,
        message:
            'The React Compiler memoizes automatically: do not hand-write memo hooks (conventions §12.4).',
    },
    {
        id: 'new-prefix',
        pattern: /\bexport\s+(?:async\s+)?function\s+new[A-Z]/,
        message: '`new` is not in the verb table; use a verb-first factory (conventions §2.1.4).',
    },
    {
        id: 'failure-name',
        pattern: /\bfunction\s+failure\s*\(/,
        message: 'Not verb-first; name the operation (conventions §2.1.4).',
    },
    {
        id: 'mode-name',
        pattern: /\bexport\s+type\s+Mode\b/,
        message: '`Mode` is too vague; qualify it (`AppMode`) (conventions §2.1.9).',
    },
    {
        id: 'acronym',
        pattern: /\b[A-Za-z][A-Za-z0-9]*_ID\b/g,
        message:
            'Acronyms read as words in identifiers (`Id`); `*_IDS` is reserved for id arrays (conventions §2.1.7).',
        allow: /\b(?:FAMILY|SIZE_PROFILE|COLOR_SPACE)_IDS\b/,
    },
    {
        // `import/extensions` does not see a directory import (`'../catalog'`): it resolves to a file.
        id: 'import-extension',
        pattern: /\bfrom\s+'\.{1,2}\/(?:(?!\.(?:tsx?|css|mjs|js|json)')[^'\n])*'/,
        message:
            'Relative import without an explicit extension; write the file (`../catalog/index.ts`) (conventions §2.1.9).',
    },
];

/**
 * Rules on file names, which the line scan cannot see (`catalogueStore.ts` has no `\bcatalogue\b`
 * inside any line). Patterns are not global: `test()` must stay stateless.
 */
const FILE_NAME_RULES = [
    {
        id: 'file-name',
        pattern: /catalogue|colour|tuning/i,
        message:
            'File name uses a retired word; use `catalog`, `color`, `config` (conventions §2.1.1).',
    },
];

/**
 * The git-ignored pipeline output is `<package>/dataset/`, next to a `package.json`. `src/dataset/`
 * and `scripts/dataset/` are code and must be scanned, so the name alone is not enough.
 *
 * @param {string} directory @param {string} entry
 */
function isOutputDirectory(directory, entry) {
    return entry === 'dataset' && existsSync(join(directory, 'package.json'));
}

/** @param {string} directory @param {string[]} [files] */
function collectFiles(directory, files = []) {
    for (const entry of readdirSync(directory)) {
        if (IGNORED_DIRECTORIES.has(entry) || isOutputDirectory(directory, entry)) {
            continue;
        }

        const path = join(directory, entry);
        const stats = statSync(path);

        if (stats.isDirectory()) {
            collectFiles(path, files);
        } else if (SOURCE_EXTENSIONS.has(path.slice(path.lastIndexOf('.')))) {
            files.push(path);
        }
    }

    return files;
}

/** @param {string} file @param {number} line @param {RegExpMatchArray} match */
function lineOf(file, line, match) {
    const column = (match.index ?? 0) + 1;

    return `${relative(process.cwd(), file)}:${line}:${column}`;
}

/**
 * @param {string[]} roots
 * @returns {{ id: string; message: string; at: string; text: string }[]}
 */
function scan(roots) {
    const findings = [];

    for (const file of roots.flatMap((root) => collectFiles(root))) {
        const name = basename(file);

        for (const rule of FILE_NAME_RULES) {
            if (rule.pattern.test(name)) {
                findings.push({
                    id: rule.id,
                    message: rule.message,
                    at: relative(process.cwd(), file),
                    text: name,
                });
            }
        }

        const lines = readFileSync(file, 'utf8').split('\n');

        lines.forEach((text, index) => {
            for (const rule of RULES) {
                const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
                const match = pattern.exec(text);

                if (!match || (rule.allow && rule.allow.test(text))) {
                    continue;
                }

                findings.push({
                    id: rule.id,
                    message: rule.message,
                    at: lineOf(file, index + 1, match),
                    text: text.trim(),
                });
            }
        });
    }

    return findings;
}

const roots = process.argv.slice(2).map((root) => resolve(root));
const scanned = roots.length > 0 ? roots : DEFAULT_ROOTS.map((root) => resolve(root));
const findings = scan(scanned);

if (findings.length === 0) {
    console.log(
        `banned-words: clean (${scanned.map((root) => relative(process.cwd(), root)).join(', ')})`,
    );
} else {
    const byRule = new Map();

    for (const finding of findings) {
        const group = byRule.get(finding.id) ?? [];
        group.push(finding);
        byRule.set(finding.id, group);
    }

    for (const [id, group] of byRule) {
        console.log(`\n${id} (${group.length}) — ${group[0].message}`);

        for (const finding of group) {
            console.log(`  ${finding.at}  ${finding.text}`);
        }
    }

    console.log(`\nbanned-words: ${findings.length} finding(s).`);
}

process.exit(findings.length > 0 ? 1 : 0);
