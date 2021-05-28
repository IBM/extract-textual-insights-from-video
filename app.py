from flask import Flask, flash, request, redirect, url_for, render_template, jsonify
from werkzeug.utils import secure_filename
import os
import json
import pipes
import requests
import math
import matplotlib.pyplot as plt
from datetime import datetime
import time
from ibm_watson import SpeechToTextV1
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 \
    import Features, EntitiesOptions, KeywordsOptions, \
    SyntaxOptions, SyntaxOptionsTokens, CategoriesOptions, ConceptsOptions, \
    EmotionOptions, RelationsOptions, SemanticRolesOptions
from ibm_watson import ToneAnalyzerV3
from operator import itemgetter
from wordcloud import WordCloud, STOPWORDS
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from ibm_watson.websocket import RecognizeCallback, AudioSource
from moviepy.editor import VideoFileClip

''' Initialize Flask Variables '''

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'mp4','mov'}
app.config["VIDEO_UPLOAD"] = "static/raw/"
app.config["AUDIO_UPLOAD"] = "static/audios/"
app.config["TRANSCRIPT_UPLOAD"] = "static/transcripts/"
app.config["NOUNS_ADJECTIVES"] = "static/images/nouns_adjectives"
app.config["VERBS"] = "static/images/verbs"

''' Initialize other constants for STT '''

# Constants for Speech-To-Text values
STT_API_KEY_ID = ""
STT_URL = ""
language_customization_id = ""
acoustic_customization_id = ""

transcript = ''
filename_converted = ''

# Constants for NLU & Tone Analyzer values
NLU_API_KEY_ID = ""
NLU_URL = ""
TONE_API_KEY_ID = ""
TONE_URL = ""

SttModel = None
NluOptions = None
liteVersion = False

''' Methods for IBM Watson Speech-To-Text '''

with open('speechtotext.json', 'r') as credentialsFile:
    credentials1 = json.loads(credentialsFile.read())

STT_API_KEY_ID = credentials1.get('apikey')
STT_URL = credentials1.get('url')
STT_language_model = "Earnings call language model"
STT_acoustic_model = "Earnings call acoustic model"

authenticator = IAMAuthenticator(STT_API_KEY_ID)
speech_to_text = SpeechToTextV1(
    authenticator=authenticator
)
speech_to_text.set_service_url(STT_URL)

try:
    language_models = speech_to_text.list_language_models().get_result()
    model = language_models["customizations"]
    for i in model:
        if i["name"] == STT_language_model:
            language_customization_id = i["customization_id"]
except:
    liteVersion = True

try:
    acoustic_models = speech_to_text.list_acoustic_models().get_result()
    model = acoustic_models["customizations"]
    for i in model:
        if i["name"] == STT_acoustic_model:
            acoustic_customization_id = i["customization_id"]
except:
    liteVersion = True

@app.route('/initSTT')
def initSTT():
    models = []
    flag1 = False
    flag2 = False
    try:
        if liteVersion:
            respo = {"message": "Using Lite Version of STT"}
        else:
            language_models = speech_to_text.list_language_models().get_result()
            acoustic_models = speech_to_text.list_acoustic_models().get_result()

            language_model = language_models["customizations"]
            acoustic_model = acoustic_models["customizations"]

            for name in language_model:
                if name["name"] == STT_language_model:
                    flag1 = True
                    break

            for name in acoustic_model:
                if name["name"] == STT_acoustic_model:
                    flag2 = True
                    break

            if not flag1:
                respo = {"message": "Language Model \"" +
                        STT_language_model + "\" Does not exist!"}
            else:
                respo = {"message": "Language Model \"" +
                        STT_language_model + "\" found!"}

            if not flag2:
                respo = {"message": "Acoustic Model \"" +
                        STT_language_model + "\" Does not exist!"}
            else:
                respo = {"message": "Acoustic Model \"" +
                        STT_acoustic_model + "\" found!"}

    except ClientError as be:
        respo = {"message": "CLIENT ERROR: {0}\n".format(be)}
    except Exception as e:
        respo = {"message": " {0}".format(e)}

    return json.dumps(respo, indent=2)


