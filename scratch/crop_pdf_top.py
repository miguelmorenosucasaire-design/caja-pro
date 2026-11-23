from PIL import Image

im = Image.open("scratch/pdf_page_1.png")
w, h = im.size
print("Size:", w, h)

# Crop top 300px
top_crop = im.crop((0, 0, w, 400))
top_crop.save("scratch/top_crop.png")
print("Saved scratch/top_crop.png")

# Check non-white pixels
pixels = top_crop.getdata()
non_white = sum(1 for p in pixels if p[0] < 240 or p[1] < 240 or p[2] < 240)
print("Non-white pixels in top 400px:", non_white)
