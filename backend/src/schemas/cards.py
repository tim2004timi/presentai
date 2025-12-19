from datetime import datetime
from typing import List
from pydantic import BaseModel


class CardCreate(BaseModel):
    index: int
    title: str
    text: str


class CardInDB(BaseModel):
    id: int
    card_list_id: int
    index: int
    title: str
    text: str

    class Config:
        from_attributes = True


class CardListCreate(BaseModel):
    inputform_id: int
    title: str
    cards: List[CardCreate]


class CardListInDB(BaseModel):
    id: int
    inputform_id: int
    title: str
    created_at: datetime
    cards: List[CardInDB]

    class Config:
        from_attributes = True



