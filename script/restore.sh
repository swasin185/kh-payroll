#!/bin/bash
set -e
shopt -s expand_aliases
alias mysql="mysql payroll"

dbdir=/backup/db/$1
gunzip $dbdir/payroll.sql.gz
# import/export between MariaDB/MySQL
sed -i 's/utf8mb4_uca1400_ai_ci/utf8mb4_unicode_ci/g' $dbdir/payroll.sql
sed -i 's/NO_AUTO_CREATE_USER,//g' $dbdir/payroll.sql
sed -i 's/DEFINER=`[^` ]*`@`[^` ]*`//g' $dbdir/payroll.sql
mysql < $dbdir/payroll.sql
gzip $dbdir/payroll.sql

unalias mysql
