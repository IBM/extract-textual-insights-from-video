servicename="cp-stt"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm speechtotext.json
touch speechtotext.json

servicename="cp-ta"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm naturallanguageunderstanding.json
touch naturallanguageunderstanding.json

servicename="cp-nlu"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm toneanalyzer.json
touch toneanalyzer.json
