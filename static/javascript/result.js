const optionals = document.getElementById('optionals');
const optional1 = document.getElementById('optional1');
const optional2 = document.getElementById('optional2');
const optional3 = document.getElementById('optional3');
const removeThis = document.getElementById('removeThis');
const progressMsg = document.getElementById("myP");
const progressIndicator = document.getElementById("progressIndicator");
const tabsHere = document.getElementById("tabsHere");
const submitButton = document.getElementById("Upload");

const scrollClass = document.getElementById("scrollClass");

const categoryHere = document.getElementById('categoryHere');
const conceptHere = document.getElementById('conceptHere');
const entityHere = document.getElementById('entityHere');
const sentimentsHere = document.getElementById('sentimentsHere');
const positiveSentencesHere = document.getElementById('positiveSentencesHere');
const wordCloudHere = document.getElementById('wordCloudHere');
const NLUAnalysed = document.getElementById("NLUAnalysed");
const Loading1 = document.getElementById("Loading1");
const Loading2 = document.getElementById("Loading2");

var fileN;

const elem = document.getElementById('myBar');
var width = 1;
var videoTime = 0;
var startTimes = [];
var endTimes = [];
var speakersList = [];

$(document).ready(() => {
videoHere.ontimeupdate = () => { myFunction() };
Convert(document.getElementById("filename").innerHTML);
});

const myFunction = () => {
    // Display the current position of the video in a p element with id="demo"
    num = videoHere.currentTime;
    videoTime = num.toFixed(2);
    for (i = 0; i < startTimes.length; i++) {
        if (videoTime > startTimes[i] && videoTime < endTimes[i])
            console.log(speakersList[i]);

    }
};

// Detect Unique Speakers
Array.prototype.contains = (v) => {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = () => {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}

// Extract Audio from Audio
const Convert = async (file) => {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Converting " + file + " ...";
    await fetch(`/videoToAudio?fileName=${file}`).then(async (response) => {
        data = await response.json();
        if (data.flag == 1) {
            progressMsg.className = "w3-text-green w3-animate-opacity";
            progressMsg.innerHTML = "Successfully Converted.";
            width = 50;
            elem.style.width = width + '%';
            SpeechToText(file.split('.')[0] + '.mp3');
        } else if (data.flag == 0) {
            //Handle data.Exception
        }
    });
};

// Audio to Text

const SpeechToText = async (file) => {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Transcribing " + file + " ...";

    setTimeout(() => {
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Approximately " + Math.ceil(videoHere.duration.toFixed(1) / 60) + " Min left...";
    }, 2000);

    setTimeout(() => {
        progressMsg.className = "w3-animate-opacity";
        progressMsg.innerHTML = "Transcribing " + file + " ...";
    }, 8000);

    await fetch(`/transcribeAudio`).then(async (response) => {
        data = await response.json();
        arr = [];
        Loading1.style.display = "none";
        tabsHere.style.display = "block";
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Successfully Transcribed.";
        width = 75;
        elem.style.width = width + '%';

        scrollClass.innerHTML = '';

        scrollClass.innerHTML = `<div class="bx--tile" id='editor'>\
                                        <a class="bx--btn bx--btn--primary bx--btn--field" target="_blank" href="static/transcripts/${file.split('.')[0] + '.txt'}" type="button">\
                                        Download as Text\
                                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">\
                                        <path d="M7.5 11l4.1-4.4.7.7L7 13 1.6 7.3l.7-.7L6.5 11V0h1v11zM13 15v-2h1v2c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1v-2h1v2h12z"></path></svg>\
                                        </a>\
                                        <button class="bx--btn bx--btn--primary bx--btn--field" onclick="downloadPDF('${file.split('.')[0] + '.txt'}')" type="button">\
                                        Download as PDF\
                                        <svg focusable="false" preserveAspectRatio="xMidYMid meet" style="will-change: transform;" xmlns="http://www.w3.org/2000/svg" class="bx--btn__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">\
                                        <path d="M7.5 11l4.1-4.4.7.7L7 13 1.6 7.3l.7-.7L6.5 11V0h1v11zM13 15v-2h1v2c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1v-2h1v2h12z"></path></svg>\
                                        </button>\
                                        </div>\
                                        <br>`;


        scrollClass.innerHTML += "<div id='content'>";                                
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
            }
        });
        scrollClass.innerHTML += "</div>";                                
        uniqueSpeakers = [];
        uniqueSpeakers = arr.unique();
        fileN = file.split('.')[0]
        NluAnalysis(file.split('.')[0] + '.txt');
    });
}

// Text Analytics with NLU

const NluAnalysis = async (file) => {
    progressMsg.className = "w3-animate-opacity";
    progressMsg.innerHTML = "Performing NLU Analysis on " + file + " ...";
    await fetch(`/analyseText`).then(async (respo) => {
        response = await respo.json();
        tabsHere.style.display = "block";
        progressMsg.className = "w3-text-green w3-animate-opacity";
        progressMsg.innerHTML = "Successfully extracted Insights from the Video!";
        width = 100;
        elem.style.width = width + '%';
        Loading2.style.display = "none";
        setTimeout(function () { progressIndicator.style.display = "none"; }, 5000);

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

        wordCloudHere.innerHTML = `<div class="bx--col-md-3"><div class="outside"><div class="inside"><h6> Nouns & Adjectives </h6><br> <img class="center" height="256" width="256" src="../${response.wordclouds[0]}"> </div></div></div>
                <div class="bx--col-md-4"><div class="outside"><div class="inside"> <h6> Verbs </h6><br><img class="center" height="256" width="256" src="../${response.wordclouds[1]}"> </div></div></div>`;
    });
}

const downloadText = (filename) => {
    location.replace(`static/transcripts/${filename}`);
};

const downloadPDF = (filename) => {
    var doc = new jsPDF();
    var specialElementHandlers = {
        '#editor': (element, renderer) => {
            return true;
        }
    };

    doc.fromHTML($('#scrollClass').html(), 15, 15, {
        'width': 170,
        'elementHandlers': specialElementHandlers
    });
    doc.save(`${filename.replace('.txt', '.pdf')}`);
};

const downloadNLU = () => {
    var printContents = document.getElementById("NLUAnalysed").innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
};