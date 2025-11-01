#!/bin/bash
docker build -t kh-payroll:latest -f script/docker/Dockerfile .
docker image prune
docker run -d \
  --name kh-payroll-server \
  --network "host" \
  kh-payroll:latest