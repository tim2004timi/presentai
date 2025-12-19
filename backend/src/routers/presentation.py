from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import get_current_user
from src.crud import presentation as presentation_crud
from src.database import get_db
from src.models.user import User
from src.schemas.presentation import PresentationInDB
from src.utils import STATIC_DIR

router = APIRouter(prefix="/presentations", tags=["Presentations"])


@router.get(
    "/file/{filename}",
    summary="Загрузить файл презентации",
    description="Загружает файл презентации по filename.ext (например, uuid.pptx или uuid.pdf)",
)
async def download_presentation_file(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Загрузить файл презентации (PPTX или PDF)"""
    # Извлекаем UUID без расширения
    file_stem = Path(filename).stem
    
    # Проверяем, что презентация существует и принадлежит пользователю
    presentation = await presentation_crud.get_presentation_by_filename(
        db, file_stem
    )
    if not presentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found",
        )
    
    # Проверяем права доступа
    if presentation.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )
    
    # Проверяем расширение файла
    file_extension = Path(filename).suffix.lower()
    if file_extension not in [".pptx", ".pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension. Only .pptx and .pdf are allowed",
        )
    
    # Формируем путь к файлу
    file_path = STATIC_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found",
        )
    
    # Определяем media type
    media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation" if file_extension == ".pptx" else "application/pdf"
    
    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type,
    )


@router.get(
    "/{presentation_id}",
    response_model=PresentationInDB,
    summary="Получить презентацию по ID",
)
async def get_presentation(
    presentation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить презентацию по ID"""
    presentation = await presentation_crud.get_presentation_by_id(
        db, presentation_id, user_id=current_user.id
    )
    if not presentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found",
        )
    return PresentationInDB.model_validate(presentation)


@router.get(
    "",
    response_model=List[PresentationInDB],
    summary="Получить список презентаций текущего пользователя",
)
async def get_presentations(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить все презентации текущего пользователя"""
    presentations = await presentation_crud.get_presentations_by_user(
        db, current_user.id, skip=skip, limit=limit
    )
    return [PresentationInDB.model_validate(p) for p in presentations]

