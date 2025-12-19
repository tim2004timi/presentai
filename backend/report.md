# Отчет по API эндпоинтам

BASE_URL: `http://localhost:8000/api`

Все эндпоинты, кроме `/api/auth/token` и `/api/auth/register`, требуют аутентификации через Bearer токен в заголовке `Authorization: Bearer <token>`.

---

## 1. Аутентификация (Auth)

### POST /api/auth/token
**Входные данные:**
- `username` (form-data, string) - логин пользователя
- `password` (form-data, string) - пароль пользователя

**Выходные данные:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "login": "string",
    "is_active": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### POST /api/auth/register
**Входные данные:**
```json
{
  "login": "string",
  "password": "string"
}
```

**Выходные данные:**
```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {
    "login": "string",
    "is_active": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
}
```

---

### GET /api/auth/me
**Входные данные:** нет (требуется аутентификация)

**Выходные данные:**
```json
{
  "id": "integer",
  "login": "string",
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

## 2. Пользователи (Users)

### GET /api/users/me
**Входные данные:** нет (требуется аутентификация)

**Выходные данные:**
```json
{
  "id": "integer",
  "login": "string",
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### PUT /api/users/me
**Входные данные:**
```json
{
  "login": "string (optional)"
}
```

**Выходные данные:**
```json
{
  "id": "integer",
  "login": "string",
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### GET /api/users/{user_id}
**Входные данные:**
- `user_id` (path parameter, integer) - ID пользователя

**Выходные данные:**
```json
{
  "id": "integer",
  "login": "string",
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### GET /api/users
**Входные данные:**
- `skip` (query parameter, integer, default: 0) - количество записей для пропуска
- `limit` (query parameter, integer, default: 100, max: 1000) - количество записей для возврата

**Выходные данные:**
```json
[
  {
    "id": "integer",
    "login": "string",
    "is_active": true,
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

---

## 3. Формы ввода (Input Forms)

### POST /api/inputforms/upload
**Входные данные:**
- `file` (form-data, file) - файл для загрузки

**Выходные данные:**
```json
{
  "filename": "string"
}
```

---

### POST /api/inputforms
**Входные данные:**
```json
{
  "title": "string",
  "text": "string",
  "slides": "integer (должно быть > 0)",
  "files": ["string"]
}
```

**Выходные данные:**
```json
{
  "form": {
    "id": "integer",
    "title": "string",
    "text": "string",
    "slides": "integer",
    "files": ["string"],
    "user_id": "integer",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "generated_slides": {
    "cards": [
      {
        "index": "integer",
        "title": "string",
        "text": "string"
      }
    ]
  }
}
```

---

### GET /api/inputforms
**Входные данные:**
- `skip` (query parameter, integer, default: 0) - количество записей для пропуска
- `limit` (query parameter, integer, default: 100) - количество записей для возврата

**Выходные данные:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "text": "string",
    "slides": "integer",
    "files": ["string"],
    "user_id": "integer",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

---

### GET /api/inputforms/{form_id}
**Входные данные:**
- `form_id` (path parameter, integer) - ID формы

**Выходные данные:**
```json
{
  "id": "integer",
  "title": "string",
  "text": "string",
  "slides": "integer",
  "files": ["string"],
  "user_id": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### PUT /api/inputforms/{form_id}
**Входные данные:**
- `form_id` (path parameter, integer) - ID формы
- Body:
```json
{
  "title": "string (optional)",
  "text": "string (optional)",
  "slides": "integer (optional, должно быть > 0)",
  "files": ["string"] (optional)
}
```

**Выходные данные:**
```json
{
  "id": "integer",
  "title": "string",
  "text": "string",
  "slides": "integer",
  "files": ["string"],
  "user_id": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### DELETE /api/inputforms/{form_id}
**Входные данные:**
- `form_id` (path parameter, integer) - ID формы

**Выходные данные:**
- Статус: 204 No Content
- Тело ответа: пустое

---

## 4. Списки карточек (Card Lists)

### POST /api/cardlists/create_card_list
**Входные данные:**
```json
{
  "inputform_id": "integer",
  "title": "string",
  "cards": [
    {
      "index": "integer",
      "title": "string",
      "text": "string"
    }
  ]
}
```

**Выходные данные:**
```json
{
  "id": "integer",
  "inputform_id": "integer",
  "title": "string",
  "created_at": "datetime",
  "presentation": {
    "id": "integer",
    "filename": "string",
    "title": "string",
    "user_id": "integer",
    "card_list_id": "integer",
    "created_at": "datetime"
  }
}
```

---

### GET /api/cardlists/{card_list_id}
**Входные данные:**
- `card_list_id` (path parameter, integer) - ID списка карточек

**Выходные данные:**
```json
{
  "id": "integer",
  "inputform_id": "integer",
  "title": "string",
  "created_at": "datetime",
  "cards": [
    {
      "id": "integer",
      "card_list_id": "integer",
      "index": "integer",
      "title": "string",
      "text": "string"
    }
  ]
}
```

---

### GET /api/cardlists/inputform/{inputform_id}
**Входные данные:**
- `inputform_id` (path parameter, integer) - ID формы

**Выходные данные:**
```json
[
  {
    "id": "integer",
    "inputform_id": "integer",
    "title": "string",
    "created_at": "datetime",
    "cards": [
      {
        "id": "integer",
        "card_list_id": "integer",
        "index": "integer",
        "title": "string",
        "text": "string"
      }
    ]
  }
]
```

---

## 5. Презентации (Presentations)

### GET /api/presentations/file/{filename}
**Входные данные:**
- `filename` (path parameter, string) - имя файла с расширением (например: `uuid.pptx` или `uuid.pdf`)

**Выходные данные:**
- Файл (PPTX или PDF)
- Content-Type: `application/vnd.openxmlformats-officedocument.presentationml.presentation` (для .pptx) или `application/pdf` (для .pdf)

---

### GET /api/presentations/{presentation_id}
**Входные данные:**
- `presentation_id` (path parameter, integer) - ID презентации

**Выходные данные:**
```json
{
  "id": "integer",
  "filename": "string",
  "title": "string",
  "user_id": "integer",
  "card_list_id": "integer",
  "created_at": "datetime"
}
```

---

### GET /api/presentations
**Входные данные:**
- `skip` (query parameter, integer, default: 0) - количество записей для пропуска
- `limit` (query parameter, integer, default: 100) - количество записей для возврата

**Выходные данные:**
```json
[
  {
    "id": "integer",
    "filename": "string",
    "title": "string",
    "user_id": "integer",
    "card_list_id": "integer",
    "created_at": "datetime"
  }
]
```

---

## Примечания

- Все даты возвращаются в формате ISO 8601 (datetime)
- Все эндпоинты, кроме `/api/auth/token` и `/api/auth/register`, требуют Bearer токен в заголовке `Authorization`
- Пользователи могут работать только со своими данными (проверка прав доступа выполняется автоматически)
- При создании формы (`POST /api/inputforms`) автоматически генерируются слайды через OpenAI
- При создании списка карточек (`POST /api/cardlists/create_card_list`) автоматически создается презентация (PPTX и PDF)

