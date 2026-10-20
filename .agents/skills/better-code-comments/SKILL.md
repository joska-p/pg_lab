---
name: better-code-comments
description: Improve code comments by making them accurate, concise, and useful. Use when adding or revising comments in source code.
---

# Better Code Comments

- Explain why the code does something when the reason is not obvious.
- Document non-obvious invariants, constraints, trade-offs, and surprising behavior.
- Do not narrate code that is already clear from names and implementation.
- Keep comments concise, specific, and consistent with the codebase's language and style.
- Verify every comment against the implementation; never guess intent or promise behavior the code does not guarantee.
- Update or remove comments that are stale, redundant, misleading, or contradicted by the code.
- Prefer improving names or simplifying code over adding a comment when that would make the code clearer.
- Do not add educational explanations unless explicitly requested.
