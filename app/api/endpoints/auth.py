from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app.core import settings, create_access_token
from app.domain.services import UserService
from app.api.dependencies import get_current_user_inactive, get_user_service
from app.schemas import User as UserSchema, UserCreate, Token, UserWithToken
from app.domain import (
    UserAlreadyExistsError, 
    InvalidCredentialsError, 
    InactiveUserError, 
    InvalidTokenError
)
from app.domain.models import User as DomainUser

router = APIRouter()

@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    try:
        user = await user_service.register_user(email=user_in.email, password=user_in.password)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "is_active": user.is_active}, expires_delta=access_token_expires
        )
        return {
            "user": user,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/resend-verification")
async def resend_verification_email(
    user_service: UserService = Depends(get_user_service),
    current_user: DomainUser = Depends(get_current_user_inactive),
):
    if current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already verified",
        )
    
    if await user_service.resend_verification_email(current_user):
        return {"message": "Verification email resent"}
    
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to resend verification email",
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
