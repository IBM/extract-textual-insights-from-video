const getLangModel = document.getElementById("getLangModel");
const gotLangModel = document.getElementById("gotLangModel");

const getAcoModel = document.getElementById("getAcoModel");
const gotAcoModel = document.getElementById("gotAcoModel");

$(document).ready(() => {
    section1.click();
    getSTTModels('language', 'select-langModel');
    getSTTModels('acoustic', 'select-acoModel');
});

videoInput.onchange = () => {
    if (videoInput.value === "sample-vdo") {
        sampleVideo.style.display = "block";
        uploadVideo.style.display = "none";
    } else {
        sampleVideo.style.display = "none";
        uploadVideo.style.display = "block";
    }
}

uploadBtn.onclick = async () => {
    section1.click();
    createProgressBar();
    toggleSTTLoading();
    toggleLoadingNlu();
    console.log("(script.js)=> Submit button pressed");
    let filename = "";
    let proceed;
    if (input.files.length === 0 && videoInput.value === "upload-vdo") uploadfailed.style.display = "block";
    else if (videoInput.value === "sample-vdo") {
        console.log("(script.js)=> Sample Video selected");
        filename = sampleVideoAnalyze();
        updateListElement(1, "complete");
        proceed = true;
    }
    else {
        updateListElement(1, "current");
        console.log("(script.js)=> File Upload in progress...");
        const response = await uploadVideoFile();
        const data = await response.filename;
        filename = data;
        proceed = response.flag;
        console.log("(script.js)=> File Upload completed with Proceed flag=", proceed);
        console.log("(script.js)=> filename: ", filename);
        proceed ? updateListElement(1, "complete") : updateListElement(1, "incomplete");
    }
    
    if (proceed) {
        updateListElement(2, "current");
        console.log("(script.js)=> Extraction in progress...");
        const response = await Extractor(filename);
        const data = await response.filename;
        filename = data;
        proceed = response.flag;
        console.log("(script.js)=> Extraction completed with Proceed flag=", proceed);
        console.log("(script.js)=> Audio filename: ", filename);
        proceed ? updateListElement(2, "complete"): updateListElement(2, "incomplete");
    }

    updateListElement(3, "current");
    console.log("(script.js)=> Transcription in progress...");
    const response = await SpeechToText(filename);
    const data = await response.filename;
    filename = data;
    proceed = response.flag;
    console.log("(script.js)=> Transcription completed with Proceed flag=", proceed);
    console.log("(script.js)=> Text filename: ", filename);
    toggleSTTLoading();
    proceed ? updateListElement(3, "complete") : updateListElement(3, "incomplete");

    if (proceed) {
        updateListElement(4, "current");
        console.log("(script.js)=> Natural Language Understanding & Tone Analysis in progress...");
        const response = await NluAnalysis(filename);
        const data = await response.flag;
        proceed = data;
        console.log("(script.js)=> Natural Language Understanding & Tone Analysis completed with flag=", proceed);
        if (proceed) {
            toggleLoadingNlu();
            updateListElement(4, "complete");
            updateListElement(5, "complete");
        } else {
            updateListElement(4, "incomplte");
        }
    }
    // selectedSttModels();
    
    // SpeechToText(data.filename, SttModel);
}
