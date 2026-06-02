#!/usr/bin/env bash
# Generate self-signed server certificate (server.key + server.crt)
# Creates server.key and server.crt, and copies them to /etc/cert (requires sudo)
# Uses a single temporary OpenSSL config with SANs.

set -euo pipefail

# Work from the script directory
cd "$(dirname "$0")"

# Hosts can be provided as arguments, otherwise default to common localhost names
if [ "$#" -gt 0 ]; then
  HOSTS=("$@")
else
  HOSTS=(localhost 127.0.0.1 ::1)
fi

echo "Generating self-signed server certificate for: ${HOSTS[*]}"

# First host used as CN
CN=${HOSTS[0]}

# Create a single temporary OpenSSL config file containing DN and SANs
CONF=$(mktemp)
cat > "$CONF" <<EOF
[ req ]
default_bits       = 2048
prompt             = no
default_md         = sha256
distinguished_name = dn
req_extensions     = v3_req

[ dn ]
CN = $CN

[ v3_req ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth

[ alt_names ]
EOF

IDX=1
for H in "${HOSTS[@]}"; do
  # IPv4: contains dots; IPv6: contains ':'; otherwise DNS
  if echo "$H" | grep -Eq '^[0-9]+(\.[0-9]+){3}$'; then
    echo "IP.$IDX = $H" >> "$CONF"
  elif echo "$H" | grep -q ':'; then
    echo "IP.$IDX = $H" >> "$CONF"
  else
    echo "DNS.$IDX = $H" >> "$CONF"
  fi
  IDX=$((IDX + 1))
done

# Generate key + self-signed certificate using the single config file
openssl req -x509 -nodes -newkey rsa:2048 -keyout server.key -out server.crt -days 825 -sha256 -config "$CONF" -extensions v3_req

# Clean up
rm -f "$CONF"

# Install to /etc/cert so services can reference them
INSTALL_DIR=/etc/cert
echo "Installing certs to $INSTALL_DIR (requires sudo if not root)..."
if [ "$(id -u)" -eq 0 ]; then
  mkdir -p "$INSTALL_DIR"
  install -m 0644 server.crt "$INSTALL_DIR/server.crt"
  install -m 0600 server.key "$INSTALL_DIR/server.key"
else
  if command -v sudo >/dev/null 2>&1; then
    sudo mkdir -p "$INSTALL_DIR"
    sudo install -m 0644 server.crt "$INSTALL_DIR/server.crt"
    sudo install -m 0600 server.key "$INSTALL_DIR/server.key"
  else
    echo "sudo not available; skipping install to $INSTALL_DIR. Copy files manually if needed."
  fi
fi

echo $INSTALL_DIR/server.key
echo $INSTALL_DIR/server.crt
