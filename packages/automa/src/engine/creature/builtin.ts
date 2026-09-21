import type { Creature } from "./registry";

const pixel = {
  id: "pixel",
  name: "Pixel",
  width: 1,
  height: 1,
  cells: [[1]],
} as const satisfies Creature;

const block = {
  id: "block",
  name: "Block",
  width: 2,
  height: 2,
  cells: [
    [1, 1],
    [1, 1],
  ],
} as const satisfies Creature;

const beehive = {
  id: "beehive",
  name: "Beehive",
  width: 4,
  height: 3,
  cells: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
} as const satisfies Creature;

const loaf = {
  id: "loaf",
  name: "Loaf",
  width: 4,
  height: 4,
  cells: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
  ],
} as const satisfies Creature;

// ── Oscillators ──────────────────────────────────────────
const blinker = {
  id: "blinker",
  name: "Blinker",
  width: 3,
  height: 1,
  cells: [[1, 1, 1]],
} as const satisfies Creature;

const toad = {
  id: "toad",
  name: "Toad",
  width: 4,
  height: 2,
  cells: [
    [0, 1, 1, 1],
    [1, 1, 1, 0],
  ],
} as const satisfies Creature;

const beacon = {
  id: "beacon",
  name: "Beacon",
  width: 4,
  height: 4,
  cells: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1],
  ],
} as const satisfies Creature;

// Period-3, beautiful symmetric oscillator
const pulsar = {
  id: "pulsar",
  name: "Pulsar",
  width: 13,
  height: 13,
  cells: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  ],
} as const satisfies Creature;

// Period-15 — oscillates through 15 distinct phases
const pentadecathlon = {
  id: "pentadecathlon",
  name: "Pentadecathlon",
  width: 3,
  height: 10,
  cells: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
  ],
} as const satisfies Creature;

// ── Spaceships ───────────────────────────────────────────
// Travels diagonally across the grid
const glider = {
  id: "glider",
  name: "Glider",
  width: 3,
  height: 3,
  cells: [
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
  ],
} as const satisfies Creature;

// Travels horizontally, period 4
const lwss = {
  id: "lwss",
  name: "LWSS",
  width: 5,
  height: 4,
  cells: [
    [0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
  ],
} as const satisfies Creature;

// Medium-weight spaceship — wider body, same period as LWSS
const mwss = {
  id: "mwss",
  name: "MWSS",
  width: 6,
  height: 5,
  cells: [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1],
  ],
} as const satisfies Creature;

// ── Methuselahs ──────────────────────────────────────────
// 5 cells → stabilizes after 1103 generations
const rPentomino = {
  id: "r-pentomino",
  name: "R-pentomino",
  width: 3,
  height: 3,
  cells: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ],
} as const satisfies Creature;

// 7 cells → dies completely after exactly 130 generations
const diehard = {
  id: "diehard",
  name: "Diehard",
  width: 8,
  height: 3,
  cells: [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1],
  ],
} as const satisfies Creature;

// 7 cells → explodes into ~633 cells after 5206 generations
const acorn = {
  id: "acorn",
  name: "Acorn",
  width: 7,
  height: 3,
  cells: [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1],
  ],
} as const satisfies Creature;

// 7 cells → stabilizes after 173 generations
const piHeptomino = {
  id: "pi-heptomino",
  name: "Pi-heptomino",
  width: 3,
  height: 3,
  cells: [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
} as const satisfies Creature;

// 7 cells → stabilizes after 243 generations
const bHeptomino = {
  id: "b-heptomino",
  name: "B-heptomino",
  width: 3,
  height: 4,
  cells: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
} as const satisfies Creature;

// ── Infinite growth ──────────────────────────────────────
// The first pattern discovered that grows without bound.
// Every 30 generations it fires a new glider — population grows forever.
const gosperGliderGun = {
  id: "gosper-glider-gun",
  name: "Gosper Glider Gun",
  width: 36,
  height: 9,
  cells: [
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
    [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
    ],
  ],
} as const satisfies Creature;

export {
  pixel,
  acorn,
  beacon,
  beehive,
  bHeptomino,
  // Oscillators
  blinker,
  // Still lifes
  block,
  diehard,
  // Spaceships
  glider,
  // Infinite growth
  gosperGliderGun,
  loaf,
  lwss,
  mwss,
  pentadecathlon,
  piHeptomino,
  pulsar,
  // Methuselahs
  rPentomino,
  toad,
};
