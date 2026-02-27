import datetime
from typing import Optional
from app.domain.interfaces import IUserRepository, IEmailSender
from app.domain import (
    User as DomainUser, 
    UserAlreadyExistsError, 
    InvalidCredentialsError, 
    InactiveUserError, 
    InvalidTokenError
)
from app.core import get_password_hash, verify_password

class UserService:
    def __init__(self, user_repository: IUserRepository, email_sender: IEmailSender):
        self.user_repository = user_repository
        self.email_sender = email_sender

    async def register_user(self, email: str, password: str) -> DomainUser:
        existing_user = await self.user_repository.get_by_email(email)
        if existing_user:
            raise UserAlreadyExistsError(email)
        
        hashed_password = get_password_hash(password)
        
        # Create domain user object
        new_user = DomainUser(
            email=email,
            password_hash=hashed_password,
            is_active=False
        )

        user = await self.user_repository.create(new_user)
        
        # Send verification email
        await self.email_sender.send_verification_email(user.email, user.verification_token)
        
        return user

    async def authenticate_user(self, email: str, password: str) -> Optional[DomainUser]:
        user = await self.user_repository.get_by_email(email)
        if not user:
            raise InvalidCredentialsError()
        
        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()
        
        if not user.is_active:
            raise InactiveUserError()
            
        return user

    async def verify_user(self, token: str) -> bool:
        user = await self.user_repository.get_by_token(token)
        if not user:
            raise InvalidTokenError()
        
        user.is_active = True
        user.verification_token = None
        user.updated_at = datetime.datetime.utcnow()
        await self.user_repository.update(user)
        return True
