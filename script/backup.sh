set -e
shopt -s expand_aliases
alias mysqldump="mysqldump -uadmin -pTom1973# -h 10.0.0.245"
dbdir=/backup/db/$(date +%F)
mkdir -p $dbdir
mysqldump --routines --single-transaction --skip-lock-tables payroll > $dbdir/payroll.sql
gzip $dbdir/payroll.sql

unalias mysql
