import { defineReactLib } from '@repo/internal-config/vite-lib';
import { defineConfig } from 'vite-plus';

// @repo/ui ships StyleX source for consumers to compile, so no Vite
// transform plugins belong here (vp pack runs tsdown, not Vite).
// pack must not rewrite package.json exports: they intentionally point
// at ./src so every app compiles the same source with the shared preset.
export default defineConfig({
    pack: {
        // One entry per public file (see package.json exports).
        // exports: false: the dual source/dist map is hand-written so it
        // keeps pointing at ./src for internal "source" resolution.
        // Explicit file list (no globs): test files must never become
        // entries. Keep in sync with the exports map below.
        entry: [
            './src/components/Badge.tsx',
            './src/components/Button.tsx',
            './src/components/Card.tsx',
            './src/components/Checkbox.tsx',
            './src/components/ColorField.tsx',
            './src/components/ControlField.tsx',
            './src/components/ControlPanel.tsx',
            './src/components/ControlSection.tsx',
            './src/components/ErrorBoundary.tsx',
            './src/components/ExperimentShell.tsx',
            './src/components/Led.tsx',
            './src/components/MaterialScene.tsx',
            './src/components/NumberField.tsx',
            './src/components/RadioGroup.tsx',
            './src/components/Readout.tsx',
            './src/components/SectionHeading.tsx',
            './src/components/Segmented.tsx',
            './src/components/Select.tsx',
            './src/components/ShellWrapper.tsx',
            './src/components/Slider.tsx',
            './src/components/Stack.tsx',
            './src/components/Stage.tsx',
            './src/components/Swatch.tsx',
            './src/components/Text.tsx',
            './src/components/TextArea.tsx',
            './src/components/TextInput.tsx',
            './src/components/Toggle.tsx',
            './src/recipes/effects.stylex.ts',
            './src/recipes/fields.stylex.ts',
            './src/recipes/interaction.stylex.ts',
            './src/recipes/typography.stylex.ts',
            './src/tokens/colors.stylex.ts',
            './src/tokens/families.stylex.ts',
            './src/tokens/layout.stylex.ts',
            './src/tokens/motion.stylex.ts',
            './src/tokens/palette.stylex.ts',
            './src/tokens/shadows.stylex.ts',
            './src/tokens/transparency.stylex.ts',
            './src/tokens/typography.stylex.ts',
            './src/stylex-preset.ts',
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
    ...defineReactLib(),
});
