#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

KXREPORT="${WORKSPACE_DIR}/kxreport/report"
KH_PAYROLL="${WORKSPACE_DIR}/kh-payroll/report"

# Remove any old symlink or directory to clean up
rm -rf "${KXREPORT}/kh-payroll"
rm -rf "${KXREPORT}/t"

# Ensure the destination directory exists
mkdir -p "${KXREPORT}/kh-payroll"

# Sync or copy the report files (rsync is preferred to handle updates/deletions cleanly)
if command -v rsync &> /dev/null; then
  rsync -av --delete "${KH_PAYROLL}/" "${KXREPORT}/kh-payroll/"
else
  cp -r "${KH_PAYROLL}"/* "${KXREPORT}/kh-payroll/"
fi

# Navigate to the kxreport directory and run build
cd "${WORKSPACE_DIR}/kxreport"
./script/build.sh
