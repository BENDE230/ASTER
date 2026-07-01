from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    feeling = Column(String, nullable=True)   # Step 1
    duration = Column(String, nullable=True)  # Step 2
    reason = Column(String, nullable=True)    # Step 3

    user = relationship("User", back_populates="onboarding")
