from PIL import Image

im = Image.open("scratch/pdf_page_1.png")
w, h = im.size
print("Size:", w, h)

# Let's crop middle and bottom as well
im.crop((0, 300, w, 900)).save("scratch/mid_crop.png")
im.crop((0, 900, w, 1600)).save("scratch/bottom_crop.png")
print("Saved mid and bottom crops")
