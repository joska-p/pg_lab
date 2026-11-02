#!/usr/bin/env bash
# kanban.sh — CLI pour le GitHub Project "Le Bazar Créatif".
# Capture d'idées rapide : les cartes arrivent déjà dans la bonne colonne.
#
# Usage:
#   ./scripts/kanban.sh add "TITLE" [-s STATUS] [-p PRIORITY] [-e EFFORT] [-b BODY]
#   ./scripts/kanban.sh idea "TITLE"            # raccourci: Backlog / Low
#   ./scripts/kanban.sh wip "TITLE"             # raccourci: In Progress / High
#   ./scripts/kanban.sh list
#   ./scripts/kanban.sh status <ITEM_ID> <STATUS>
#   ./scripts/kanban.sh priority <ITEM_ID> <PRIORITY>
#   ./scripts/kanban.sh effort <ITEM_ID> <EFFORT>
#   ./scripts/kanban.sh delete <ITEM_ID>
#   ./scripts/kanban.sh board                   # ouvre le board dans le navigateur
#   ./scripts/kanban.sh queue                   # liste la file d'attente
#   ./scripts/kanban.sh drain                   # vide la file (lent, respecte GitHub)
#
# STATUS:   Backlog | Todo | In Progress | Done
# PRIORITY: Low | Medium | High | Urgent
# EFFORT:   1 | 2 | 3 | 5 | 8
#
# File d'attente: en cas de rate limit GitHub, les opérations échouées sont
# mises en file (scripts/kanban.queue) au lieu de bloquer. `drain` les rejoue
# avec une cadence lente (KANBAN_DELAY, défaut 15 s) et vérifie le quota
# GraphQL avant chaque opération.

set -euo pipefail

OWNER="joska-p"
PROJECT_NUMBER=1
DEFAULT_STATUS="Backlog"
DEFAULT_PRIORITY="Medium"

VALID_STATUS="Backlog|Todo|In Progress|Done"
VALID_PRIORITY="Low|Medium|High|Urgent"
VALID_EFFORT="1|2|3|5|8"

# File d'attente persistante + cadence du drain (modifiable via env).
QUEUE_FILE="${KANBAN_QUEUE:-$(dirname "$0")/kanban.queue}"
QUEUE_DELAY="${KANBAN_DELAY:-15}"

die() {
  echo "❌ $*" >&2
  exit 1
}

PROJECT_ID=""
FIELDS_JSON=""
GH_FAIL_FILE="${TMPDIR:-/tmp}/kanban_gh_fail.txt"

# Exécute gh en capturant stderr. En cas d'échec, `GH_FAIL_FILE` contient le message
# d'erreur (souvent "GraphQL: API rate limit exceeded") et la fonction renvoie 1.
gh_call() {
  local out errfile
  errfile="$(mktemp)"
  if out="$(gh "$@" 2>"$errfile")"; then
    rm -f "$errfile"
    rm -f "$GH_FAIL_FILE"
    printf '%s' "$out"
  else
    cat "$errfile" > "$GH_FAIL_FILE"
    rm -f "$errfile"
    return 1
  fi
}

is_rate_limited() {
  [[ -f "$GH_FAIL_FILE" ]] && grep -qiE "rate limit|unknown owner type" "$GH_FAIL_FILE"
}

# Résolution paresseuse + cache : un seul appel réseau par ressource par invocation.
project_id() {
  if [[ -z "$PROJECT_ID" ]]; then
    PROJECT_ID="$(gh_call project view "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq .id)" || return 2
  fi
  printf '%s' "$PROJECT_ID"
}

fields_json() {
  if [[ -z "$FIELDS_JSON" ]]; then
    FIELDS_JSON="$(gh_call project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)" || return 1
  fi
  printf '%s' "$FIELDS_JSON"
}

# Ajoute une opération en file d'attente pour `drain`. $1 = champ, $2 = item, $3 = valeur.
enqueue() {
  printf '%s\t%s\t%s\n' "$1" "$2" "$3" >> "$QUEUE_FILE"
  echo "⏳ Rate limit — en file d'attente: $1 $2 → $3 (kanban.sh drain pour rejouer)"
}

# True si le quota GraphQL est suffisant pour une opération.
ensure_quota() {
  local remaining
  remaining="$(gh api rate_limit --jq '.resources.graphql.remaining' 2>/dev/null)"
  [[ -n "$remaining" ]] && (( remaining > 50 ))
}

field_id() {
  fields_json | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id'
}

option_id() {
  fields_json | jq -r --arg f "$1" --arg o "$2" \
    '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id'
}

