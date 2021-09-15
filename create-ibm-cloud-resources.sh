servicename="cp-stt"
service="speech-to-text"
region="eu-gb"

cpserviceexists=$(ibmcloud resource service-instance $servicename | awk 'FNR == 2 {print}')
if [ "$cpserviceexists" = "OK" ]; then
    echo "(1/3) Speech to Text service already exists in your IBM Cloud account, using the same resource"
    ibmcloud resource service-key "$servicename-creds" > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > speechtotext.json
else
    echo "(1/3) Creating Speech to text service"
    ibmcloud resource service-instance-create $servicename $service lite $region
    ibmcloud resource service-key-create "$servicename-creds" Manager --instance-name $servicename > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > speechtotext.json
fi

servicename="cp-nlu"
cpserviceexists=$(ibmcloud resource service-instance $servicename | awk 'FNR == 2 {print}')
if [ "$cpserviceexists" = "OK" ]; then
    echo "(2/3) Natural language understanding service already exists in your IBM Cloud account, using the same resource"
    ibmcloud resource service-key "$servicename-creds" > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > naturallanguageunderstanding.json
else
    echo "(2/3) Creating Natural Language Understanding service"
    ibmcloud resource service-instance-create $servicename $service lite $region
    ibmcloud resource service-key-create "$servicename-creds" Manager --instance-name $servicename > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > naturallanguageunderstanding.json
fi

servicename="cp-ta"
cpserviceexists=$(ibmcloud resource service-instance $servicename | awk 'FNR == 2 {print}')
if [ "$cpserviceexists" = "OK" ]; then
    echo "(3/3) Text analytics service already exists in your IBM Cloud account, using the same resource"
    ibmcloud resource service-key "$servicename-creds" > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > toneanalyzer.json
else
    echo "(3/3) Creating Text Analysis service"
    ibmcloud resource service-instance-create $servicename $service lite $region
    ibmcloud resource service-key-create "$servicename-creds" Manager --instance-name $servicename > "$servicename.txt"  2>&1
    apikey=$(cat $servicename.txt | awk '$1 == "apikey:" {print $2}')
    url=$(cat $servicename.txt | awk '$1 == "url:" {print $2}')
    JSON_STRING='{"apikey":"'"$apikey"'","url":"'"$url"'"}'
    echo $JSON_STRING > toneanalyzer.json
fi
