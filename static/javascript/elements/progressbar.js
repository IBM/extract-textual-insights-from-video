const addProgressBar = document.getElementById('addProgressBar');

const createList = () => {
    let ul = document.createElement('ul');
    ul.classList.add('bx--progress');
    ul.id = 'progressbar';
    return ul;
}

const createListElement = (id, steptitle, message, status) => {
    let li = document.createElement('li');
    li.classList.add('bx--progress-step');
    li.classList.add(`bx--progress-step--${status}`);
    li.classList.add('bx--progress-step--disabled');
    li.innerHTML = `
        <svg id=${"svg"+id}>
            <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 13c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"></path>
          </svg>
        <p tabindex="0" class="bx--progress-label">
            ${steptitle}
        </p>
        <p class="bx--progress-optional">${message}</p>
        <span class="bx--progress-line"></span>
        `;
    li.id = id;
    return li;
}

const updateListElement = (id, status) => {
    let li = document.getElementById(id);
    li.classList.remove("bx--progress-step--incomplete");
    li.classList.remove("bx--progress-step--disabled");
    let svg = document.getElementById("svg"+id);
    svg.innerHTML = "";

    if (status === "complete") {
    li.classList.add(`bx--progress-step--${status}`);
    svg.innerHTML = `
    <path d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7S11.9,1,8,1z M8,14c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6S11.3,14,8,14z"></path><path d="M7 10.8L4.5 8.3 5.3 7.5 7 9.2 10.7 5.5 11.5 6.3z"></path>
    `;
    } else {
        li.classList.add(`bx--progress-step--${status}`);
        svg.innerHTML = `
        <path d="M 7, 7 m -7, 0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0" ></path>
        `;
    }
}


const createProgressBar = () => {
    deleteProgressBar();
    addProgressBar.appendChild(createList());
    const progressbar = document.getElementById('progressbar');
    progressbar.appendChild(createListElement(1, "Upload", "Extracting audio from video", "incomplete"));
    progressbar.appendChild(createListElement(2, "Extract", "Extracting audio from video", "incomplete"));
    progressbar.appendChild(createListElement(3, "Transcribe", "Transcribing text from audio", "incomplete"));
    progressbar.appendChild(createListElement(4, "Analyze", "Analyzing text to get insights", "incomplete"));
    progressbar.appendChild(createListElement(5, "Done", " ", "incomplete"));
    // setTimeout(() => {
    //     updateListElement(1, "complete");
    //     setTimeout(() => {
    //         updateListElement(2, "complete");
    //         setTimeout(() => {
    //             updateListElement(3, "complete");
    //             setTimeout(() => {
    //                 updateListElement(4, "complete");
    //                 setTimeout(() => {
    //                     updateListElement(5, "complete");
    //                 }, 3000);
    //             }, 3000);
    //         }, 3000);
    //     }, 3000);
        
    // }, 3000);
}

const deleteProgressBar = () => {addProgressBar.innerHTML = "";}