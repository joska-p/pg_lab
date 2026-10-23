# Creative Playground

> A creative coding playground where I experiment with generative art, data viz, and visual toys. Built for fun, documented for collaborators.

by [@jpotin](https://gitlab.com/jpotin)

---

## What is this?

A collection of creative coding experiments, visual explorations, small tools, and notes — some polished, some prototypes, some just abandoned ideas worth keeping around. The common thread is curiosity, not a specific product or stack.

It's a playground, not a product.

---

## Development environment

Development happens inside an Arch Linux [distrobox](https://distrobox.it/)
container named `dev-env`, with a dedicated home at `~/Work/dev/dev_home`.

```sh
distrobox enter dev-env
cd /home/muratha/Work/dev/pg_lab
vp install
vp dev
```

The full setup — host packages, container creation, toolchain, shell config and
gotchas — is documented in
[codex/docs/dev-environment.md](codex/docs/dev-environment.md).
