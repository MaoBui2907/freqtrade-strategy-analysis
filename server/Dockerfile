
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt

RUN pip install -r requirements.txt

COPY . .

ENV MONGO_CONNECTION_STRING=${MONGO_CONNECTION_STRING}

ENV MONGO_DB_NAME=${MONGO_DB_NAME}

ENV ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

EXPOSE 80

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "80"]