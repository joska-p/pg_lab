import { defineConfig } from 'vite-plus';

import { reactPlugins } from '../../tooling/vite/react.ts';
import { sharedViteConfig } from '../../tooling/vite/shared.ts';

export default defineConfig({
    ...sharedViteConfig,
    base: '/pg_lab/',
    plugins: reactPlugins(),
});
