export class Clock {
    #time = 0;
    #deltaTime = 0;
    #isPlaying = true;

    get time(): number {
        return this.#time;
    }

    get deltaTime(): number {
        return this.#deltaTime;
    }

    get isPlaying(): boolean {
        return this.#isPlaying;
    }

    play(): this {
        this.#isPlaying = true;
        return this;
    }

    pause(): this {
        this.#isPlaying = false;
        this.#deltaTime = 0;
        return this;
    }

    togglePlay(): this {
        return this.#isPlaying ? this.pause() : this.play();
    }

    reset(): this {
        this.#time = 0;
        this.#deltaTime = 0;
        return this;
    }

    update(delta: number): void {
        if (!this.#isPlaying) {
            this.#deltaTime = 0;
            return;
        }
        this.#deltaTime = delta;
        this.#time += delta;
    }
}
