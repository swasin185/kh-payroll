#!/bin/bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NITRO_PORT=3443
export NITRO_SSL_KEY="$(cat /etc/cert/key.pem)"
export NITRO_SSL_CERT="$(cat /etc/cert/cert.pem)"
node .output/server/index.mjs 
# private serve behing nginx
# node .output/server/index.mjs --host 127.0.0.1
