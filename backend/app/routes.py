from fastapi import APIRouter, UploadFile, File, HTTPException
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
import os
import uuid

router = APIRouter()
UPLOAD_DIR = "uploaded_epubs"

async def get_words_from_specific_page(book, page: int):
    all_docs = list(book.get_items_of_type(ebooklib.ITEM_DOCUMENT))
    if page < 1 or page > len(all_docs):
        raise HTTPException(status_code=400, detail="Page out of range")

    # Get the specific document for the page
    selected_item = all_docs[page - 1]  # Page 1 corresponds to index 0
    content = selected_item.get_body_content().decode('utf-8', errors='ignore')
    # Parse the HTML and extract text
    soup = BeautifulSoup(content, 'html.parser')
    text = soup.get_text(separator=' ', strip=True)
    words = text.split()

    debug_write_words(words)
    # Return the words from the specific page
    return {"words": words}

def debug_write_words(words):
    with open("words.txt", "w") as txt_file:
        for line in words:
            txt_file.write("".join(line) + "\n")

async def get_file_path(file_id):
    return os.path.join(UPLOAD_DIR, f"{file_id}.epub")


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


@router.get("/words/{file_id}/{page}")
async def get_words_from_epub(file_id: str, page: int):
    file_path = await get_file_path(file_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    # Open the ePub file
    book = epub.read_epub(file_path)
    return await get_words_from_specific_page(book, page)
