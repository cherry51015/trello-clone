import uuid
from typing import List

from sqlalchemy import String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class List(Base):
    __tablename__ = "lists"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    board_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("boards.id", ondelete="CASCADE")
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    position: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    board: Mapped["Board"] = relationship(
        "Board",
        back_populates="lists"
    )

    cards: Mapped[List["Card"]] = relationship(
        "Card",
        back_populates="list",
        order_by="Card.position",
        cascade="all, delete-orphan"
    )
