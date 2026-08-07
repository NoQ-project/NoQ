from pydantic import BaseModel


class InstitutionResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    address: str
    phone: str | None = None
    email: str
    website: str | None = None

    class Config:
        from_attributes = True