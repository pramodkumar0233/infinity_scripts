import pytesseract # type: ignore
from PIL import Image # type: ignore

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

text = pytesseract.image_to_string(Image.open("handwritten.jpg"))
print(text)
