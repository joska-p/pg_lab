# @repo/automa

> An interactive cellular automaton — paint life onto a GPU-driven grid, watch it evolve under pluggable rules.

---

## Intention & Concept

`@repo/automa` is the interactive WebGL2 cellular automaton workbench.

State lives entirely on the GPU. The grid is uploaded once as a texture and transformed in-place by GLSL compute shaders running on a ping-pong state buffer, achieving zero-copy rendering directly to the display at 60 FPS.

## Brainstorming, Inspirations & Credits

- **Visual Inspo:** GPGPU cellular automata, Conway's Game of Life, HighLife, Brian's Brain.
- **Math / Papers:** Cellular automata theory (John Conway, Rudy Rucker, Stephen Wolfram totalistic rules).
- **Borrowed Code & Algorithms:** Glaze WebGL2 GPGPU ping-pong buffer patterns and React Three Fiber rendering pipeline.

## Patterns & Gotchas

- **Ping-Pong State Buffers:** The GPGPU simulation ping-pongs two WebGL textures. Brushes and creature stamps write directly into the active state texture between frame steps to ensure smooth interactivity without stalling the simulation loop.

## References

- [Conway's Game of Life - Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
- [Tsoding Conway implementation](https://github.com/tsoding/conway)