set_field() { # $1 item_id, $2 field name, $3 option name
  local item="$1" fname="$2" oname="$3" pid fid oid expected
  pid="$(project_id)" || return 1
  fields_json >/dev/null || return 2
  fid="$(field_id "$fname")"
  if [[ -z "$fid" ]]; then
    if is_rate_limited; then return 2; fi
    die "Champ '$fname' introuvable sur le projet."
  fi
  oid="$(option_id "$fname" "$oname")"
  if [[ -z "$oid" ]]; then
    if is_rate_limited; then return 2; fi
    case "$fname" in
      Status) expected="$VALID_STATUS" ;;
      Priority) expected="$VALID_PRIORITY" ;;
      Effort) expected="$VALID_EFFORT" ;;
      *) expected="?" ;;
    esac
    die "Option '$oname' inconnue pour '$fname' (attendu: $expected)."
  fi
  gh_call project item-edit --id "$item" --project-id "$pid" \
    --field-id "$fid" --single-select-option-id "$oid" >/dev/null || return 2
}

create_item() { # $1 title, $2 body
  local title="$1" body="${2:-}"
  if [[ -n "$body" ]]; then
    gh_call project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --title "$title" --body "$body" --format json --jq .id || return 1
  else
    gh_call project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --title "$title" --format json --jq .id || return 1
  fi
}

cmd_add() {
  [[ $# -ge 1 ]] || die "Usage: kanban.sh add \"TITLE\" [-s STATUS] [-p PRIORITY] [-e EFFORT] [-b BODY]"
  local title="$1"
  shift
  local status="$DEFAULT_STATUS" priority="$DEFAULT_PRIORITY" effort="" body=""
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -s | --status) status="$2"; shift 2 ;;
      -p | --priority) priority="$2"; shift 2 ;;
      -e | --effort) effort="$2"; shift 2 ;;
      -b | --body) body="$2"; shift 2 ;;
      *) die "Option inconnue: $1" ;;
    esac
  done
  [[ "$status" =~ ^($VALID_STATUS)$ ]] || die "Statut invalide: '$status' (attendu: $VALID_STATUS)."
  [[ "$priority" =~ ^($VALID_PRIORITY)$ ]] || die "Priorité invalide: '$priority' (attendu: $VALID_PRIORITY)."
  [[ -z "$effort" || "$effort" =~ ^($VALID_EFFORT)$ ]] || die "Effort invalide: '$effort' (attendu: $VALID_EFFORT)."

  local item
  item="$(create_item "$title" "$body")" || true
  if [[ -z "$item" ]]; then
    if is_rate_limited; then
      local args="-s $status -p $priority"
      [[ -n "$effort" ]] && args="$args -e $effort"
      [[ -n "$body" ]] && args="$args -b \"$body\""
      enqueue ADD "$title" "$args"
      return 0
    fi
    echo "❌ Échec de la création de la carte." >&2
    return 1
  fi
  local pending=""
  set_field "$item" Status "$status" || {
    if is_rate_limited; then enqueue Status "$item" "$status"; pending=", status en file"; else return 1; fi
  }
  set_field "$item" Priority "$priority" || {
    if is_rate_limited; then enqueue Priority "$item" "$priority"; pending="$pending, priorité en file"; else return 1; fi
  }
  if [[ -n "$effort" ]]; then
    set_field "$item" Effort "$effort" || {
      if is_rate_limited; then enqueue Effort "$item" "$effort"; pending="$pending, effort en file"; else return 1; fi
    }
  fi
  echo "✅ Carte ajoutée: $title ($status / $priority${effort:+ / $effort})${pending}"
}

