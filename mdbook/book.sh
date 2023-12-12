#!/usr/bin/env bash
set -euo pipefail
cd $(dirname ${BASH_SOURCE[0]})

echo -e "Preview of the generated SUMMARY.md:\n"
cat src/SUMMARY.md

rm -rf ./book/
mdbook build --dest-dir ./book/
