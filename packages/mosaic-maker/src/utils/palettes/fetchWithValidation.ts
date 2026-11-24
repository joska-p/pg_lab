import type { z } from 'zod';

async function fetchWithValidation<TData>(url: string, schema: z.ZodType<TData>): Promise<TData> {
    const response = await fetch(url);

    return schema.parse(await response.json());
}

export { fetchWithValidation };
