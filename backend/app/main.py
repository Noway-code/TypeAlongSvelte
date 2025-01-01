from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
from .utils.delete import delete_single_epub, delete_all_epubs
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Beep boop! I am alive! 🤖")
    # print("I will delete all epubs on shutdown!")
    yield
    # delete_all_epubs()
    # print("Get wrecked, epubs! 💥")
    print("Goodbye! 👋")
app = FastAPI(lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the router
app.include_router(router, prefix="/api", tags=["API Routes"])

@app.get("/")
async def root():
    return {"message": "Welcome to TypeAlong!"}