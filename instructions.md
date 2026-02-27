# Project Instructions: FastAPI DDD Todo Application

## Core Architectural Principle
Follow **Domain-Driven Design (DDD)**. Strictly separate business logic from technical implementation details.

## Directory Structure & Logic Placement
- **/app/api/**: Entry points (Controllers). Handles FastAPI routing, request/response parsing, and dependency injection. **No business logic here.**
- **/app/domain/**: The "Heart" of the app. Pure Python.
    - `models.py`: Domain Entities (Internal data structures, not DB tables).
    - `service.py`: Business rules (e.g., "User cannot have more than 50 active tasks").
    - `interfaces.py`: Abstract Base Classes/Protocols for repositories to ensure the domain doesn't depend on the DB.
- **/app/infrastructure/**: Technical details.
    - `persistence/`: SQLAlchemy/Database table definitions.
    - `repositories/`: Concrete implementations of the `interfaces.py` (The actual SQL queries).
- **/app/schemas/**: Pydantic models (DTOs) for API validation.
- **/app/core/**: Global config, constants, and security settings.

## Testing Strategy & Rules
- **/tests/unit/**: Focus on testing `domain/service.py`. 
    - **Mocking**: Use `unittest.mock` or `pytest-mock` to mock the Repository Interfaces.
    - **Goal**: Test business rules (e.g., "Does the service throw an error if a task title is too short?") without a database.

## Development Rules
1. **Dependency Rule**: Inner layers (Domain) must NOT import from outer layers (Infrastructure/API).
2. **Dependency Injection**: Use FastAPI `Depends` to inject repositories into services, and services into API endpoints.
3. **Asynchronous First**: All database and I/O operations must use `async` and `await`.
4. **Validation**: Use Pydantic for request/response bodies and Domain Services for business rule validation.
5. **No Logic in Routes**: API routes should only call a Service method and return a response.

## Example Flow
`API Route` -> `Domain Service` -> `Repository Interface (Domain)` -> `Repository Implementation (Infra)` -> `Database`

# Tech Stack (Backend)
1. FastAPI for routing
2. SQLite DB for storing information with sqlalchemy as an ORM