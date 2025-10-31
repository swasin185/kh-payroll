#!/bin/bash
docker run -d --rm  \
  --name mariadb \
  --network host \
  -p 3306:3306 \
  -e MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=true \
  -e MARIADB_RANDOM_ROOT_PASSWORD=true \
  -e MARIADB_DATABASE=payroll \
  -v $(pwd)/sql:/docker-entrypoint-initdb.d \
  mariadb:12-noble
