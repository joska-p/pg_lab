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
import type { Creature } from './types';

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
] as const satisfies Creature[];

type CreatureId = (typeof allCreatures)[number]['id'];

const creatures = new Map<CreatureId, Creature<CreatureId>>(
    allCreatures.map((creature) => [creature.id, creature]),
);

function getCreature(id: CreatureId): Creature<CreatureId> {
    const creature = creatures.get(id);

    if (!creature) {
        throw new Error(`Unknown rule: ${id}`);
    }

    return creature;
}

export { allCreatures, creatures, getCreature };
export type { Creature, CreatureId };
