#!/usr/bin/env bash
# =============================================================================
# steps/03-python.sh — pyenv + uv + Python CLI tools
# =============================================================================

step_python_setup() {
  # --- pyenv ----------------------------------------------------------------
  log "Installing pyenv..."
  if [[ ! -d "$HOME/.pyenv" ]]; then
    curl -fsSL https://pyenv.run | bash
    ok "pyenv installed."
  else
    skip "pyenv already installed."
  fi

  export PYENV_ROOT="$HOME/.pyenv"
  export PATH="$PYENV_ROOT/bin:$PATH"
  eval "$(pyenv init -)"

  # --- uv -------------------------------------------------------------------
  log "Installing uv..."
  if ! command -v uv &>/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:$PATH"
    ok "uv $(uv --version) installed."
  else
    skip "uv already installed: $(uv --version)"
  fi

  # --- Global Python CLI tools via uv --------------------------------------
  log "Installing global Python tools via uv..."
  local tools=(ruff ipython jupyterlab httpie graphifyy)
  for tool in "${tools[@]}"; do
    if uv tool list 2>/dev/null | grep -q "^${tool} "; then
      skip "${tool} already installed."
    else
      if uv tool install "$tool"; then
        ok "${tool} installed."
      else
        warn "${tool} install failed — skipping."
      fi
    fi
  done

  # --- ~/.env.local scaffold -----------------------------------------------
  if [[ ! -f "$HOME/.env.local" ]]; then
    cat > "$HOME/.env.local" << 'EOF'
# ~/.env.local — NEVER commit this file.
# Sourced automatically by .zshrc on every shell start.
#
# export GITLAB_TOKEN=glpat-xxxxxxxxxxxx
# export VERCEL_TOKEN=xxxxxxxxxxxx
# export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
# export OPENAI_API_KEY=sk-xxxxxxxxxxxx
EOF
    chmod 600 "$HOME/.env.local"
    ok "~/.env.local scaffold created."
  else
    skip "~/.env.local already exists."
  fi
}
