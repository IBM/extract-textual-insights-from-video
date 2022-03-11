FROM registry.access.redhat.com/ubi8/python-39:1-27.1645821294

WORKDIR /app

ADD . /app

RUN pip install --trusted-host pypi.python.org -r requirements.txt

EXPOSE 8080

CMD ["python", "-u", "app.py"]
