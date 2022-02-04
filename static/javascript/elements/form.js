const videoInput = document.getElementById("select-video-input");

const uploadVideo = document.getElementById("uploadVideo");
const sampleVideo = document.getElementById("sampleVideo");

const uploadBtn = document.getElementById("Upload");
const input = document.querySelector('input[type="file"]');

const uploading = document.getElementById("uploading");
const uploaded = document.getElementById("uploaded");
const uploadfailed = document.getElementById("uploadfailed");

const videoHere = document.getElementById("videoHere");

const section1 = document.getElementById("section1");
const section2 = document.getElementById("section2");
const section3 = document.getElementById("section3");

const uploadVideoFile = async () => {
    console.log("(form.js)=> uploadVideoFile function called");
    toggleUploading();
    const url = "/api/v1.0/uploadVideo";

    const formData = new FormData();
    formData.append("video", input.files[0]);

    const options = {
        method: "POST",
        body: formData
    };
    console.log("(form.js)=> API call made to /api/v1.0/uploadVideo");
    const data = await fetch(url, options);
    const response = await data.json();
    console.log("(form.js)=> Received response from API");
    let file = response.filename;
    videoHere.innerHTML = "";
    var source = document.createElement('source');
    source.setAttribute('src', `static/videos/${file}`);
    source.setAttribute('type', `video/${file.split('.')[1]}`);
    videoHere.appendChild(source);
    videoHere.load();
    toggleUploading();
    console.log(`(form.js)=> Video file was successfully uploaded. Returning the filename='${file}'`);
    return {flag: true,filename:file};
}

const toggleUploading = () => {
    if (uploading.style.display === "none") {
        uploading.style.display = "block";
        uploaded.style.display = "none";
        videoHere.style.display = "none";
    } else {
        uploading.style.display = "none";
        uploaded.style.display = "block";
        videoHere.style.display = "block";
    }
}

const toggleUploadFailed = () => {
    if (uploadfailed.style.display === "none") {
        uploadfailed.style.display = "block";
        uploaded.style.display = "none";
        videoHere.style.display = "none";
        uploading.style.display = "none";
    } else {
        uploadfailed.style.display = "none";
        uploading.style.display = "none";
        uploaded.style.display = "block";
        videoHere.style.display = "block";
    }
}

const sampleVideoAnalyze = () => {
    file = "sample-data-virtualization-with-python.mp4"
    videoHere.innerHTML = "";
    var source = document.createElement('source');
    source.setAttribute('src', `static/sample/${file}`);
    source.setAttribute('type', `video/${file.split('.')[1]}`);
    videoHere.appendChild(source);
    videoHere.load();
    videoHere.style.display = "block";
    console.log(`(form.js)=> Sample Video file selected. Returning the filename='${file}'`);
    return file;
}