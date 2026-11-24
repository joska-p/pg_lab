import type { SequenceRule } from './rules/types';

export interface GenerateSequenceOptions {
    sequenceRule: SequenceRule;
    steps: number;
    seed?: string;
}

function generateSequence({ sequenceRule, steps, seed }: GenerateSequenceOptions): number[] {
    const sequence: number[] = [0];
    const seen = new Set([0]);
    let current = 0;
    const safeSteps = sequenceRule.maxSteps === 0 ? steps : Math.min(steps, sequenceRule.maxSteps);

    for (let i = 1; i < safeSteps; i++) {
        current = sequenceRule.getNext({
            index: i,
            current,
            sequence,
            seen,
            ...(seed && { seed }),
        });
        sequence.push(current);
        seen.add(current);
    }

    return sequence;
}

export { generateSequence };
