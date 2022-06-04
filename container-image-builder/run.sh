set -e
echo "Running the container.."
Port_Num=$(cat Dockerfile | grep "EXPOSE" | awk '{print $2}')
docker -H localhost:2375 run -p 8089:$Port_Num test:v${Ver_Num}

