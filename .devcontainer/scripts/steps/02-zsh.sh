#!/usr/bin/env bash
# =============================================================================
# steps/02-zsh.sh — Oh My Zsh + Powerlevel10k + plugins + dotfiles
# =============================================================================

step_zsh_setup() {
  log "Setting up Oh My Zsh..."
  if [[ ! -d "$HOME/.oh-my-zsh" ]]; then
    RUNZSH=no CHSH=no KEEP_ZSHRC=yes \
      sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
    ok "Oh My Zsh installed."
  else
    skip "Oh My Zsh already installed."
  fi

  log "Installing Powerlevel10k theme..."
  local p10k_dir="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
  if [[ ! -d "$p10k_dir" ]]; then
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "$p10k_dir"
    ok "Powerlevel10k installed."
  else
    skip "Powerlevel10k already installed."
  fi

  log "Installing zsh plugins..."
  local zsh_custom="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

  if [[ ! -d "$zsh_custom/plugins/zsh-autosuggestions" ]]; then
    git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions \
      "$zsh_custom/plugins/zsh-autosuggestions"
    ok "zsh-autosuggestions installed."
  else
    skip "zsh-autosuggestions already installed."
  fi

  if [[ ! -d "$zsh_custom/plugins/zsh-syntax-highlighting" ]]; then
    git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting \
      "$zsh_custom/plugins/zsh-syntax-highlighting"
    ok "zsh-syntax-highlighting installed."
  else
    skip "zsh-syntax-highlighting already installed."
  fi

  if [[ ! -d "$zsh_custom/plugins/zsh-history-substring-search" ]]; then
    git clone --depth=1 https://github.com/zsh-users/zsh-history-substring-search \
      "$zsh_custom/plugins/zsh-history-substring-search"
    ok "zsh-history-substring-search installed."
  else
    skip "zsh-history-substring-search already installed."
  fi

  log "Copying dotfiles..."
  # .zshrc and .p10k.zsh: back up if they already exist and differ
  for dotfile in .zshrc .p10k.zsh; do
    local src="$DOTFILES_DIR/${dotfile}" dst="$HOME/${dotfile}"
    if [[ -f "$dst" ]] && diff -q "$src" "$dst" &>/dev/null; then
      skip "${dotfile} already up to date."
    elif [[ -f "$dst" ]]; then
      cp "$dst" "${dst}.bak"
      cp "$src" "$dst"
      ok "${dotfile} updated (backup → ${dotfile}.bak)."
    else
      cp "$src" "$dst"
      ok "${dotfile} installed."
    fi
  done
}
