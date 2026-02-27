from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status

from app.domain.interfaces import ITaskRepository
from app.domain import Task
from app.schemas import TaskCreate, TaskUpdate

class TaskService:
    def __init__(self, task_repository: ITaskRepository):
        self.task_repository = task_repository

    async def create_task(self, task_create: TaskCreate, user_id: UUID) -> Task:
        return await self.task_repository.create(task_create, user_id)

    async def get_task_by_id(self, task_id: UUID, user_id: UUID) -> Optional[Task]:
        task = await self.task_repository.get_by_id(task_id)
        if not task or task.user_id != user_id:
            return None
        return task

    async def get_user_tasks(self, user_id: UUID) -> List[Task]:
        return await self.task_repository.get_all_by_user_id(user_id)

    async def update_task(self, task_id: UUID, task_update: TaskUpdate, user_id: UUID) -> Optional[Task]:
        task = await self.task_repository.get_by_id(task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
        return await self.task_repository.update(task_id, task_update)

    async def delete_task(self, task_id: UUID, user_id: UUID) -> bool:
        task = await self.task_repository.get_by_id(task_id)
        if not task or task.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        return await self.task_repository.delete(task_id)
