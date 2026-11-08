# Creative Playground

> A creative coding playground where I experiment with generative art, data viz, and visual toys. Built for fun, documented for collaborators.

by [@jpotin](https://gitlab.com/jpotin)

---

## What is this?

A collection of creative coding experiments, visual explorations, small tools, and notes — some polished, some prototypes, some just abandoned ideas worth keeping around. The common thread is curiosity, not a specific product or stack.

It's a playground, not a product.

---

## Development environment

Development happens inside an Ubuntu 26.04 [dev
container](https://containers.dev/) managed by `scripts/dev`, with a dedicated
persistent home at `~/Work/dev/pg_lab-home`.

```sh
cd ~/Work/dev/pg_lab
./scripts/dev            # shell in the container

vp install
vp dev --host            # the dev server is published through podman
```

The full setup — manifest files, host packages, toolchain, shell config and
gotchas — is documented in
[codex/docs/dev-environment.md](codex/docs/dev-environment.md).
