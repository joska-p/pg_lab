const modules = import.meta.glob('../assets/radu-img/*.svg', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>;

export const raduImgUrlById: Record<number, string> = Object.fromEntries(
    Object.entries(modules).map(([path, url]) => {
        const match = path.match(/\/(\d+)\.svg$/);
        const id = match ? Number(match[1]) : Number.NaN;
        return [id, url];
    }),
);
