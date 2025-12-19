from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from src.models.base import Base


class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255), nullable=False, unique=True, index=True)  # UUID без расширения
    title = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_list_id = Column(Integer, ForeignKey("card_lists.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", backref="presentations")
    card_list = relationship("CardList", backref="presentations")

    def __repr__(self):
        return f"<Presentation(id={self.id}, filename={self.filename}, title={self.title})>"

