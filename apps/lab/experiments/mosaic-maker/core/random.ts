/*
 * Small randomness helpers shared by tile generation and control actions.
 * No state is kept here: every call is independent and testable.
 */

function getRandom<T>(array: readonly T[]): T {
    const item = array[Math.floor(Math.random() * array.length)];

    if (item === undefined) {
        throw new Error('Cannot get random item from empty array');
    }

    return item;
}

function shuffleArray<T extends readonly unknown[]>(array: T): [...T] {
    const result = [...array] as [...T];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        const temp = result[i];

        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}

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

export { getRandom, shuffleArray, shuffleObject };
