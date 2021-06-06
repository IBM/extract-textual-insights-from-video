FROM python:3.7
ENV PYTHONUNBUFFERED 1
RUN apt-get update
RUN apt-get --assume-yes install ffmpeg
RUN mkdir /app
WORKDIR /app
ADD . /app
RUN pip install -r requirements.txt
