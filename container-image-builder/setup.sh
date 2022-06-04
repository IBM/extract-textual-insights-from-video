ibmcloud login -sso -a cloud.ibm.com -r eu-de -g Default
ibmcloud plugin install container-service
export CLUSTERID=$(ibmcloud ks cluster ls | awk 'FNR == 3 {print $2}')
ibmcloud ks cluster config --cluster $CLUSTERID

read i < ./dind.txt
i=`expr $i + 1`
echo $i > ./dind.txt
Ver_Num=`cat ./dind.txt`

kubectl apply -f pod.yaml
sleep 10
kubectl port-forward dind 2375:2375
