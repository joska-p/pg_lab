# Session prompt — understand the colour conversion pipeline

> Goal: understand **why** the pipeline is
> `x, y ∈ [-1,1] → tree → r, g, b ∈ [-1,1] → colour conversion → screen`,
> i.e. why we pass through a colour-space conversion at all.
> Working language for the session: French for discussion, English for code
> and docs.

Context first, in `codex/notes/randomart-time-in-xy.md` (read it before
starting). The relevant code lives in `packages/randomart/src/core/color/`
and `packages/randomart/src/core/compiler/` (`compile.ts`, `preamble.ts`).

The questions to answer, with concrete code/GLSL examples from this
codebase (not generic theory dumps):

1. The tree outputs values in `[-1, 1]` per channel. Why `[-1, 1]` and not
   `[0, 1]` from the start? What does the symmetric range buy us (sign,
   `select`/`gt` operators, gradients)?
2. What exactly does the colour-space function do to the triplet? Compare
   `srgb` (a "plain remap") with `oklch`: what is mapped, what is preserved,
   why does OKLCH give "flatter, more even colour" (see the preset
   descriptions in `presets.ts`)?
3. Why is the conversion done **once at the end of `main()`** on the
   `(r, g, b)` triplet, rather than per-operator or per-branch? What would
   break if an operator mixed spaces mid-tree?
4. Where does `[0, 1]` end and the screen's 8-bit `[0, 255]` begin? What is
   the role of the framebuffer / `o_color` here?
5. What is a "colour space" in this codebase concretely: one GLSL function in
   the preamble (`buildPreamble` + `COLOR_SPACES`)? How does
   `colorSpaceFunction` pick it, and what happens on import of an artwork
   that names a space this build doesn't know?

Deliverable: a new section appended to `codex/notes/randomart-time-in-xy.md`
(or a sibling note `codex/notes/randomart-colour-pipeline.md`) that a future
session can read cold. No code changes.

Do not fix the failing tests in this session (see "Known-broken state" in the
note) — stay focused on understanding and documenting.
