FROM python:3.12-slim
WORKDIR /app
COPY ai-service/pyproject.toml ./
RUN pip install --no-cache-dir "fastapi==0.139.2" "uvicorn[standard]==0.35.0" "pydantic-settings==2.10.1"
COPY ai-service/app ./app
EXPOSE 8010
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010"]
