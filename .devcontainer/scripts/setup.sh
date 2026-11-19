#!/usr/bin/env bash
# =============================================================================
# setup.sh — boffin lab environment bootstrap
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=scripts/lib/common.sh
source "$SCRIPT_DIR/lib/common.sh"

# Guard early — before any step functions are sourced or called
require_vscode_user

# Source steps
source "$SCRIPT_DIR/steps/00-system.sh"
source "$SCRIPT_DIR/steps/01-ssh.sh"
source "$SCRIPT_DIR/steps/02-zsh.sh"
source "$SCRIPT_DIR/steps/03-python.sh"
source "$SCRIPT_DIR/steps/04-node.sh"
source "$SCRIPT_DIR/steps/05-git.sh"
source "$SCRIPT_DIR/steps/06-quality.sh"

REQUEST="${1:-all}"
REQUEST="${REQUEST// /}"   # strip any accidental spaces

run_step() {
  local key="$1" fn="$2"
  if [[ "$REQUEST" == "all" || ",$REQUEST," == *",$key,"* ]]; then
    echo ""
    log "━━━ step: ${key} ━━━"
    "$fn"
  fi
}

run_step "system"  step_system_setup # <--- NOUVEAU
run_step "ssh"     step_ssh_setup
run_step "zsh"     step_zsh_setup
run_step "python"  step_python_setup
#run_step "node"    step_node_setup
run_step "git"     step_git_setup
run_step "quality" step_quality_setup

print_ready_banner
