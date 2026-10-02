# Relentless interview to stress-test a plan, decision, or idea.

The interview runs relentlessly until shared understanding exists, mapped as a **design tree**: every decision branches into the decisions hanging off it.

The tree moves in **rounds**. The **frontier** is every decision whose prerequisites are settled: questions answerable now, without guessing at unheard answers. One round covers the whole frontier, each question numbered with a recommended answer attached. Answers arrive before the next round opens.

Each question:

```
❓ **Q1** - **<question title>**: <body, might include choices>

➡️ <your recommended answer>
```

Each round reshapes the tree: settled decisions push the frontier outward, the next round recomputes, and a question depending on an open answer waits for a later round.

Facts are the interviewer's job. A frontier question needing an environmental fact dispatches a sub-agent; anything lookable stays away from the user. Its arrival blocks only downstream questions; the rest of the round proceeds. Decisions belong to the user: each goes to them, and the wait is part of the method.

Completion is an empty frontier: every branch visited, nothing silently assumed. Action starts at the user's confirmation of shared understanding.
