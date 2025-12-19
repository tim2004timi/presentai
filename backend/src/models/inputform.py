from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, ARRAY, CheckConstraint
from sqlalchemy.orm import relationship
from src.models.base import Base


class InputForm(Base):
    __tablename__ = "input_forms"
    __table_args__ = (
        CheckConstraint('slides > 0', name='check_slides_positive'),
    )

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    text = Column(String, nullable=False)
    slides = Column(Integer, nullable=False)
    files = Column(ARRAY(String), nullable=False, default=[])
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship
    user = relationship("User", backref="input_forms")

    def __repr__(self):
        return f"<InputForm(id={self.id}, title={self.title}, user_id={self.user_id})>"

