from datetime import datetime

from pydantic import BaseModel

from app.schemas.card import CardOut


class ListCreate(BaseModel):
    title: str
    board_id: str


class ListUpdate(BaseModel):
    title: str | None = None


class ListReorder(BaseModel):
    prev_position: float | None = None
    next_position: float | None = None


class ListOut(BaseModel):
    id: str
    board_id: str
    title: str
    position: float
    created_at: datetime

    cards: list[CardOut] = []

    model_config = {
        "from_attributes": True
    }