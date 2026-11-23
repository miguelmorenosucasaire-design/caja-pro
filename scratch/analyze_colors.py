from PIL import Image
import numpy as np

im = Image.open(r"C:\Users\MIGUEL\.gemini\antigravity\brain\5821ddea-af78-49ad-96d0-1a882b4589e0\.user_uploaded\media_1794709379092_bdbb08c6.png")
arr = np.array(im)

# Let's inspect the top-right logo area (CETPRO shield)
# im size is (754, 469). Top-right is around x: 650-740, y: 10-60
logo_cetpro = arr[10:65, 650:730]
# Check unique colors / dominant colors in logo_cetpro
# Is it monochrome blue or does it have red/yellow/green?
r, g, b = logo_cetpro[:,:,0], logo_cetpro[:,:,1], logo_cetpro[:,:,2]
# Red pixels (where R > 150 and G < 100 and B < 100)
red_mask = (r > 150) & (g < 100) & (b < 100)
# Yellow/Gold pixels (where R > 150 and G > 120 and B < 80)
yellow_mask = (r > 150) & (g > 120) & (b < 80)
# Blue pixels (where B > 120 and R < 100)
blue_mask = (b > 120) & (r < 100)

print("CETPRO logo color analysis:")
print("Red pixels:", np.sum(red_mask))
print("Yellow/Gold pixels:", np.sum(yellow_mask))
print("Blue pixels:", np.sum(blue_mask))

# Check the number 0000000 area (around x: 400-500, y: 40-70)
num_area = arr[40:70, 410:500]
nr, ng, nb = num_area[:,:,0], num_area[:,:,1], num_area[:,:,2]
n_red_mask = (nr > 160) & (ng < 100) & (nb < 100)
print("Number 0000000 red pixels:", np.sum(n_red_mask))
