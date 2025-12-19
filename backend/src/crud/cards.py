from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional
from src.models.cards import CardList, Card
from src.schemas.cards import CardListCreate, CardCreate


async def get_card_list_by_id(
    db: AsyncSession,
    card_list_id: int
) -> Optional[CardList]:
    """Получить список карточек по ID с загрузкой карточек"""
    result = await db.execute(
        select(CardList)
        .options(selectinload(CardList.cards))
        .where(CardList.id == card_list_id)
    )
    return result.scalar_one_or_none()


async def get_card_lists_by_inputform(
    db: AsyncSession,
    inputform_id: int
) -> List[CardList]:
    """Получить все списки карточек для формы с загрузкой карточек"""
    result = await db.execute(
        select(CardList)
        .options(selectinload(CardList.cards))
        .where(CardList.inputform_id == inputform_id)
        .order_by(CardList.created_at.desc())
    )
    return result.scalars().all()


async def create_card_list(
    db: AsyncSession,
    card_list_create: CardListCreate
) -> CardList:
    """Создать новый список карточек с карточками"""
    # Создаем CardList
    db_card_list = CardList(
        inputform_id=card_list_create.inputform_id,
        title=card_list_create.title,
    )
    db.add(db_card_list)
    await db.flush()  # Получаем ID для CardList
    
    # Создаем карточки
    for card_create in card_list_create.cards:
        db_card = Card(
            card_list_id=db_card_list.id,
            index=card_create.index,
            title=card_create.title,
            text=card_create.text,
        )
        db.add(db_card)
    
    await db.commit()
    # Перезагружаем с карточками
    await db.refresh(db_card_list)
    # Явно загружаем карточки
    result = await db.execute(
        select(CardList)
        .options(selectinload(CardList.cards))
        .where(CardList.id == db_card_list.id)
    )
    return result.scalar_one()


async def delete_card_list(
    db: AsyncSession,
    card_list_id: int
) -> bool:
    """Удалить список карточек (каскадно удалит все карточки)"""
    card_list = await get_card_list_by_id(db, card_list_id)
    if not card_list:
        return False
    
    await db.delete(card_list)
    await db.commit()
    return True

