import { chromium } from 'playwright-core';

import type { Frame } from './imageStats';
import { RENDER_SCRIPT } from './renderScript';

export type RenderOutcome =
    | { readonly ok: true; readonly frames: readonly Frame[] }
    | { readonly ok: false; readonly error: string };

export interface Renderer {
    /** Render a fragment shader at each phase into square RGBA frames of `size` pixels. */
    render(source: string, phases: readonly number[], size: number): Promise<RenderOutcome>;
    close(): Promise<void>;
}

type RawResult =
    | { readonly ok: true; readonly frames: readonly string[] }
    | { readonly ok: false; readonly error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item): item is string => typeof item === 'string');
}

/** The page answers with untyped JSON: check its shape before trusting it. */
function parseResult(value: unknown): RawResult {
    if (isRecord(value)) {
        if (value.ok === true && isStringArray(value.frames)) {
            return { ok: true, frames: value.frames };
        }

        if (value.ok === false && typeof value.error === 'string') {
            return { ok: false, error: value.error };
        }
    }

    throw new Error('Unexpected answer from the render page');
}

function decodeFrame(base64: string, size: number): Frame {
    return { width: size, height: size, rgba: new Uint8Array(Buffer.from(base64, 'base64')) };
}

/**
 * Launches headless Chromium (software GL is enough at thumbnail size). Browsers are not bundled
 * with `playwright-core`: install one with `npx playwright install chromium`, or point
 * `CHROMIUM_PATH` at an existing executable.
 */
export async function createRenderer(): Promise<Renderer> {
    const executablePath = process.env.CHROMIUM_PATH;
    const browser = await chromium.launch({
        headless: true,
        ...(executablePath !== undefined && { executablePath }),
        args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    });
    const page = await browser.newPage();

    await page.goto('about:blank');
    await page.evaluate(RENDER_SCRIPT);

    return {
        async render(source, phases, size) {
            // Passed as a string expression, never as a function: see `renderScript.ts`.
            const raw: unknown = await page.evaluate(
                `window.__render(${JSON.stringify(source)}, ${JSON.stringify(phases)}, ${size})`,
            );
            const result = parseResult(raw);

            if (!result.ok) {
                return result;
            }

            return { ok: true, frames: result.frames.map((frame) => decodeFrame(frame, size)) };
        },

        async close() {
            await browser.close();
        },
    };
}
