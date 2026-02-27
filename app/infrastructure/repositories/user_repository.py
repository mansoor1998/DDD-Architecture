from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.domain.interfaces import IUserRepository
from app.domain import User as DomainUser
from app.infrastructure.persistence.models import User as ORMUser
from app.schemas import UserCreate

class UserRepository(IUserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[DomainUser]:
        result = await self.db.execute(select(ORMUser).filter(ORMUser.email == email))
        orm_user = result.scalars().first()
        if orm_user:
            return DomainUser(
                id=UUID(orm_user.id),
                email=orm_user.email,
                password_hash=orm_user.password_hash,
                is_active=orm_user.is_active,
                created_at=orm_user.created_at,
                updated_at=orm_user.updated_at
            )
        return None

    async def get_by_id(self, user_id: UUID) -> Optional[DomainUser]:
        result = await self.db.execute(select(ORMUser).filter(ORMUser.id == str(user_id)))
        orm_user = result.scalars().first()
        if orm_user:
            return DomainUser(
                id=UUID(orm_user.id),
                email=orm_user.email,
                password_hash=orm_user.password_hash,
                is_active=orm_user.is_active,
                created_at=orm_user.created_at,
                updated_at=orm_user.updated_at
            )
        return None

    async def create(self, user: UserCreate) -> DomainUser:
        orm_user = ORMUser(
            email=user.email,
            password_hash=user.password # The password should already be hashed by the service
        )
        self.db.add(orm_user)
        await self.db.commit()
        await self.db.refresh(orm_user)
        
        return DomainUser(
            id=UUID(orm_user.id),
            email=orm_user.email,
            password_hash=orm_user.password_hash,
            is_active=orm_user.is_active,
            created_at=orm_user.created_at,
            updated_at=orm_user.updated_at
        )
