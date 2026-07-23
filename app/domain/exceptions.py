from uuid import UUID


class DomainError(Exception):
    """Base class for all domain-specific errors."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class UserAlreadyExistsError(DomainError):
    def __init__(self, email: str):
        super().__init__(f"User with the provided email already exists.")


class InvalidCredentialsError(DomainError):
    def __init__(self):
        super().__init__("Invalid email or password.")


class InactiveUserError(DomainError):
    def __init__(self):
        super().__init__("User account is inactive. Please verify your email.")


class InvalidTokenError(DomainError):
    def __init__(self):
        super().__init__("Invalid or expired verification token.")


class TaskNotFoundError(DomainError):
    def __init__(self, task_id: UUID):
        super().__init__(f"Task with id {task_id} not found.")


class AccessDeniedError(DomainError):
    def __init__(self):
        super().__init__("Access denied.")
