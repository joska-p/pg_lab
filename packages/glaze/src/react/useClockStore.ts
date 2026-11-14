import { useSyncExternalStore } from 'react';

import type { PositiveNumber } from '../core/brands';
import { createNullClockStore } from './clockStore';
import type { ClockStore } from './types';

/**
 * Store global partagé par toutes les instances de GpuCanvas / CpuCanvas.
 *
 * Quand un canvas se monte, il enregistre son ClockStore ici. Les composants consommateurs peuvent
 * alors y accéder sans avoir à créer leur propre store Zustand ni à manipuler
 * `useSyncExternalStore` à la main.
 *
 * Par défaut, on utilise le `nullClockStore` : un objet qui répond à la même interface mais ne fait
 * rien. Cela évite à l'appelant de devoir tester "est-ce que le clock existe ?" partout.
 */
const nullClockStore = createNullClockStore();

let currentClockStore: ClockStore = nullClockStore;
const listeners = new Set<() => void>();

/**
 * Enregistre (ou remplace) le ClockStore courant. Appelé en interne par GpuCanvas dès que la
 * surface GPU est prête.
 */
export function setGlobalClockStore(clockStore: ClockStore): void {
    currentClockStore = clockStore;
    listeners.forEach((fn) => fn());
}

/**
 * Hook : retourne le ClockStore actuellement branché.
 *
 * Retourne toujours une valeur valide (le `nullClockStore` tant qu'aucun canvas n'est monté). Le
 * composant ne rerend que quand la référence change.
 */
export function useClockStore(): ClockStore {
    return useSyncExternalStore(
        (onChange) => {
            listeners.add(onChange);
            return () => listeners.delete(onChange);
        },
        () => currentClockStore,
    );
}

/**
 * Hook : contrôle de lecture/pause du clock.
 *
 * Retourne un état `isPlaying` qui se met à jour automatiquement, et des setters pour piloter
 * l'horloge. Le composant ne rerend que quand l'état de lecture change, pas à chaque image.
 *
 * Avant qu'un canvas ne soit monté, les setters ne font rien (nullClockStore).
 */
export function useClockPlayback() {
    const clockStore = useClockStore();

    const isPlaying = useSyncExternalStore(
        (onChange) => clockStore.subscribe(onChange),
        () => clockStore.getIsPlaying(),
    );

    return {
        isPlaying,
        togglePlay: () => clockStore.togglePlay(),
        play: () => clockStore.play(),
        pause: () => clockStore.pause(),
        reset: () => clockStore.reset(),
        setSpeed: (speed: PositiveNumber) => clockStore.setSpeed(speed),
    };
}
