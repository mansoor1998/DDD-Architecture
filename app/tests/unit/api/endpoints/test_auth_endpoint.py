import pytest
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas import UserCreate
from app.domain.exceptions import (
    UserAlreadyExistsError,
    InvalidCredentialsError,
    InactiveUserError,
    InvalidTokenError,
)

# Adjust this import to match your router's actual location
from app.api.endpoints.auth import (
    register,
    resend_verification_email,
    verify_email,
    login_access_token,
)


# ---------------------------------------------------------
# 1. /register Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_register_success(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.register_user.return_value = mocker.Mock(
        email="test@test.com", is_active=True
    )
    mocker.patch(
        "app.api.endpoints.auth.create_access_token", return_value="fake-token"
    )
    mocker.patch("app.api.endpoints.auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES", 30)

    user_data = UserCreate(email="test@test.com", password="password")
    res = await register(user_in=user_data, user_service=mock_svc)

    assert res["access_token"] == "fake-token"
    mock_svc.register_user.assert_called_once()


@pytest.mark.asyncio
async def test_register_already_exists(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.register_user.side_effect = UserAlreadyExistsError("User exists")

    user_data = UserCreate(email="test@test.com", password="password")
    with pytest.raises(HTTPException) as exc:
        await register(user_in=user_data, user_service=mock_svc)

    assert exc.value.status_code == 400


# ---------------------------------------------------------
# 2. /resend-verification Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_resend_verification_success(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.resend_verification_email.return_value = True
    inactive_user = mocker.Mock(is_active=False)

    res = await resend_verification_email(
        user_service=mock_svc, current_user=inactive_user
    )
    assert res["message"] == "Verification email resent"


@pytest.mark.asyncio
async def test_resend_verification_already_active(mocker):
    active_user = mocker.Mock(is_active=True)

    with pytest.raises(HTTPException) as exc:
        await resend_verification_email(
            user_service=mocker.AsyncMock(), current_user=active_user
        )

    assert exc.value.status_code == 400


# ---------------------------------------------------------
# 3. /verify-email Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_verify_email_success(mocker):
    mock_svc = mocker.AsyncMock()

    res = await verify_email(token="valid-token", user_service=mock_svc)
    assert res["message"] == "Email successfully verified"
    mock_svc.verify_user.assert_called_once_with("valid-token")


@pytest.mark.asyncio
async def test_verify_email_invalid_token(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.verify_user.side_effect = InvalidTokenError()

    with pytest.raises(HTTPException) as exc:
        await verify_email(token="bad-token", user_service=mock_svc)

    assert exc.value.status_code == 400


# ---------------------------------------------------------
# 4. /login/access-token Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_login_success(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.authenticate_user.return_value = mocker.Mock(
        email="test@test.com", is_active=True
    )
    mocker.patch(
        "app.api.endpoints.auth.create_access_token", return_value="fake-token"
    )
    mocker.patch("app.core.config.settings.ACCESS_TOKEN_EXPIRE_MINUTES", 30)

    form_data = OAuth2PasswordRequestForm(
        username="test@test.com", password="password", scope=""
    )
    res = await login_access_token(user_service=mock_svc, form_data=form_data)

    assert res["access_token"] == "fake-token"


@pytest.mark.asyncio
async def test_login_invalid_credentials(mocker):
    mock_svc = mocker.AsyncMock()
    mock_svc.authenticate_user.side_effect = InvalidCredentialsError()

    form_data = OAuth2PasswordRequestForm(
        username="test@test.com", password="wrong", scope=""
    )
    with pytest.raises(HTTPException) as exc:
        await login_access_token(user_service=mock_svc, form_data=form_data)

    assert exc.value.status_code == 401
