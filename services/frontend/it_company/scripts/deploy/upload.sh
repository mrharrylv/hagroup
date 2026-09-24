#!/usr/bin/env bash
# Uploads a built dist/ to the website bucket, following plan.mjs.
#
#   Phase 1  every non-HTML file (hashed assets, icons, robots, sitemap, llms)
#   Phase 2  the HTML pages, only once phase 1 fully succeeded, so no page is
#            ever live before the hashed assets it references
#
# Each object gets the plan's key, Content-Type and Cache-Control; nothing is
# left to the CLI's mime guessing. Uploads run UPLOAD_PARALLELISM (default 8)
# at a time. Any failed upload fails the script, and a phase 1 failure means
# no HTML is uploaded at all.
#
# Usage: upload.sh <bucket> <distDir>

set -euo pipefail

usage() {
  echo "usage: upload.sh <bucket> <distDir>" >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
[ -n "$1" ] && [ -n "$2" ] || usage

BUCKET="$1"
DIST_DIR="${2%/}"
PARALLELISM="${UPLOAD_PARALLELISM:-8}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -d "$DIST_DIR" ]; then
  echo "upload: dist directory not found: $DIST_DIR" >&2
  exit 1
fi
for tool in aws node xargs awk; do
  command -v "$tool" > /dev/null || { echo "upload: '$tool' is not on PATH" >&2; exit 1; }
done

PLAN_FILE="$(mktemp)"
trap 'rm -f "$PLAN_FILE"' EXIT

if ! node "$SCRIPT_DIR/plan.mjs" "$DIST_DIR" > "$PLAN_FILE"; then
  echo "upload: could not plan the upload; nothing was uploaded" >&2
  exit 1
fi

# One object. Runs in a child bash under xargs, so it re-arms strict mode.
upload_one() {
  set -euo pipefail
  if [ "$#" -ne 4 ]; then
    echo "upload: malformed plan row: $*" >&2
    return 1
  fi
  local file="$1" key="$2" content_type="$3" cache_control="$4"
  if ! aws s3 cp "$DIST_DIR/$file" "s3://$BUCKET/$key" \
    --no-guess-mime-type \
    --content-type "$content_type" \
    --cache-control "$cache_control" \
    --only-show-errors; then
    echo "upload: FAILED $file -> s3://$BUCKET/$key" >&2
    return 1
  fi
}
export -f upload_one
export BUCKET DIST_DIR

# Plan rows of one phase as file, key, contentType, cacheControl.
# want_html=1 selects the html phase, 0 everything else.
phase_rows() {
  awk -F '\t' -v want_html="$1" '
    NF != 5 { print "upload: malformed plan row " NR ": " $0 > "/dev/stderr"; exit 1 }
    (($5 == "html") ? 1 : 0) == want_html + 0 { print $1 "\t" $2 "\t" $3 "\t" $4 }
  ' "$PLAN_FILE"
}

# Called from an `if`, where errexit is off: every failure returns explicitly.
upload_phase() {
  local want_html="$1" count
  count="$(phase_rows "$want_html" | wc -l | tr -d ' ')" || return 1
  PHASE_COUNT="$count"
  [ "$count" -gt 0 ] || return 0
  phase_rows "$want_html" \
    | tr '\t\n' '\0\0' \
    | xargs -0 -n 4 -P "$PARALLELISM" bash -c 'upload_one "$@"' upload_one \
    || return 1
}

echo "Phase 1: uploading non-HTML files to s3://$BUCKET ..."
if ! upload_phase 0; then
  echo "upload: phase 1 failed; no HTML was uploaded, the live pages are unchanged" >&2
  exit 1
fi
echo "Phase 1: $PHASE_COUNT non-HTML file(s) uploaded"

echo "Phase 2: uploading HTML pages to s3://$BUCKET ..."
if ! upload_phase 1; then
  echo "upload: phase 2 failed; some pages may still be the previous version" >&2
  exit 1
fi
echo "Phase 2: $PHASE_COUNT HTML page(s) uploaded"
