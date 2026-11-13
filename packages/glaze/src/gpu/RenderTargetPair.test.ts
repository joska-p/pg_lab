import { describe, expect, it, vi } from 'vite-plus/test';

import { RenderTargetPair } from './RenderTargetPair';

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

function createMockGl() {
    let textureIndex = 0;
    let fboIndex = 0;

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
        createTexture: vi.fn(() => ({ _tex: ++textureIndex })),
        deleteTexture: vi.fn(),
        bindTexture: vi.fn(),
        texImage2D: vi.fn(),
        texParameteri: vi.fn(),
        createFramebuffer: vi.fn(() => ({ _fbo: ++fboIndex })),
        deleteFramebuffer: vi.fn(),
        bindFramebuffer: vi.fn(),
        framebufferTexture2D: vi.fn(),
        checkFramebufferStatus: vi.fn(() => FRAMEBUFFER_COMPLETE),
        clearColor: vi.fn(),
        clear: vi.fn(),
        viewport: vi.fn(),
    };
}

describe('RenderTargetPair', () => {
    it('creates exactly two textures and two framebuffers', () => {
        const gl = createMockGl();

        new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        expect(gl.createTexture).toHaveBeenCalledTimes(2);
        expect(gl.createFramebuffer).toHaveBeenCalledTimes(2);
    });

    it('read and write are different targets initially', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        expect(pair.read).not.toBe(pair.write);
    });

    it('swap exchanges read and write roles', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        const readBefore = pair.read;
        const writeBefore = pair.write;

        pair.swap();

        expect(pair.read).toBe(writeBefore);
        expect(pair.write).toBe(readBefore);
    });

    it('double swap restores the original assignment', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        const readBefore = pair.read;

        pair.swap();
        pair.swap();

        expect(pair.read).toBe(readBefore);
    });

    it('exposes width and height', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 128, 64);

        expect(pair.width).toBe(128);
        expect(pair.height).toBe(64);
    });

    it('resize recreates exactly two targets and resets pingPong', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        pair.swap(); // move to pingPong = 1
        gl.createTexture.mockClear();
        gl.deleteTexture.mockClear();
        pair.resize(128, 128);

        expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
        expect(gl.createTexture).toHaveBeenCalledTimes(2);
        expect(pair.width).toBe(128);
        expect(pair.height).toBe(128);
    });

    it('reinitialize recreates exactly two targets', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        gl.createTexture.mockClear();
        gl.deleteTexture.mockClear();
        pair.reinitialize();

        expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
        expect(gl.createTexture).toHaveBeenCalledTimes(2);
    });

    it('destroy destroys both targets and notifies the hook once', () => {
        const gl = createMockGl();
        const hook = vi.fn();

        const pair = new RenderTargetPair(
            gl as unknown as WebGL2RenderingContext,
            64,
            64,
            {},
            hook,
        );

        pair.destroy();
        pair.destroy();
        pair.destroy();

        expect(hook).toHaveBeenCalledTimes(1);
        expect(hook).toHaveBeenCalledWith(pair);
        expect(gl.deleteTexture).toHaveBeenCalledTimes(2);
        expect(gl.deleteFramebuffer).toHaveBeenCalledTimes(2);
    });

    it('destroy without hook does not throw', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        expect(() => pair.destroy()).not.toThrow();
    });

    it('reinitialize after destroy is a no-op', () => {
        const gl = createMockGl();

        const pair = new RenderTargetPair(gl as unknown as WebGL2RenderingContext, 64, 64);

        pair.destroy();
        gl.createTexture.mockClear();
        pair.reinitialize();

        expect(gl.createTexture).not.toHaveBeenCalled();
    });
});
