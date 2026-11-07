import { z } from 'zod';

const paletteSchema = z.array(z.array(z.string().min(3).max(9).startsWith('#')).min(5)).min(1);

const paletteObjectSchema = z
    .object({
        id: z.string(),
        '--color-0': z.string(),
        '--color-1': z.string(),
        '--color-2': z.string(),
        '--color-3': z.string(),
        '--color-4': z.string(),
    })
    .catchall(z.string());

const cachedPalettesSchema = z.object({
    palettes: z.array(paletteObjectSchema),
    expiration: z.number(),
    version: z.number(),
});

export { cachedPalettesSchema, paletteSchema };
