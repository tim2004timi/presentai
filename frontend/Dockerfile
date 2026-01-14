# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Аргументы для переменных окружения (передаются из docker-compose)
ARG VITE_API_HOST=localhost
ARG VITE_API_PORT=8000

# Устанавливаем переменные окружения для сборки
ENV VITE_API_HOST=${VITE_API_HOST}
ENV VITE_API_PORT=${VITE_API_PORT}

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем остальные файлы проекта
COPY . .

# Собираем проект (переменные VITE_* будут встроены в код)
RUN npm run build

# Открываем порт 8080
EXPOSE 8080

# Запускаем preview сервер на порту 8080
CMD ["npm", "run", "preview", "--", "--host", "--port", "8080"]

