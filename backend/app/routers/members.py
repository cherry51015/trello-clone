from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Member

from app.schemas.member import MemberOut


router = APIRouter(
    prefix="/members",
    tags=["members"]
)


@router.get("/", response_model=list[MemberOut])
def get_members(
    db: Session = Depends(get_db)
):
    return (
        db.query(Member)
        .order_by(Member.name)
        .all()
    )