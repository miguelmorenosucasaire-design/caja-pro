from PIL import Image
import numpy as np

im_top = Image.open("scratch/crop_top.png")
im_mid = Image.open("scratch/crop_mid.png")

# Let's inspect unique non-white colors in top vs mid
def get_colors(im):
    arr = np.array(im)
    # non-white (where any channel < 240)
    mask = (arr[:,:,0] < 240) | (arr[:,:,1] < 240) | (arr[:,:,2] < 240)
    pts = arr[mask]
    return pts

pts_top = get_colors(im_top)
pts_mid = get_colors(im_mid)

print("Top points count:", len(pts_top))
print("Mid points count:", len(pts_mid))

# Check Minedu logo area in top (left side: x 20-150, y 20-80)
arr_top = np.array(im_top)
arr_mid = np.array(im_mid)

logo_minedu_top = arr_top[20:80, 20:150]
logo_minedu_mid = arr_mid[20:80, 20:150]

print("Top minedu logo mean:", np.mean(logo_minedu_top, axis=(0,1)))
print("Mid minedu logo mean:", np.mean(logo_minedu_mid, axis=(0,1)))
