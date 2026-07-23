import pytest
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

# Adjust the import path to match where TaskRepository is actually saved 
# (e.g., app.infrastructure.repositories.task_repository)
from app.infrastructure.repositories.task_repository import TaskRepository
from app.domain.models import Task as DomainTask
from app.infrastructure.persistence.models import Task as ORMTask

@pytest.fixture
def mock_session(mocker):
    return mocker.AsyncMock(spec=AsyncSession)

@pytest.fixture
def repo(mock_session):
    return TaskRepository(db=mock_session)

@pytest.fixture
def sample_task_data():
    task_id = uuid.uuid4()
    user_id = uuid.uuid4()
    now = datetime.now()
    
    domain_task = DomainTask(
        id=task_id, user_id=user_id, title="Test", description="Desc",
        status="pending", priority=1, due_date=now, created_at=now, updated_at=now
    )
    
    # Mock ORM Task with string UUIDs
    orm_task = ORMTask(
        id=str(task_id), user_id=str(user_id), title="Test", description="Desc",
        status="pending", priority=1, due_date=now, created_at=now, updated_at=now
    )
    return domain_task, orm_task

# ---------------------------------------------------------
# 1. Create Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_create(repo, mock_session, sample_task_data):
    domain_task, _ = sample_task_data
    
    result = await repo.create(domain_task)
    
    mock_session.add.assert_called_once()
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once()
    assert result.id == domain_task.id
    assert result.title == "Test"

# ---------------------------------------------------------
# 2. Get By ID Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_by_id_found(mocker, repo, mock_session, sample_task_data):
    _, orm_task = sample_task_data
    
    # Mock the execute().scalars().first() chain
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = orm_task
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_id(uuid.UUID(orm_task.id))
    assert result is not None
    assert str(result.id) == orm_task.id

@pytest.mark.asyncio
async def test_get_by_id_not_found(mocker, repo, mock_session):
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = None
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_id(uuid.uuid4())
    assert result is None

# ---------------------------------------------------------
# 3. Get All By User ID Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_all_by_user_id(mocker, repo, mock_session, sample_task_data):
    _, orm_task = sample_task_data
    
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.all.return_value = [orm_task]
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_all_by_user_id(uuid.UUID(orm_task.user_id))
    assert len(result) == 1
    assert str(result[0].id) == orm_task.id

# ---------------------------------------------------------
# 4. Update Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update(mocker, repo, mock_session, sample_task_data):
    _, orm_task = sample_task_data
    task_id = uuid.UUID(orm_task.id)
    
    # Mock the get_by_id call inside update
    mocker.patch.object(repo, "get_by_id", return_value=sample_task_data[0])
    
    result = await repo.update(task_id, {"title": "Updated Title"})
    
    mock_session.execute.assert_awaited_once()
    mock_session.commit.assert_awaited_once()
    assert result.id == task_id

# ---------------------------------------------------------
# 5. Delete Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_delete(mocker, repo, mock_session):
    mock_result = mocker.Mock(rowcount=1)
    mock_session.execute.return_value = mock_result
    
    result = await repo.delete(uuid.uuid4())
    
    mock_session.execute.assert_awaited_once()
    mock_session.commit.assert_awaited_once()
    assert result is True