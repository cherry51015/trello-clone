import uuid
from typing import List

from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.associations import card_members


class Member(Base):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    name: Mapped[str] = mapped_column(
        String(80),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        nullable=False
    )

    avatar_color: Mapped[str] = mapped_column(
        String(20),
        default="#579dff"
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    cards: Mapped[List["Card"]] = relationship(
        "Card",
        secondary=card_members,
        back_populates="members"
    )