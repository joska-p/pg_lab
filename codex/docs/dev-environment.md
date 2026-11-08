# Development Environment — Ubuntu 26.04 dev container

How the `pg_lab` workspace is built, and how to recreate it from scratch.

The environment is a **rootless podman container** described by
[`.devcontainer/`](../.devcontainer/), with a **persistent home** that lives
outside the repository. The host stays clean: only the project and the
dedicated home are bind-mounted into the container.

> Snapshot: 2026-11-08. Versions are informative; the files in `.devcontainer/`
> and `scripts/dev` are the source of truth.

---

## 1. Host

Arch Linux + KDE Plasma (Wayland). Only podman is required on the host:

```sh
sudo pacman -S podman
```

Zed is installed on the host (not in the container):

```sh
curl -f https://zed.dev/install.sh | sh   # ~/.local/bin/zed
```

| Component | Version at snapshot |
| --------- | ------------------- |
| podman    | 6.1.4               |
| Zed       | 1.27.0              |

---

## 2. Container layout

Three paths matter:

| What                      | Host                     | Container            |
| ------------------------- | ------------------------ | -------------------- |
| Repository                | `~/Work/dev/pg_lab`      | `/workspaces/pg_lab` |
| Persistent home (`$HOME`) | `~/Work/dev/pg_lab-home` | `/home/dev`          |
| Host home                 | `/home/muratha`          | **not mounted**      |

Consequences:

- Inside the container `~` is `/home/dev`, the persistent home. It holds
  dotfiles, SSH keys, caches and every toolchain installed by
  `post-create.sh`.
- The repository is at `/workspaces/pg_lab` (the working directory of the
  container). It is the exact same files as on the host, edits are shared.
- Nothing else from the host home is visible. `gh`, SSH and the toolchains use
  the container home only.

The container user is `dev` (uid/gid 1000). Rootless podman runs with
`--userns=keep-id`, so host files owned by uid 1000 appear as `dev` and remain
writable.

The home directory lives on the host disk and **survives** `scripts/dev down`
and image rebuilds. Back it up like any other important directory.

---

## 3. First run

```sh
cd ~/Work/dev/pg_lab
./scripts/dev
```

`scripts/dev` builds the image if needed, starts the container, and runs
`.devcontainer/post-create.sh` on first boot. Provisioning installs Vite+
(node, pnpm, bun, `vp`), Rust, OpenCode and the committed dotfiles. It takes a
few minutes and only happens once per home.

Then finish the credentials inside the container:

```sh
gh auth login                 # token stored in ~/.config/gh, no keyring here
ssh-keygen -t ed25519 -C "jpotin@gmail.com"
gh ssh-key add ~/.ssh/id_ed25519.pub
```

Alternatively copy the keys from the host into `~/Work/dev/pg_lab-home/.ssh/`
before the first run.

To install the browser stack as well (also works on an already provisioned
home):

```sh
PG_LAB_WITH_BROWSER=1 ./scripts/dev up
```

---

## 4. Base image

`.devcontainer/Dockerfile` starts from `ubuntu:26.04` and installs the
day-to-day toolset with apt: git, gh, openssh, sudo, zsh, starship, ripgrep,
fd, bat, eza, jq, tree, build-essential, python3, gh, and the zsh plugins.

Notes:

- Ubuntu ships `batcat` and `fdfind`; the Dockerfile links them to `bat` and
  `fd`.
- **Do not install `chromium` with apt.** On Ubuntu it is a snap wrapper that
  does not work in a container. `agent-browser` downloads its own Chrome build.
- No systemd inside the container.
- No NVIDIA toolkit: GPU is irrelevant for headless browser automation. A
  headed Chrome can use the Intel iGPU through `/dev/dri` if it is added to
  `scripts/dev`.
- Remaining manual steps: `gh auth login` (stores the token in
  `~/.config/gh/hosts.yml`, because there is no session keyring) and SSH keys
  in the persistent home.

---

## 5. Shell and prompt

The container user's shell is zsh. The committed dotfiles are copied to the
persistent home on first boot and can be edited there:

| File                      | Role                                     |
| ------------------------- | ---------------------------------------- |
| `~/.zshenv`               | Vite+ and Cargo environment, every shell |
| `~/.zshrc`                | prompt, plugins, PATH, aliases           |
| `~/.config/starship.toml` | prompt theme (Gruvbox-ish, quiet)        |

`~/.zshenv` sources `~/.config/vite-plus/env` and `~/.cargo/env` when present.
`~/.zshrc` loads the Ubuntu plugin paths:

