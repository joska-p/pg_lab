# PG_LAB

PG_LAB is a personal creative coding playground. This glossary defines the canonical vocabulary for discussing its concepts so the author and an agent can use the same words without guessing.

## Language

Entries are written in English. Discussion may happen in French.

### Playground shell

**Experiment**:
A registered playground entry that can be opened in the shell and contributes a Scene and optional Controls. An Experiment may be backed by a package or be internal to the playground app.
_Avoid_: App, project, demo, package

**Scene**:
The React component an Experiment contributes for the Stage.
_Avoid_: Canvas, view, screen, artwork, 3D scene, scene graph

**Controls**:
The React component an Experiment contributes for the Panel.
_Avoid_: Settings, config, sidebar, panel, camera controls

**Stage**:
The shell region that hosts the current Experiment's Scene.
_Avoid_: Canvas, viewport, shader stage

**Panel**:
The shell region opposite the Stage that hosts the Experiment's Controls.
_Avoid_: Sidebar, drawer, controls

**Shell**:
The playground host around every Experiment: routing, chrome, Stage and Panel. The Shell owns real time and DOM or I/O boundaries. The core/shell architecture rule is a separate convention, not this entity.
_Avoid_: App, framework, core shell

### Rendering

**Surface**:
A backend runtime that owns a canvas context, sizing and the frame loop; it is CPU or GPU.
_Avoid_: Renderer, canvas, style recipe, layer
_Unit_: `width`/`height` in CSS px; `deviceWidth`/`deviceHeight` in device px; `dpr = round(device / css)`

**Canvas**:
The viewport element in which a Scene draws, backed by a Surface.
_Avoid_: Stage, surface, frame
_Unit_: Layout and pointer space in CSS px; backing store in device px

**Frame**:
One draw cycle scheduled by a Surface for a given clock value.
_Avoid_: Tick, pass, update, generation
_Range_: `iFrame` is a nonnegative integer

**Clock**:
The Surface-owned source of animation time and delta.
_Avoid_: Playback store, timer, wall clock
_Unit_: `time`, `deltaTime`, `iTime`, `iTimeDelta` in seconds; raw durations use the `*Ms` suffix

### Creative concepts

**Seed**:
A trimmed, non-empty string that, with a Grammar, identifies the expression of an Artwork. An Rng is the deterministic generator derived from a Seed, not the Seed itself.
_Avoid_: Random number, RNG, noise, key
_Range_: 1–64 characters after trimming

**Grammar**:
The weighted operator vocabulary and structure limits used to generate an expression. A preset pairs a Grammar with a suggested ColorSpace, label and description; it is not the Grammar.
_Avoid_: Preset, config, ruleset, formula
_Range_: weights are integers `0..16`; `minDepth >= 1`; `maxDepth >= minDepth`; `maxNodes >= 1`; `shareDepth` in `[0, maxDepth]`

**Artwork**:
The immutable result of a Grammar, a Seed and a ColorSpace: an expression and its compiled shader. Its identity includes the ColorSpace; changing it yields a different Artwork with the same expression.
_Avoid_: Image, PNG, Scene, shader, expression

**ColorSpace**:
The compile-time mapping from raw channel triplets to sRGB. It is applied after generation, not a set of colors; changing it keeps the expression and recompiles the shader.
_Avoid_: Palette, tint, theme
_Range_: raw channels in `[-1,1]^3`; sRGB output in `[0,1]`

**Visual layer**:
A pluggable drawing rule in a sequence's layer stack. Only the two-word term is canonical; a bare layer may mean an architecture layer.
_Avoid_: Pass, effect, overlay, architecture layer
