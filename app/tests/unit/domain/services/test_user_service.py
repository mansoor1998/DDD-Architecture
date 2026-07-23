import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from app.domain.services.user_service import UserService
from app.domain.models import User
from app.domain.exceptions import (
    UserAlreadyExistsError, 
    InvalidCredentialsError, 
    InactiveUserError, 
    InvalidTokenError
)

@pytest.fixture
def mock_user_repo():
    return AsyncMock()

@pytest.fixture
def mock_email_sender():
    return AsyncMock()

@pytest.fixture
def user_service(mock_user_repo, mock_email_sender):
    return UserService(user_repository=mock_user_repo, email_sender=mock_email_sender)

# --- register_user tests ---

@pytest.mark.asyncio
async def test_register_user_success(user_service, mock_user_repo, mock_email_sender):
    """Test successful user registration."""
    email = "test@example.com"
    password = "securepassword"
    
    mock_user_repo.get_by_email.return_value = None
    mock_user_repo.create.side_effect = lambda u: u
    
    with patch("app.domain.services.user_service.get_password_hash", return_value="hashed_pwd"):
        user = await user_service.register_user(email, password)
        
        assert user.email == email
        assert user.password_hash == "hashed_pwd"
        assert user.is_active is False
        mock_user_repo.get_by_email.assert_called_once_with(email)
        mock_user_repo.create.assert_called_once()
        mock_email_sender.send_verification_email.assert_called_once_with(email, user.verification_token)

@pytest.mark.asyncio
async def test_register_user_already_exists(user_service, mock_user_repo):
    """Test registration fails if user already exists."""
    email = "existing@example.com"
    mock_user_repo.get_by_email.return_value = User(email=email, password_hash="any")
    
    with pytest.raises(UserAlreadyExistsError):
        await user_service.register_user(email, "password")
    
    mock_user_repo.create.assert_not_called()

# --- authenticate_user tests ---

@pytest.mark.asyncio
async def test_authenticate_user_success(user_service, mock_user_repo):
    """Test successful authentication."""
    email = "test@example.com"
    password = "correctpassword"
    hashed_password = "hashed_correct_password"
    user = User(email=email, password_hash=hashed_password, is_active=True)
    
    mock_user_repo.get_by_email.return_value = user
    
    with patch("app.domain.services.user_service.verify_password", return_value=True):
        authenticated_user = await user_service.authenticate_user(email, password)
        
        assert authenticated_user == user
        mock_user_repo.get_by_email.assert_called_once_with(email)

@pytest.mark.asyncio
async def test_authenticate_user_not_found_throws_invalid_credentials(user_service, mock_user_repo):
    """Test authentication fails if user is not found (InvalidCredentialsError)."""
    email = "nonexistent@example.com"
    mock_user_repo.get_by_email.return_value = None
    
    with pytest.raises(InvalidCredentialsError):
        await user_service.authenticate_user(email, "password")

@pytest.mark.asyncio
async def test_authenticate_user_wrong_password_throws_invalid_credentials(user_service, mock_user_repo):
    """Test authentication fails if password is incorrect (InvalidCredentialsError)."""
    email = "test@example.com"
    user = User(email=email, password_hash="hashed_pwd", is_active=True)
    mock_user_repo.get_by_email.return_value = user
    
    with patch("app.domain.services.user_service.verify_password", return_value=False):
        with pytest.raises(InvalidCredentialsError):
            await user_service.authenticate_user(email, "wrong_password")

@pytest.mark.asyncio
async def test_authenticate_user_inactive_throws_error(user_service, mock_user_repo):
    """Test authentication fails if user is inactive."""
    email = "inactive@example.com"
    user = User(email=email, password_hash="hashed_pwd", is_active=False)
    mock_user_repo.get_by_email.return_value = user
    
    with patch("app.domain.services.user_service.verify_password", return_value=True):
        with pytest.raises(InactiveUserError):
            await user_service.authenticate_user(email, "password")

# --- verify_user tests ---

@pytest.mark.asyncio
async def test_verify_user_success(user_service, mock_user_repo):
    """Test successful user verification via token."""
    token = "valid_token"
    user = User(email="test@example.com", password_hash="hashed", is_active=False, verification_token=token)
    mock_user_repo.get_by_token.return_value = user
    
    result = await user_service.verify_user(token)
    
    assert result is True
    assert user.is_active is True
    assert user.verification_token is None
    mock_user_repo.update.assert_called_once_with(user)

@pytest.mark.asyncio
async def test_verify_user_invalid_token_throws_error(user_service, mock_user_repo):
    """Test verification fails with invalid token."""
    token = "invalid_token"
    mock_user_repo.get_by_token.return_value = None
    
    with pytest.raises(InvalidTokenError):
        await user_service.verify_user(token)
    
    mock_user_repo.update.assert_not_called()
