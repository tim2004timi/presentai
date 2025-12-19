import os
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import get_current_user
from src.crud import inputform as inputform_crud
from src.database import get_db
from src.models.user import User
from src.schemas.inputform import (
    InputFormCreate,
    InputFormInDB,
    InputFormUpdate,
    FileUploadResponse,
    InputFormCreateResponse,
)
from src.utils import generate_slides_from_input_form

router = APIRouter(prefix="/inputforms", tags=["Input Forms"])

# Путь к директории static
STATIC_DIR = Path("static")
STATIC_DIR.mkdir(exist_ok=True)


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    summary="Загрузить файл",
    description="Загружает файл в директорию static с UUID именем и возвращает имя файла с расширением",
)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Загрузить файл в static/ с UUID именем"""
    # Получаем расширение файла
    file_extension = Path(file.filename).suffix if file.filename else ""
    
    # Генерируем UUID имя
    file_uuid = str(uuid.uuid4())
    filename = f"{file_uuid}{file_extension}"
    
    # Полный путь к файлу
    file_path = STATIC_DIR / filename
    
    # Сохраняем файл
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )
    
    return FileUploadResponse(filename=filename)


@router.post(
    "",
    response_model=InputFormCreateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать новую форму",
)
async def create_input_form(
    form_create: InputFormCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Создать новую форму ввода и сгенерировать слайды"""
    
    # 1. Валидация наличия файлов
    if form_create.files:
        missing_files = [
            f for f in form_create.files 
            if not (STATIC_DIR / f).exists()
        ]
        if missing_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Файлы не найдены: {', '.join(missing_files)}",
            )
    
    # 2. Создаем запись в БД
    form = await inputform_crud.create_input_form(db, form_create, current_user.id)
    
    # 3. Генерируем слайды через OpenAI
    # Функция сама вернет объект GeneratedSlides или выбросит HTTPException
    generated_slides = await generate_slides_from_input_form(form_create)
    
    # 4. Возвращаем ответ
    # Pydantic сам соберет InputFormCreateResponse из этих объектов
    return InputFormCreateResponse(
        form=InputFormInDB.model_validate(form),
        generated_slides=generated_slides
    )


@router.get(
    "",
    response_model=List[InputFormInDB],
    summary="Получить все формы текущего пользователя",
)
async def get_my_input_forms(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить все формы текущего пользователя"""
    forms = await inputform_crud.get_input_forms_by_user(
        db, current_user.id, skip=skip, limit=limit
    )
    return [InputFormInDB.model_validate(form) for form in forms]


@router.get(
    "/{form_id}",
    response_model=InputFormInDB,
    summary="Получить форму по ID",
)
async def get_input_form(
    form_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить форму по ID (только свои формы)"""
    form = await inputform_crud.get_input_form_by_id(
        db, form_id, user_id=current_user.id
    )
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Input form not found",
        )
    return InputFormInDB.model_validate(form)


@router.put(
    "/{form_id}",
    response_model=InputFormInDB,
    summary="Обновить форму",
)
async def update_input_form(
    form_id: int,
    form_update: InputFormUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Обновить форму (только свои формы)"""
    # Проверяем существование файлов, если они обновляются
    if form_update.files is not None:
        missing_files = []
        for filename in form_update.files:
            file_path = STATIC_DIR / filename
            if not file_path.exists():
                missing_files.append(filename)
        
        if missing_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Файлы не найдены: {', '.join(missing_files)}",
            )
    
    form = await inputform_crud.update_input_form(
        db, form_id, form_update, user_id=current_user.id
    )
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Input form not found",
        )
    return InputFormInDB.model_validate(form)


@router.delete(
    "/{form_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить форму",
)
async def delete_input_form(
    form_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Удалить форму (только свои формы)"""
    success = await inputform_crud.delete_input_form(
        db, form_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Input form not found",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

