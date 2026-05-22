import uuid
from typing import List

from sqlalchemy import (
    String,
    Float,
    ForeignKey,
    Boolean,
    Date,
    Text,
    DateTime,
    func
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.database import Base
from app.models.associations import card_labels, card_members


class Label(Base):
    __tablename__ = "labels"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    color: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    cards: Mapped[List["Card"]] = relationship(
        "Card",
        secondary=card_labels,
        back_populates="labels"
    )


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    list_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("lists.id", ondelete="CASCADE")
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        default=""
    )

    position: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    due_date: Mapped[Date] = mapped_column(
        Date,
        nullable=True
    )

    is_archived: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    list: Mapped["List"] = relationship(
        "List",
        back_populates="cards"
    )

    labels: Mapped[List["Label"]] = relationship(
        "Label",
        secondary=card_labels,
        back_populates="cards",
        uselist=True
    )

    members: Mapped[List["Member"]] = relationship(
        "Member",
        secondary=card_members,
        back_populates="cards",
        uselist=True
    )

    checklists: Mapped[List["Checklist"]] = relationship(
        "Checklist",
        back_populates="card",
        cascade="all, delete-orphan",
        uselist=True
    )


class Checklist(Base):
    __tablename__ = "checklists"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    card_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("cards.id", ondelete="CASCADE")
    )

    title: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    card: Mapped["Card"] = relationship(
        "Card",
        back_populates="checklists"
    )

    items: Mapped[List["ChecklistItem"]] = relationship(
        "ChecklistItem",
        back_populates="checklist",
        cascade="all, delete-orphan",
        order_by="ChecklistItem.position"
    )


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    checklist_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("checklists.id", ondelete="CASCADE")
    )

    text: Mapped[str] = mapped_column(
        String(300),
        nullable=False
    )

    is_done: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    position: Mapped[float] = mapped_column(
        Float,
        default=0
    )

    checklist: Mapped["Checklist"] = relationship(
        "Checklist",
        back_populates="items"
    )