const LoadingStt = document.getElementById("LoadingStt");
const speakerHere = document.getElementById("speakerHere");

const getSTTModels = async (model_type, select_id) => {
    let url = '';
    if (model_type == "acoustic")
        url = '/api/v1.0/transcribe/acoustic';
    else if (model_type == "language")
        url = '/api/v1.0/transcribe/language';

    await fetch(url, {timeout:false}).then(async (response) => {
        data = await response.json();
        var dynamicSelect = document.getElementById(select_id);

        data.customizations.forEach(element => {
            var newOption = document.createElement("option");
            newOption.text = element.name.toString(); 
            newOption.value = element.customization_id.toString(); 
            dynamicSelect.add(newOption);
        });

        if (model_type == "acoustic") {
            getAcoModel.style.display = "none";
            gotAcoModel.style.display = "block";
        }
        else if (model_type == "language") {
            getLangModel.style.display = "none";
            gotLangModel.style.display = "block";
        }
    });
};

const selectedSttModels = () => {
    return {
        langModel: document.getElementById("select-langModel").value,
        acoModel: document.getElementById("select-acoModel").value
    };
}

const toggleSTTLoading = () => LoadingStt.style.display === "none" ? LoadingStt.style.display = "block" : LoadingStt.style.display = "none";

const SpeechToText = async (filename) => {
    console.log("(speech-to-text.js)=> SpeechToText function called with filename: " + filename);
    let speakers = [];
    let SttModel = selectedSttModels();
    speakerHere.innerHTML = "";
    console.log("(speech-to-text.js)=> Selected STT Models: ", SttModel);
    console.log(`(speech-to-text.js)=> API call made to /api/v1.0/transcribe/stt with filename: ${filename}, langModel: ${SttModel.langModel}, acoModel: ${SttModel.acoModel}`);
    const data = await fetch(`/api/v1.0/transcribe/stt?filename=${filename}&langModelId=${SttModel.langModel}&acoModelId=${SttModel.acoModel}`, {timeout:false});
    const json = await data.json();
    console.log("(speech-to-text.js)=> Received response from API");
    speakerHere.innerHTML += json.speaker;
    speakers.push(json.speaker);
    
    if (json.error) {
        console.log(`[x](speech-to-text.js)=> Error: ${json.error} Returning flag=false`);
        return {flag: false, error: json.error};
    }else {
        console.log(`(speech-to-text.js)=> Successfully transcribed text. Returning flag=true`);
        return {flag: true, speakers: speakers, filename: json.filename};
    }
};