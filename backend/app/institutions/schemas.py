<<<<<<< HEAD
from pydantic import BaseModel, ConfigDict
from typing import Optional


class InstitutionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
=======
>>>>>>> f4c3dca878710c3027b416ba91e7275d45219b3f
