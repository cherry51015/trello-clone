from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session, selectinload

from app.database import get_db

from app.models import Card, Label, Member
from app.models.card import Checklist, ChecklistItem

from app.schemas.card import (
    CardCreate,
    CardUpdate,
    CardReorder,
    CardOut,
    ChecklistCreate,
    ChecklistItemCreate,
    ChecklistItemUpdate
)

from app.services.position import (
    between,
    needs_rebalance,
    rebalance
)

from app.services.ai_service import (
    generate_card_description
)


router = APIRouter(
    prefix="/cards",
    tags=["cards"]
)


def get_card_or_404(card_id: str, db: Session):
    card = (
        db.query(Card)
        .options(
            selectinload(Card.labels),
            selectinload(Card.members),
            selectinload(Card.checklists)
            .selectinload(Checklist.items)
        )
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    return card


@router.post("/", response_model=CardOut, status_code=201)
def create_card(
    data: CardCreate,
    db: Session = Depends(get_db)
):
    position = between(
        data.prev_position,
        data.next_position
    )

    card = Card(
        list_id=data.list_id,
        title=data.title,
        position=position
    )

    db.add(card)
    db.commit()

    return get_card_or_404(card.id, db)


@router.get("/{card_id}", response_model=CardOut)
def get_card(
    card_id: str,
    db: Session = Depends(get_db)
):
    return get_card_or_404(card_id, db)


@router.patch("/{card_id}", response_model=CardOut)
def update_card(
    card_id: str,
    data: CardUpdate,
    db: Session = Depends(get_db)
):
    card = (
        db.query(Card)
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    for field, value in data.model_dump(
        exclude_none=True
    ).items():
        setattr(card, field, value)

    db.commit()

    return get_card_or_404(card_id, db)


@router.patch("/{card_id}/reorder", response_model=CardOut)
def reorder_card(
    card_id: str,
    data: CardReorder,
    db: Session = Depends(get_db)
):
    card = (
        db.query(Card)
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    card.list_id = data.list_id

    card.position = between(
        data.prev_position,
        data.next_position
    )

    db.commit()

    sibling_cards = (
        db.query(Card)
        .filter(Card.list_id == data.list_id)
        .order_by(Card.position)
        .all()
    )

    if needs_rebalance(
        [c.position for c in sibling_cards]
    ):
        new_positions = rebalance(
            len(sibling_cards)
        )

        for current_card, position in zip(
            sibling_cards,
            new_positions
        ):
            current_card.position = position

        db.commit()

    return get_card_or_404(card_id, db)


@router.delete("/{card_id}", status_code=204)
def delete_card(
    card_id: str,
    db: Session = Depends(get_db)
):
    card = (
        db.query(Card)
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    db.delete(card)
    db.commit()


@router.post("/{card_id}/labels/{label_id}",
             response_model=CardOut)
def add_label(
    card_id: str,
    label_id: str,
    db: Session = Depends(get_db)
):
    card = get_card_or_404(card_id, db)

    label = (
        db.query(Label)
        .filter(Label.id == label_id)
        .first()
    )

    if not label:
        raise HTTPException(
            status_code=404,
            detail="Label not found"
        )

    if label not in card.labels:
        card.labels.append(label)

    db.commit()

    return get_card_or_404(card_id, db)


@router.delete("/{card_id}/labels/{label_id}",
               response_model=CardOut)
def remove_label(
    card_id: str,
    label_id: str,
    db: Session = Depends(get_db)
):
    card = get_card_or_404(card_id, db)

    card.labels = [
        label
        for label in card.labels
        if label.id != label_id
    ]

    db.commit()

    return get_card_or_404(card_id, db)


@router.post("/{card_id}/members/{member_id}",
             response_model=CardOut)
def assign_member(
    card_id: str,
    member_id: str,
    db: Session = Depends(get_db)
):
    card = get_card_or_404(card_id, db)

    member = (
        db.query(Member)
        .filter(Member.id == member_id)
        .first()
    )

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    if member not in card.members:
        card.members.append(member)

    db.commit()

    return get_card_or_404(card_id, db)


@router.delete("/{card_id}/members/{member_id}",
               response_model=CardOut)
def remove_member(
    card_id: str,
    member_id: str,
    db: Session = Depends(get_db)
):
    card = get_card_or_404(card_id, db)

    card.members = [
        member
        for member in card.members
        if member.id != member_id
    ]

    db.commit()

    return get_card_or_404(card_id, db)


@router.post("/{card_id}/checklists",
             status_code=201)
def add_checklist(
    card_id: str,
    data: ChecklistCreate,
    db: Session = Depends(get_db)
):
    card = (
        db.query(Card)
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    checklist = Checklist(
        card_id=card_id,
        title=data.title
    )

    db.add(checklist)
    db.commit()

    return get_card_or_404(card_id, db)


@router.post(
    "/{card_id}/checklists/{checklist_id}/items",
    status_code=201
)
def add_checklist_item(
    card_id: str,
    checklist_id: str,
    data: ChecklistItemCreate,
    db: Session = Depends(get_db)
):
    checklist = (
        db.query(Checklist)
        .filter(Checklist.id == checklist_id)
        .first()
    )

    if not checklist:
        raise HTTPException(
            status_code=404,
            detail="Checklist not found"
        )

    item = ChecklistItem(
        checklist_id=checklist_id,
        text=data.text,
        position=float(len(checklist.items) + 1)
    )

    db.add(item)
    db.commit()

    return get_card_or_404(card_id, db)

@router.patch(
    "/{card_id}/checklists/{checklist_id}/items/{item_id}"
)
def update_checklist_item(
    card_id: str,
    checklist_id: str,
    item_id: str,
    data: ChecklistItemUpdate,
    db: Session = Depends(get_db)
):
    item = (
        db.query(ChecklistItem)
        .filter(ChecklistItem.id == item_id)
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Checklist item not found"
        )

    if data.text is not None:
        item.text = data.text

    if data.is_done is not None:
        item.is_done = data.is_done

    db.commit()

    return get_card_or_404(card_id, db)


@router.delete(
    "/{card_id}/checklists/{checklist_id}",
    status_code=204
)
def delete_checklist(
    card_id: str,
    checklist_id: str,
    db: Session = Depends(get_db)
):
    checklist = (
        db.query(Checklist)
        .filter(Checklist.id == checklist_id)
        .first()
    )

    if not checklist:
        raise HTTPException(
            status_code=404,
            detail="Checklist not found"
        )

    db.delete(checklist)
    db.commit()


@router.post("/{card_id}/generate-description")
async def generate_description(
    card_id: str,
    db: Session = Depends(get_db)
):
    card = (
        db.query(Card)
        .filter(Card.id == card_id)
        .first()
    )

    if not card:
        raise HTTPException(
            status_code=404,
            detail="Card not found"
        )

    description = await generate_card_description(
        card.title
    )

    return {
        "description": description
    }