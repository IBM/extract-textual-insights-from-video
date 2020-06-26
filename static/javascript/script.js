const uploading2 = document.getElementById("uploading2");
const error2 = document.getElementById("error2");
const uploaded2 = document.getElementById("uploaded2");

const Loading1 = document.getElementById("Loading1");
const Loading2 = document.getElementById("Loading2");

const gotLangModel = document.getElementById("gotLangModel");
const getLangModel = document.getElementById("getLangModel");

const gotAcoModel = document.getElementById("gotAcoModel");
const getAcoModel = document.getElementById("getAcoModel");
const scrollClass = document.getElementById("scrollClass");

const categoryHere = document.getElementById('categoryHere');
const conceptHere = document.getElementById('conceptHere');
const entityHere = document.getElementById('entityHere');
const sentimentsHere = document.getElementById('sentimentsHere');
const positiveSentencesHere = document.getElementById('positiveSentencesHere');
const wordCloudHere = document.getElementById('wordCloudHere');
const NLUAnalysed = document.getElementById("NLUAnalysed");

const optionals = document.getElementById('optionals');
const optional1 = document.getElementById('optional1');
const optional2 = document.getElementById('optional2');
const optional3 = document.getElementById('optional3');
const removeThis = document.getElementById('removeThis');
const progressMsg = document.getElementById("myP");
const progressIndicator = document.getElementById("progressIndicator");
const tabsHere = document.getElementById("tabsHere");
const videoHere = document.getElementById("videoHere");



const elem = document.getElementById('myBar');
var width = 1;
var videoTime = 0;
var startTimes = [];
var endTimes = [];
var speakersList = [];

$(document).ready(function() {

    uploaded2.style.display = "none";
    error2.style.display = "none";
    uploading2.style.display = "none";
    videoHere.style.display = "none";
    gotAcoModel.style.display = "none";
    gotLangModel.style.display = "none";
    Loading1.style.display = "none";
    Loading2.style.display = "none";
    NLUAnalysed.style.display = "none";
    progressIndicator.style.display = "none";
    tabsHere.style.display = "none";
    // Assign an ontimeupdate event to the video element, and execute a function if the current playback position has changed
    videoHere.ontimeupdate = function() { myFunction() };

    getLanguageModels();
    getAcousticModels();
});

function isEmpty(el) {
    return !$.trim(el.html())
}

function myFunction() {
    // Display the current position of the video in a p element with id="demo"
    num = videoHere.currentTime;
    videoTime = num.toFixed(2);
    for (i = 0; i < startTimes.length; i++) {
        if (videoTime > startTimes[i] && videoTime < endTimes[i])
            console.log(speakersList[i]);

    }
}

Array.prototype.contains = function(v) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}

async function getLanguageModels() {
    await fetch('/listLanguageModels').then(async(response) => {
        data = await response.json();

        var dynamicSelect = document.getElementById("select-id1");

        data.customizations.forEach(element => {

            var newOption = document.createElement("option");
            newOption.text = element.name.toString(); //item.whateverProperty
            newOption.value = element.customization_id.toString(); //item.whateverProperty

            dynamicSelect.add(newOption);

            //new select items should populated immediately
        });

        getLangModel.style.display = "none";
        gotLangModel.style.display = "block";

    });
}

async function getAcousticModels() {
    await fetch('/listAcousticModels').then(async(response) => {
        data = await response.json();

        var dynamicSelect = document.getElementById("select-id2");

        data.customizations.forEach(element => {

            var newOption = document.createElement("option");
            newOption.text = element.name.toString(); //item.whateverProperty
            newOption.value = element.customization_id.toString(); //item.whateverProperty

            dynamicSelect.add(newOption);

            //new select items should populated immediately
        });

        getAcoModel.style.display = "none";
        gotAcoModel.style.display = "block";

    });
}

