from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_status():
    return {"status": "TypeAlong is running"}

@router.post("/upload")
async def upload_file(file_name: str):
    # Placeholder logic for handling uploaded files
    return {"message": f"File '{file_name}' uploaded successfully"}
