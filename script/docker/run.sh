#!/bin/bash
docker build -t kh-payroll:latest .
docker image prune -f
docker-compose up -d
