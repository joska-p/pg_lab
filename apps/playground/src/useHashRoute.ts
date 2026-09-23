import { useEffect, useRef } from 'react';

import { EXPERIMENTS } from './experiments';
import { setPageName, usePageName } from './stores/appStore';
import type { PageName } from './stores/appStore';

const EXPERIMENT_IDS: ReadonlySet<string> = new Set(Object.keys(EXPERIMENTS));

function readHash(): PageName {
    const id = window.location.hash.replace(/^#\/?/, '');
    if (id !== '' && EXPERIMENT_IDS.has(id)) {
        return id as PageName;
    }
    return 'menu';
}

function writeHash(page: PageName): void {
    const wanted = page === 'menu' ? '' : `#/${page}`;
    if (window.location.hash === wanted) {
        return;
    }
    if (wanted === '') {
        window.history.pushState(null, '', window.location.pathname + window.location.search);
    } else {
        window.location.hash = wanted;
    }
}

function clearHash(): void {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
}

export function useHashRoute(): void {
    const pageName = usePageName();
    const pageRef = useRef(pageName);
    const mountedRef = useRef(false);

    // Initial URL wins over the default store state.
    useEffect(() => {
        const id = readHash();
        if (id === 'menu') {
            if (window.location.hash !== '') {
                clearHash();
            }
            return;
        }
        pageRef.current = id;
        setPageName(id);
    }, []);

    // Browser chrome (back/forward/manual edit) drives the store.
    useEffect(() => {
        const onHashChange = () => {
            const id = readHash();
            if (id === 'menu' && window.location.hash !== '') {
                clearHash();
            }
            if (id !== pageRef.current) {
                pageRef.current = id;
                setPageName(id);
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // In-app navigation drives the URL.
    useEffect(() => {
        pageRef.current = pageName;
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        writeHash(pageName);
    }, [pageName]);
}
