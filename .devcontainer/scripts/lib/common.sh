#!/usr/bin/env bash
# =============================================================================
# lib/common.sh — shared helpers for all setup steps
# =============================================================================

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../dotfiles" && pwd)"

# Gruvbox-ish palette
GREEN='\033[38;5;142m'
BLUE='\033[38;5;109m'
YELLOW='\033[38;5;214m'
RED='\033[38;5;167m'
FG='\033[38;5;223m'
MUTED='\033[38;5;245m'
NC='\033[0m'

log()   { echo -e "${BLUE}▶${NC}  $*"; }
ok()    { echo -e "${GREEN}✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
error() { echo -e "${RED}✗${NC}  $*" >&2; exit 1; }
skip()  { echo -e "${MUTED}–${NC}  $*"; }

# Confirm we're running as boffin — exit early before any step functions run
require_vscode_user() {
  if [ "$(whoami)" != "vscode" ]; then
    error "This script must be run as vscode, not $(whoami)."
  fi
}

# Print the post-setup quick-reference banner
print_ready_banner() {
  local cols inner_width
  cols="$(tput cols 2>/dev/null || echo 80)"
  [[ "$cols" =~ ^[0-9]+$ ]] || cols=80
  [ "$cols" -lt 60  ] && cols=60
  [ "$cols" -gt 120 ] && cols=120
  inner_width=$((cols - 2))

  local border title=" vscode lab is ready " pad
  border="$(printf '%*s' "$inner_width" '' | tr ' ' '─')"
  pad="$(printf '%*s' "$((inner_width - ${#title}))" '')"

  echo ""
  echo -e "${MUTED}┌${border}┐${NC}"
  echo -e "${MUTED}│${NC}${GREEN}${title}${NC}${pad}${MUTED}│${NC}"
  echo -e "${MUTED}└${border}┘${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo -e "  ${FG}1.${NC} ${BLUE}exec zsh${NC}                              — switch to your configured shell"
  echo -e "  ${FG}2.${NC} ${BLUE}git config --global user.name 'You'${NC}  — set git identity"
  echo -e "  ${FG}3.${NC} ${BLUE}git config --global user.email 'you@'${NC}"
  echo -e "  ${FG}4.${NC} ${BLUE}nano ~/.env.local${NC}                     — add API tokens"
  echo ""
  echo -e "${YELLOW}SSH key sources (choose one):${NC}"
  echo -e "  ${BLUE}GITLAB_USER=you bash .devcontainer/scripts/setup.sh ssh${NC}"
  echo -e "  ${BLUE}SSH_PUBLIC_KEY_FILE=~/.ssh/id_ed25519.pub bash .devcontainer/scripts/setup.sh ssh${NC}"
  echo -e "  ${BLUE}SSH_PUBLIC_KEY=\"\$(cat ~/.ssh/id_ed25519.pub)\" bash .devcontainer/scripts/setup.sh ssh${NC}"
  echo ""
  echo -e "${YELLOW}Run any step again anytime:${NC}"
  echo -e "  ${BLUE}bash .devcontainer/scripts/setup.sh ssh,node,quality${NC}"
  echo ""
  echo -e "${MUTED}Tip: secrets go in ~/.env.local — gitignored, sourced automatically by .zshrc${NC}"
}
