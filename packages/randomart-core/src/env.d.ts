interface ImportMetaEnv {
    readonly VITE_MEASURE?: string;
    readonly VITE_FUZZ_COUNT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
