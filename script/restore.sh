set -e

# Enable alias expansion in non-interactive shell and define database alias
shopt -s expand_aliases
alias mysql="mysql -uadmin -pTom1973# -h 10.0.0.245"

dbdir=/backup/db/$1
gunzip $dbdir/payroll.sql.gz
mysql < $dbdir/payroll.sql
gzip $dbdir/payroll.sql

unalias mysql
