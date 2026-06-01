#!/bin/bash
# Generate Local Root CA and sign localhost SSL certificate

set -e

# Go to the directory of this script
cd "$(dirname "$0")"

echo "=== 1. Generating Root CA private key ==="
openssl genrsa -out rootCA.key 4096

echo "=== 2. Generating Root CA self-signed certificate ==="
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 3650 -config ca.conf -out rootCA.crt

echo "=== 3. Generating Server private key ==="
openssl genrsa -out server.key 2048

echo "=== 4. Generating Certificate Signing Request (CSR) for Server ==="
openssl req -new -key server.key -config server.conf -out server.csr

echo "=== 5. Signing Server Certificate using the Root CA and ext.conf ==="
openssl x509 -req \
  -in server.csr \
  -CA rootCA.crt \
  -CAkey rootCA.key \
  -CAcreateserial \
  -out server.crt \
  -days 825 \
  -sha256 \
  -extfile ext.conf

echo "=== 6. Copying keys to match system cert names (key.pem, cert.pem) ==="
cp server.crt cert.pem
cp server.key key.pem

echo "=== 7. Copying to system certificate storage (/etc/cert) ==="
sudo mkdir -p /etc/cert
sudo cp -ur rootCA.crt server.crt server.key cert.pem key.pem /etc/cert/

echo "=== Success! ==="
echo "Files created in script/cert/:"
echo "  - rootCA.key / rootCA.crt (Your local Root CA)"
echo "  - server.key / server.crt (Your signed SSL certificate for localhost)"
echo "  - key.pem / cert.pem (Copies for backward compatibility)"
echo ""
echo "Note: Import 'rootCA.crt' into your browser/OS Trusted Root authorities to avoid SSL warnings."