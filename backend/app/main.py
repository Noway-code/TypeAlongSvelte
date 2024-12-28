from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router  # Import your routes

app = FastAPI()

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