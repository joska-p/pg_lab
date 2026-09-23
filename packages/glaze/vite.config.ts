import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';
import { lazyPlugins } from 'vite-plus';

// https://vite.dev/config/
export default defineConfig({
    pack: {
        // One entry per public subpath (see package.json exports).
        // Explicit file list (no globs): *.test.ts files must never
        // become entries. exports: false: the dual source/dist map is
        // hand-written so it keeps pointing at ./src internally.
        entry: [
            './src/core/Camera.ts',
            './src/core/CameraControls.ts',
            './src/core/Clock.ts',
            './src/core/FrameLoop.ts',
            './src/core/InputStore.ts',
            './src/core/brands.ts',
            './src/core/cameraTypes.ts',
            './src/core/clockTypes.ts',
            './src/core/environment.ts',
            './src/core/frameTypes.ts',
            './src/core/geometry.ts',
            './src/core/gestureTypes.ts',
            './src/core/gestures.ts',
            './src/core/inputTypes.ts',
            './src/core/render.ts',
            './src/core/shapes.ts',
            './src/core/surfaceTypes.ts',
            './src/core/time.ts',
            './src/cpu/CpuSurface.ts',
            './src/cpu/types.ts',
            './src/gpu/GpuSurface.ts',
            './src/gpu/StateBuffer.ts',
            './src/gpu/batch/ShapeBatcher.ts',
            './src/gpu/batch/geometry.ts',
            './src/gpu/batch/types.ts',
            './src/gpu/shader/Program.ts',
            './src/gpu/shader/compileProgram.ts',
            './src/gpu/shader/setUniforms.ts',
            './src/gpu/shader/types.ts',
            './src/gpu/shapes/TextRasterizer.ts',
            './src/gpu/shapes/color.ts',
            './src/gpu/shapes/types.ts',
            './src/gpu/types.ts',
            './src/react/CpuCanvas.tsx',
            './src/react/GpuCanvas.tsx',
            './src/react/clockStore.ts',
            './src/react/interactions.ts',
            './src/react/observable.ts',
            './src/react/stackTypes.ts',
            './src/react/surfaceStack.ts',
            './src/react/types.ts',
            './src/react/useNodeResource.ts',
        ],
        dts: {
            generator: 'tsgo',
        },
        exports: false,
    },
    test: {
        include: ['src/**/*.test.ts'],
    },
    // lint: owned by the root config `lint.overrides`.
    plugins: lazyPlugins(() => [
        babel({
            presets: [reactCompilerPreset()],
        }),
        react(),
    ]),
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    server: {
        fs: {
            allow: ['../..'],
        },
    },
});
