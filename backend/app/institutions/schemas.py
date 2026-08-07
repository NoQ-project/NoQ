from pydantic import BaseModel


class InstitutionCreateSchema(BaseModel):
    name: str
    description: str | None = None
    address: str
    phone: str | None = None
    website: str | None = None

class InstitutionUpdateSchema(BaseModel):
    name: str
    description: str | None = None
    address: str
    phone: str | None = None
    website: str | None = None



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


class InstitutionDashboardResponse(BaseModel):
    institution_name: str
    total_queues: int
    active_queues: int
    total_tokens_today: int
    waiting_tokens: int
    called_tokens: int
    served_tokens: int
    missed_tokens: int