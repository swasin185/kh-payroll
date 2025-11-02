#!/bin/bash
# docker build -t kh-payroll:latest -f script/docker/Dockerfile ../..
docker-compose pull
docker-compose build
docker image prune -f
docker-compose up -d
