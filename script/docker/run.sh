#!/bin/bash
docker build -t keehin-nuxt-app:latest ./script/docker
docker run -d \
  -p 3443:3443 \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  -e NITRO_PORT=3443 \
  -e NITRO_SSL_KEY=/etc/cert/key.pem \
  -e NITRO_SSL_CERT=/etc/cert/cert.pem \
  -v ../kxreport/cert/key.pem:/etc/cert/key.pem:ro \
  -v ../kxreport/cert/cert.pem:/etc/cert/cert.pem:ro \
  --name keehin_nuxt_server \
  keehin-nuxt-app:latest
