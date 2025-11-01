#!/bin/bash
docker build -t kh-payroll:latest -f script/docker/Dockerfile .
docker-compose up -d