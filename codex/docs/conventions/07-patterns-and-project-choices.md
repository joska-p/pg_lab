[← Index](README.md)

# 11. Patterns

Patterns are tools, not rules.

Use a pattern when it solves a problem already present in the code.

Do not introduce a pattern merely because the problem resembles an example from another project.

Useful patterns in this codebase include:

- branded types for established invariants (§1.1);
- external-store subscriptions for mutable live objects (§4);
- proof tokens for meaningful lifecycle constraints (§7.1);
- explicit shells around deterministic cores (§1.2).

Patterns may be removed when the problem they solved disappears.

A pattern should not acquire authority merely because it already exists.

---

# 12. Current project choices

These are current decisions, not general principles.

They may change when the application's requirements change.

## 12.1 Zustand

Zustand is used for:

- shared UI state;
- reachability of live objects.

This avoids introducing separate mechanisms for application state and module-level object access.

Zustand is an implementation choice.

The underlying architectural principles are:

- explicit ownership;
- explicit reachability;
- appropriate reactivity;
- minimal duplication.

---

## 12.2 No server-data layer

There is currently no server-data requirement.

Do not introduce TanStack Query or another request/response state layer until the application actually has external server data that benefits from it.

Revisit this decision when that requirement appears.

---

## 12.3 Package static assets consumed as libraries

A package imported as a library (e.g. `apps/playground` lazy-imports `@repo/<pkg>/App` source) must not serve its own static files via `public/` + absolute `fetch()` paths.

Vite never merges a guest's `public/` into the host's `public/`, and absolute paths ignore the host's `base`.

Use Vite-resolved assets co-located with the code instead:

- Store files under `src/assets/<domain>/` in the owning package.
- Resolve them with a lazy `import.meta.glob` + `?url` map keyed by filename; `fetch()` the resolved URL.
- Never keep a `baseUrl` / absolute-path fallback alongside it: one pattern only.

```ts
const sdfUrlModules = import.meta.glob('../assets/molecules/*.sdf', {
    query: '?url',
    import: 'default',
}) as Record<string, () => Promise<string>>;

const sdfUrlByFile = new Map<string, () => Promise<string>>(
    Object.entries(sdfUrlModules).map(([path, loader]) => [path.split('/').pop() ?? path, loader]),
);

export async function loadMolecule(entry: MoleculeEntry): Promise<Molecule> {
    const loader = sdfUrlByFile.get(entry.file);
    if (!loader) throw new Error(`unknown asset ${entry.file}`);
    const res = await fetch(await loader());
    if (!res.ok) throw new Error(`could not load ${entry.file} (${res.status})`);
    return parseAndValidate(await res.text(), entry.file);
}
```

Why: Vite hashes/emits the files, rewrites URLs with the consumer's `base` automatically, keeps per-file lazy fetch (small files may inline as `data:` URLs, larger ones emit separate files — both fetchable), and works unchanged in package standalone `dev`, host `dev`, and host `build`.

---

## 12.4 React Compiler

The React Compiler is enabled in every package (`reactCompilerPreset()` in the
package `vite.config.ts`).

Do not write `useMemo`, `useCallback`, or `React.memo` by hand. The compiler
memoizes derived values and stabilizes callbacks automatically; manual memo hooks
add noise and can conflict with what the compiler already does.

Keep components following the Rules of React so the compiler can do its job.
