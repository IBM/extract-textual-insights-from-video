# Use speech-to-text, advanced NLP and tone analyzer to extract textual insights from a given video

This Code Pattern is part of the series [Extracting Textual Insights from Videos with IBM Watson]()

Part of the World Health Organization's guidance on limiting further spread of COVID-19 is to practice social distancing. As a result, Companies in most affected areas are taking precautionary measures by encouraging Work from Home and Educational Institutes are closing their facilities. Employees working from home must be aware of the happenings in their company and need to collaborate with their team, students at home must be up to date with their education.

With the help of Technology, employees can continue to collaborate and be involved into their work with Virtual Meetings, Schools and teachers can continue to engage with their students through Virtual Classrooms.

In this code pattern, Given a video recording of the virtual meeting or a virtual classroom, we extract the audio from the video, transcribe the audio into text,  and extract insights from the text.

When you have completed this code pattern, you will understand how to:

* Use Watson Speech to Text service to convert the human voice into the written word.
* Use advanced NLP to analyze text and extract meta-data from content such as concepts, entities, keywords, categories, sentiment and emotion.
* Leverage Tone Analyzer's cognitive linguistic analysis to identify a variety of tones at both the sentence and document level.

<!--add an image in this path-->
![architecture](doc/source/images/architecture.png)

<!--Optionally, add flow steps based on the architecture diagram-->
## Flow

1. User uploads recorded video file of the virtual meeting or a virtual classroom in the application.

2. FFMPG Library extracts audio from the video file.

3. Watson Speech To Text transcribes the audio to give a diarized textual output.

4. Watson Language Translator (Optionally) translates other languages into English transcript.

5. Watson Tone Analyzer analyses the transcript and picks up top positive statements form the transcript.

6. Watson Natural Language Understanding reads the transcript to identify key pointers from the transcript and get the sentiments and emotions.

7. The key pointers and summary of the video is then presented to the user in the application.

8. The user can then download the textual insights.

<!--Optionally, update this section when the video is created-->
# Watch the Video

coming soon
<!-- [![video](https://img.youtube.com/vi/zbhDULZGJEE/0.jpg)](https://www.youtube.com/watch?v=zbhDULZGJEE) -->

# Pre-requisites

1. [IBM Cloud](https://cloud.ibm.com) Account

2. [Docker](https://www.docker.com/products/docker-desktop)

3. [Python](https://www.python.org/downloads/release/python-365/)

# Steps

1. [Clone the repo](#1-clone-the-repo)

2. [Add the Credentials to the Application](#2-add-the-credentials-to-the-application)

3. [Deploy the Application](#3-deploy-the-application)

4. [Run the Application](#4-run-the-application)


### 1. Clone the repo

Clone the [`extract-textual-insights-from-video`](https://github.com/IBM/extract-textual-insights-from-video) repo locally. In a terminal, run:

```bash
$ git clone https://github.com/IBM/extract-textual-insights-from-video
```

### 2. Add the Credentials to the Application

- In the repo parent folder, copy the **credentials.json** file created in [first code pattern of the series](https://github.com/IBM/convert-video-to-audio), paste it and rename it as **cloudobjectstorage.json** file. This will connect the application to the same Cloud Object Storage Bucket which was created in the first code pattern of the series.

- In the repo parent folder, copy the **credentials1.json** file created in [second code pattern of the series](https://github.com/IBM/build-custom-stt-model-with-diarization), paste it and rename it as **speechtotext.json** file. This will connect the application to the same Speech-To-Text service which was created in the second code pattern of the series.

- In the repo parent folder, copy the **credentials1.json** file created in [third code pattern of the series](https://github.com/IBM/use-advanced-nlp-and-tone-analyser-to-analyse-speaker-insights), paste it and rename it as **naturallanguageunderstanding.json** file. This will connect the application to the same Natural Language Understanding service which was created in the third code pattern of the series.

- In the repo parent folder, copy the **credentials2.json** file created in [third code pattern of the series](https://github.com/IBM/use-advanced-nlp-and-tone-analyser-to-analyse-speaker-insights), paste it and rename it as **toneanalyser.json** file. This will connect the application to the same Tone Analyzer service which was created in the third code pattern of the series.

### 4. Run the Application

<details><summary><b>With Docker Installed</b></summary>

- change directory to repo parent folder :
    
```bash
$ cd extract-textual-insights-from-video/
```

- Build the **Dockerfile** as follows :

```bash
$ docker image build -t extract-textual-insights-from-video .
```

- once the dockerfile is built run the dockerfile as follows :

```bash
$ docker run -p 8080:8080 extract-textual-insights-from-video
```

- The Application will be available on <http://localhost:8080>

</details>

<details><summary><b>Without Docker </b></summary>

- Install the **FFMPEG** library.

For Mac users run the following command:

```bash
$ brew install ffmpeg
```

Other platform users can refer to the [ffmpeg documentation](https://www.ffmpeg.org/download.html) to install the library.

- Install the python libraries as follows:

    - change directory to repo parent folder
    
    ```bash
    $ cd extract-textual-insights-from-video/
    ```

    - use `python pip` to install the libraries

    ```bash
    $ pip install -r requirements.txt
    ```

- Finally run the application as follows:

```bash
$ python app.py
```

- The Application will be available on <http://localhost:8080>

</details>

### 5. Run the Application

- Visit  <http://localhost:8080> on your browser to run the application.



### Summary

We have seen how to extract audio from video files and store the result in Cloud Object Storage. In the [next code pattern of the series](https://github.com/IBM/build-custom-stt-model-with-diarization) we will learn how to train a custom Speech to Text model to transcribe the text from the extracted audio files.


<!-- keep this -->
## License

This code pattern is licensed under the Apache License, Version 2. Separate third-party code objects invoked within this code pattern are licensed by their respective providers pursuant to their own separate licenses. Contributions are subject to the [Developer Certificate of Origin, Version 1.1](https://developercertificate.org/) and the [Apache License, Version 2](https://www.apache.org/licenses/LICENSE-2.0.txt).

[Apache License FAQ](https://www.apache.org/foundation/license-faq.html#WhatDoesItMEAN)
