#!/bin/bash

chemin="/home/erasme/eddia"
url="https://192.168.70.135:3010/"
cd $chemin
node app.js > app_log.log &
nohup google-chrome $url &
