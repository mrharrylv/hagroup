#!/usr/bin/env bash
# Deletes the bucket objects the new build no longer has.
#
# Compares every key in the bucket with the key list of the build
# (`node plan.mjs dist --keys`, shipped in the artifact as keys.txt) and
# deletes the rest. Run it only after the CloudFront invalidation completed,
# so no edge still serves a page that references an old hashed asset.
#
# Safety: a key list without index.html is refused outright (it is not a
# real build), and index.html is never deleted whatever the list says.
#
# Usage: cleanup.sh <bucket> <keysFile>

set -euo pipefail

usage() {
  echo "usage: cleanup.sh <bucket> <keysFile>" >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
[ -n "$1" ] && [ -n "$2" ] || usage

BUCKET="$1"
KEYS_FILE="$2"
PROTECTED_KEY="index.html"

if [ ! -f "$KEYS_FILE" ]; then
  echo "cleanup: keys file not found: $KEYS_FILE" >&2
  exit 1
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# comm needs both sides in the same byte order.
awk 'NF' "$KEYS_FILE" | LC_ALL=C sort -u > "$WORK_DIR/expected"
if ! grep -qxF "$PROTECTED_KEY" "$WORK_DIR/expected"; then
  echo "cleanup: $KEYS_FILE has no $PROTECTED_KEY, so it is not a real build's key list; refusing to delete anything" >&2
  exit 1
fi

if ! aws s3api list-objects-v2 --bucket "$BUCKET" --query 'Contents[].Key' --output text > "$WORK_DIR/listing"; then
  echo "cleanup: could not list s3://$BUCKET; nothing was deleted" >&2
  exit 1
fi
# Text output: one line per listing page, keys separated by tabs; an empty page prints None.
tr '\t' '\n' < "$WORK_DIR/listing" | awk 'NF && $0 != "None"' | LC_ALL=C sort -u > "$WORK_DIR/actual"

LC_ALL=C comm -23 "$WORK_DIR/actual" "$WORK_DIR/expected" \
  | awk -v protected="$PROTECTED_KEY" '$0 != protected' > "$WORK_DIR/orphans"

ORPHAN_COUNT="$(wc -l < "$WORK_DIR/orphans" | tr -d ' ')"
if [ "$ORPHAN_COUNT" -eq 0 ]; then
  echo "No orphaned files to remove"
  exit 0
fi

echo "Removing $ORPHAN_COUNT orphaned file(s) from s3://$BUCKET ..."
FAILED=0
while IFS= read -r key; do
  if aws s3api delete-object --bucket "$BUCKET" --key "$key" < /dev/null > /dev/null; then
    echo "   deleted $key"
  else
    echo "cleanup: FAILED to delete $key" >&2
    FAILED=$((FAILED + 1))
  fi
done < "$WORK_DIR/orphans"

if [ "$FAILED" -gt 0 ]; then
  echo "cleanup: $FAILED of $ORPHAN_COUNT delete(s) failed" >&2
  exit 1
fi
echo "$ORPHAN_COUNT orphaned file(s) removed"
