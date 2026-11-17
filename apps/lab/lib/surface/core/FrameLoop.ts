type FrameSubscriber = () => void;
type FrameStep = (time: number, delta: number) => void;

const defaultNow = (): number => performance.now();

const defaultSchedule = (callback: (time: number) => void): (() => void) => {
    const rafId = requestAnimationFrame(callback);
    return () => {
        cancelAnimationFrame(rafId);
    };
};

/**
 * RAF loop that starts on the first subscriber and stops when the last one leaves. An idle surface
 * never keeps ticking.
 */
export class FrameLoop {
    readonly #step: FrameStep;
    readonly #now: () => number;
    readonly #schedule: (callback: (time: number) => void) => () => void;
    readonly #subscribers = new Set<FrameSubscriber>();
    #cancelScheduled: (() => void) | null = null;
    #running = false;
    #lastTime = 0;

    constructor(
        step: FrameStep,
        options: {
            now?: () => number;
            schedule?: (callback: (time: number) => void) => () => void;
        } = {},
    ) {
        this.#step = step;
        this.#now = options.now ?? defaultNow;
        this.#schedule = options.schedule ?? defaultSchedule;
    }

    get isRunning(): boolean {
        return this.#running;
    }

    subscribe(callback: FrameSubscriber): () => void {
        this.#subscribers.add(callback);
        this.#start();

        return () => {
            this.#subscribers.delete(callback);

            if (this.#subscribers.size === 0) {
                this.#stop();
            }
        };
    }

    /**
     * Runs every subscriber once over a snapshot taken at entry: subscribing mid-frame joins at the
     * next frame, unsubscribing skips at the next frame — never mid-pass.
     */
    runFrameSubscribers(): void {
        const frameSubscribers = new Set(this.#subscribers);

        for (const callback of frameSubscribers) {
            callback();
        }
    }

    dispose(): void {
        this.#stop();
        this.#subscribers.clear();
    }

    #start(): void {
        if (this.#running) {
            return;
        }

        this.#running = true;
        this.#lastTime = this.#now();
        this.#tick(this.#lastTime);
    }

    #stop(): void {
        this.#running = false;
        this.#cancelScheduled?.();
        this.#cancelScheduled = null;
    }

    /**
     * Schedule-before-dispatch: the next frame is re-linked before any callback runs, so a throwing
     * callback can never kill the animation chain.
     */
    #tick = (rafTime: number): void => {
        if (!this.#running) {
            return;
        }

        // Convert ms to seconds
        const timeSec = rafTime / 1000;
        const delta = Math.max(timeSec - this.#lastTime, 0);

        this.#lastTime = timeSec;

        // Keep-alive first: re-link before any callback runs.
        this.#cancelScheduled = this.#schedule(this.#tick);

        this.#step(timeSec, delta);
    };
}
