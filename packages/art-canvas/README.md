# @repo/art-canvas

> A drop-bag for shader experiments — a WebGL workshop container where each
> idea lives as its own module, and adding a new one is deliberately easy.

---

## 🎯 Intention & Concept

Art Canvas is a workshop container designed to lower the friction of creating and exploring WebGL shader experiments. Rather than rebuilding boilerplate for every new concept, the container provides a robust interactive canvas, state management pattern, and controls wiring out of the box. Each idea lives as an isolated, self-contained module (such as Seed, Atlas, Folded Space, or Manual), allowing experiments to be dropped in, iterated upon, and explored independently. The container itself is stable, while the modules serve as an evolving playground—with the current architectural push (**Atlas**) exploring Unicode symbols as visual matter rendered via modular-arithmetic shaders.

## 🥷 Brainstorming, Inspirations & Credits

- **Visual Inspirations:** Unicode glyph families (arrows, boxes, arcs, chevrons), procedural shader outputs, cosine color palettes.
- **Math / Papers:** Modular arithmetic, space repetition (`repeatSpace`), procedural seed-to-shader composition.
- **Borrowed Code & Algorithms:** GLSL preamble dependency injection and deduplication (`resolveDeps`), Zustand-powered modular state and control wiring.

## ⚠️ Patterns & Gotchas

- **Self-Contained Modules:** Every module (component, controls, and store) must reside entirely under `src/modules/<name>/`. Modules should remain strictly independent and liftable.
- **Flexible Authoring:** Advanced modules use registry-based GLSL dependency injection (Seed), while lighter modules author shaders inline (Atlas, Manual). Both patterns are valid.
- **Seed Determinism:** The Seed generator guarantees that identical seeds produce identical base shaders; creative variety emerges through mood lenses and user overrides.
- **GLSL Collision Domains:** Module code and shared preamble utilities are injected separately. `resolveDeps` deduplicates the preamble to ensure each utility is declared exactly once. New shared utilities must be registered in the preamble registry and declared in module `deps`.

## 📚 References

- [List of Unicode characters - Unified Canadian Aboriginal Syllabics](https://en.wikipedia.org/wiki/List_of_Unicode_characters#Unified_Canadian_Aboriginal_Syllabics)
