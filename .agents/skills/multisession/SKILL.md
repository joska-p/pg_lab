---
name: multisession
description: Prepare large tasks for work across multiple sessions. Create minimal persistent context so a new session can quickly understand the goal, current state, and most useful next action without reconstructing the previous conversation.
---

# Multisession Work

Use this skill when a task is large enough to span multiple sessions.

The goal is to make restarting cheap, not to preserve the previous session.

## Persistent context

Create one short entry-point file containing:

- the overall goal;
- the current state;
- the most useful next action.

Keep it minimal. The repository is the source of truth.

Create additional files only when they provide useful persistent context that does not belong in the entry point.

Do not create documentation merely to preserve session history. Git already provides history.

## Planning

Before starting, understand the task well enough to divide it into reasonable sessions.

The plan should describe intent and milestones, not detailed implementation instructions.

The plan is guidance, not a contract. Adapt it whenever the actual state of the project suggests a better direction.

A session may reorder, merge, split, replace, or abandon planned work.

## Starting a session

Read the entry-point file first.

Then inspect the repository and other documentation as needed for the current task.

Do not read unrelated planning, historical, or session files just because they exist.

Treat persistent context as a navigation aid, not as a substitute for inspecting the actual project state.

## Working

Work normally within the current session.

Preserve only information that is likely to matter to a future session.

Prefer existing source code, documentation, Git history, and other repository state over duplicating information into planning files.

Do not claim work is complete without appropriate verification.

Do not run tests or other validation merely because this skill requires it. Validate when it provides useful evidence for the current task.

## Ending a session

Before stopping, update the entry-point file so that another session can continue without reconstructing the conversation.

Record important decisions or discoveries only when they are likely to matter later.

Leave the repository in the state that the normal project workflow expects.

The goal is not to preserve the session.

The goal is to make the next session start cleanly.
