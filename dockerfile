FROM ubuntu:16.04

LABEL maintainer="Manoj Jahgirdar <manoj.jahgirdar@in.ibm.com>"

RUN apt-get update
RUN apt-get --assume-yes install ffmpeg
RUN apt-get install -y python3 python3-dev python3-pip

COPY ./ ./app
WORKDIR ./app

RUN python3 -m pip install pip --upgrade
RUN python3 -m pip install wheel

RUN pip3 install -r requirements.txt

CMD python3 app.py
