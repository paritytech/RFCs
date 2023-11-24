#/usr/bin/env bash
set -euo pipefail
cd $(dirname ${BASH_SOURCE[0]})

mkdir -p src/{approved,proposed}
cat SUMMARY_preface.md > src/SUMMARY.md

cp ../text/*.md src/approved/

append_rfc_to_summary () {
  local file="$1"
  local title=$(head -n 1 $file) # Grab the title from the contents of the file
  local title=${title#\# } # Remove the "#: " prefix
  local path=${file#./src/} # Relative path, without the src prefix (format required by mdbook)
  echo "- [$title]($path)" >> src/SUMMARY.md;
}

for f in ./src/approved/*.md;
do
  append_rfc_to_summary "$f"
done

echo -e "\n---\n\n# Proposed\n\n" >> src/SUMMARY.md

for f in ./src/proposed/*.md;
do
  [ -e "$f" ] || break
  append_rfc_to_summary "$f"
done

cat SUMMARY_postface.md >> src/SUMMARY.md

echo "Preview of the generated SUMMARY.md:\n"
cat src/SUMMARY.md

rm -rf ../book/
mdbook build --dest-dir ../book/
