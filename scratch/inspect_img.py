import os
from PIL import Image

p1 = r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794709379092_bdbb08c6.png"
p2 = r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794703573854_a49e7b32.jpg"

for p in [p1, p2]:
    if os.path.exists(p):
        im = Image.open(p)
        print(f"Path: {os.path.basename(p)}, Size: {im.size}, Mode: {im.mode}")