```zsh
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

Syntax highlighting must be sourced **after** autosuggestions.

Editing the files in `.devcontainer/dotfiles/` does not update an existing
home; copy them manually or reset the home.

---

## 6. JavaScript toolchain — Vite+

Node, pnpm and Bun are **not** installed with apt. Vite+ provides them through
shims in the persistent home:

| Command        | Provided by      |
| -------------- | ---------------- |
| `node`         | Vite+ runtime    |
| `pnpm` / `npm` | Vite+ shims      |
| `bun`          | Vite+ shim       |
| `vp`           | Vite+ global CLI |

Versions are resolved per project from `package.json` (`engines.node`,
`devEngines.packageManager`). Use `vp env use …` to override for the current
shell, `vp toolchain` to inspect what is active.

**Do not `apt install nodejs`.** A system Node shadows or conflicts with the
Vite+ shims. Let Vite+ own the runtime.

Upgrade with `vp upgrade`.

---

## 7. Rust

`post-create.sh` runs rustup with `--no-modify-path`; `~/.cargo/env` is sourced
from `~/.zshenv`. Installs into `~/.cargo` and `~/.rustup`, inside the
persistent home. Used for the occasional native tool, not for the JS projects.

---

## 8. OpenCode

Installed under `~/.opencode/bin` (already on `PATH` via `~/.zshrc`) by the
OpenCode 2 installer. Upgrade with `opencode upgrade`.

---

## 9. Git, GitHub, SSH

The committed `.devcontainer/dotfiles/.gitconfig` sets the identity:

```sh
git config --global user.name "joska"
git config --global user.email "jpotin@gmail.com"
```

`gh auth login` stores credentials in `~/.config/gh/` since the container has no
session keyring. SSH keys live in the persistent home and survive rebuilds.

---

## 10. Browser automation

Optional, installed on demand with `PG_LAB_WITH_BROWSER=1`. It runs
`vp add -g agent-browser@latest` then `agent-browser install --with-deps`; the
Ubuntu target is supported natively, unlike the previous Arch setup.

Browsers are cached in `~/.agent-browser/browsers`, inside the persistent home.
Upgrade with `vp add -g agent-browser@latest`.

Headed Chrome requires Wayland/X11 sockets and `/dev/dri`, which are not wired
by default. Headless usage needs none of that.

---

## 11. Zed on the host

Zed runs on the host and opens `~/Work/dev/pg_lab` directly; the container only
provides the command-line environment. Language servers and formatters are the
ones configured in `.zed/settings.json` and run host-side.

The repository is also a valid Dev Container project. To let Zed open it inside
the container:

1. Add `"use_podman": true` to the host Zed settings (`~/.config/zed/settings.json`).
2. Open the project and accept "Open in Container".

This integration is optional and still under development upstream: configuration
changes require a manual restart, and `forwardPorts` is not supported (the port
is published through `appPort`). The container it creates is separate from the
one managed by `scripts/dev`; use one at a time, since both mount the same home.

---

## 12. Daily use

```sh
cd ~/Work/dev/pg_lab

./scripts/dev            # shell in the container (workspace cwd)
./scripts/dev exec vp check --fix
./scripts/dev status
./scripts/dev down       # home is kept
```

Inside the container:

```sh
vp install
vp dev --host            # --host is required: the port is published by podman
```

The playground app is served under `/pg_lab/`.

Common checks:

```sh
vp check --fix
vp test
vp -C packages/randomart check
```

`scripts/dev` reference:

| Command                  | Effect                                      |
| ------------------------ | ------------------------------------------- |
| `scripts/dev`            | `up` then an interactive zsh                |
| `scripts/dev up`         | build if needed, start, provision if needed |
| `scripts/dev shell`      | same as the default                         |
| `scripts/dev exec CMD…`  | run one command in the workspace            |
| `scripts/dev rebuild`    | recreate image and container (home kept)    |
| `scripts/dev down`       | remove the container (home kept)            |
| `scripts/dev status`     | image, container and mount summary          |
| `scripts/dev reset-home` | **destructive**: delete the persistent home |

`PG_LAB_DEV_HOME` overrides the home location. If you change it, update the
mount in `.devcontainer/devcontainer.json` as well.

---

## 13. Maintenance

```sh
./scripts/dev rebuild    # pick up Dockerfile changes
vp upgrade               # inside the container
rustup update            # inside the container
opencode upgrade         # inside the container
./scripts/dev exec sudo apt-get update
```

The host only needs `podman` and Zed.

---

## 14. Version snapshot

| Tool          | Version                                   |
| ------------- | ----------------------------------------- |
| Ubuntu image  | `ubuntu:26.04` (LTS, 26.04.1 at snapshot) |
| Vite+         | 1.4.0                                     |
| Node.js       | 24.22.1                                   |
| pnpm          | 12.8.1                                    |
| Bun           | 1.4.4                                     |
| Rust          | 1.99.0                                    |
| OpenCode      | 2.1.4                                     |
| agent-browser | 0.38.1 (optional)                         |

---

## Gotchas

- **System Node**: never `apt install nodejs`; Vite+ owns the runtime.
- **Persistent home is precious**: `~/Work/dev/pg_lab-home` contains shell
  config, SSH keys, gh credentials and every toolchain. Back it up.
- **Two sources of container settings**: `scripts/dev` and
  `.devcontainer/devcontainer.json` describe the same container. Update both
  when changing mounts, ports or user flags.
- **`--userns` and the devcontainer CLI**: recent CLI versions inject
  `--userns=keep-id` themselves. If Zed or the CLI rejects a duplicate flag,
  remove `runArgs` from `devcontainer.json`; `scripts/dev` keeps passing it
  explicitly.
- **`vp dev --host`**: without it, Vite listens on loopback inside the
  container and the published port does not reach it.
- **No keyring / systemd**: `gh` uses its config file; services come from
  nowhere, the container is not a session.
- **Dotfiles are copied, not symlinked**: editing `.devcontainer/dotfiles/`
  requires recopying into the home (or `scripts/dev reset-home`).
