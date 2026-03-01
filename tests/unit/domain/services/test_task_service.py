import pytest
from uuid import uuid4
from unittest.mock import AsyncMock

from app.domain.services.task_service import TaskService
from app.domain.models import Task, TaskStatus
from app.domain.exceptions import AccessDeniedError, TaskNotFoundError

@pytest.fixture
def mock_task_repo():
    return AsyncMock()

@pytest.fixture
def task_service(mock_task_repo):
    return TaskService(task_repository=mock_task_repo)

# --- create_task tests ---

@pytest.mark.asyncio
async def test_create_task_success(task_service, mock_task_repo):
    """Test creating a normal task successfully."""
    user_id = uuid4()
    mock_task_repo.get_all_by_user_id.return_value = []
    mock_task_repo.create.side_effect = lambda t: t
    
    task_data = {"title": "Test Task", "description": "Normal task"}
    
    task = await task_service.create_task(task_data, user_id)
    
    assert task.title == "Test Task"
    assert task.status == TaskStatus.PENDING
    assert task.user_id == user_id
    mock_task_repo.create.assert_called_once()

@pytest.mark.asyncio
async def test_create_task_reaches_limit_throws_error(task_service, mock_task_repo):
    """Test that creating more than 50 active tasks throws AccessDeniedError."""
    user_id = uuid4()
    # Mocking 50 active tasks
    mock_task_repo.get_all_by_user_id.return_value = [
        Task(id=uuid4(), user_id=user_id, title=f"Task {i}", description=f"Description {i}", status=TaskStatus.PENDING) 
        for i in range(50)
    ]
    
    task_data = {"title": "51st Task", "description": "Should fail"}
    
    with pytest.raises(AccessDeniedError):
        await task_service.create_task(task_data, user_id)
    
    mock_task_repo.create.assert_not_called()

@pytest.mark.asyncio
async def test_create_task_incorrect_user_id(task_service, mock_task_repo):
    """Test that task creation uses the provided user_id correctly."""
    actual_user_id = uuid4()
    incorrect_user_id = uuid4()
    mock_task_repo.get_all_by_user_id.return_value = []
    mock_task_repo.create.side_effect = lambda t: t
    
    task_data = {"title": "Task with User ID", "description": "Checking ID binding"}
    
    task = await task_service.create_task(task_data, actual_user_id)
    
    # Ensure the task is tied to the ID passed to the service, not another one
    assert task.user_id == actual_user_id
    assert task.user_id != incorrect_user_id

# --- get_task_by_id tests ---

@pytest.mark.asyncio
async def test_get_task_by_id_found(task_service, mock_task_repo):
    """Test successfully finding a task by ID."""
    user_id = uuid4()
    task_id = uuid4()
    expected_task = Task(id=task_id, user_id=user_id, title="Found Task", description="Existent")
    mock_task_repo.get_by_id.return_value = expected_task
    
    task = await task_service.get_task_by_id(task_id, user_id)
    
    assert task.id == task_id
    assert task.user_id == user_id
    mock_task_repo.get_by_id.assert_called_once_with(task_id)

@pytest.mark.asyncio
async def test_get_task_by_id_not_found(task_service, mock_task_repo):
    """Test that TaskNotFoundError is raised when task doesn't exist."""
    user_id = uuid4()
    task_id = uuid4()
    mock_task_repo.get_by_id.return_value = None
    
    with pytest.raises(TaskNotFoundError):
        await task_service.get_task_by_id(task_id, user_id)

@pytest.mark.asyncio
async def test_get_task_by_id_access_denied(task_service, mock_task_repo):
    """Test that AccessDeniedError is raised if the user doesn't own the task."""
    owner_id = uuid4()
    other_user_id = uuid4()
    task_id = uuid4()
    # Task belongs to owner_id
    task = Task(id=task_id, user_id=owner_id, title="Private Task", description="Secret")
    mock_task_repo.get_by_id.return_value = task
    
    # other_user_id tries to access it
    with pytest.raises(AccessDeniedError):
        await task_service.get_task_by_id(task_id, other_user_id)

# --- update_task tests ---

@pytest.mark.asyncio
async def test_update_task_success(task_service, mock_task_repo):
    """Test updating a task successfully."""
    user_id = uuid4()
    task_id = uuid4()
    existing_task = Task(id=task_id, user_id=user_id, title="Old Title", description="Old Desc")
    update_data = {"title": "New Title"}
    updated_task = Task(id=task_id, user_id=user_id, title="New Title", description="Old Desc")
    
    mock_task_repo.get_by_id.return_value = existing_task
    mock_task_repo.update.return_value = updated_task
    
    result = await task_service.update_task(task_id, update_data, user_id)
    
    assert result.title == "New Title"
    mock_task_repo.update.assert_called_once_with(task_id, update_data)

@pytest.mark.asyncio
async def test_update_task_not_found(task_service, mock_task_repo):
    """Test that updating a non-existent task raises TaskNotFoundError."""
    user_id = uuid4()
    task_id = uuid4()
    mock_task_repo.get_by_id.return_value = None
    
    with pytest.raises(TaskNotFoundError):
        await task_service.update_task(task_id, {"title": "Fail"}, user_id)
    
    mock_task_repo.update.assert_not_called()

# --- delete_task tests ---

@pytest.mark.asyncio
async def test_delete_task_success(task_service, mock_task_repo):
    """Test deleting a task successfully."""
    user_id = uuid4()
    task_id = uuid4()
    existing_task = Task(id=task_id, user_id=user_id, title="To Delete", description="Bye")
    
    mock_task_repo.get_by_id.return_value = existing_task
    mock_task_repo.delete.return_value = True
    
    result = await task_service.delete_task(task_id, user_id)
    
    assert result is True
    mock_task_repo.delete.assert_called_once_with(task_id)

@pytest.mark.asyncio
async def test_delete_task_not_found(task_service, mock_task_repo):
    """Test that deleting a non-existent task raises TaskNotFoundError."""
    user_id = uuid4()
    task_id = uuid4()
    mock_task_repo.get_by_id.return_value = None
    
    with pytest.raises(TaskNotFoundError):
        await task_service.delete_task(task_id, user_id)
    
    mock_task_repo.delete.assert_not_called()
