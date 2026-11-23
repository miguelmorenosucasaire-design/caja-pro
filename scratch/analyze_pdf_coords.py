from PIL import Image

im = Image.open("scratch/pdf_page_1.png")
w, h = im.size
print(f"Image size: {w}x{h}")

# Find bounding box of all non-white pixels
# In PIL, a pixel is white if R,G,B > 245
bbox = im.getbbox()
print("PIL getbbox:", bbox)

# Find leftmost non-white pixel
leftmost_x = w
for y in range(h):
    for x in range(w):
        p = im.getpixel((x, y))
        if p[0] < 240 or p[1] < 240 or p[2] < 240:
            if x < leftmost_x:
                leftmost_x = x
            break

print(f"Leftmost non-white pixel is at x = {leftmost_x}")

# Find rightmost non-white pixel
rightmost_x = 0
for y in range(h):
    for x in range(w-1, -1, -1):
        p = im.getpixel((x, y))
        if p[0] < 240 or p[1] < 240 or p[2] < 240:
            if x > rightmost_x:
                rightmost_x = x
            break

print(f"Rightmost non-white pixel is at x = {rightmost_x}")
print(f"Total content width = {rightmost_x - leftmost_x}px, leaving right margin = {w - rightmost_x}px")
