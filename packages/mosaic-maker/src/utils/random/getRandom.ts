function getRandom<T>(array: T[]): T {
    const item = array[Math.floor(Math.random() * array.length)];

    if (item === undefined) {
        throw new Error('Cannot get random item from empty array');
    }

    return item;
}

export { getRandom };
