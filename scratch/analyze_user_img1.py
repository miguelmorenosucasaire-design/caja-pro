from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794703573854_a49e7b32.jpg")
print("Size:", im.size)
arr = np.array(im)

# Top voucher logo (y: 20-80, x: 630-720)
top_logo = arr[20:80, 630:720]
# Bottom voucher logo (y: 480-550, x: 630-720)
bot_logo = arr[480:550, 630:720]

def analyze(name, box):
    r, g, b = box[:,:,0], box[:,:,1], box[:,:,2]
    blue = np.sum((b > 100) & (r < 80) & (g < 80))
    yellow = np.sum((r > 150) & (g > 120) & (b < 80))
    red = np.sum((r > 150) & (g < 80) & (b < 80))
    print(f"{name}: Blue={blue}, Yellow={yellow}, Red={red}")

analyze("Top logo", top_logo)
analyze("Bottom logo", bot_logo)
