#!/bin/bash
KXREPORT=$HOME/kxreport/report
ln -s ../report $KXREPORT/kh-payroll
cd $KXREPORT/..
./build.sh
