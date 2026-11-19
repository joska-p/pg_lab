#!/usr/bin/env bash
# =============================================================================
# steps/00-system.sh — System updates & essential AI agent CLI tools
# =============================================================================

step_system_setup() {
  log "Updating package lists and upgrading system packages..."
  sudo apt-get update -y
  sudo apt-get upgrade -y

  log "Installing essential CLI & exploration tools for AI agent..."
  # - ripgrep (rg) & fd-find (fd): ultra-fast text and file searching
  # - jq: fast JSON parsing and transformation
  # - tree: project structure visualization
  # - fzf: fuzzy filtering
  # - bat: cat clone with syntax highlighting
  # - htop, curl, wget, procps: essential sysadmin tools
  sudo apt-get install -y \
    iputils-ping \
    ripgrep \
    fd-find \
    jq \
    tree \
    fzf \
    bat \
    htop \
    curl \
    wget \
    procps \
    gh \
    build-essential

  # --- Deb-specific binary aliases -------------------------------------------
  # On Debian/Ubuntu, `fd` is packaged as `fdfind` and `bat` as `batcat`.
  # We create symlinks so the standard `fd` and `bat` commands work for the agent.
  mkdir -p "$HOME/.local/bin"

  if command -v fdfind &>/dev/null && [[ ! -f "$HOME/.local/bin/fd" ]]; then
    ln -s "$(which fdfind)" "$HOME/.local/bin/fd"
    ok "Symlink created: fd -> fdfind"
  fi

  if command -v batcat &>/dev/null && [[ ! -f "$HOME/.local/bin/bat" ]]; then
    ln -s "$(which batcat)" "$HOME/.local/bin/bat"
    ok "Symlink created: bat -> batcat"
  fi

  ok "System update & CLI tools ready."
}