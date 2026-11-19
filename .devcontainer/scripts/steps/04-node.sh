step_node_setup() {
  # --- fnm ------------------------------------------------------------------
  log "Installing fnm..."
  export FNM_DIR="$HOME/.local/share/fnm"
  if [[ ! -x "$FNM_DIR/fnm" ]]; then
    curl -fsSL https://fnm.vercel.app/install | bash -s -- \
      --install-dir "$FNM_DIR" \
      --skip-shell
    ok "fnm installed."
  else
    skip "fnm already installed."
  fi

  export PATH="$FNM_DIR:$PATH"
  eval "$(fnm env --shell bash)"

  # --- Node LTS -------------------------------------------------------------
  log "Installing Node.js LTS..."
  fnm install --lts
  fnm default lts-latest
  fnm use default
  ok "Node $(node --version) installed and set as default."

  # --- pnpm via corepack ----------------------------------------------------
  log "Enabling corepack + pnpm..."
  export PNPM_HOME="$HOME/.local/share/pnpm"
  mkdir -p "$PNPM_HOME/bin"
  export PATH="$PNPM_HOME/bin:$PNPM_HOME:$PATH"

  corepack enable
  corepack prepare pnpm@latest --activate

  # Persist PNPM & FNM PATHs to shell rc files for interactive shells
  for rc in "$HOME/.zshrc" "$HOME/.bashrc"; do
    if [[ -f "$rc" ]] && ! grep -q "PNPM_HOME" "$rc"; then
      echo -e '\n# pnpm & fnm' >> "$rc"
      echo 'export FNM_DIR="$HOME/.local/share/fnm"' >> "$rc"
      echo 'export PATH="$FNM_DIR:$PATH"' >> "$rc"
      echo 'eval "$(fnm env)"' >> "$rc"
      echo 'export PNPM_HOME="$HOME/.local/share/pnpm"' >> "$rc"
      echo 'export PATH="$PNPM_HOME/bin:$PATH"' >> "$rc"
    fi
  done

  ok "pnpm $(pnpm --version) ready."

  # --- Zed LSP tools --------------------------------------------------------
  log "Installing language servers for Zed..."

  # Tailwind CSS v4 language server
  pnpm add -g @tailwindcss/language-server

  # TypeScript language server
  pnpm add -g typescript

  ok "Language servers installed."
}
