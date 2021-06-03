servicename="cp-stt"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm speechtotext.json
rm cp-stt.txt
touch speechtotext.json

servicename="cp-nlu"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm naturallanguageunderstanding.json
rm cp-nlu.txt
touch naturallanguageunderstanding.json

servicename="cp-ta"
ibmcloud resource service-key-delete "$servicename-creds" -f
ibmcloud resource service-instance-delete $servicename -f
rm toneanalyzer.json
rm cp-ta.txt
touch toneanalyzer.json
