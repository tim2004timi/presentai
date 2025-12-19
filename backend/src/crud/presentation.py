from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from src.models.presentation import Presentation
from src.schemas.presentation import PresentationCreate


async def get_presentation_by_id(
    db: AsyncSession,
    presentation_id: int,
    user_id: Optional[int] = None
) -> Optional[Presentation]:
    """Получить презентацию по ID, опционально с фильтром по user_id"""
    query = select(Presentation).where(Presentation.id == presentation_id)
    if user_id is not None:
        query = query.where(Presentation.user_id == user_id)
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_presentation_by_filename(
    db: AsyncSession,
    filename: str
) -> Optional[Presentation]:
    """Получить презентацию по filename (UUID без расширения)"""
    result = await db.execute(
        select(Presentation).where(Presentation.filename == filename)
    )
    return result.scalar_one_or_none()


async def get_presentations_by_user(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Presentation]:
    """Получить все презентации пользователя"""
    result = await db.execute(
        select(Presentation)
        .where(Presentation.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(Presentation.created_at.desc())
    )
    return result.scalars().all()


async def get_presentations_by_card_list(
    db: AsyncSession,
    card_list_id: int
) -> List[Presentation]:
    """Получить все презентации для списка карточек"""
    result = await db.execute(
        select(Presentation)
        .where(Presentation.card_list_id == card_list_id)
        .order_by(Presentation.created_at.desc())
    )
    return result.scalars().all()


async def create_presentation(
    db: AsyncSession,
    presentation_create: PresentationCreate,
    user_id: int
) -> Presentation:
    """Создать новую презентацию"""
    db_presentation = Presentation(
        filename=presentation_create.filename,
        title=presentation_create.title,
        user_id=user_id,
        card_list_id=presentation_create.card_list_id,
    )
    db.add(db_presentation)
    await db.commit()
    await db.refresh(db_presentation)
    return db_presentation


async def delete_presentation(
    db: AsyncSession,
    presentation_id: int,
    user_id: Optional[int] = None
) -> bool:
    """Удалить презентацию"""
    presentation = await get_presentation_by_id(db, presentation_id, user_id)
    if not presentation:
        return False
    
    await db.delete(presentation)
    await db.commit()
    return True

