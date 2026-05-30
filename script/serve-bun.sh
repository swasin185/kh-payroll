#!/bin/bash
# serve-bun.sh - Runs the built server using Bun behind Nginx
# Nginx terminates SSL, so we run on plain HTTP on localhost.

export NITRO_PORT=3000
export NITRO_HOST=127.0.0.1
export NODE_TLS_REJECT_UNAUTHORIZED=0

echo "Starting Nuxt server with Bun on http://$NITRO_HOST:$NITRO_PORT..."
exec bun .output/server/index.mjs
