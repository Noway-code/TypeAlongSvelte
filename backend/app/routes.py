from fastapi import APIRouter, UploadFile, File
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import os
import uuid
router = APIRouter()
book = epub.read_epub("app/static/Digital_Minimalism.epub")
UPLOAD_DIR = "uploaded_epubs"


@router.get("/status")
async def get_status():
    all_words = []
    # Iterate over every item in the ePub
    for item in book.get_items():
        # Only process document (HTML/XHTML) items
        if item.get_type() == ebooklib.ITEM_DOCUMENT:
            content = item.get_body_content().decode('utf-8', errors='ignore')
            # Use BeautifulSoup to strip HTML tags
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text(separator=' ', strip=True)
            # Split into words
            words_in_doc = text.split()
            # Collect them in all_words
            all_words.extend(words_in_doc)

            # If we've reached at least 100, stop
            if len(all_words) >= 100:
                break

    # Take the first 100 words
    first_100 = all_words[:100]
    return {"words": first_100}

@router.post("/upload")
async def upload_epub(file: UploadFile = File(...)):
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    unique_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{unique_id}.epub")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)


    return {"file_id": unique_id}

@router.get("/book")
async def get_book():
    return {"title": book.get_metadata("DC", "title")}