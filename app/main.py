from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.persistence.database import engine, Base
from app.core import settings
from app.api.endpoints import auth, users, tasks

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # In case you want to start fresh
        await conn.run_sync(Base.metadata.create_all)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo API"}

@app.get("/test")
def test_func():
    return { "message": "another test function right here" }
