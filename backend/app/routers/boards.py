from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Board, List, Card, Checklist

from app.schemas.board import (
    BoardCreate,
    BoardUpdate,
    BoardOut,
    BoardDetailOut
)


router = APIRouter(
    prefix="/boards",
    tags=["boards"]
)


@router.get("/", response_model=list[BoardOut])
def get_boards(db: Session = Depends(get_db)):
    return (
        db.query(Board)
        .order_by(Board.created_at)
        .all()
    )


@router.post("/", response_model=BoardOut, status_code=201)
def create_board(
    data: BoardCreate,
    db: Session = Depends(get_db)
):
    board = Board(
        title=data.title,
        bg_color=data.bg_color
    )

    db.add(board)
    db.commit()
    db.refresh(board)

    return board


@router.get("/{board_id}", response_model=BoardDetailOut)
def get_board(
    board_id: str,
    db: Session = Depends(get_db)
):
    board = (
        db.query(Board)
        .options(
            selectinload(Board.lists)
            .selectinload(List.cards)
            .selectinload(Card.labels),

            selectinload(Board.lists)
            .selectinload(List.cards)
            .selectinload(Card.members),

            selectinload(Board.lists)
            .selectinload(List.cards)
            .selectinload(Card.checklists)
            .selectinload(Checklist.items),
        )
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    return board


@router.patch("/{board_id}", response_model=BoardOut)
def update_board(
    board_id: str,
    data: BoardUpdate,
    db: Session = Depends(get_db)
):
    board = (
        db.query(Board)
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    if data.title is not None:
        board.title = data.title

    if data.bg_color is not None:
        board.bg_color = data.bg_color

    db.commit()
    db.refresh(board)

    return board


@router.delete("/{board_id}", status_code=204)
def delete_board(
    board_id: str,
    db: Session = Depends(get_db)
):
    board = (
        db.query(Board)
        .filter(Board.id == board_id)
        .first()
    )

    if not board:
        raise HTTPException(
            status_code=404,
            detail="Board not found"
        )

    db.delete(board)
    db.commit()