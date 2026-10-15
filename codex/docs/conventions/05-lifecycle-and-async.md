[← Index](README.md)

# 7. Lifecycle

Lifecycle is an ownership problem.

The component or system that creates a live object should have a clear relationship with its lifecycle.

A lifecycle-sensitive operation should have a clearly defined valid context.

Prefer making valid lifecycle transitions explicit rather than relying on undocumented calling order.

For example:

```text
create
  ↓
configure
  ↓
mount
  ↓
start
  ↓
running
  ↓
stop
  ↓
destroy
```

The exact lifecycle may differ by object.

What matters is that invalid transitions are difficult to make accidentally.

---

## 7.1 Proof tokens

When an operation is only valid during a particular lifecycle phase, consider using a **proof token**.

A proof token represents:

> "This call is being made through the intended lifecycle."

For example, a draw operation may require an active-frame token.

Use proof tokens when the additional type constraint prevents a misuse that would otherwise be difficult or expensive to diagnose.

Do not use proof tokens by default.

First make the lifecycle itself clear.

A proof token is useful when the type system can meaningfully reinforce that lifecycle.

It is not useful merely because the type system can express it.

Proof tokens are compile-time design aids, not runtime security mechanisms.

TypeScript cannot prevent:

```ts
someValue as ActiveFrameToken;
```

and a token can still be retained and misused after its intended lifetime.

The purpose is to make the correct path the natural path.

---

# 9. Asynchronous work

Asynchronous work has a lifecycle too.

An async operation should have a clear owner.

When an operation can outlive the object or context that started it, decide explicitly what should happen when that owner disappears.

Possible policies include:

- cancellation;
- ignoring stale results;
- transferring ownership;
- allowing the operation to complete independently.

Do not allow asynchronous work to mutate an object after that object's lifecycle has ended merely because the Promise eventually resolved.

When multiple async operations can race, make the rule for stale results explicit.

For example:

```text
request A starts
    ↓
request B starts
    ↓
B completes
    ↓
A completes later
```

If A is no longer authoritative, its result must not silently overwrite B.

The exact mechanism may be:

- `AbortController`;
- a generation/version number;
- an ownership check;
- another appropriate mechanism.

The architectural rule comes first.

The mechanism comes second.
