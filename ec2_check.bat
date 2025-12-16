@echo off
ssh -i "C:\EC2KEY\ezroad-seoul-key.pem" -o StrictHostKeyChecking=no ubuntu@3.36.74.144 "docker --version && docker ps -a && df -h"
