from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response

from app.api.dependencies import get_current_user, get_task_service
from app.domain.models import User as DomainUser
from app.domain.services import TaskService
from app.schemas import Task as TaskSchema, TaskCreate, TaskUpdate

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
    return await task_service.create_task(task_in, current_user.id)

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
    task = await task_service.get_task_by_id(task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

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
    task = await task_service.update_task(task_id, task_in, current_user.id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    current_user: DomainUser = Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    """
    Delete a task.
    """
    deleted = await task_service.delete_task(task_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
