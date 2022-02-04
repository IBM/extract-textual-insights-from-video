from flask_restful import Resource
import logging as logger
from flask import request, flash, redirect
import os
import json
from moviepy.editor import VideoFileClip

class VideoUitls(Resource):
    ALLOWED_EXTENSIONS = {'mp4','mov'}
    SttModel = {}

    def __init__(self):
        logger.debug('Inside Video Utils Class')
    
    def get(self):
        ''' Method to handle GET request '''
        
        if "extract" in request.args:
            filename = request.args.get('filename')
            fileformat = '.wav'
            if filename == "error":
                return {"flag": 0}
            elif filename == "sample-data-virtualization-with-python.mp4":
                videofilepath = 'static/sample/' + filename
            else:
                videofilepath = 'static/videos/' + filename
            audiofilepath =  'static/audios/' + filename.split('.')[0] + fileformat
            try:
                video = VideoFileClip(videofilepath)
                audio = video.audio
                rate = video.fps
                audio.write_audiofile(audiofilepath)
                return {"flag": 1, "filename": filename.split('.')[0] + fileformat}
            except Exception as e:
                print(e)
                return {"flag": 0}

    def post(self):
        ''' Method to handle POST upload '''
        if request.method == 'POST':
            if 'video' not in request.files:
                flash('No file part')
                return redirect(request.url)
            file = request.files['video']
            if file.filename == '':
                flash('No selected file')
                return redirect(request.url)
            if file and self.allowed_file(file.filename):
                filename_converted = file.filename.replace(
                    " ", "-").replace("'", "").lower()
                file.save(os.path.join('static/videos/', filename_converted))
                logger.debug("FILE SAVED!")
            
            return {"flag": 1, "filename": filename_converted}

        return {"flag": 0}

    def allowed_file(self, filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS
