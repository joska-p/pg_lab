import { useEffect, useRef } from 'react';

import { EXPERIMENTS } from '../experiments';
import type { ExperimentKey } from '../experiments';
import { setExperimentKey, useExperimentKey } from '../stores/appStore';

const EXPERIMENT_IDS: ReadonlySet<string> = new Set(Object.keys(EXPERIMENTS));

function readHash(): ExperimentKey {
    const id = window.location.hash.replace(/^#\/?/, '');
    if (id !== '' && EXPERIMENT_IDS.has(id)) {
        return id as ExperimentKey;
    }
    return 'home';
}

function writeHash(page: ExperimentKey): void {
    const wanted = page === 'home' ? '' : `#/${page}`;
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
    const experimentKey = useExperimentKey();
    const experimentRef = useRef(experimentKey);
    const mountedRef = useRef(false);

    // Initial URL wins over the default store state.
    useEffect(() => {
        const id = readHash();
        if (id === 'home') {
            if (window.location.hash !== '') {
                clearHash();
            }
            return;
        }
        experimentRef.current = id;
        setExperimentKey(id);
    }, []);

    // Browser chrome (back/forward/manual edit) drives the store.
    useEffect(() => {
        const onHashChange = () => {
            const id = readHash();
            if (id === 'home' && window.location.hash !== '') {
                clearHash();
            }
            if (id !== experimentRef.current) {
                experimentRef.current = id;
                setExperimentKey(id);
            }
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, []);

    // In-app navigation drives the URL.
    useEffect(() => {
        experimentRef.current = experimentKey;
        if (!mountedRef.current) {
            mountedRef.current = true;
            return;
        }
        writeHash(experimentKey);
    }, [experimentKey]);
}
