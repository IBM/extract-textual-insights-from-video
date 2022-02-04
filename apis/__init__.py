from flask_restful import Api
from app import app

from .watsonSpeechToText import WatsonSpeechToText
from .videoUtils import VideoUitls
from .watsonNLUTa import WatsonNLUTA

restServer = Api(app)

restServer.add_resource(WatsonSpeechToText, "/api/v1.0/transcribe/<string:model>")
restServer.add_resource(VideoUitls, "/api/v1.0/uploadVideo")
restServer.add_resource(WatsonNLUTA, "/api/v1.0/analyseText")