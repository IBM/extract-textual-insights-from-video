const category = document.getElementById('category');
const concepts = document.getElementById('concepts');
const entity = document.getElementById('entity');

const LoadedNlu = document.getElementById('LoadedNlu');
const LoadingNlu = document.getElementById('LoadingNlu');

const optionals = document.getElementById('optionals');
const optional1 = document.getElementById('optional1');
const optional2 = document.getElementById('optional2');
const optional3 = document.getElementById('optional3');
const removeThis = document.getElementById('removeThis');

const categoryHere = document.getElementById('categoryHere');
const conceptHere = document.getElementById('conceptHere');
const entityHere = document.getElementById('entityHere');
const sentimentsHere = document.getElementById('sentimentsHere');
const positiveSentencesHere = document.getElementById('positiveSentencesHere');
const wordCloudHere = document.getElementById('wordCloudHere');

const nluFeatures = () => {
    let categoryBool, conceptsBool, entityBool;
    category.checked ? categoryBool = "True" : categoryBool = "False";
    concepts.checked ? conceptsBool = "True" : conceptsBool = "False";
    entity.checked ? entityBool = "True" : entityBool = "False";
    
    return {
        category: categoryBool,
        concepts: conceptsBool,
        entity: entityBool,
        sentiments: 'True',
        positiveSentences: 'True'
    }
}

const toggleLoadingNlu = () => {
    if (LoadingNlu.style.display === "none"){
        LoadingNlu.style.display = "block";
        LoadedNlu.style.display = "none";
    } else {
        LoadingNlu.style.display = "none";
        LoadedNlu.style.display = "block";
    }
}

const NluAnalysis = async (filename) => {
    const url = `/api/v1.0/analyseText`;
    
    const payload = nluFeatures();
    payload.filename = filename;

    const options = {
        method: 'POST',
        body: JSON.stringify(payload)
    }
    
    categoryHere.innerHTML = "";
    conceptHere.innerHTML = "";
    entityHere.innerHTML = "";
    sentimentsHere.innerHTML = "";
    positiveSentencesHere.innerHTML = "";
    wordCloudHere.innerHTML = "";
    
    const res = await fetch(url, options);
    const response = await res.json();

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

    return {flag: true};
}




