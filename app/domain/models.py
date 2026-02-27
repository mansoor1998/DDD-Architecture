import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class User:
    def __init__(
        self,
        email: str,
        password_hash: str,
        is_active: bool = False,
        verification_token: Optional[str] = None,
        id: Optional[UUID] = None,
        created_at: Optional[datetime.datetime] = None,
        updated_at: Optional[datetime.datetime] = None,
    ):
        self.id = id or uuid4()
        self.email = email
        self.password_hash = password_hash
        self.is_active = is_active
        self.verification_token = verification_token or str(uuid4())
        self.created_at = created_at or datetime.datetime.utcnow()
        self.updated_at = updated_at or datetime.datetime.utcnow()

class Task:
    def __init__(
        self,
        user_id: UUID,
        title: str,
        description: str,
        status: TaskStatus = TaskStatus.PENDING,
        priority: TaskPriority = TaskPriority.MEDIUM,
        due_date: Optional[datetime.datetime] = None,
        id: Optional[UUID] = None,
        created_at: Optional[datetime.datetime] = None,
        updated_at: Optional[datetime.datetime] = None,
    ):
        self.id = id or uuid4()
        self.user_id = user_id
        self.title = title
        self.description = description
        self.status = status
        self.priority = priority
        self.due_date = due_date
        self.created_at = created_at or datetime.datetime.utcnow()
        self.updated_at = updated_at or datetime.datetime.utcnow()
