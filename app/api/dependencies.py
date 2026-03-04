from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.domain.models import User
from app.domain.services import UserService, TaskService
from app.infrastructure.persistence.database import get_db
from app.infrastructure.repositories import UserRepository, TaskRepository
from app.domain.interfaces import IUserRepository, ITaskRepository, IEmailSender
from app.infrastructure.email import GmailEmailSender

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login/access-token")

def get_user_repository(db: AsyncSession = Depends(get_db)) -> IUserRepository:
    return UserRepository(db)

def get_task_repository(db: AsyncSession = Depends(get_db)) -> ITaskRepository:
    return TaskRepository(db)

def get_email_sender() -> IEmailSender:
    return GmailEmailSender()

def get_user_service(
    user_repo: IUserRepository = Depends(get_user_repository),
    email_sender: IEmailSender = Depends(get_email_sender)
) -> UserService:
    return UserService(user_repo, email_sender)

def get_task_service(task_repo: ITaskRepository = Depends(get_task_repository)) -> TaskService:
    return TaskService(task_repo)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service),
) -> User:
    token_data = decode_access_token(token)
    if token_data.sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = await user_service.user_repository.get_by_email(email=token_data.sub)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive. Please verify your email.",
        )
        
    return user
