from datetime import datetime

from pydantic import BaseModel

from app.schemas.list import ListOut


class BoardCreate(BaseModel):
    title: str
    bg_color: str = "#1d2125"


class BoardUpdate(BaseModel):
    title: str | None = None
    bg_color: str | None = None


class BoardDetailOut(BaseModel):
    id: str
    title: str
    bg_color: str
    created_at: datetime

    lists: list[ListOut] = []

    model_config = {
        "from_attributes": True
    }


class BoardOut(BaseModel):
    id: str
    title: str
    bg_color: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }