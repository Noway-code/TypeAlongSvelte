from fastapi import FastAPI
from app.routes import router  # Import your routes

app = FastAPI()

# Include the router
app.include_router(router, prefix="/api", tags=["API Routes"])

@app.get("/")
async def root():
    return {"message": "Welcome to TypeAlong!"}
