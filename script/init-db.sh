#!/bin/bash
set -e

# Enable alias expansion in non-interactive shell and define database alias
shopt -s expand_aliases
alias mysql="mysql -uadmin -pTom1973# -h 10.0.0.245"

echo "Starting database schema initialization..."

# Run SQL files in sequence using mysql client
mysql < script/sql/01-dbuser.sql
mysql < script/sql/02-main.sql
mysql < script/sql/03-payroll.sql
mysql < script/sql/04-views.sql
mysql < script/sql/05-procedure.sql
mysql < script/sql/06-photos.sql

echo "Database initialization completed successfully!"

unalias mysql
