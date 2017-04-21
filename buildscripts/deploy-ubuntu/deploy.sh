#!/bin/bash
pm2 stop cs
git checkout develop
git pull origin develop
npm install
pm2 start cs

exit;
