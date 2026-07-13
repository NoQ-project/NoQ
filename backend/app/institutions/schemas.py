from pydantic import BaseModel, ConfigDict
from typing import Optional


class InstitutionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)