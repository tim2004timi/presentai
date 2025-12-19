from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from src.models.inputform import InputForm
from src.schemas.inputform import InputFormCreate, InputFormUpdate


async def get_input_form_by_id(
    db: AsyncSession, 
    form_id: int, 
    user_id: Optional[int] = None
) -> Optional[InputForm]:
    """Получить форму по ID, опционально с фильтром по user_id"""
    query = select(InputForm).where(InputForm.id == form_id)
    if user_id is not None:
        query = query.where(InputForm.user_id == user_id)
    
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_input_forms_by_user(
    db: AsyncSession, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[InputForm]:
    """Получить все формы пользователя"""
    result = await db.execute(
        select(InputForm)
        .where(InputForm.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(InputForm.created_at.desc())
    )
    return result.scalars().all()


async def get_all_input_forms(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 100
) -> List[InputForm]:
    """Получить все формы"""
    result = await db.execute(
        select(InputForm)
        .offset(skip)
        .limit(limit)
        .order_by(InputForm.created_at.desc())
    )
    return result.scalars().all()


async def create_input_form(
    db: AsyncSession, 
    form_create: InputFormCreate, 
    user_id: int
) -> InputForm:
    """Создать новую форму"""
    db_form = InputForm(
        title=form_create.title,
        text=form_create.text,
        slides=form_create.slides,
        files=form_create.files,
        user_id=user_id,
    )
    db.add(db_form)
    await db.commit()
    await db.refresh(db_form)
    return db_form


async def update_input_form(
    db: AsyncSession, 
    form_id: int, 
    form_update: InputFormUpdate, 
    user_id: Optional[int] = None
) -> Optional[InputForm]:
    """Обновить форму"""
    form = await get_input_form_by_id(db, form_id, user_id)
    if not form:
        return None
    
    update_data = form_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(form, field):
            setattr(form, field, value)
    
    await db.commit()
    await db.refresh(form)
    return form


async def delete_input_form(
    db: AsyncSession, 
    form_id: int, 
    user_id: Optional[int] = None
) -> bool:
    """Удалить форму"""
    form = await get_input_form_by_id(db, form_id, user_id)
    if not form:
        return False
    
    await db.delete(form)
    await db.commit()
    return True

