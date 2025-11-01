#!/bin/bash
sudo docker build -t kh-payroll:latest -f script/docker/Dockerfile .
docker run -d \
  -p 3443:3443 \
  -e NODE_TLS_REJECT_UNAUTHORIZED=0 \
  -e NITRO_PORT=3443 \
  -e NITRO_SSL_KEY=/etc/cert/key.pem \
  -e NITRO_SSL_CERT=/etc/cert/cert.pem \
  -v $(pwd)/script/cert/key.pem:/etc/cert/key.pem:ro \
  -v $(pwd)/script/cert/cert.pem:/etc/cert/cert.pem:ro \
  --name kh-payroll-server \
  kh-payroll:latest
