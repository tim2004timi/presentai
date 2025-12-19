from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from src.models.base import Base


class CardList(Base):
    __tablename__ = "card_lists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inputform_id = Column(Integer, ForeignKey("input_forms.id"), nullable=False)
    title = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    input_form = relationship("InputForm", backref="card_lists")
    cards = relationship("Card", back_populates="card_list", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<CardList(id={self.id}, inputform_id={self.inputform_id}, title={self.title})>"


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    card_list_id = Column(Integer, ForeignKey("card_lists.id"), nullable=False)
    index = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    text = Column(String, nullable=False)

    # Relationships
    card_list = relationship("CardList", back_populates="cards")

    def __repr__(self):
        return f"<Card(id={self.id}, card_list_id={self.card_list_id}, index={self.index}, title={self.title})>"
