#!/usr/bin/env sh
# Validates the fuzz shaders with glslangValidator (no browser, no GPU).
#
# Usage, from packages/randomart:   sh scripts/validate-glsl.sh [dir]
# Requires glslangValidator: `brew install glslang` or `apt install glslang-tools`.
# Add the output directory (default `.shaders`) to .gitignore.
set -eu

DIR="$(pwd)/${1:-.shaders}"

rm -rf "$DIR"
VITE_DUMP_SHADERS="$DIR" vp test dump

fail=0
count=0

for file in "$DIR"/*.frag; do
    [ -e "$file" ] || { echo "No shader was dumped in $DIR" >&2; exit 1; }
    count=$((count + 1))

    if ! glslangValidator -S frag "$file" >"$file.log" 2>&1; then
        echo "FAIL $file"
        cat "$file.log"
        fail=1
    fi
done

echo "Validated $count shaders, status: $fail"
exit "$fail"
