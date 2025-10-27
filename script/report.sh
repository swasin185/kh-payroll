#!/bin/bash
DIR=/khgroup/report/kh-payroll
sudo mkdir -p $DIR
sudo cp -ur ./report/*.jasper $DIR
sudo chgrp -R tomcat $DIR
