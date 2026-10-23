# Development Environment — Arch Linux distrobox

How the `pg_lab` workspace is built, and how to recreate it from scratch after a
clean install.

The goal is a **disposable container** with a **persistent home**, so the host
system stays clean and the toolchain can be rebuilt without touching the host
dotfiles.

> Snapshot: 2026-10-23. Versions are informative; the commands are the source of
> truth.

---

## 1. Host

Arch Linux + KDE Plasma (Wayland). Only a few packages are needed on the host:

```sh
sudo pacman -S podman distrobox
```

Also installed on the host (not in the container):

```sh
# Zed editor — installs to ~/.local/bin/zed and ~/.local/zed.app
curl -f https://zed.dev/install.sh | sh
```

`~/.local/bin` must be on `PATH`.

| Component | Version at snapshot           |
| --------- | ----------------------------- |
| distrobox | 1.8.2.5 (compatibility layer) |
| podman    | host package                  |
| Zed       | host install                  |

---

## 2. Create the container

```sh
distrobox create --name dev-env --image archlinux:latest --home ~/Work/dev/dev_home
distrobox enter dev-env
```

Why `--home`:

- `~/Work/dev/dev_home` becomes the container `$HOME`, separate from the host
  home. Dotfiles and caches do not collide.
- The directory lives on the host disk, so it **survives `distrobox rm`**.
  Only remove it manually if you really want a blank environment.
- The host home is still bind-mounted inside the container, at both
  `/home/<user>` and `/run/host/home/<user>` (same directory). Host repos are
  therefore at `/home/<user>/Work/dev/`, **not** under `~`: inside the
  container `~` is `dev_home`.

Do **not** delete the container and the home directory at the same time unless
you intend to rebuild everything.

### Paths inside the container

| What                   | Path                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Container home (`$HOME`, `~`) | `/home/<user>/Work/dev/dev_home` — dotfiles, caches, SSH keys |
| Host home              | `/home/<user>` and `/run/host/home/<user>` (same directory)       |
| Project                | `/home/<user>/Work/dev/pg_lab`                                    |

Consequences:

- `cd ~/Work/dev/pg_lab` **does not work**: `~` is `dev_home`, so it expands to
  `dev_home/Work/dev/pg_lab`, which does not exist.
- Use `/home/<user>/Work/dev/pg_lab` (short) or
  `/run/host/home/<user>/Work/dev/pg_lab` (the form OpenCode sessions often
  report). They are the same files.
- `~/.zshrc`, `~/.config/`, `~/.ssh/` are container-specific. The host keeps its
  own dotfiles in `/home/<user>/`.

---

## 3. Base packages

Inside the container:

```sh
sudo pacman -Syu
```

Then the day-to-day toolset:

```sh
sudo pacman -S --needed \
  git github-cli openssh sudo less man-db man-pages \
  zsh zsh-completions zsh-autosuggestions zsh-syntax-highlighting starship \
  ripgrep fd bat eza jq tree bc time words pigz unzip zip 7zip rsync \
  uv ffmpeg imagemagick graphviz chromium \
  ttf-jetbrains-mono-nerd ttf-liberation \
  inetutils mtr traceroute tcpdump lsof \
  glibc-locales
```

Notes:

- `chromium` pulls the GTK/X/audio dependencies it needs (gtk3, mesa, nss, …).
  GPU acceleration additionally needs `mesa vulkan-intel vulkan-radeon`
  depending on the hardware.
- `base` is in the Arch image. `base-devel` is **not** installed (no `gcc`,
  `make`): add it only if something needs to compile native code.
- No AUR helper inside the container. Keep AUR packages on the host.
- `-lic` locales: `glibc-locales` provides them; the host locale environment
  (`LANG`, `LC_*`) is forwarded by distrobox.

---

## 4. Shell and prompt

```sh
chsh -s /usr/bin/zsh
```

Minimal `~/.zshrc` content (the rest is aliases):

```zsh
eval "$(starship init zsh)"

source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Vite+ shims (node, npm, pnpm, bun)
. "$HOME/.config/vite-plus/env"

export PATH="$HOME/.opencode/bin:$HOME/.local/bin:$PATH"

export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME/bin:$PATH"

alias ll='eza -l --icons --group-directories-first'
alias la='eza -la --icons --group-directories-first'
alias lt='eza --tree --icons'
```

Zsh plugin order matters: syntax highlighting must be sourced **after**
autosuggestions.

