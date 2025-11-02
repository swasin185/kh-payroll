#!/bin/bash
docker compose down -v --remove-orphans
# doccker stop $(sudo docker ps -a -q)
ducker container prune -f
docker system prune -a -f
