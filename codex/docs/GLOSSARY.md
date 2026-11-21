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
