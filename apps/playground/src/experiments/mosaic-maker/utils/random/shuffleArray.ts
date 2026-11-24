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

export { shuffleArray };
