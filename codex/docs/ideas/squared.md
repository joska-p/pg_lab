# Squared rectangle

## Idea

Turn a convex 3D polyhedron (or a 3-connected planar graph) into a perfect squared rectangle. The
pipeline goes from the polyhedron's dual graph to a Kirchhoff linear system, then to a Smith
diagram whose currents and voltage drops become the widths and heights of a rectangular tiling.

## Visual intent

Show the 3D mesh next to its 2D dissection: selecting a face or edge highlights the matching
rectangle, and moving the source/sink poles morphs the tiling live. A second direction skips the
3D view and uses the pipeline as a procedural art engine — hash-driven graphs rendered as
Mondrian/Bauhaus compositions with palette and shader variations. A third direction treats the
same tiling as an automatic UI layout engine.

## Why it was kept

The idea sits at a rich intersection of graph theory, electrical networks, and generative layout.
It offers both a strong pedagogical visual and a plausible rendering backend for other
Experiments, so discarding it would lose a reusable mathematical building block.

## What to revisit

- Pick one of the three directions before writing code; the demo, the art engine and the layout
  engine have very different control surfaces.
- Implement the Laplacian solve and the Smith diagram IR (`LayoutIR`), including numeric
  tolerance for nearly equal potentials.
- Decide the rendering target: SVG for crisp export, or Canvas2D/GLSL for animation.
- See the original package README in git history for the full derivation and references
  (Brooks–Smith–Stone–Tutte 1940, Steinitz, Tutte).
