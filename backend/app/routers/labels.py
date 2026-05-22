from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Label
from app.schemas.card import LabelOut

router = APIRouter(
    prefix="/labels",
    tags=["labels"]
)


@router.get("/", response_model=list[LabelOut])
def get_labels(
    db: Session = Depends(get_db)
):
    return (
        db.query(Label)
        .order_by(Label.name)
        .all()
    )
