from typing import List
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth import get_current_user
from src.crud import cards as cards_crud
from src.crud import inputform as inputform_crud
from src.crud import presentation as presentation_crud
from src.database import get_db
from src.models.user import User
from src.schemas.cards import CardListCreate, CardListInDB
from src.schemas.presentation import PresentationCreate, PresentationInDB, CardListWithPresentation
from src.utils import generate_pptx
from src.schemas.inputform import SlideCard

router = APIRouter(prefix="/cardlists", tags=["Card Lists"])


@router.post(
    "/create_card_list",
    response_model=CardListWithPresentation,
    status_code=status.HTTP_201_CREATED,
    summary="Создать список карточек",
)
async def create_card_list(
    card_list_create: CardListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Создать новый список карточек и презентацию"""
    # Проверяем, что форма существует и принадлежит пользователю
    input_form = await inputform_crud.get_input_form_by_id(
        db, card_list_create.inputform_id, user_id=current_user.id
    )
    if not input_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Input form not found or access denied",
        )
    
    # Создаем список карточек
    card_list = await cards_crud.create_card_list(db, card_list_create)
    
    # Создаем презентацию из карточек
    slide_cards = [
        SlideCard(index=card.index, title=card.title, text=card.text)
        for card in card_list.cards
    ]
    
    # Генерируем PPTX (возвращает filename с расширением .pptx)
    filename_with_ext = generate_pptx(card_list_create.title, slide_cards)
    
    # Извлекаем UUID без расширения
    filename = Path(filename_with_ext).stem
    
    # Создаем запись о презентации в БД
    presentation_create = PresentationCreate(
        filename=filename,
        title=card_list_create.title,
        card_list_id=card_list.id,
    )
    presentation = await presentation_crud.create_presentation(
        db, presentation_create, current_user.id
    )
    
    # Возвращаем CardList с Presentation
    return CardListWithPresentation(
        id=card_list.id,
        inputform_id=card_list.inputform_id,
        title=card_list.title,
        created_at=card_list.created_at,
        presentation=PresentationInDB.model_validate(presentation),
    )


@router.get(
    "/{card_list_id}",
    response_model=CardListInDB,
    summary="Получить список карточек по ID",
)
async def get_card_list(
    card_list_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить список карточек по ID"""
    card_list = await cards_crud.get_card_list_by_id(db, card_list_id)
    if not card_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card list not found",
        )
    
    # Проверяем, что форма принадлежит пользователю
    input_form = await inputform_crud.get_input_form_by_id(
        db, card_list.inputform_id, user_id=current_user.id
    )
    if not input_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card list not found or access denied",
        )
    
    return CardListInDB.model_validate(card_list)


@router.get(
    "/inputform/{inputform_id}",
    response_model=List[CardListInDB],
    summary="Получить все списки карточек для формы",
)
async def get_card_lists_by_inputform(
    inputform_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить все списки карточек для формы"""
    # Проверяем, что форма существует и принадлежит пользователю
    input_form = await inputform_crud.get_input_form_by_id(
        db, inputform_id, user_id=current_user.id
    )
    if not input_form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Input form not found or access denied",
        )
    
    card_lists = await cards_crud.get_card_lists_by_inputform(db, inputform_id)
    return [CardListInDB.model_validate(card_list) for card_list in card_lists]

