import { defineAppConfig } from '../../vite.config.ts';

// Check for existence of the variables rather than exact string matches
const isVercel = Boolean(process.env.VERCEL);
const basePath = isVercel ? '/' : '/pg_lab/';

export default defineAppConfig({ base: basePath });
