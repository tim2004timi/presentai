FROM python:3.10-slim

WORKDIR /app

# Устанавливаем системные зависимости, включая LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-liberation \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем переменные окружения для LibreOffice в headless режиме
ENV LIBREOFFICE_HOME=/usr/lib/libreoffice
ENV DISPLAY=:99

# Копируем requirements и устанавливаем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 8000

# Запускаем приложение
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]