from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from doc.database import get_db
from doc.models.budget import Budget
from doc.schemas.budget_schema import BudgetCreate, BudgetOut
from doc.utils.security import get_current_user

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.post("/", response_model=BudgetOut)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    new_budget = Budget(**budget.dict())
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget

@router.get("/trip/{trip_id}", response_model=List[BudgetOut])
def get_budgets(trip_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Budget).filter(Budget.trip_id == trip_id).all()
