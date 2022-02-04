const Extractor = async (filename) => {
    console.log("(extractor.js)=> Extractor function called with filename='" + filename + "'");
    let url = `/api/v1.0/uploadVideo?filename=${filename}&extract=True`;
    console.log("(extractor.js)=> API call made to /api/v1.0/uploadVideo");
    const response = await fetch(url, {timeout:false});
    const data = await response.json();
    console.log("(extractor.js)=> Response received from API");
    if (data.flag == 1) {
        console.log("(extractor.js)=> Audio from the video was successfully extracted. Returning the filename='" + data.filename + "'");
        // progressMsg.className = "w3-text-green w3-animate-opacity";
        // progressMsg.innerHTML = "Successfully extracted.";
        return {flag: true,filename:data.filename};
    } else if (data.flag == 0) {
        console.log("[x](extractor.js)=> Failed to extract Audio from the video! Returning the filename='error'");
        return {flag: false,filename:"error"};
    }
};