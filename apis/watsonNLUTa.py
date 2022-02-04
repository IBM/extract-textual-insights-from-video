from flask_restful import Resource
import json
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson import ToneAnalyzerV3
from ibm_watson.natural_language_understanding_v1 \
    import Features, EntitiesOptions, KeywordsOptions, \
    SyntaxOptions, SyntaxOptionsTokens, CategoriesOptions, ConceptsOptions
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from flask import request, jsonify
from operator import itemgetter
from wordcloud import WordCloud, STOPWORDS
import matplotlib.pyplot as plt
from datetime import datetime

class WatsonNLUTA(Resource):
    
    NLU_API_KEY_ID = ""
    NLU_URL = ""

    TONE_API_KEY_ID = ""
    TONE_URL = ""

    def __init__(self):
        try:
            with open('naturallanguageunderstanding.json', 'r') as credentialsFile:
                credentials1 = json.loads(credentialsFile.read())

            self.NLU_API_KEY_ID = credentials1.get('apikey')
            self.NLU_URL = credentials1.get('url')

            nlu_authenticator = IAMAuthenticator(self.NLU_API_KEY_ID)
            natural_language_understanding = NaturalLanguageUnderstandingV1(
                version='2021-08-01',
                authenticator=nlu_authenticator
            )
            natural_language_understanding.set_service_url(self.NLU_URL)

            self.natural_language_understanding = natural_language_understanding
        except json.decoder.JSONDecodeError:
            print("Natural Language Understanding credentials file is empty, please enter the credentials and try again.")

        try:    
            with open('toneanalyzer.json', 'r') as credentialsFile:
                credentials2 = json.loads(credentialsFile.read())
            
            self.TONE_API_KEY_ID = credentials2.get('apikey')
            self.TONE_URL = credentials2.get('url')

            tone_analyzer_authenticator = IAMAuthenticator(self.TONE_API_KEY_ID)
            tone_analyzer = ToneAnalyzerV3(
                version='2017-09-21',
                authenticator=tone_analyzer_authenticator
            )
            tone_analyzer.set_service_url(self.TONE_URL)

            self.tone_analyzer = tone_analyzer

        except json.decoder.JSONDecodeError:
            print("Tone Analyzer credentials file is empty, please enter the credentials and try again.")
            

    def get(self):
        pass

    def post(self):
        if request.method == 'POST':
            body = json.loads(request.get_data())
            options = body
            fileName = body.get('filename')
            
            ''' Prepare the text for Analysis'''
            
            with open('static/transcripts/'+fileName, 'r') as text_file:
                text = text_file.read()

            ''' Initialize a return variable '''

            myJsonDict = {}

            ''' Extract Category with NLU '''

            if options.get('category') == "True":
                try:
                    response = self.natural_language_understanding.analyze(
                        language='en',
                        text=text,
                        features=Features(categories=CategoriesOptions(limit=1))).get_result()

                    category = response['categories'][0]

                    myJsonDict.update({"category": category})
                except:
                    myJsonDict.update({"category": "Text too small to extract category"})
            else:
                pass

            ''' Extract Concepts with NLU '''

            if options.get('concepts') == "True":
                try:
                    response = self.natural_language_understanding.analyze(
                        language='en',
                        text=text,
                        features=Features(concepts=ConceptsOptions(limit=3))).get_result()

                    concepts = sorted(response['concepts'],
                                        key=itemgetter('relevance'), reverse=True)

                    myJsonDict.update({"concepts": concepts})
                except:
                    myJsonDict.update({"concepts": "Text too small to extract concepts"})
            else:
                pass

            ''' Extract Entity with NLU '''

            if options.get('entity') == "True":
                try:
                    response = self.natural_language_understanding.analyze(
                        language='en',
                        text=text,
                        features=Features(entities=EntitiesOptions(limit=1))).get_result()

                    entity = sorted(response['entities'],
                                    key=itemgetter('relevance'), reverse=True)

                    myJsonDict.update({"entity": entity[0]})
                except:
                    myJsonDict.update({"entity": "Text too small to extract entity"})
            else:
                pass

            ''' Extract Sentiments and Emotions with NLU '''

            if options.get('sentiments') == "True":
                try:
                    response = self.natural_language_understanding.analyze(
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
                except:
                    myJsonDict.update({"sentiments": "Text too small to extract sentiments"})
            else:
                pass

            ''' Analyse tone to get top 5 positive sentences '''

            if options.get('positiveSentences') == "True":
                tone_analysis = self.tone_analyzer.tone(
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
            try:
                response = self.natural_language_understanding.analyze(
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

                verbsWC = "static/images/verbs"+todayDate+'.png'
                plt.switch_backend('Agg')
                plt.figure(figsize=(5, 5), facecolor=None)
                plt.imshow(wordcloud_verbs)
                plt.axis("off")
                plt.tight_layout(pad=0)
                plt.savefig(verbsWC, title=True)

                nounsAdjWC = "static/images/nouns_adjectives"+todayDate+'.png'
                plt.switch_backend('Agg')
                plt.figure(figsize=(5, 5), facecolor=None)
                plt.imshow(wordcloud_nouns_adj)
                plt.axis("off")
                plt.tight_layout(pad=0)
                plt.savefig(nounsAdjWC, title=True)

                wordclouds = [nounsAdjWC, verbsWC]

                myJsonDict.update({"wordclouds": wordclouds})
            except:
                myJsonDict.update({"wordclouds": "Text too small to extract wordclouds"})
            # print(json.dumps(myJsonDict, indent=2))
            return jsonify(myJsonDict)