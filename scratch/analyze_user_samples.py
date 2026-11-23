from PIL import Image
import numpy as np

c = Image.open("scratch/cetpro_sample.png").convert("RGB")
m = Image.open("scratch/minedu_sample.png").convert("RGB")

print("CETPRO crop size:", c.size)
print("MINEDU crop size:", m.size)

# Find unique dominant colors in CETPRO crop (excluding near white background)
arr_c = np.array(c)
mask_c = (arr_c[:,:,0] < 240) | (arr_c[:,:,1] < 240) | (arr_c[:,:,2] < 240)
pts_c = arr_c[mask_c]
mean_color_c = np.median(pts_c, axis=0)
print("CETPRO logo ink color (median RGB):", mean_color_c)

# Find unique dominant colors in MINEDU crop
arr_m = np.array(m)
mask_m = (arr_m[:,:,0] < 240) | (arr_m[:,:,1] < 240) | (arr_m[:,:,2] < 240)
pts_m = arr_m[mask_m]
mean_color_m = np.median(pts_m, axis=0)
print("MINEDU logo ink color (median RGB):", mean_color_m)