$('#Upload').on('click', function() {
    uploaded2.style.display = "none";
    uploading2.style.display = "block";
    progressIndicator.style.display = "block";
    if (isEmpty($('#myFiles'))) {
        uploading2.style.display = "none";
        error2.style.display = "block";
    } else {
        var category = document.getElementById('category');
        var concepts = document.getElementById('concepts');
        var entity = document.getElementById('entity');
        var categoryBool, conceptsBool, entityBool;
        Loading1.style.display = "block";
        Loading2.style.display = "block";
        if (category.checked == true) {
            categoryBool = "True";
        } else {
            categoryBool = "False";
        }

        if (concepts.checked == true) {
            conceptsBool = "True";
        } else {
            conceptsBool = "False";
        }

        if (entity.checked == true) {
            entityBool = "True";
        } else {
            entityBool = "False";
        }

        var file = $('.bx--file-filename').html();

        progressMsg.className = "w3-animate-opacity";
        progressMsg.innerHTML = "uploading " + file + "...";

        let NluOptions = {
            file: file,
            category: categoryBool,
            concepts: conceptsBool,
            entity: entityBool,
            sentiments: 'True',
            positiveSentences: 'True'
        };

        let SttModel = {
            file: file,
            langModel: document.getElementById("select-id1").value,
            acoModel: document.getElementById("select-id2").value
        };

        formData = new FormData($('form')[0]);
        formData.append("SttModel", JSON.stringify(SttModel));
        formData.append("NluOptions", JSON.stringify(NluOptions));

        error2.style.display = "none";
        $.ajax({
            url: '/uploader',
            type: 'POST',
            data: formData,
            dataType: 'json',
            cache: false,
            contentType: false,
            processData: false,
            success: function(response) {
                data = response;
                if (data.flag == 1) {
                    progressMsg.className = "w3-text-green w3-animate-opacity";
                    progressMsg.innerHTML = "Successfully Uploaded.";
                    width = 25;
                    elem.style.width = width + '%';

                    Convert(file);
                } else if (data.flag == 0) {
                    //Handle data.Exception
                }
            },
            error: function() {
                error2.style.display = "block";
            }
        });
    }

});

async function Convert(file) {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Converting " + file + " ...";
    await fetch(`/videoToAudio?fileName=${file}`).then(async(response) => {
        data = await response.json();
        if (data.flag == 1) {
            progressMsg.className = "w3-text-green w3-animate-opacity";
            progressMsg.innerHTML = "Successfully Converted.";
            width = 50;
            elem.style.width = width + '%';
            videoPlayer = `<source src="static/raw/${file.split('.')[0].replace(
                / /g, "-").replace(/'/g, "").toLowerCase()}.mp4" type="video/mp4">
        Your browser does not support HTML video.`;
            videoHere.innerHTML = videoPlayer;
            videoHere.style.display = "block";
            SpeechToText(file.split('.')[0] + '.flac');
        } else if (data.flag == 0) {
            //Handle data.Exception
        }
    });
}

