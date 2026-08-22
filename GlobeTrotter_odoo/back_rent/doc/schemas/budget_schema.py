from pydantic import BaseModel

class BudgetBase(BaseModel):
    trip_id: int
    amount: float
    category: str

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    id: int

    class Config:
        from_attributes = True
        orm_mode = True
