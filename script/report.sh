#!/bin/bash
KXREPORT=$HOME/kxreport/report
ln -s $HOME/kh-payroll/report $KXREPORT/kh-payroll
cd $KXREPORT/..
./script/build.sh
