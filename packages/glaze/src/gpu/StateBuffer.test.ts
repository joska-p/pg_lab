import { describe, expect, it, vi } from 'vite-plus/test';

import { createStateBuffer } from './StateBuffer';

/** Minimal WebGL2 mock: enough for `StateBufferTargets`' texture/FBO lifecycle. */
function createMockGl() {
    return {
        createTexture: vi.fn(() => ({})),
        createFramebuffer: vi.fn(() => ({})),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        checkFramebufferStatus: vi.fn(() => 0x8cd5), // FRAMEBUFFER_COMPLETE
        deleteTexture: vi.fn(),
        deleteFramebuffer: vi.fn(),
        FRAMEBUFFER: 0x8d40,
        FRAMEBUFFER_COMPLETE: 0x8cd5,
        COLOR_ATTACHMENT0: 0x8ce0,
        TEXTURE_2D: 0x0de1,
        RGBA8: 0x8058,
        RGBA: 0x1908,
        UNSIGNED_BYTE: 0x1401,
        NEAREST: 0x2600,
        CLAMP_TO_EDGE: 0x812f,
    };
}

type MockGl = ReturnType<typeof createMockGl>;

function createBuffer(gl: MockGl) {
    return createStateBuffer(gl as unknown as WebGL2RenderingContext, 100, 100);
}

describe('StateBuffer target lifecycle', () => {
    it('keeps the target pair when resize() is called with identical dimensions', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        buffer.resize(100, 100);

        expect(gl.createTexture.mock.calls.length).toBe(created);
    });

    it('recreates the target pair when resize() changes dimensions', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        buffer.resize(200, 100);

        expect(gl.createTexture.mock.calls.length).toBe(created + 2);
    });

    it('reinitialize() forces a new target pair at current dimensions (context-restore fix)', () => {
        const gl = createMockGl();
        const buffer = createBuffer(gl);
        const created = gl.createTexture.mock.calls.length;

        // The restore path reinitializes at the *same* dimensions; resize() alone would no-op.
        buffer.reinitialize();

        expect(gl.createTexture.mock.calls.length).toBe(created + 2);
    });
});
