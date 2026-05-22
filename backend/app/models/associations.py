from sqlalchemy import Table, Column, ForeignKey, String

from app.database import Base


card_labels = Table(
    "card_labels",
    Base.metadata,
    Column(
        "card_id",
        String,
        ForeignKey("cards.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Column(
        "label_id",
        String,
        ForeignKey("labels.id", ondelete="CASCADE"),
        primary_key=True
    ),
)

card_members = Table(
    "card_members",
    Base.metadata,
    Column(
        "card_id",
        String,
        ForeignKey("cards.id", ondelete="CASCADE"),
        primary_key=True
    ),
    Column(
        "member_id",
        String,
        ForeignKey("members.id", ondelete="CASCADE"),
        primary_key=True
    ),
)