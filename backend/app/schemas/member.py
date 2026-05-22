from pydantic import BaseModel


class MemberOut(BaseModel):
    id: str
    name: str
    email: str
    avatar_color: str

    model_config = {
        "from_attributes": True
    }