from flask import Flask, render_template
import os

transcript = ''
filename_converted = ''

app = Flask(__name__)

app.config["VIDEO_UPLOAD"] = "static/raw/"
app.config["AUDIO_UPLOAD"] = "static/audios/"
app.config["TRANSCRIPT_UPLOAD"] = "static/transcripts/"
app.config["NOUNS_ADJECTIVES"] = "static/images/nouns_adjectives"
app.config["VERBS"] = "static/images/verbs"

@app.route('/')
def index():
    return render_template('index.html')

port = os.getenv('VCAP_APP_PORT', '8080')
if __name__ == '__main__':
    from apis import *
    app.secret_key = os.urandom(12)
    app.run(host='0.0.0.0', port=port, debug=True)