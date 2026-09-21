import { createClock } from '@repo/glaze/core/Clock';
import { msToSeconds } from '@repo/glaze/core/time';
import type { NonNegativeSeconds, Seconds } from '@repo/glaze/core/time';
import type { StateBuffer } from '@repo/glaze/gpu/StateBuffer';

import { AGE_DECAY_RATE, AGE_GROWTH_RATE, SPEED_DEFAULT_MS } from '../../lib/constants';
import {
    GRID_DEFAULT_COLS,
    GRID_DEFAULT_DENSITY,
    GRID_DEFAULT_ROWS,
    GRID_DEFAULT_SEED,
} from '../config';
import type { Creature } from '../creature/registry';
import { createGrid, seedGrid } from '../grid';
import { rules, type Rule } from '../rules/registry';

export interface SimulationOptions {
    rows?: number;
    cols?: number;
    rule?: Rule;
    density?: number;
    seed?: number;
    speedMs?: number;
    /** Notified whenever the generation counter changes (steps, paints, resets). */
    onGenerationChange?: (generation: number) => void;
}

/** Upper bound per frame tick so a huge delta (tab switch) cannot stall a paint. */
const MAX_STEPS_PER_TICK = 4;

export class SimulationEngine {
    readonly #buffer: StateBuffer;
    readonly #birthBuffer = new Int32Array(9);
    readonly #surviveBuffer = new Int32Array(9);
    readonly #clock = createClock({ autoStart: false });
    readonly #onGenerationChange: ((generation: number) => void) | undefined;

    #rule: Rule;
    #rows: number;
    #cols: number;
    #density: number;
    #seed: number;
    #generation = 0;
    #accumulator = 0;
    /** Generation interval in seconds — deltas arrive in seconds, so the threshold must match. */
    #interval: Seconds;

    constructor(
        buffer: StateBuffer,
        simShaderSource: string,
        paintShaderSource: string,
        options: SimulationOptions = {},
    ) {
        this.#buffer = buffer;
        buffer.addProgram('default', simShaderSource);
        buffer.addProgram('paint', paintShaderSource);

        this.#rows = options.rows ?? GRID_DEFAULT_ROWS;
        this.#cols = options.cols ?? GRID_DEFAULT_COLS;
        this.#rule = options.rule ?? rules.conway;
        this.#density = options.density ?? GRID_DEFAULT_DENSITY;
        this.#seed = options.seed ?? GRID_DEFAULT_SEED;
        this.#interval = msToSeconds(options.speedMs ?? SPEED_DEFAULT_MS);
        this.#onGenerationChange = options.onGenerationChange;

        const grid = createGrid(this.#rows, this.#cols);

        seedGrid(grid, this.#density, this.#seed);
        this.#buffer.init(grid);
    }

    // ── Frame-driven stepping ──

    /** Feed the surface's frame delta (seconds); runs generations while the clock plays. */
    tick(delta: NonNegativeSeconds): void {
        this.#clock.update(delta);

        if (!this.#clock.isPlaying) return;

        this.#accumulator += this.#clock.deltaTime;
        let steps = 0;

        while (this.#accumulator >= this.#interval && steps < MAX_STEPS_PER_TICK) {
            this.step();
            this.#accumulator -= this.#interval;
            steps++;
        }

        if (steps === MAX_STEPS_PER_TICK) this.#accumulator = 0;
    }

    play(): void {
        this.#clock.play();
    }

    pause(): void {
        this.#clock.pause();
        this.#accumulator = 0;
    }

    get running(): boolean {
        return this.#clock.isPlaying;
    }

    setSpeed(ms: number): void {
        this.#interval = msToSeconds(ms);
    }

    setRule(rule: Rule): void {
        this.#rule = rule;
    }

    step(): void {
        this.#gpuStep(this.#rule);
        this.#setGeneration(this.#generation + 1);
    }

    // ── Grid lifecycle ──

    reinit(rows: number, cols: number): void {
        this.#rows = rows;
        this.#cols = cols;
        this.#resetGrid(false);
    }

    clear(): void {
        this.#resetGrid(false);
    }

    randomize(density = this.#density): void {
        this.#density = density;
        this.#resetGrid(true);
    }

    paintCell(col: number, row: number, value: number): void {
        this.#gpuPaint(col, row, value);
        this.#setGeneration(this.#generation + 1);
    }

    placeCreature(col: number, row: number, creature: Creature): void {
        const offsetX = Math.floor(creature.width / 2);
        const offsetY = Math.floor(creature.height / 2);
        let changed = false;

        for (let y = 0; y < creature.height; y++) {
            const rowCells = creature.cells[y];

            for (let x = 0; x < creature.width; x++) {
                const val = rowCells[x];

                if (!val) continue;

                const gx = col - offsetX + x;
                const gy = row - offsetY + y;

                if (gx < 0 || gx >= this.#buffer.width || gy < 0 || gy >= this.#buffer.height)
                    continue;

                this.#gpuPaint(gx, gy, val);
                changed = true;
            }
        }

        if (changed) {
            this.#setGeneration(this.#generation + 1);
        }
    }

    destroy(): void {
        this.pause();
        this.#buffer.destroy();
    }

    // ── Getters ──

    getDisplayTexture(): WebGLTexture {
        return this.#buffer.getTexture();
    }

    get width(): number {
        return this.#buffer.width;
    }

    get height(): number {
        return this.#buffer.height;
    }

    get generation(): number {
        return this.#generation;
    }

    get rule(): Rule {
        return this.#rule;
    }

    // ── Internals ──

    #resetGrid(seed: boolean): void {
        const grid = createGrid(this.#rows, this.#cols);

        if (seed) seedGrid(grid, this.#density, this.#seed);

        if (this.#buffer.width !== this.#cols || this.#buffer.height !== this.#rows) {
            this.#buffer.resize(this.#cols, this.#rows);
        }

        this.#buffer.init(grid);
        this.#setGeneration(0);
    }

    #setGeneration(generation: number): void {
        this.#generation = generation;
        this.#onGenerationChange?.(generation);
    }

    #gpuStep(rule: Rule): void {
        for (let i = 0; i < 9; i++) {
            this.#birthBuffer[i] = rule.birth[i] ? 1 : 0;
            this.#surviveBuffer[i] = rule.survive[i] ? 1 : 0;
        }

        this.#buffer.useProgram('default');
        this.#buffer.setUniforms({
            u_gridSize: [this.#buffer.width, this.#buffer.height],
            u_birth: this.#birthBuffer,
            u_survive: this.#surviveBuffer,
            u_stateCount: rule.stateCount,
            u_ageGrowth: AGE_GROWTH_RATE,
            u_ageDecay: AGE_DECAY_RATE,
        });
        this.#buffer.step();
    }

    #gpuPaint(col: number, row: number, value: number): void {
        this.#buffer.useProgram('paint');
        this.#buffer.setUniforms({
            u_targetCell: [col, row],
            u_value: value,
        });
        this.#buffer.step();
    }
}
