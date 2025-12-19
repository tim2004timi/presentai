from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class InputFormBase(BaseModel):
    title: str
    text: str
    slides: int = Field(gt=0, description="Количество слайдов должно быть больше 0")
    files: List[str] = []


class InputFormCreate(InputFormBase):
    pass


class InputFormUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    slides: Optional[int] = Field(None, gt=0, description="Количество слайдов должно быть больше 0")
    files: Optional[List[str]] = None


class InputFormInDB(InputFormBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    filename: str


class SlideCard(BaseModel):
    index: int
    title: str
    text: str


class GeneratedSlides(BaseModel):
    cards: list[SlideCard]


class InputFormCreateResponse(BaseModel):
    """Ответ при создании формы с результатом генерации слайдов"""
    form: InputFormInDB
    generated_slides: GeneratedSlides

