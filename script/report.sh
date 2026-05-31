#!/bin/bash
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

KXREPORT="${WORKSPACE_DIR}/kxreport/report"
KH_PAYROLL="${WORKSPACE_DIR}/kh-payroll/report"

# Remove the old symlink if it exists
rm -f "${KXREPORT}/kh-payroll"

# Create a valid symbolic link
ln -s "${KH_PAYROLL}" "${KXREPORT}/kh-payroll"

# Navigate to the kxreport directory and run build
cd "${WORKSPACE_DIR}/kxreport"
./script/build.sh
