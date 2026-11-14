import { describe, expect, it, vi } from 'vite-plus/test';

import type { Program } from '../gpu/Program';
import type { Surface } from '../gpu/Surface';
import { renderSurfaceFrame } from './renderSurfaceFrame';

interface FakeSurface {
    renderProgram: ReturnType<typeof vi.fn>;
}

function createFakeSurface(): { surface: Surface; fake: FakeSurface } {
    const fake: FakeSurface = {
        renderProgram: vi.fn(),
    };
    return { surface: fake as unknown as Surface, fake };
}

function fakeProgram(name = 'prog'): Program {
    return { name } as unknown as Program;
}

describe('renderSurfaceFrame', () => {
    it('returns renderedProgram without drawing when program is null', () => {
        const { surface, fake } = createFakeSurface();
        const prev = fakeProgram('prev');

        const result = renderSurfaceFrame({
            surface,
            program: null,
            renderedProgram: prev,
        });

        expect(result).toBe(prev);
        expect(fake.renderProgram).not.toHaveBeenCalled();
    });

    it('falls back to surface.renderProgram when renderFrame is not provided', () => {
        const { surface, fake } = createFakeSurface();
        const program = fakeProgram('prog1');
        const uniformsFn = vi.fn(() => ({ u_val: 42 }));

        const result = renderSurfaceFrame({
            surface,
            program,
            renderedProgram: null,
            uniforms: uniformsFn,
        });

        expect(result).toBe(program);
        expect(fake.renderProgram).toHaveBeenCalledWith(program, { u_val: 42 });
    });

    it('invokes custom renderFrame when provided and skips surface.renderProgram', () => {
        const { surface, fake } = createFakeSurface();
        const program = fakeProgram('prog1');
        const renderFrame = vi.fn();
        const uniformsFn = vi.fn(() => ({ u_val: 99 }));

        const result = renderSurfaceFrame({
            surface,
            program,
            renderedProgram: null,
            uniforms: uniformsFn,
            renderFrame,
        });

        expect(result).toBe(program);
        expect(renderFrame).toHaveBeenCalledWith({
            surface,
            program,
            uniforms: { u_val: 99 },
        });
        expect(fake.renderProgram).not.toHaveBeenCalled();
    });

    it('skips drawing when gate returns false and program was already drawn', () => {
        const { surface, fake } = createFakeSurface();
        const program = fakeProgram('prog1');
        const renderFrame = vi.fn();

        const result = renderSurfaceFrame({
            surface,
            program,
            renderedProgram: program,
            gate: () => false,
            renderFrame,
        });

        expect(result).toBe(program);
        expect(renderFrame).not.toHaveBeenCalled();
        expect(fake.renderProgram).not.toHaveBeenCalled();
    });

    it('forces one-shot redraw when program is new, even if gate returns false', () => {
        const { surface } = createFakeSurface();
        const newProgram = fakeProgram('new');
        const oldProgram = fakeProgram('old');
        const renderFrame = vi.fn();

        const result = renderSurfaceFrame({
            surface,
            program: newProgram,
            renderedProgram: oldProgram,
            gate: () => false,
            renderFrame,
        });

        expect(result).toBe(newProgram);
        expect(renderFrame).toHaveBeenCalledTimes(1);
    });

    it('passes undefined uniforms when no uniforms callback is provided', () => {
        const { surface } = createFakeSurface();
        const program = fakeProgram('prog1');
        const renderFrame = vi.fn();

        renderSurfaceFrame({
            surface,
            program,
            renderedProgram: null,
            renderFrame,
        });

        expect(renderFrame).toHaveBeenCalledWith({
            surface,
            program,
            uniforms: undefined,
        });
    });
});
