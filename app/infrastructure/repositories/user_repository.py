from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update as sqlalchemy_update
from uuid import UUID

from app.domain.interfaces import IUserRepository
from app.domain import User as DomainUser
from app.infrastructure.persistence.models import User as ORMUser

class UserRepository(IUserRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_domain(self, orm_user: ORMUser) -> DomainUser:
        return DomainUser(
            id=UUID(orm_user.id),
            email=orm_user.email,
            password_hash=orm_user.password_hash,
            is_active=orm_user.is_active,
            verification_token=orm_user.verification_token,
            created_at=orm_user.created_at,
            updated_at=orm_user.updated_at
        )

    async def get_by_email(self, email: str) -> Optional[DomainUser]:
        result = await self.db.execute(select(ORMUser).filter(ORMUser.email == email))
        orm_user = result.scalars().first()
        return self._to_domain(orm_user) if orm_user else None

    async def get_by_id(self, user_id: UUID) -> Optional[DomainUser]:
        result = await self.db.execute(select(ORMUser).filter(ORMUser.id == str(user_id)))
        orm_user = result.scalars().first()
        return self._to_domain(orm_user) if orm_user else None

    async def get_by_token(self, token: str) -> Optional[DomainUser]:
        result = await self.db.execute(select(ORMUser).filter(ORMUser.verification_token == token))
        orm_user = result.scalars().first()
        return self._to_domain(orm_user) if orm_user else None

    async def create(self, user: DomainUser) -> DomainUser:
        orm_user = ORMUser(
            id=str(user.id),
            email=user.email,
            password_hash=user.password_hash,
            is_active=user.is_active,
            verification_token=user.verification_token,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
        self.db.add(orm_user)
        await self.db.commit()
        await self.db.refresh(orm_user)
        return self._to_domain(orm_user)

    async def update(self, user: DomainUser) -> DomainUser:
        await self.db.execute(
            sqlalchemy_update(ORMUser)
            .where(ORMUser.id == str(user.id))
            .values(
                is_active=user.is_active,
                verification_token=user.verification_token,
                updated_at=user.updated_at
            )
        )
        await self.db.commit()
        return user
