dbdir=/backup/db/$1
gunzip $dbdir/payroll.sql.gz
mysql < $dbdir/payroll.sql
gzip $dbdir/payroll.sql
