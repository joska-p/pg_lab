import { describe, expect, it, vi } from 'vite-plus/test';

import { RenderTarget } from './RenderTarget';

const FRAMEBUFFER = 0x8d40;
const FRAMEBUFFER_COMPLETE = 0x8cd5;
const COLOR_ATTACHMENT0 = 0x8ce0;
const COLOR_BUFFER_BIT = 0x4000;
const TEXTURE_2D = 0x0de1;
const RGBA8 = 0x8058;
const RGBA = 0x1908;
const UNSIGNED_BYTE = 0x1401;
const NEAREST = 0x2600;
const LINEAR = 0x2601;
const CLAMP_TO_EDGE = 0x812f;
const TEXTURE_MIN_FILTER = 0x2801;
const TEXTURE_MAG_FILTER = 0x2800;
const TEXTURE_WRAP_S = 0x2802;
const TEXTURE_WRAP_T = 0x2803;

function baseMockGl() {
    return {
        FRAMEBUFFER,
        FRAMEBUFFER_COMPLETE,
        COLOR_ATTACHMENT0,
        COLOR_BUFFER_BIT,
        TEXTURE_2D,
        RGBA8,
        RGBA,
        UNSIGNED_BYTE,
        NEAREST,
        LINEAR,
        CLAMP_TO_EDGE,
        TEXTURE_MIN_FILTER,
        TEXTURE_MAG_FILTER,
        TEXTURE_WRAP_S,
        TEXTURE_WRAP_T,
        createTexture: vi.fn(() => ({ _tex: true })),
        deleteTexture: vi.fn(),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn(() => ({ _fbo: true })),
        deleteFramebuffer: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        checkFramebufferStatus: vi.fn(() => FRAMEBUFFER_COMPLETE),
        clearColor: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn(),
    };
}

function createMockGl(overrides: Partial<ReturnType<typeof baseMockGl>> = {}) {
    return { ...baseMockGl(), ...overrides };
}

describe('RenderTarget', () => {
    it('creates one texture and one framebuffer', () => {
        const gl = createMockGl();

        new RenderTarget(gl as unknown as WebGL2RenderingContext, 64, 64);

        expect(gl.createTexture).toHaveBeenCalledTimes(1);
        expect(gl.createFramebuffer).toHaveBeenCalledTimes(1);
    });

    it('exposes width and height', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 128, 64);

        expect(target.width).toBe(128);
        expect(target.height).toBe(64);
    });

    it('exposes the texture', () => {
        const gl = createMockGl();
        const fakeTexture = { _tex: true };

        gl.createTexture.mockReturnValue(fakeTexture);

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 32, 32);

        expect(target.texture).toBe(fakeTexture);
    });

    it('applies NEAREST filter by default', () => {
        const gl = createMockGl();

        new RenderTarget(gl as unknown as WebGL2RenderingContext, 32, 32);

        expect(gl.texParameteri).toHaveBeenCalledWith(TEXTURE_2D, TEXTURE_MIN_FILTER, NEAREST);
        expect(gl.texParameteri).toHaveBeenCalledWith(TEXTURE_2D, TEXTURE_MAG_FILTER, NEAREST);
    });

    it('applies LINEAR filter when requested', () => {
        const gl = createMockGl();

        new RenderTarget(gl as unknown as WebGL2RenderingContext, 32, 32, { filter: 'linear' });

        expect(gl.texParameteri).toHaveBeenCalledWith(TEXTURE_2D, TEXTURE_MIN_FILTER, LINEAR);
        expect(gl.texParameteri).toHaveBeenCalledWith(TEXTURE_2D, TEXTURE_MAG_FILTER, LINEAR);
    });

    it('resize with identical dimensions is a no-op', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 64, 64);

        gl.createTexture.mockClear();
        gl.createFramebuffer.mockClear();
        target.resize(64, 64);

        expect(gl.createTexture).not.toHaveBeenCalled();
        expect(gl.createFramebuffer).not.toHaveBeenCalled();
    });

    it('resize with new dimensions recreates the target', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 64, 64);

        gl.createTexture.mockClear();
        gl.deleteTexture.mockClear();
        target.resize(128, 128);

        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(gl.createTexture).toHaveBeenCalledTimes(1);
        expect(target.width).toBe(128);
        expect(target.height).toBe(128);
    });

    it('reinitialize always recreates at the current size', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 64, 64);

        gl.createTexture.mockClear();
        gl.deleteTexture.mockClear();
        target.reinitialize();

        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(gl.createTexture).toHaveBeenCalledTimes(1);
        expect(target.width).toBe(64);
        expect(target.height).toBe(64);
    });

    it('incomplete framebuffer cleanup deletes both texture and framebuffer', () => {
        const gl = createMockGl({
            checkFramebufferStatus: vi.fn(() => 0x0000), // not FRAMEBUFFER_COMPLETE
        });

        expect(() => new RenderTarget(gl as unknown as WebGL2RenderingContext, 64, 64)).toThrow(
            /incomplete/,
        );

        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(1);
    });

    it('destroy is idempotent and calls the hook exactly once', () => {
        const gl = createMockGl();
        const hook = vi.fn();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 32, 32, {}, hook);

        target.destroy();
        target.destroy();
        target.destroy();

        expect(hook).toHaveBeenCalledTimes(1);
        expect(hook).toHaveBeenCalledWith(target);
        expect(gl.deleteTexture).toHaveBeenCalledTimes(1);
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(1);
    });

    it('destroy without hook does not throw', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 32, 32);

        expect(() => target.destroy()).not.toThrow();
    });

    it('bindFramebuffer sets the viewport', () => {
        const gl = createMockGl();

        const target = new RenderTarget(gl as unknown as WebGL2RenderingContext, 128, 64);

        gl.viewport.mockClear();
        target.bindFramebuffer();

        expect(gl.viewport).toHaveBeenCalledWith(0, 0, 128, 64);
        expect(gl.bindFramebuffer).toHaveBeenCalledWith(FRAMEBUFFER, expect.anything());
    });
});
