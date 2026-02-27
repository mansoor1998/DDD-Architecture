from typing import Optional
from fastapi import HTTPException, status
from app.domain.interfaces import IUserRepository
from app.domain import User as DomainUser
from app.schemas import UserCreate
from app.core import get_password_hash, verify_password

class UserService:
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    async def register_user(self, user_create: UserCreate) -> DomainUser:
        existing_user = await self.user_repository.get_by_email(user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )
        
        hashed_password = get_password_hash(user_create.password)
        # The create method expects a UserCreate schema. We send a new one with the hashed password.
        user_to_create = UserCreate(email=user_create.email, password=hashed_password)

        return await self.user_repository.create(user_to_create)

    async def authenticate_user(self, email: str, password: str) -> Optional[DomainUser]:
        user = await self.user_repository.get_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.password_hash):
            return None
            
        return user
