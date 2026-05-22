from datetime import date

from fastapi import APIRouter, Depends, Query

from sqlalchemy.orm import (
    Session,
    selectinload
)

from app.database import get_db

from app.models import (
    Card,
    Label,
    Member
)

from app.models.card import Checklist

from app.schemas.card import CardOut


router = APIRouter(
    prefix="/search",
    tags=["search"]
)


@router.get("/cards", response_model=list[CardOut])
def search_cards(
    q: str | None = Query(None),
    label_id: str | None = Query(None),
    member_id: str | None = Query(None),
    due_before: date | None = Query(None),
    due_after: date | None = Query(None),
    db: Session = Depends(get_db)
):
    query = (
        db.query(Card)
        .options(
            selectinload(Card.labels),
            selectinload(Card.members),
            selectinload(Card.checklists)
            .selectinload(Checklist.items)
        )
        .filter(Card.is_archived.is_(False))
    )

    if q:
        query = query.filter(
            Card.title.ilike(f"%{q}%")
        )

    if label_id:
        query = query.filter(
            Card.labels.any(Label.id == label_id)
        )

    if member_id:
        query = query.filter(
            Card.members.any(Member.id == member_id)
        )

    if due_before:
        query = query.filter(
            Card.due_date <= due_before
        )

    if due_after:
        query = query.filter(
            Card.due_date >= due_after
        )

    return (
        query
        .order_by(Card.created_at.desc())
        .limit(50)
        .all()
    )