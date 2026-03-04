from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.core import settings, create_access_token
from app.domain.services import UserService
from app.api.dependencies import get_user_service
from app.schemas import User as UserSchema, UserCreate, Token
from app.domain import (
    UserAlreadyExistsError, 
    InvalidCredentialsError, 
    InactiveUserError, 
    InvalidTokenError
)

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    try:
        user = await user_service.register_user(email=user_in.email, password=user_in.password)
        return user
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("/verify-email")
async def verify_email(
    token: str,
    user_service: UserService = Depends(get_user_service),
):
    try:
        await user_service.verify_user(token)
        return {"message": "Email successfully verified"}
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    user_service: UserService = Depends(get_user_service),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    try:
        user = await user_service.authenticate_user(email=form_data.username, password=form_data.password)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={ "sub": user.email, "is_active": user.is_active }, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except (InvalidCredentialsError, InactiveUserError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
