#!/bin/bash
set -e
cd ../
echo "Checking for docker file"
    if [ -f "Dockerfile" ]; then
        echo "Dockerfile exists."
        echo "Building docker image"
        read i < ./container-image-builder/num.txt
        i=`expr $i + 1`
        echo $i > ./container-image-builder/num.txt
        Ver_Num=`cat ./container-image-builder/num.txt`
        docker -H localhost:2375 build -t test:v$Ver_Num .
        echo "Docker Image Built"
        echo "Running docker image"
        source ./container-image-builder/run.sh
    else 
        echo "Dockerfile does not exist."
    fi
