FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr (better for docker logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

# Install requirements first (better layer caching — only re-runs pip install if requirements.txt changes)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# NOTE: No app config (DATABASE_URL, SECRET_KEY, SMTP_*, etc.) is set here on purpose.
# Secrets/config do not belong baked into the image — they're injected at runtime by
# whatever is running the container (docker-compose env_file, Docker/K8s secrets,
# a cloud secrets manager, etc). Pydantic BaseSettings will read them from the
# container's environment automatically. See docker-compose.yml / .env.example.

EXPOSE 8000

# No --reload in production images; use it only by overriding CMD for local dev.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]