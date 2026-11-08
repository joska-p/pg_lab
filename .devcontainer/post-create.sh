#!/usr/bin/env bash
# Provision the persistent dev home on first boot.
#
# Runs from both the devcontainer CLI (postCreateCommand) and scripts/dev up.
# It is idempotent: the marker at the end short-circuits later runs.
#
# Set PG_LAB_WITH_BROWSER=1 to also install agent-browser and its Chrome build.
set -euo pipefail

MARKER="$HOME/.pg_lab-ready"
DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/dotfiles"

say() { printf '\n==> %s\n' "$*"; }

install_browser() {
    [ -f "$HOME/.pg_lab-browser" ] && return 0
    say "Installing agent-browser"
    . "$HOME/.config/vite-plus/env"
    vp add -g agent-browser@latest
    agent-browser install --with-deps
    touch "$HOME/.pg_lab-browser"
}

if [ -f "$MARKER" ]; then
    say "Dev home already provisioned ($MARKER)"
    [ "${PG_LAB_WITH_BROWSER:-0}" = "1" ] && install_browser
    exit 0
fi

say "Installing Vite+ (node, pnpm, bun, vp)"
installer="$(mktemp)"
curl -fsSL https://vite.plus -o "$installer"
# Answer the "manage Node?" prompt up front: Vite+ owns the runtime here.
VP_NODE_MANAGER=yes bash "$installer"
rm -f "$installer"

# Vite+ writes its environment into the home; load it for the rest of this run.
. "$HOME/.config/vite-plus/env"

say "Installing Rust toolchain"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs |
    sh -s -- -y --no-modify-path

say "Installing OpenCode"
installer="$(mktemp)"
curl -fsSL https://opencode.ai/v2/install -o "$installer"
bash "$installer" --no-modify-path
rm -f "$installer"

if [ "${PG_LAB_WITH_BROWSER:-0}" = "1" ]; then
    install_browser
fi

say "Installing dotfiles"
mkdir -p "$HOME/.config"
cp "$DOTFILES/.zshrc" "$HOME/.zshrc"
cp "$DOTFILES/.zshenv" "$HOME/.zshenv"
cp "$DOTFILES/starship.toml" "$HOME/.config/starship.toml"
cp "$DOTFILES/.gitconfig" "$HOME/.gitconfig"

touch "$MARKER"

say "Provisioning complete"
printf '%s\n' \
    "Remaining manual steps:" \
    "  gh auth login                 # stores the token in ~/.config/gh (no keyring here)" \
    "  ssh-keygen -t ed25519 ...     # or copy ~/.ssh keys from the host"
