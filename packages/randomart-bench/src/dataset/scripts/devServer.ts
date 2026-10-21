import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const STARTUP_TIMEOUT_MS = 60_000;
const POLL_MS = 250;

/** This file lives in `src/dataset/scripts/`; the dev server runs from the package root. */
const PACKAGE_ROOT = fileURLToPath(new URL('../../..', import.meta.url));

async function isServing(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });

        return response.ok;
    } catch {
        return false;
    }
}

async function waitUntilServing(url: string, server: ChildProcess): Promise<void> {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;

    while (Date.now() < deadline) {
        if (server.exitCode !== null) {
            throw new Error(
                `Dev server exited with code ${server.exitCode} before answering ${url}`,
            );
        }

        if (await isServing(url)) {
            return;
        }

        await sleep(POLL_MS);
    }

    throw new Error(`Dev server did not answer ${url} within ${STARTUP_TIMEOUT_MS / 1000}s`);
}

/** The installed `vp`, resolved instead of looked up in PATH: this runs as a plain node script. */
function vpBinary(): string {
    const require = createRequire(import.meta.url);
    const packageJson = require.resolve('vite-plus/package.json');

    return join(dirname(packageJson), 'bin', 'vp');
}

function startDevServer(url: string): ChildProcess {
    const { port } = new URL(url);
    const args = port ? ['dev', '--strictPort', '--port', port] : ['dev'];

    // Detached with its own group: the dev server is a tree (vp spawns vite), and all of it must go.
    return spawn(process.execPath, [vpBinary(), ...args], {
        cwd: PACKAGE_ROOT,
        detached: true,
        stdio: ['ignore', 'ignore', 'inherit'],
    });
}

function stop(server: ChildProcess): void {
    if (server.pid === undefined) {
        return;
    }

    try {
        process.kill(-server.pid, 'SIGTERM');
    } catch {
        // Already gone.
    }
}

/**
 * Runs `run` with the app served at `url`: starts the dev server when nothing answers, and stops it
 * afterwards. A server that was already running belongs to someone else and is left alone.
 */
export async function withDevServer<T>(url: string, run: () => Promise<T>): Promise<T> {
    if (await isServing(url)) {
        return run();
    }

    const server = startDevServer(url);

    try {
        await waitUntilServing(url, server);

        return await run();
    } finally {
        stop(server);
    }
}
