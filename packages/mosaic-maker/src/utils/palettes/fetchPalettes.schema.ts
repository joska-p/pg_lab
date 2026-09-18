import { z } from "zod";

const paletteSchema = z.array(z.array(z.string().min(3).max(9).startsWith("#")).min(5)).min(1);

export { paletteSchema };
