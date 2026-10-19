#!/usr/bin/env node
/**
 * Audit runner (conventions §1.2, §2.1, §2.4, §12.4).
 *
 * Chains the mechanical checks that keep randomart coherent: dead code (knip), layer direction and
 * core purity (oxlint `tools/audit/oxlint.audit.jsonc`), banned vocabulary (banned-words.mjs),
 * import extensions, cycles (madge) and duplication (jscpd). Every check prints first; the runner
 * exits non-zero only when a gating check fails, so a report is always complete.
 *
 * Usage: node tools/audit/run.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PACKAGE = 'packages/randomart';

/**
 * `gating: false` marks a check that reports a signal we tolerate for now, so it cannot fail the
 * runner while its finding is being decided (see the note on cycles below).
 */
const CHECKS = [
    {
        name: 'layers + purity + extensions',
        command: 'vp',
        args: ['lint', '-c', 'tools/audit/oxlint.audit.jsonc', PACKAGE],
        gating: true,
    },
    {
        name: 'banned vocabulary',
        command: 'node',
        args: ['tools/audit/banned-words.mjs', PACKAGE],
        gating: true,
    },
    {
        name: 'dead code',
        command: 'knip',
        args: ['-W', PACKAGE],
        gating: true,
    },
    {
        name: 'duplication',
        command: 'jscpd',
        // Production files only: the test suite duplicates fixtures on purpose.
        args: [PACKAGE, '--ignore', '**/*.test.ts', '--threshold', '1'],
        gating: true,
    },
    {
        name: 'cycles',
        command: 'madge',
        args: ['--circular', '--extensions', 'ts,tsx', `${PACKAGE}/src`, `${PACKAGE}/scripts`],
        // Informational: madge counts type-only and barrel edges. The type-aware `import/no-cycle`
        // rule in `vp check` is the gate; a green there with red here means type-only cycles only.
        gating: false,
    },
];

/** Prefer the workspace binary so the runner works outside `vp run`. */
function resolveCommand(command) {
    const local = join('node_modules', '.bin', command);

    return existsSync(local) ? local : command;
}

const results = [];

for (const check of CHECKS) {
    console.log(`\n── ${check.name} ─────────────────────────────────────────`);

    const { status } = spawnSync(resolveCommand(check.command), check.args, { stdio: 'inherit' });
    results.push({ ...check, failed: status !== 0 });
}

console.log('\n── audit summary ───────────────────────────────────────');

for (const { name, failed, gating } of results) {
    const state = failed ? (gating ? 'FAIL' : 'warn') : 'pass';

    console.log(`${state.padEnd(5)} ${name}`);
}

const failed = results.some(({ failed, gating }) => failed && gating);

process.exit(failed ? 1 : 0);
