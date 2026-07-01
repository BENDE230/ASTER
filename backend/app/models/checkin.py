from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    feeling = Column(String, nullable=False)
    calm_score = Column(Integer, nullable=True)  # 1-10
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="checkins")
