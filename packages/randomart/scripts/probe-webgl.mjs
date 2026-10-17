// Usage: node scripts/probe-webgl.mjs [gpu|swiftshader]
import { chromium } from 'playwright-core';

const MODES = {
    gpu: ['--ignore-gpu-blocklist'],
    swiftshader: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
};
const mode = process.argv[2] ?? 'gpu';
const executablePath = process.env.CHROMIUM ?? '/usr/bin/chromium';

const browser = await chromium.launch({ executablePath, headless: true, args: MODES[mode] });
const page = await browser.newPage();
const info = await page.evaluate(() => {
    const gl = document.createElement('canvas').getContext('webgl2');

    if (!gl) {
        return null;
    }

    const debug = gl.getExtension('WEBGL_debug_renderer_info');

    return {
        version: gl.getParameter(gl.VERSION),
        renderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unknown',
    };
});

console.log(mode, info ?? 'WebGL2 UNAVAILABLE');
await browser.close();
