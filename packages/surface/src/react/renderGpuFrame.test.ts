import { describe, expect, it, vi } from 'vite-plus/test';

import type { GpuSurface } from '../gpu/GpuSurface';
import type { Program } from '../gpu/Program';
import { renderGpuFrame } from './renderGpuFrame';

interface FakeSurface {
    renderProgram: ReturnType<typeof vi.fn>;
}

function createFakeSurface(): { surface: GpuSurface; fake: FakeSurface } {
    const fake: FakeSurface = {
        renderProgram: vi.fn(),
    };
    return { surface: fake as unknown as GpuSurface, fake };
}

function fakeProgram(name = 'prog'): Program {
    return { name } as unknown as Program;
}

describe('renderGpuFrame', () => {
    it('returns renderedProgram without drawing when program is null', () => {
        const { surface, fake } = createFakeSurface();
        const prev = fakeProgram('prev');

        const result = renderGpuFrame({
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

        const result = renderGpuFrame({
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

        const result = renderGpuFrame({
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

        const result = renderGpuFrame({
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

        const result = renderGpuFrame({
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

        renderGpuFrame({
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