The prompt theme lives in `~/.config/starship.toml` (Gruvbox-ish, quiet). It is
not reproduced here — back it up with the rest of `dev_home`.

> The `dev` alias (`alias dev="distrobox enter dev-env"`) belongs to the
> **host** `~/.zshrc`. `distrobox` is not installed inside the container.

---

## 5. JavaScript toolchain — Vite+

Node, pnpm and Bun are **not** installed with pacman. Vite+ provides them
through shims:

```sh
curl -fsSL https://vite.plus | bash
exec zsh
vp --version
```

The installer appends `. "$HOME/.config/vite-plus/env"` to the shell rc and puts
its shims first in `PATH`:

| Command        | Provided by      |
| -------------- | ---------------- |
| `node`         | Vite+ runtime    |
| `pnpm` / `npm` | Vite+ shims      |
| `bun`          | Vite+ shim       |
| `vp`           | Vite+ global CLI |

Versions are resolved per project from `package.json` (`engines.node`,
`devEngines.packageManager`). Use `vp env use …` to override for the current
shell, `vp toolchain` to inspect what is active.

**Do not `pacman -S nodejs`.** A system Node shadows or conflicts with the Vite+
shims; this was tried and reverted. Let Vite+ own the runtime.

Upgrade:

```sh
vp upgrade
```

---

## 6. Rust

```sh
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Installs into `~/.cargo` and `~/.rustup`; `~/.cargo/env` is sourced from the
shell rc. Used for the occasional native tool, not for the JS projects.

---

## 7. OpenCode

```sh
curl -fsSL https://opencode.ai/install | bash
opencode --version
```

Installs under `~/.opencode/bin` (already on `PATH` via `.zshrc`). Upgrade with
`opencode upgrade`.

---

## 8. Git, GitHub, SSH

```sh
git config --global user.name "joska"
git config --global user.email "jpotin@gmail.com"

gh auth login          # GitHub.com, SSH protocol, credentials in keyring
ssh-keygen -t ed25519 -C "jpotin@gmail.com"
gh ssh-key add ~/.ssh/id_ed25519.pub
```

`gh` uses the host keyring through the forwarded session bus. If keyring access
fails, check that the desktop session is unlocked before `gh auth login`.

---

## 9. Browser automation

Installed globally through Vite+ (not bundled with it):

```sh
vp add -g agent-browser@0.38.1
agent-browser install          # downloads its Chrome build
agent-browser open https://example.com
```

Browsers are cached in `~/.agent-browser/browsers`. The system `chromium`
package covers the X/GTK/runtime libraries it needs and is kept as a manual
fallback; `agent-browser install --with-deps` targets Debian/Ubuntu and is not
useful on Arch. GUI apps work because distrobox forwards the Wayland/X11 and
audio sockets from the host session.

Upgrade the global package with `vp add -g agent-browser@latest`.

---

## 10. Daily use

```sh
# On the host
dev                              # alias → distrobox enter dev-env

# Inside the container
cd /home/muratha/Work/dev/pg_lab
vp install
vp dev
```

`dev` only exists on the host. Inside the container it would call nothing:
`distrobox` is not installed there, and the container is already the target.
Use `exit` to come back to the host.

Common checks:

```sh
vp check --fix
vp test
vp -C packages/randomart check
```

Maintenance:

```sh
sudo pacman -Syu
vp upgrade
rustup update
opencode upgrade
```

---

## 11. Version snapshot

| Tool          | Version                                              |
| ------------- | ---------------------------------------------------- |
| Arch image    | `archlinux:latest` (rolling, 2026.09.20 at snapshot) |
| Vite+         | 1.4.0                                                |
| Node.js       | 24.22.1                                              |
| pnpm          | 12.8.1                                               |
| Bun           | 1.4.4                                                |
| Rust          | 1.99.0                                               |
| uv            | 0.13.1                                               |
| gh            | 2.102.0                                              |
| Chromium      | 154.0.8037.97                                        |
| OpenCode      | 2.1.4                                                |
| agent-browser | 0.38.1                                               |

---

## Gotchas

- **System Node**: do not install `nodejs` from pacman; Vite+ owns the runtime.
- **`dev_home` is precious**: it contains shell config, Vite+/pnpm caches, gh
  credentials and SSH keys. Keep it on the host and back it up.
- **Host home path**: inside the container the same files appear under
  `/home/<user>` and `/run/host/home/<user>`. Both work; use one consistently.
- **No systemd inside the container**: services (keyring, audio) come from the
  host session, not from the container.
