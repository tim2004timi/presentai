from datetime import datetime
from typing import List
from pydantic import BaseModel


class PresentationBase(BaseModel):
    filename: str
    title: str


class PresentationCreate(BaseModel):
    filename: str
    title: str
    card_list_id: int


class PresentationInDB(PresentationBase):
    id: int
    user_id: int
    card_list_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CardListWithPresentation(BaseModel):
    """Схема для ответа create_card_list с презентацией"""
    id: int
    inputform_id: int
    title: str
    created_at: datetime
    presentation: PresentationInDB

    class Config:
        from_attributes = True

