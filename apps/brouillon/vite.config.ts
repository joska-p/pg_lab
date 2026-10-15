import { defineConfig } from 'vite-plus';

import { reactPlugins } from '../../tools/vite/react.ts';
import { sharedViteConfig } from '../../tools/vite/shared.ts';

export default defineConfig({
    ...sharedViteConfig,
    plugins: reactPlugins(),
});
