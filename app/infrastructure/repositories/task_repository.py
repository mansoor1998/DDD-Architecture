from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update as sqlalchemy_update, delete as sqlalchemy_delete
from uuid import UUID

from app.domain.interfaces import ITaskRepository
from app.domain import Task as DomainTask
from app.infrastructure.persistence.models import Task as ORMTask

class TaskRepository(ITaskRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    def _to_domain(self, orm_task: ORMTask) -> DomainTask:
        return DomainTask(
            id=UUID(orm_task.id),
            user_id=UUID(orm_task.user_id),
            title=orm_task.title,
            description=orm_task.description,
            status=orm_task.status,
            priority=orm_task.priority,
            due_date=orm_task.due_date,
            created_at=orm_task.created_at,
            updated_at=orm_task.updated_at,
        )

    async def create(self, task: DomainTask) -> DomainTask:
        orm_task = ORMTask(
            id=str(task.id),
            user_id=str(task.user_id),
            title=task.title,
            description=task.description,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
        self.db.add(orm_task)
        await self.db.commit()
        await self.db.refresh(orm_task)
        return self._to_domain(orm_task)

    async def get_by_id(self, task_id: UUID) -> Optional[DomainTask]:
        result = await self.db.execute(select(ORMTask).filter(ORMTask.id == str(task_id)))
        orm_task = result.scalars().first()
        return self._to_domain(orm_task) if orm_task else None

    async def get_all_by_user_id(self, user_id: UUID) -> List[DomainTask]:
        result = await self.db.execute(select(ORMTask).filter(ORMTask.user_id == str(user_id)))
        return [self._to_domain(orm_task) for orm_task in result.scalars().all()]

    async def update(self, task_id: UUID, task_update_data: dict) -> Optional[DomainTask]:
        if not task_update_data:
            return await self.get_by_id(task_id)

        await self.db.execute(
            sqlalchemy_update(ORMTask)
            .where(ORMTask.id == str(task_id))
            .values(**task_update_data)
        )
        await self.db.commit()
        return await self.get_by_id(task_id)

    async def delete(self, task_id: UUID) -> bool:
        result = await self.db.execute(
            sqlalchemy_delete(ORMTask).where(ORMTask.id == str(task_id))
        )
        await self.db.commit()
        return result.rowcount > 0
