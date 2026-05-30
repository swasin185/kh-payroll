#!/bin/bash
# set -e
# shopt -s expand_aliases
# alias mysql="mysql -uadmin -pTom1973# -h 10.0.0.245"

dbdir=/backup/db/$1
gunzip $dbdir/payroll.sql.gz
mysql < $dbdir/payroll.sql
# sed -i 's/utf8mb4_uca1400_ai_ci/utf8mb4_unicode_ci/g' your_dump_file.sql
gzip $dbdir/payroll.sql

# unalias mysql
