from typing import List, Optional
from uuid import UUID

from app.domain.interfaces import ITaskRepository
from app.domain import Task, TaskNotFoundError, AccessDeniedError

class TaskService:
    def __init__(self, task_repository: ITaskRepository):
        self.task_repository = task_repository

    async def create_task(self, task_data: dict, user_id: UUID) -> Task:
        tasks = await self.task_repository.get_all_by_user_id(user_id)
        active_tasks = [t for t in tasks if t.status != "completed"]
        if len(active_tasks) >= 50:
            raise AccessDeniedError()
            
        task = Task(user_id=user_id, **task_data)
        return await self.task_repository.create(task)

    async def get_task_by_id(self, task_id: UUID, user_id: UUID) -> Optional[Task]:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise TaskNotFoundError(task_id)
        if task.user_id != user_id:
            raise AccessDeniedError()
        return task

    async def get_user_tasks(self, user_id: UUID) -> List[Task]:
        return await self.task_repository.get_all_by_user_id(user_id)

    async def update_task(self, task_id: UUID, task_update_data: dict, user_id: UUID) -> Optional[Task]:
        await self.get_task_by_id(task_id, user_id)
        return await self.task_repository.update(task_id, task_update_data)

    async def delete_task(self, task_id: UUID, user_id: UUID) -> bool:
        await self.get_task_by_id(task_id, user_id)
        return await self.task_repository.delete(task_id)
