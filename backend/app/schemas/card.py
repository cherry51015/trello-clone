from datetime import datetime, date

from pydantic import BaseModel, field_validator

from app.schemas.member import MemberOut


class LabelOut(BaseModel):
    id: str
    name: str
    color: str

    model_config = {
        "from_attributes": True
    }


class ChecklistItemOut(BaseModel):
    id: str
    text: str
    is_done: bool
    position: float

    model_config = {
        "from_attributes": True
    }


class ChecklistOut(BaseModel):
    id: str
    title: str
    items: list[ChecklistItemOut] = []

    model_config = {
        "from_attributes": True
    }


class CardCreate(BaseModel):
    title: str
    list_id: str

    prev_position: float | None = None
    next_position: float | None = None


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    due_date: date | None = None
    is_archived: bool | None = None


class CardReorder(BaseModel):
    list_id: str

    prev_position: float | None = None
    next_position: float | None = None


class CardOut(BaseModel):
    id: str
    list_id: str
    title: str
    description: str
    position: float

    due_date: date | None
    is_archived: bool

    created_at: datetime

    labels: list[LabelOut] = []
    members: list[MemberOut] = []
    checklists: list[ChecklistOut] = []

    @field_validator("labels", "members", "checklists", mode="before")
    @classmethod
    def _normalize_relations(cls, value):
        if value is None:
            return []
        if isinstance(value, (list, tuple)):
            return list(value)
        return [value]

    model_config = {
        "from_attributes": True
    }


class ChecklistCreate(BaseModel):
    title: str


class ChecklistItemCreate(BaseModel):
    text: str


class ChecklistItemUpdate(BaseModel):
    text: str | None = None
    is_done: bool | None = None