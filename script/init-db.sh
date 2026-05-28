#!/bin/bash
set -e

# Change directory to the root of the project
cd "$(dirname "$0")/.."

echo "Starting database schema initialization..."

# Run SQL files in sequence using mysql client
mysql < script/sql/01-dbuser.sql
mysql < script/sql/02-main.sql
mysql < script/sql/03-payroll.sql
mysql < script/sql/04-views.sql
mysql < script/sql/05-procedure.sql

echo "Database initialization completed successfully!"
