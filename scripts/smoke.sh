#!/usr/bin/env bash
set -euo pipefail

npm run build

LOG_FILE="${TMPDIR:-/tmp}/ethnomusicology-workbench-smoke.log"
rm -rf .tmp/pages
mkdir -p .tmp/pages
cp -R docs .tmp/pages/ethnomusicology-workbench

npx http-server .tmp/pages -a 127.0.0.1 -p 4173 -c-1 --silent >"${LOG_FILE}" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "${SERVER_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:4173/ethnomusicology-workbench/" >/dev/null; then
    READY=1
    break
  fi
  sleep 0.25
done

if [[ "${READY:-0}" != "1" ]]; then
  printf "%s\n" "Static preview did not become ready. Log:"
  cat "${LOG_FILE}"
  exit 1
fi

PLAYWRIGHT_BASE_URL="http://127.0.0.1:4173/ethnomusicology-workbench/" npx playwright test
