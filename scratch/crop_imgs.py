from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794703573854_a49e7b32.jpg")
arr = np.array(im)

# Look for non-white regions in the upper half and lower half
# Top header is y: 0 to 120
# Let's save crops to see what they look like
crop_top = im.crop((0, 0, 745, 120))
crop_top.save("scratch/crop_top.png")

crop_mid = im.crop((0, 370, 745, 490))
crop_mid.save("scratch/crop_mid.png")
print("Saved crops")
