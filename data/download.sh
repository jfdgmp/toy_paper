#!/usr/bin/env bash
# Fetch the Stack Overflow Annual Developer Survey results CSV.
#
# Data license:
#   - Database structure: Open Database License (ODbL) 1.0
#   - Cell contents:      Database Contents License (DbCL) 1.0
# Attribution: Stack Overflow Annual Developer Survey.
# Source: https://github.com/StackExchange/Survey
#
# We do NOT commit the CSV to git. See .gitignore.

set -euo pipefail

HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$HERE"

# Default to the most recent year known at the time of writing.
# Override on the command line: `bash download.sh 2024`
YEAR="${1:-2025}"

URL="https://github.com/StackExchange/Survey/raw/refs/heads/main/packages/archive/${YEAR}/results.csv"
OUT="results.csv"

echo "Downloading Stack Overflow Developer Survey ${YEAR} results..."
echo "  from: ${URL}"
echo "  to:   ${HERE}/${OUT}"

if command -v curl >/dev/null 2>&1; then
  curl -fSL --progress-bar "$URL" -o "$OUT"
elif command -v wget >/dev/null 2>&1; then
  wget --show-progress -O "$OUT" "$URL"
else
  echo "Neither curl nor wget is installed. Install one of them, or download the CSV manually:" >&2
  echo "  ${URL}" >&2
  exit 1
fi

bytes=$(wc -c < "$OUT" | tr -d ' ')
echo "Done. ${OUT} is ${bytes} bytes."
echo
echo "Quick sanity check (first two rows):"
head -2 "$OUT" | cut -c1-200
echo
echo "Note: if the file came back tiny (a few hundred bytes), the YEAR may not exist yet."
echo "List available years at: https://github.com/StackExchange/Survey/tree/main/packages/archive"
