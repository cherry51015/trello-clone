from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import List

from app.schemas.list import (
    ListCreate,
    ListUpdate,
    ListReorder,
    ListOut
)

from app.services.position import (
    between,
    needs_rebalance,
    rebalance
)


router = APIRouter(
    prefix="/lists",
    tags=["lists"]
)


@router.post("/", response_model=ListOut, status_code=201)
def create_list(
    data: ListCreate,
    db: Session = Depends(get_db)
):
    existing_lists = (
        db.query(List)
        .filter(List.board_id == data.board_id)
        .order_by(List.position)
        .all()
    )

    last_position = (
        existing_lists[-1].position
        if existing_lists
        else None
    )

    position = between(last_position, None)

    new_list = List(
        board_id=data.board_id,
        title=data.title,
        position=position
    )

    db.add(new_list)
    db.commit()
    db.refresh(new_list)

    return new_list


@router.patch("/{list_id}", response_model=ListOut)
def update_list(
    list_id: str,
    data: ListUpdate,
    db: Session = Depends(get_db)
):
    current_list = (
        db.query(List)
        .filter(List.id == list_id)
        .first()
    )

    if not current_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    if data.title is not None:
        current_list.title = data.title

    db.commit()
    db.refresh(current_list)

    return current_list


@router.patch("/{list_id}/reorder", response_model=ListOut)
def reorder_list(
    list_id: str,
    data: ListReorder,
    db: Session = Depends(get_db)
):
    current_list = (
        db.query(List)
        .filter(List.id == list_id)
        .first()
    )

    if not current_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    current_list.position = between(
        data.prev_position,
        data.next_position
    )

    db.commit()

    sibling_lists = (
        db.query(List)
        .filter(List.board_id == current_list.board_id)
        .order_by(List.position)
        .all()
    )

    if needs_rebalance(
        [lst.position for lst in sibling_lists]
    ):
        new_positions = rebalance(len(sibling_lists))

        for lst, position in zip(
            sibling_lists,
            new_positions
        ):
            lst.position = position

        db.commit()

    db.refresh(current_list)

    return current_list


@router.delete("/{list_id}", status_code=204)
def delete_list(
    list_id: str,
    db: Session = Depends(get_db)
):
    current_list = (
        db.query(List)
        .filter(List.id == list_id)
        .first()
    )

    if not current_list:
        raise HTTPException(
            status_code=404,
            detail="List not found"
        )

    db.delete(current_list)
    db.commit()