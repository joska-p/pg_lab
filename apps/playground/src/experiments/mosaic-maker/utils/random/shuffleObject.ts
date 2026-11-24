import { shuffleArray } from './shuffleArray';

function shuffleObject<Value>(object: Record<string, Value>): Record<string, Value> {
    const keys = Object.keys(object);
    const values = Object.values(object);
    const shuffledValues = shuffleArray(values);
    const shuffled: Record<string, Value> = {};

    shuffledValues.forEach((value, index) => {
        const key = keys[index];

        if (key !== undefined) {
            shuffled[key] = value;
        }
    });

    return shuffled;
}

export { shuffleObject };