''' Methods for IBM Watson Natural Language Understanding '''

with open('naturallanguageunderstanding.json', 'r') as credentialsFile:
    credentials1 = json.loads(credentialsFile.read())

NLU_API_KEY_ID = credentials1.get('apikey')
NLU_URL = credentials1.get('url')

nlu_authenticator = IAMAuthenticator(NLU_API_KEY_ID)
natural_language_understanding = NaturalLanguageUnderstandingV1(
    version='2019-07-12',
    authenticator=nlu_authenticator
)

natural_language_understanding.set_service_url(NLU_URL)

''' Methods for IBM Watson Tone Analyser '''

with open('toneanalyzer.json', 'r') as credentialsFile:
    credentials2 = json.loads(credentialsFile.read())

TONE_API_KEY_ID = credentials2.get('apikey')
TONE_URL = credentials2.get('url')

tone_analyzer_authenticator = IAMAuthenticator(TONE_API_KEY_ID)

tone_analyzer = ToneAnalyzerV3(
    version='2017-09-21',
    authenticator=tone_analyzer_authenticator
)

tone_analyzer.set_service_url(TONE_URL)


''' Method to handle POST upload '''

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploader', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        print(request.form)
        # check if the post request has the file part
        if 'video' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['video']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename_converted = secure_filename(file.filename.replace(
                " ", "-").replace("'", "").lower())
            file.save(os.path.join(app.config['VIDEO_UPLOAD'], filename_converted))
            print("FILE SAVED!")
        
        '''Get the Nlu Options from Client'''

        global NluOptions
        nluopt = request.form
        NluOptions = json.loads(nluopt['NluOptions'])
        print(NluOptions)
        '''Get the Stt Options from Client'''

        global SttModel
        sttopt = request.form
        SttModel = json.loads(sttopt['SttModel'])
        print(SttModel)

        return json.dumps({"flag": 1})
    return json.dumps({"flag": 1})

def uploader():
    try:
        if request.method == 'POST':

            '''Get the Video from Client'''

            f = request.files["video"]

            filename_converted = f.filename.replace(
                " ", "-").replace("'", "").lower()
            # cmd = 'rm -r static/raw/*'
            # os.system(cmd)
            f.save(os.path.join(
                app.config["VIDEO_UPLOAD"], secure_filename(filename_converted)))

        # print(json.dumps(SttModel, indent=2))
        # print(json.dumps(NluOptions, indent=2))
        myResponse = {"flag": 1}

    except Exception as e:
        print("Unable {0}".format(e))
        myResponse = {"flag": 0, "Exception": "{0}".format(e)}

    return json.dumps(myResponse, indent=2)

@app.route('/videoToAudio')
def videoToAudio():
    fileName = request.args['fileName']
    filename_converted = fileName.replace(
        " ", "-").replace("'", "").lower()
    
    try:
        file, file_extension = os.path.splitext(filename_converted)
        file = pipes.quote(file)
        
        # cmd = 'rm -r static/audios/*'
        # os.system(cmd)
        
        # video_to_wav = 'ffmpeg -i ' +app.config['VIDEO_UPLOAD']+ file + file_extension + \
        #     ' -vn -f flac -ab 192000 -vn ' + \
        #     app.config["AUDIO_UPLOAD"] + file + '.flac'
            
        # print(video_to_wav)
        # os.system(video_to_wav)

        videofilepath = app.config['VIDEO_UPLOAD']+ file + file_extension
        audiofilepath = app.config['AUDIO_UPLOAD'] + file + '.mp3'
        video = VideoFileClip(videofilepath)
        audio = video.audio
        audio.write_audiofile(audiofilepath)

        myFlag = {"flag": 1}
    except OSError as err:
        print(str(err))
        myFlag = {"flag": 0, "Exception": str(err)}

    return json.dumps(myFlag, indent=2)


''' Methods to transcribe text with Watson Speech to Text'''