cmd_list() {
  gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --jq '
    ["STATUS", "PRIORITY", "EFFORT", "TITLE", "ID"],
    (.items[] | [(.status // "—"), (.priority // "—"), (.effort // "—"), .title, .id])
  | @tsv'
}

cmd_set_status() {
  [[ $# -eq 2 ]] || die "Usage: kanban.sh status <ITEM_ID> <STATUS>"
  [[ "$2" =~ ^($VALID_STATUS)$ ]] || die "Statut invalide: '$2' (attendu: $VALID_STATUS)."
  set_field "$1" Status "$2" || {
    if is_rate_limited; then enqueue Status "$1" "$2"; return 0; fi
    return 1
  }
  echo "✅ Statut mis à jour: $2"
}

cmd_set_priority() {
  [[ $# -eq 2 ]] || die "Usage: kanban.sh priority <ITEM_ID> <PRIORITY>"
  [[ "$2" =~ ^($VALID_PRIORITY)$ ]] || die "Priorité invalide: '$2' (attendu: $VALID_PRIORITY)."
  set_field "$1" Priority "$2" || {
    if is_rate_limited; then enqueue Priority "$1" "$2"; return 0; fi
    return 1
  }
  echo "✅ Priorité mise à jour: $2"
}

cmd_set_effort() {
  [[ $# -eq 2 ]] || die "Usage: kanban.sh effort <ITEM_ID> <EFFORT>"
  [[ "$2" =~ ^($VALID_EFFORT)$ ]] || die "Effort invalide: '$2' (attendu: $VALID_EFFORT)."
  set_field "$1" Effort "$2" || {
    if is_rate_limited; then enqueue Effort "$1" "$2"; return 0; fi
    return 1
  }
  echo "✅ Effort mis à jour: $2"
}

cmd_delete() {
  [[ $# -eq 1 ]] || die "Usage: kanban.sh delete <ITEM_ID>"
  gh project item-delete "$PROJECT_NUMBER" --owner "$OWNER" --id "$1"
  echo "🗑️  Carte supprimée."
}

cmd_board() {
  gh project view "$PROJECT_NUMBER" --owner "$OWNER" --web
}

cmd_queue() {
  if [[ ! -f "$QUEUE_FILE" ]] || [[ ! -s "$QUEUE_FILE" ]]; then
    echo "✅ File vide."
    return 0
  fi
  cat "$QUEUE_FILE"
}

cmd_enqueue() {
  [[ $# -eq 3 ]] || die "Usage: kanban.sh enqueue <FIELD> <ITEM_ID> <VALUE>  (FIELD: Status|Priority|Effort)"
  local field="$1" item="$2" value="$3"
  case "$field" in
    Status) [[ "$value" =~ ^($VALID_STATUS)$ ]] || die "Statut invalide: '$value' (attendu: $VALID_STATUS)." ;;
    Priority) [[ "$value" =~ ^($VALID_PRIORITY)$ ]] || die "Priorité invalide: '$value' (attendu: $VALID_PRIORITY)." ;;
    Effort) [[ "$value" =~ ^($VALID_EFFORT)$ ]] || die "Effort invalide: '$value' (attendu: $VALID_EFFORT)." ;;
    *) die "Champ inconnu: '$field' (Status|Priority|Effort)." ;;
  esac
  enqueue "$field" "$item" "$value"
}

cmd_drain() {
  if [[ ! -f "$QUEUE_FILE" ]] || [[ ! -s "$QUEUE_FILE" ]]; then
    echo "✅ File vide."
    return 0
  fi
  local -a lines
  mapfile -t lines < "$QUEUE_FILE"
  local tmp i j field item value
  tmp="$QUEUE_FILE.tmp"
  : > "$tmp"
  for (( i = 0; i < ${#lines[@]}; i++ )); do
    field=""; item=""; value=""
    IFS=$'\t' read -r field item value <<< "${lines[$i]}"
    [[ -n "$field" ]] || continue
    echo "▶️  $field $item → $value"
    if ! ensure_quota; then
      echo "⏸️  Quota GraphQL faible — lignes restantes conservées, relancez plus tard (kanban.sh drain)."
      for (( j = i; j < ${#lines[@]}; j++ )); do printf '%s\n' "${lines[$j]}" >> "$tmp"; done
      mv "$tmp" "$QUEUE_FILE"
      return 0
    fi
    sleep "$QUEUE_DELAY"
    local success=0
    if [[ "$field" == "ADD" ]]; then
      # Rejouer cmd_add "item" value
      eval "cmd_add \"\$item\" $value" && success=1 || success=0
    else
      set_field "$item" "$field" "$value" && success=1 || success=0
    fi

    if (( success == 1 )); then
      echo "✅ $field exécuté: $item"
    else
      if is_rate_limited; then
        echo "⏸️  Rate limit — arrêt du drain, lignes restantes conservées."
      else
        echo "❌ Échec de $field (voir erreur ci-dessus) — ligne conservée."
      fi
      for (( j = i; j < ${#lines[@]}; j++ )); do printf '%s\n' "${lines[$j]}" >> "$tmp"; done
      mv "$tmp" "$QUEUE_FILE"
      return 0
    fi
  done
  mv "$tmp" "$QUEUE_FILE"
}

case "${1:-}" in
  add) shift; cmd_add "$@" ;;
  idea) shift; cmd_add "$1" -s Backlog -p Low ;;
  wip) shift; cmd_add "$1" -s "In Progress" -p High ;;
  list) cmd_list ;;
  status) shift; cmd_set_status "$@" ;;
  priority) shift; cmd_set_priority "$@" ;;
  effort) shift; cmd_set_effort "$@" ;;
  delete) shift; cmd_delete "$@" ;;
  board) cmd_board ;;
  queue) cmd_queue ;;
  enqueue) shift; cmd_enqueue "$@" ;;
  drain) cmd_drain ;;
  *)
    cat <<EOF
Usage: ./scripts/kanban.sh <commande> [args]

  add "TITLE" [-s STATUS] [-p PRIORITY] [-e EFFORT] [-b BODY]   Crée une carte (Backlog/Medium par défaut)
  idea "TITLE"                                      Raccourci: Backlog + Low
  wip "TITLE"                                       Raccourci: In Progress + High
  list                                              Liste les cartes
  status <ITEM_ID> <STATUS>                         Backlog | Todo | In Progress | Done
  priority <ITEM_ID> <PRIORITY>                     Low | Medium | High | Urgent
  effort <ITEM_ID> <EFFORT>                         1 | 2 | 3 | 5 | 8
  delete <ITEM_ID>                                  Supprime une carte
  board                                             Ouvre le board dans le navigateur
  queue                                             Liste la file d'attente (rate limit)
  enqueue <FIELD> <ITEM_ID> <VALUE>                 Ajoute une opération à la file
  drain                                             Rejoue la file (lent, respectueux: 15s/op)
EOF
    ;;
esac
