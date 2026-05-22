import uuid
from typing import List


from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    bg_color: Mapped[str] = mapped_column(
        String(20),
        default="#1d2125"
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    lists: Mapped[List["List"]] = relationship(
        "List",
        back_populates="board",
        order_by="List.position",
        cascade="all, delete-orphan"
    )