class MyRecognizeCallback(RecognizeCallback):
    def __init__(self):
        RecognizeCallback.__init__(self)

    def on_data(self, data):
        print(json.dumps(data, indent=2))

    def on_error(self, error):
        print('Error received: {0}'.format(error))

    def on_inactivity_timeout(self, error):
        print('Inactivity timeout: {0}'.format(error))


myRecognizeCallback = MyRecognizeCallback()

@app.route('/transcribeAudio', methods=['GET', 'POST'])
def transcribeAudio():
    try:
        modelInfo = SttModel
        fileName = modelInfo["file"].split('.')[0]+'.mp3'
        filename_converted = fileName.replace(
            " ", "-").replace("'", "").lower()
        print("Processing ...\n")
        with open(app.config["AUDIO_UPLOAD"]+filename_converted, 'rb') as audio_file:
            # print(app.config["AUDIO_UPLOAD"]+filename_converted)
            if liteVersion:
                speech_recognition_results = speech_to_text.recognize(
                    audio=audio_file,
                    content_type='audio/mp3',
                    recognize_callback=myRecognizeCallback,
                    model='en-US_BroadbandModel',
                    keywords=['redhat', 'data and AI', 'Linux', 'Kubernetes'],
                    keywords_threshold=0.5,
                    timestamps=True,
                    speaker_labels=True,
                    word_alternatives_threshold=0.9
                ).get_result()
            else:
                speech_recognition_results = speech_to_text.recognize(
                    audio=audio_file,
                    content_type='audio/mp3',
                    recognize_callback=myRecognizeCallback,
                    model='en-US_BroadbandModel',
                    keywords=['redhat', 'data and AI', 'Linux', 'Kubernetes'],
                    keywords_threshold=0.5,
                    customization_id=modelInfo["langModel"],
                    acoustic_customization_id=modelInfo["acoModel"],
                    timestamps=True,
                    speaker_labels=True,
                    word_alternatives_threshold=0.9
                ).get_result()

            global transcript
            transcript = ''
            for chunks in speech_recognition_results['results']:
                if 'alternatives' in chunks.keys():
                    alternatives = chunks['alternatives'][0]
                    if 'transcript' in alternatives:
                        transcript = transcript + \
                            alternatives['transcript']
                        transcript += '\n'
            # print(transcript)

            with open(app.config["TRANSCRIPT_UPLOAD"]+filename_converted.split('.')[0]+'.txt', "w") as text_file:
                text_file.write(transcript.replace("%HESITATION", ""))

            speakerLabels = speech_recognition_results["speaker_labels"]
            print("Done Processing ...\n")
            extractedData = []
            for i in speech_recognition_results["results"]:
                if i["word_alternatives"]:
                    mydict = {'from': i["word_alternatives"][0]["start_time"], 'transcript': i["alternatives"]
                                [0]["transcript"].replace("%HESITATION", ""), 'to': i["word_alternatives"][0]["end_time"]}
                    extractedData.append(mydict)

            finalOutput = []
            finalOutput.append({"filename": filename_converted.split('.')[0] +'.txt'})
            for i in extractedData:
                for j in speakerLabels:
                    if i["from"] == j["from"] and i["to"] == j["to"]:
                        mydictTemp = {"from": i["from"],
                                        "to": i["to"],
                                        "transcript": i["transcript"],
                                        "speaker": j["speaker"],
                                        "confidence": j["confidence"],
                                        "final": j["final"],
                                        }
                        finalOutput.append(mydictTemp)
            print("Done Extracting speakers ...\n")
            return json.dumps(finalOutput, indent=2)

    except Exception as e:
        print("Exception Exception Occured: {0}".format(e))
        return {"Exception": "Exception Occured: {0}".format(e)}


''' Method to analyse text with NLU and Tone Analyser '''


