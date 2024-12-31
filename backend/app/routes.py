from fastapi import APIRouter
import ebooklib
from ebooklib import epub
from bs4 import BeautifulSoup
router = APIRouter()
book = epub.read_epub("app/static/Digital_Minimalism.epub")


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
async def upload_file(file_name: str):
    # Placeholder logic for handling uploaded files
    return {"message": f"File '{file_name}' uploaded successfully"}

@router.get("/book")
async def get_book():
    return {"title": book.get_metadata("DC", "title")}