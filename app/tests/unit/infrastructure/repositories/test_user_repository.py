import pytest
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

# Adjust import paths to match your project structure
from app.infrastructure.repositories.user_repository import UserRepository
from app.domain.models import User as DomainUser
from app.infrastructure.persistence.models import User as ORMUser

@pytest.fixture
def mock_session(mocker):
    return mocker.AsyncMock(spec=AsyncSession)

@pytest.fixture
def repo(mock_session):
    return UserRepository(db=mock_session)

@pytest.fixture
def sample_user_data():
    user_id = uuid.uuid4()
    now = datetime.now()
    
    domain_user = DomainUser(
        id=user_id, email="test@test.com", password_hash="hash",
        is_active=True, verification_token="token123", 
        created_at=now, updated_at=now
    )
    
    orm_user = ORMUser(
        id=str(user_id), email="test@test.com", password_hash="hash",
        is_active=True, verification_token="token123", 
        created_at=now, updated_at=now
    )
    return domain_user, orm_user

# ---------------------------------------------------------
# 1. Get By Email Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_by_email_found(mocker, repo, mock_session, sample_user_data):
    _, orm_user = sample_user_data
    
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = orm_user
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_email("test@test.com")
    assert result is not None
    assert result.email == "test@test.com"

@pytest.mark.asyncio
async def test_get_by_email_not_found(mocker, repo, mock_session):
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = None
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_email("unknown@test.com")
    assert result is None

# ---------------------------------------------------------
# 2. Get By ID Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_by_id(mocker, repo, mock_session, sample_user_data):
    _, orm_user = sample_user_data
    
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = orm_user
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_id(uuid.UUID(orm_user.id))
    assert result is not None
    assert str(result.id) == orm_user.id

# ---------------------------------------------------------
# 3. Get By Token Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_by_token(mocker, repo, mock_session, sample_user_data):
    _, orm_user = sample_user_data
    
    mock_result = mocker.Mock()
    mock_result.scalars.return_value.first.return_value = orm_user
    mock_session.execute.return_value = mock_result
    
    result = await repo.get_by_token("token123")
    assert result is not None
    assert result.verification_token == "token123"

# ---------------------------------------------------------
# 4. Create Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_create(repo, mock_session, sample_user_data):
    domain_user, _ = sample_user_data
    
    result = await repo.create(domain_user)
    
    mock_session.add.assert_called_once()
    mock_session.commit.assert_awaited_once()
    mock_session.refresh.assert_awaited_once()
    assert result.id == domain_user.id
    assert result.email == "test@test.com"

# ---------------------------------------------------------
# 5. Update Test
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update(mocker, repo, mock_session, sample_user_data):
    domain_user, _ = sample_user_data
    domain_user.is_active = False
    
    result = await repo.update(domain_user)
    
    mock_session.execute.assert_awaited_once()
    mock_session.commit.assert_awaited_once()
    assert result.is_active is False
    assert result.id == domain_user.id