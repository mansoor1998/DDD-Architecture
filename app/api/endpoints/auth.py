from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.core import settings, create_access_token
from app.domain.services import UserService
from app.api.dependencies import get_user_service
from app.schemas import User as UserSchema, UserCreate, Token

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    user = await user_service.register_user(user_in)
    return user

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    user_service: UserService = Depends(get_user_service),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = await user_service.authenticate_user(email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
