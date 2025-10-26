#!/bin/bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NITRO_PORT=3443
export NITRO_SSL_KEY="$(cat /etc/cert/key.pem)"
export NITRO_SSL_CERT="$(cat /etc/cert/cert.pem)"
# Run Nuxt/Nitro server
node .output/server/index.mjs
