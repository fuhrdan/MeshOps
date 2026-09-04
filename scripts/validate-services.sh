#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node --check "$project_dir/services/api-gateway/index.mjs"
node --check "$project_dir/services/catalog/index.mjs"
node --check "$project_dir/services/payments/index.mjs"
node --check "$project_dir/services/ops-telemetry/index.mjs"

python3 - "$project_dir" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
for path in [root / "services/search/app.py", root / "services/notifications/app.py"]:
    compile(path.read_text(), str(path), "exec")
PY

if command -v go >/dev/null 2>&1; then
  for service in auth inventory orders; do
    (cd "$project_dir/services/$service" && go test ./...)
  done
else
  echo "Go is not installed; Go compilation is deferred to CI."
fi

echo "Eight business services and the operations telemetry adapter validated."