async function SpeechToText(file) {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Transcribing " + file + " ...";

    setTimeout(function() {
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Approximately " + videoHere.duration.toFixed(1) / 60 + " Min left...";
    }, 2000);

    setTimeout(function() {
        progressMsg.className = "w3-animate-opacity";
        progressMsg.innerHTML = "Transcribing " + file + " ...";
    }, 5000);

    await fetch(`/transcribeAudio`).then(async(response) => {
        data = await response.json();
        arr = [];
        Loading1.style.display = "none";
        tabsHere.style.display = "block";
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Successfully Transcribed.";
        width = 75;
        elem.style.width = width + '%';

        scrollClass.innerHTML = '';

        // scrollClass.innerHTML = '<div class="bx--tile">\
        //                                 <button class="bx--btn bx--btn--primary bx--btn--field" type="button" onclick="saveTextToCOS()">\
        //                                 Save Text to Cloud Object Storage\
        //                                 <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">\
        //                                 <path d = "M9 7L9 3 7 3 7 7 3 7 3 9 7 9 7 13 9 13 9 9 13 9 13 7z" ></path></svg>\
        //                                 </button>\
        //                                 <button class="bx--btn bx--btn--primary bx--btn--field" type="button">\
        //                                 Download Text\
        //                                 <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">\
        //                                 <path d="M7.5 11l4.1-4.4.7.7L7 13 1.6 7.3l.7-.7L6.5 11V0h1v11zM13 15v-2h1v2c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1v-2h1v2h12z"></path></svg>\
        //                                 </button>\
        //                                 <button class="bx--btn bx--btn--primary bx--btn--field" type="button">\
        //                                 Download Text with Speaker Details\
        //                                 <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">\
        //                                 <path d="M7.5 11l4.1-4.4.7.7L7 13 1.6 7.3l.7-.7L6.5 11V0h1v11zM13 15v-2h1v2c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1v-2h1v2h12z"></path></svg>\
        //                                 </button>\
        //                                 </div>\
        //                                 <br>';


        data.forEach(element => {
            if (element.speaker == undefined) {

            } else {
                startTimes.push(element.from);
                endTimes.push(element.to);
                speakersList.push(element.speaker);
                addSpeaker = `<div class="bx--tile">
                                    <h4 class="time-left"> Speaker ${element.speaker} </h4>
                                    <hr>
                                    <div class="well darker">
                                        <p>${element.transcript}</p>
                                    </div>
                                </div>
                                <br>`;
                scrollClass.innerHTML += addSpeaker;
                arr.push(element.speaker);
                // if (element.speaker == 0) {
                //     addSpeaker = '<div class="bx--tile">\
                //                     <h4 class="time-left"> Willie Tejada </h4>\
                //                     <hr>\
                //                     <div class="well darker">\
                //                         <p>' + element.transcript + '</p>\
                //                     </div>\
                //                 </div>\
                //                 <br>';
                //     scrollClass.innerHTML += addSpeaker;
                //     arr.push(element.speaker);
                // } else if (element.speaker == 1) {
                //     addSpeaker = '<div class="bx--tile">\
                //                     <h4 class="time-left"> Randi Stipes </h4>\
                //                     <hr>\
                //                     <div class="well darker">\
                //                         <p>' + element.transcript + '</p>\
                //                     </div>\
                //                 </div>\
                //                 <br>';
                //     scrollClass.innerHTML += addSpeaker;
                //     arr.push(element.speaker);
                // } else if (element.speaker == 2) {
                //     addSpeaker = '<div class="bx--tile">\
                //                     <h4 class="time-left"> Andrew </h4>\
                //                     <hr>\
                //                     <div class="well darker">\
                //                         <p>' + element.transcript + '</p>\
                //                     </div>\
                //                 </div>\
                //                 <br>';
                //     scrollClass.innerHTML += addSpeaker;
                //     arr.push(element.speaker);
                // }

            }
        });
        uniqueSpeakers = [];
        uniqueSpeakers = arr.unique();
        NluAnalysis(file.split('.')[0] + '.txt');
    });
}

