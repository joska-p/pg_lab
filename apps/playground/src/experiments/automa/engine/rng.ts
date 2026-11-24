const createSeededRandom = (seed: number): (() => number) => {
    let s = seed | 0;

    return () => {
        s = (s ^ (s >>> 16)) | 0;
        s = Math.imul(s, 0x45d9f3b) | 0;
        s = (s ^ (s >>> 16)) | 0;
        s = Math.imul(s, 0x27d4eb2d) | 0;
        s = (s ^ (s >>> 16)) | 0;

        return (s >>> 0) / 4294967296;
    };
};

export { createSeededRandom };
