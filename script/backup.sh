#!/bin/bash
set -e
shopt -s expand_aliases
alias mysqldump="mysqldump"
dbdir=/backup/db/$(date +%F)
mkdir -p $dbdir
mysqldump --routines --single-transaction --skip-lock-tables payroll > $dbdir/payroll.sql
gzip $dbdir/payroll.sql
unalias mysqldump
