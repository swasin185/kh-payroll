#!/bin/bash
# Exit on error
set -e

echo "=== 1. Installing dependencies ==="
bun install --linker hoisted

echo "=== 2. Building production bundle ==="
bun run build

echo "=== 3. Copying build output to /var/www/kh-payroll ==="
sudo mkdir -p /var/www/kh-payroll
sudo cp -r .output/* /var/www/kh-payroll/
sudo cp .env.example /var/www/kh-payroll/.env
sudo chown -R root:root /var/www/kh-payroll

echo "=== 4. Build finished successfully ==="
echo ""
echo "To run this application using Bun behind Nginx, you have two options to keep it running:"
echo ""
echo "Option A: Use systemd (Recommended, already configured in script/kh-payroll.service)"
echo "----------------------------------------------------------------------------------"
echo "1. Copy the systemd service file:"
sudo cp ./script/kh-payroll.service /etc/systemd/system/kh-payroll.service
sudo systemctl daemon-reload
sudo systemctl enable kh-payroll
sudo systemctl restart kh-payroll
