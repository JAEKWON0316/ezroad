@echo off
ssh -i "C:\EC2KEY\pdfchatbot-key.pem" -o StrictHostKeyChecking=no ubuntu@3.106.186.205 "docker --version && docker ps -a && df -h"
