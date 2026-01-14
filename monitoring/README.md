# Мониторинг PresentAI

Эта директория содержит конфигурацию для системы мониторинга на базе Prometheus, Loki и Grafana.

## Структура

- `prometheus/` - конфигурация Prometheus
- `loki/` - конфигурация Loki для сбора логов
- `promtail/` - конфигурация Promtail для отправки логов в Loki
- `grafana/provisioning/` - автоматическая настройка Grafana (datasources и dashboards)
- `grafana/dashboards/` - JSON файлы дашбордов

## Доступ

После запуска docker-compose:

- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Grafana**: http://localhost:3000
  - Логин: `admin`
  - Пароль: `admin` (рекомендуется изменить при первом входе)

## Метрики

Backend автоматически экспортирует метрики на эндпоинте `/metrics`:
- HTTP запросы (количество, длительность, статус коды)
- Время ответа
- Активные соединения
- Метрика `fastapi_app_info` с меткой `app_name=presentai-backend`

## Дашборды

### FastAPI Observability Dashboard

Дашборд `16110_rev4.json` автоматически загружается при запуске Grafana.

**Если дашборд не появился:**

1. Проверьте логи Grafana:
   ```bash
   docker-compose logs grafana
   ```

2. Убедитесь, что файл находится в `monitoring/grafana/dashboards/`

3. Проверьте, что datasources настроены:
   - Configuration → Data Sources
   - Должны быть: Prometheus и Loki

4. Импортируйте дашборд вручную:
   - Dashboards → Import
   - Введите ID: `16110` или загрузите файл `16110_rev4.json`

5. После импорта настройте переменные:
   - Settings → Variables
   - `DS_PROMETHEUS` → выберите datasource "Prometheus"
   - `DS_LOKI` → выберите datasource "Loki"
   - `app_name` → должно автоматически определить "presentai-backend"

## Компоненты

- **Prometheus**: сбор и хранение метрик
- **Loki**: сбор и хранение логов
- **Promtail**: агент для отправки логов из Docker контейнеров в Loki
- **Grafana**: визуализация метрик и логов

