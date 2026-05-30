#!/bin/bash
# setNginx.sh - Sets up Nginx reverse proxy for kh-payroll

# Ensure script is run with sudo/root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root or with sudo"
  exit 1
fi

apt install nginx -y
cp ../cert/cert.pem /etc/ssl/certs/
cp ../cert/key.pem /etc/ssl/private/
cp kh-payroll.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/kh-payroll.conf /etc/nginx/sites-enabled/
systemctl daemon-reload
systemctl reload nginx
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -I INPUT -p tcp --dport 443 -j ACCEPT
iptables -I INPUT -p tcp --dport 3443 -j ACCEPT
netfilter-persistent save
