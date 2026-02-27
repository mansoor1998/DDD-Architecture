from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.models import Task

class ITaskRepository(ABC):
    @abstractmethod
    async def create(self, task: Task) -> Task:
        pass

    @abstractmethod
    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        pass

    @abstractmethod
    async def get_all_by_user_id(self, user_id: UUID) -> List[Task]:
        pass

    @abstractmethod
    async def update(self, task_id: UUID, task_update_data: dict) -> Optional[Task]:
        pass

    @abstractmethod
    async def delete(self, task_id: UUID) -> bool:
        pass
