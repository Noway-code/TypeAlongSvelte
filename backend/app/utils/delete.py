# import os
#
# def delete_single_epub(epub_id: str):
#     epub = Epub.query.get(epub_id)
#     uploaded_epubs = os.path.join(os.getcwd(), "uploaded_epubs")
#     epub_path = os.path.join(uploaded_epubs, f"{epub_id}.epub")
#     if os.path.exists(epub_path):
#         os.remove(epub_path)
#     else :
#         raise NotFound("Epub not found")
#
#     return {"message": "Epub deleted successfully"}
#
# def delete_all_epubs():
#     uploaded_epubs = os.path.join(os.getcwd(), "uploaded_epubs")
#     for file in os.listdir(uploaded_epubs):
#         os.remove(os.path.join(uploaded_epubs, file))
#     return {"message": "All epubs deleted successfully"}