@app.route('/analyseText', methods=['GET', 'POST'])
def analyseText():
    options = NluOptions
    fileName = NluOptions["file"].split('.')[0]+'.txt'
    filename_converted = fileName.replace(
        " ", "-").replace("'", "").lower()
    
    ''' Prepare the text for Analysis'''
    
    with open(app.config["TRANSCRIPT_UPLOAD"]+filename_converted, 'r') as text_file:
        text = text_file.read()
        text = text.replace('%HESITATION', '')

    # print(text)

    ''' Initialize a return variable '''

    myJsonDict = {}

    ''' Extract Category with NLU '''

    if options.get('category') == "True":
        response = natural_language_understanding.analyze(
            language='en',
            text=text,
            features=Features(categories=CategoriesOptions(limit=1))).get_result()

        category = response['categories'][0]

        # Return category ['label'] ['score']
        myJsonDict.update({"category": category})
    else:
        pass

    ''' Extract Concepts with NLU '''

    if options.get('concepts') == "True":
        response = natural_language_understanding.analyze(
            language='en',
            text=text,
            features=Features(concepts=ConceptsOptions(limit=3))).get_result()

        concepts = sorted(response['concepts'],
                            key=itemgetter('relevance'), reverse=True)

        myJsonDict.update({"concepts": concepts})
        # Return concepts ['text'] ['relevence'] ['dbpedia_resource']
    else:
        pass

    ''' Extract Entity with NLU '''

    if options.get('entity') == "True":
        response = natural_language_understanding.analyze(
            language='en',
            text=text,
            features=Features(entities=EntitiesOptions(limit=1))).get_result()

        entity = sorted(response['entities'],
                        key=itemgetter('relevance'), reverse=True)

        myJsonDict.update({"entity": entity[0]})
        # Return entity[0] ['type'] ['text'] ['relevance']
    else:
        pass

    ''' Extract Sentiments and Emotions with NLU '''

    if options.get('sentiments') == "True":
        response = natural_language_understanding.analyze(
            language='en',
            text=text,
            features=Features(keywords=KeywordsOptions(sentiment=True, emotion=True, limit=10))).get_result()

        keywords = sorted(response['keywords'],
                            key=itemgetter('relevance'), reverse=True)

        keywords_sentiments_emotions = []

        for i in keywords:

            keywords_sentiments_emotions_buffer = {
                'keyword': i['text'],
                'sentiment': i['sentiment']['label'],
                'emotion': ''
            }
            maximum = i['emotion']['sadness']
            keywords_sentiments_emotions_buffer['emotion'] = 'sadness'

            if i['emotion']['joy'] > maximum:
                maximum = i['emotion']['joy']
                keywords_sentiments_emotions_buffer['emotion'] = 'joy'

            elif i['emotion']['fear'] > maximum:
                maximum = i['emotion']['fear']
                keywords_sentiments_emotions_buffer['emotion'] = 'fear'

            elif i['emotion']['disgust'] > maximum:
                maximum = i['emotion']['disgust']
                keywords_sentiments_emotions_buffer['emotion'] = 'disguest'

            elif i['emotion']['anger'] > maximum:
                maximum = i['emotion']['anger']
                keywords_sentiments_emotions_buffer['emotion'] = 'anger'

            keywords_sentiments_emotions.append(
                keywords_sentiments_emotions_buffer)

        myJsonDict.update({"sentiments": keywords_sentiments_emotions})
        # Return keywords_sentiments_emotions ['keyword'] ['sentiment'] ['emotion']
    else:
        pass

    ''' Analyse tone to get top 5 positive sentences '''

    if options.get('positiveSentences') == "True":
        tone_analysis = tone_analyzer.tone(
            {'text': text},
            content_type='application/json'
        ).get_result()

        sentences_with_joy = []
        # print(json.dumps(tone_analysis, indent=2))

        try:
            for tone in tone_analysis['sentences_tone']:
                try:
                    if tone['tones'][0]['tone_name'] == "Joy":
                        tempDict = {"sentence_id": tone['sentence_id'],
                                    "text": tone['text'],
                                    "score": tone['tones'][0]['score']}
                        sentences_with_joy.append(tempDict)
                except:
                    continue

            sentences_with_joy = sorted(
                sentences_with_joy, key=itemgetter('score'), reverse=True)

            myJsonDict.update(
                {"positiveSentences": sentences_with_joy[:5]})
        except:
            tempDict = {"sentence_id": '',
                        "text": 'Text file too small to get positive sentences, please try again with a bigger document.',
                        "score": '100'}
            myJsonDict.update(
                {"positiveSentences": [tempDict]})
        # return sentences_with_joy[:5] ['text'] ['score']
    else:
        pass

    ''' Pre-Processing parts of speech to plot Word Cloud '''

    response = natural_language_understanding.analyze(
        language='en',
        text=text,
        features=Features(
            syntax=SyntaxOptions(
                sentences=True,
                tokens=SyntaxOptionsTokens(
                    lemma=True,
                    part_of_speech=True,
                )))).get_result()

    verbs = []
    for i in response['syntax']['tokens']:
        if i['part_of_speech'] == 'VERB':
            verbs.append(i['text'])

    nouns = []
    for i in response['syntax']['tokens']:
        if i['part_of_speech'] == 'NOUN':
            nouns.append(i['text'])

    adj = []
    for i in response['syntax']['tokens']:
        if i['part_of_speech'] == 'ADJ':
            adj.append(i['text'])

    nouns_adjectives = []
    for x in nouns:
        nouns_adjectives.append(x)

    for y in adj:
        nouns_adjectives.append(y)

    comment_words_verbs = ' '
    comment_words_nouns_adj = ' '
    stopwords = set(STOPWORDS)

    for val in verbs:
        val = str(val)
        tokens = val.split()
        for i in range(len(tokens)):
            tokens[i] = tokens[i].lower()
        for words in tokens:
            comment_words_verbs = comment_words_verbs + words + ' '

    for val in nouns_adjectives:
        val = str(val)
        tokens = val.split()
        for i in range(len(tokens)):
            tokens[i] = tokens[i].lower()
        for words in tokens:
            comment_words_nouns_adj = comment_words_nouns_adj + words + ' '

    wordcloud_verbs = WordCloud(width=800, height=800,
                                background_color='white',
                                stopwords=stopwords,
                                min_font_size=10,
                                max_font_size=150,
                                random_state=42).generate(comment_words_verbs)

    wordcloud_nouns_adj = WordCloud(width=800, height=800,
                                    background_color='white',
                                    colormap="Dark2",
                                    stopwords=stopwords,
                                    min_font_size=10,
                                    max_font_size=150,
                                    random_state=42).generate(comment_words_nouns_adj)

    todayDate = datetime.today().strftime('%m-%d-%Y-%s')

    verbsWC = app.config["VERBS"]+todayDate+'.png'
    plt.switch_backend('Agg')
    plt.figure(figsize=(5, 5), facecolor=None)
    plt.imshow(wordcloud_verbs)
    plt.axis("off")
    plt.tight_layout(pad=0)
    plt.title("Verbs")
    plt.savefig(verbsWC, title=True)

    nounsAdjWC = app.config["NOUNS_ADJECTIVES"]+todayDate+'.png'
    plt.switch_backend('Agg')
    plt.figure(figsize=(5, 5), facecolor=None)
    plt.imshow(wordcloud_nouns_adj)
    plt.axis("off")
    plt.tight_layout(pad=0)
    plt.title("Nouns & Adjectives")
    plt.savefig(nounsAdjWC, title=True)

    wordclouds = [nounsAdjWC, verbsWC]

    myJsonDict.update({"wordclouds": wordclouds})
    # print(json.dumps(options, indent=2))
    return jsonify(myJsonDict)


@app.route('/listAcousticModels')
def listAcousticModels():
    try:
        acoustic_models = speech_to_text.list_acoustic_models().get_result()
    except:
        acoustic_models = {"customizations":[{"name": "Lite version", "customization_id": "lite"}]}
    return json.dumps(acoustic_models, indent=2)


@app.route('/listLanguageModels')
def listLanguageModels():
    try:
        language_models = speech_to_text.list_language_models().get_result()
    except:
        language_models = {"customizations":[{"name": "Lite version", "customization_id": "lite"}]}
    return json.dumps(language_models, indent=2)

@app.route('/')
def index():
    return render_template('index.html')


port = os.getenv('VCAP_APP_PORT', '8080')
if __name__ == "__main__":
    app.secret_key = os.urandom(12)
    app.run(debug=True, host='0.0.0.0', port=port)
