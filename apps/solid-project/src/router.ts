import { createRouter, hashHistory, intentPreload } from '@solidjs/router';
import { fileRoutes } from '@solidjs/router/fs';
import { pageRoutes } from 'virtual:file-routes';

// Link preloading is opt-in. intentPreload() warms a link's code and runs
// its preload when the pointer rests on it (or on focus/touch).
export const Router = createRouter({
    routes: fileRoutes(pageRoutes),
    history: hashHistory(),
    preloadLinks: intentPreload(),
});

export const { paths } = Router;
