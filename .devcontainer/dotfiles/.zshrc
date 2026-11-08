# Interactive shell for the pg_lab dev container (Ubuntu 26.04).
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000

eval "$(starship init zsh)"

# Syntax highlighting must be sourced after autosuggestions.
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

export PATH="$HOME/.opencode/bin:$HOME/.local/bin:$PATH"

alias ll='eza -l --icons --group-directories-first'
alias la='eza -la --icons --group-directories-first'
alias lt='eza --tree --icons'

alias ..='cd ..'
alias ...='cd ../..'

alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
