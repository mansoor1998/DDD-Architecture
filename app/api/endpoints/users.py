from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.schemas import User as UserSchema
from app.domain.models import User as DomainUser

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: DomainUser = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user
