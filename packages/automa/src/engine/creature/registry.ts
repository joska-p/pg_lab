import {
    acorn,
    beacon,
    beehive,
    bHeptomino,
    blinker,
    block,
    diehard,
    glider,
    gosperGliderGun,
    loaf,
    lwss,
    mwss,
    pentadecathlon,
    piHeptomino,
    pulsar,
    rPentomino,
    toad,
    pixel,
} from './builtin';

interface Creature {
    readonly id: string;
    readonly name: string;
    readonly width: number;
    readonly height: number;
    readonly cells: number[][];
}

const allCreatures = [
    block,
    beehive,
    loaf,
    blinker,
    toad,
    beacon,
    pulsar,
    pentadecathlon,
    glider,
    lwss,
    mwss,
    rPentomino,
    diehard,
    acorn,
    piHeptomino,
    bHeptomino,
    gosperGliderGun,
    pixel,
] as const satisfies readonly Creature[];

type CreatureId = (typeof allCreatures)[number]['id'];

const creatures = allCreatures.reduce(
    (acc, creature) => {
        acc[creature.id] = creature;

        return acc;
    },
    {} as Record<CreatureId, Creature>,
);

export { allCreatures, creatures };
export type { Creature, CreatureId };
