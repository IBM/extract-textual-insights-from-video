#!/bin/bash
set -e
cd asset
echo "Re-building docker image"
read i < ../num.txt
i=`expr $i + 1`
echo $i > ../num.txt
Ver_Num=`cat ../num.txt`
docker -H localhost:2375 build -t test:v$Ver_Num .
echo "Docker Image Built"
echo "Running docker image"
source ../run.sh