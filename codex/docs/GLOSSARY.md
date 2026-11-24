# PG_LAB

PG_LAB is a personal creative coding workbench. This glossary defines the canonical vocabulary for discussing its concepts so the author and an agent can use the same words without guessing.

## Language

### Workbench

**Workbench**:
The personal creative coding environment: the Shell together with the collection of Experiments available in it. The Workbench is the whole system; the Shell is only the host for one open Experiment.
_Avoid_: framework, project, app

**Scratchpad**:
An area of the Workbench for unpublished trials and dormant ideas. It is not part of the registered Experiment set opened in the published Workbench.
_Avoid_: draft, sandbox, testing ground, brouillon

**Experiment**:
A registered playground entry that can be opened in the shell and contributes a Scene and optional Controls.
_Avoid_: App, project, demo, package, mini-app

**Experiment mark**:
A decorative visual identity for an Experiment on a card. It is not the Scene, and it is not a Visual layer.
_Avoid_: Visual layer, logo, icon, thumbnail, artwork

**Scene**:
The component an Experiment contributes for the Stage.
_Avoid_: Canvas, view, screen, artwork, 3D scene, scene graph

**Controls**:
The component an Experiment contributes for the Panel.
_Avoid_: Settings, config, sidebar, panel, camera controls

**Stage**:
The shell region that hosts the current Experiment's Scene.
_Avoid_: Canvas, viewport, shader stage

**Panel**:
The shell region opposite the Stage that hosts the Experiment's Controls.
_Avoid_: Sidebar, drawer, controls

**Shell**:
The playground host around every Experiment: routing, chrome, Stage and Panel. It owns real time and external I/O.
_Avoid_: App, framework, core shell, workbench

### Rendering

**Surface**:
A backend runtime that owns a canvas context, sizing and the frame loop; it is CPU or GPU.
_Avoid_: Renderer, canvas, style recipe, layer
_Unit_: Layout in CSS px; backing store in device px

**Canvas**:
The viewport element in which a Scene draws, backed by a Surface.
_Avoid_: Stage, surface, frame
_Unit_: Layout and pointer space in CSS px; backing store in device px

**Frame**:
One draw cycle scheduled by a Surface for a given clock value.
_Avoid_: Tick, pass, update, generation
_Range_: The frame index is a nonnegative integer

**Clock**:
The Surface-owned source of animation time and delta.
_Avoid_: Playback store, timer, wall clock
_Unit_: Time and delta in seconds

### Creative concepts

**Seed**:
A trimmed, non-empty string that, with a Grammar, identifies the expression of an Artwork. A random generator derived from a Seed is not the Seed itself.
_Avoid_: Random number, RNG, noise, key
_Range_: 1–64 characters after trimming

**Grammar**:
The weighted operator vocabulary and structure limits used to generate an expression. A preset is a starting point built on a Grammar, not the Grammar itself.
_Avoid_: Preset, config, ruleset, formula
_Range_: weights are integers 0–16; minimum depth at least 1, maximum depth at least the minimum; at least one node; shared depth between 0 and the maximum depth

**Artwork**:
The immutable result of a Grammar, a Seed and a ColorSpace: an expression and its compiled shader. Its identity includes the ColorSpace.
_Avoid_: Image, PNG, Scene, shader, expression

**ColorSpace**:
The compile-time mapping from raw channel triplets to sRGB. It is a mapping, not a set of colors.
_Avoid_: Palette, tint, theme
_Range_: raw channels in `[-1,1]^3`; sRGB output in `[0,1]`

**Visual layer**:
A pluggable drawing rule in a sequence's layer stack. A bare layer may mean an architecture layer.
_Avoid_: Pass, effect, overlay, architecture layer