async function NluAnalysis(file) {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Performing NLU Analysis on " + file + " ...";
    await fetch(`/analyseText`).then(async(respo) => {
        response = await respo.json();
        Loading2.style.display = "none";
        tabsHere.style.display = "block";
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Successfully extracted Insights from the Video!";
        width = 100;
        elem.style.width = width + '%';
        uploading2.style.display = "none";
        uploaded2.style.display = "block";

        setTimeout(function() { progressIndicator.style.display = "none"; }, 5000);

        NLUAnalysed.style.display = "block";
        if (response.category == undefined && response.concepts == undefined && response.entity == undefined) {
            optional1.style.display = "none";
            optional2.style.display = "none";
            optional3.style.display = "none";
            removeThis.style.display = "none";
        } else if (response.category == undefined) {
            optional1.style.display = "none";
            optional2.style.display = "block";
            optional3.style.display = "block";
            removeThis.style.display = "block";
        } else if (response.concepts == undefined) {
            optional1.style.display = "block";
            optional2.style.display = "block";
            optional3.style.display = "none";
            removeThis.style.display = "block";
        } else if (response.entity == undefined) {
            optional1.style.display = "block";
            optional2.style.display = "none";
            optional3.style.display = "block";
            removeThis.style.display = "block";
        } else if (response.category == undefined && response.concepts == undefined) {
            optional1.style.display = "none";
            optional2.style.display = "block";
            optional3.style.display = "none";
            removeThis.style.display = "block";
        } else if (response.concepts == undefined && response.entity == undefined) {
            optional1.style.display = "block";
            optional2.style.display = "none";
            optional3.style.display = "none";
            removeThis.style.display = "block";
        } else if (response.entity == undefined && response.category == undefined) {
            optional1.style.display = "none";
            optional2.style.display = "none";
            optional3.style.display = "block";
            removeThis.style.display = "block";
        } else {
            optional1.style.display = "block";
            optional2.style.display = "block";
            optional3.style.display = "block";
            removeThis.style.display = "block";
            // optionals.style.display = "block";
            categoryHere.innerHTML = response.category.label;
            categoryHere.innerHTML += `<div class="bx--tag bx--tag--green"><span class="bx--tag__label">${response.category.score}</span> </div>`;

            conceptHere.innerHTML = `<ul>`;
            response.concepts.forEach(element => {
                conceptHere.innerHTML += `<br>`;
                conceptHere.innerHTML += `<li><a href='${element.dbpedia_resource}'> ${element.text} </a> <div class="bx--tag bx--tag--green"><span class="bx--tag__label">${element.relevance}</span> </div> </li>`;
            });
            conceptHere.innerHTML += `</ul>`;

            entityHere.innerHTML = `${response.entity.type}, ${response.entity.text} <div class="bx--tag bx--tag--green"><span class="bx--tag__label">${response.entity.relevance}</span> </div>`;

        }

        sentimentsHere.innerHTML = `<ul>`;
        response.sentiments.forEach(element => {
            sentimentsHere.innerHTML += `<br>`;
            if (element.sentiment == 'positive' && element.emotion == 'joy') {
                sentimentsHere.innerHTML += `<li>${element.keyword} <div class="bx--tag bx--tag--green"><span class="bx--tag__label">${element.sentiment}</span> </div> <div class="bx--tag bx--tag--cyan"><span class="bx--tag__label">${element.emotion}</span> </div></li>`;
            } else {
                sentimentsHere.innerHTML += `<li>${element.keyword} <div class="bx--tag bx--tag--grey"><span class="bx--tag__label">${element.sentiment}</span> </div> <div class="bx--tag bx--tag--gray"><span class="bx--tag__label">${element.emotion}</span> </div></li>`;
            }
        });
        sentimentsHere.innerHTML += `</ul>`;

        positiveSentencesHere.innerHTML = `<ul>`;
        response.positiveSentences.forEach(element => {
            positiveSentencesHere.innerHTML += `<br>`;
            positiveSentencesHere.innerHTML += `<li>${element.text} <div class="bx--tag bx--tag--green"><span class="bx--tag__label">${element.score}</span> </div> </li>`;
        });
        positiveSentencesHere.innerHTML += `</ul>`;

        wordCloudHere.innerHTML = `<div class="bx--col-md-3"><div class="outside"><div class="inside"><h6> Nouns & Adjectives </h6><br> <img class="center" height="256" width="256" src="${response.wordclouds[0]}"> </div></div></div>
                <div class="bx--col-md-4"><div class="outside"><div class="inside"> <h6> Verbs </h6><br><img class="center" height="256" width="256" src="${response.wordclouds[1]}"> </div></div></div>`;
    });
}

function Test() {





}