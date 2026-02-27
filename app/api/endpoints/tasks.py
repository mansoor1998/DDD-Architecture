from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response

from app.api.dependencies import get_current_user, get_task_service
from app.domain.models import User as DomainUser
from app.domain.services import TaskService
from app.schemas import Task as TaskSchema, TaskCreate, TaskUpdate
from app.domain import TaskNotFoundError, AccessDeniedError

router = APIRouter()

@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Create a new task.
    """
    try:
        return await task_service.create_task(task_in.model_dump(), current_user.id)
    except AccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="User cannot have more than 50 active tasks"
        )

@router.get("/", response_model=List[TaskSchema])
async def get_tasks(
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Get all tasks for the current user.
    """
    return await task_service.get_user_tasks(current_user.id)

@router.get("/{task_id}", response_model=TaskSchema)
async def get_task(
    task_id: UUID,
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Get a specific task by ID.
    """
    try:
        return await task_service.get_task_by_id(task_id, current_user.id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

@router.put("/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: UUID,
    task_in: TaskUpdate,
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Update a task.
    """
    try:
        return await task_service.update_task(task_id, task_in.model_dump(exclude_unset=True), current_user.id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Delete a task.
    """
    try:
        await task_service.delete_task(task_id, current_user.id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessDeniedError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
