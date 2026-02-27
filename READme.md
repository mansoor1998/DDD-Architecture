# Application Tree Structure

.
├── app
│   ├── main.py              # Entry point for FastAPI
│   ├── api                  # Application Layer: Entry points (Controllers)
│   │   ├── v1
│   │   │   ├── api.py       # Main router including all domain routers
│   │   │   └── endpoints
│   │   │       ├── tasks.py
│   │   │       └── users.py
│   │   └── dependencies.py  # Dependency injection (Auth, DB sessions)
│   │
│   ├── domain               # Domain Layer: Core Business Logic (Pure Python)
│   │   ├── tasks
│   │   │   ├── models.py    # Domain entities (not DB models)
│   │   │   ├── service.py   # Business logic/rules
│   │   │   └── interfaces.py # Abstract repository definitions
│   │   └── users
│   │       ├── models.py
│   │       ├── service.py
│   │       └── interfaces.py
│   │
│   ├── infrastructure       # Infrastructure Layer: Technical details
│   │   ├── database
│   │   │   ├── session.py   # Engine and Session setup
│   │   │   └── base.py      # Declarative base
│   │   ├── repositories     # Concrete implementation of interfaces
│   │   │   ├── task_repo.py
│   │   │   └── user_repo.py
│   │   ├── persistence      # SQL Alchemy / Motor / Tortoise models
│   │   │   ├── task_table.py
│   │   │   └── user_table.py
│   │   └── security         # JWT and Hashing implementations
│   │
│   ├── schemas              # Data Transfer Objects (Pydantic models)
│   │   ├── task_schema.py
│   │   └── user_schema.py
│   │
│   ├── core                 # Config and Constants
│   │   └── config.py
│   │
│   └── utils                # Shared helper functions
│       └── formatters.py
│
├── tests
├── alembic                  # Database migrations
├── .env
└── requirements.txt

## How to Run the Application

1.  **Install Dependencies:**
    Make sure you have `pip` installed. Then, install the project dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Set Environment Variables:**
    Create a `.env` file in the root directory of the project and set the `DATABASE_URL` and `SECRET_KEY`. For example:
    ```
    DATABASE_URL="sqlite+aiosqlite:///./sql_app.db"
    SECRET_KEY="your_super_secret_key_here"
    ```
    Replace `"your_super_secret_key_here"` with a strong, randomly generated key.

3.  **Run the Application:**
    Start the FastAPI application using Uvicorn:
    ```bash
    uvicorn app.main:app --reload
    ```
    The `--reload` flag enables auto-reloading on code changes, which is useful for development.

    Once the server is running, you can access the API documentation (Swagger UI) at `http://127.0.0.1:8000/docs` and the alternative API documentation (ReDoc) at `http://127.0.0.1:8000/redoc`.
