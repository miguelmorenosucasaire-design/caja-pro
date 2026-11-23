from PIL import Image
import numpy as np

# Create blue version of escudo_recibo_ingreso.png
escudo = Image.open(r"public\img\escudo_recibo_ingreso.png").convert("RGBA")
arr_esc = np.array(escudo)

# Institutional blue: RGB (31, 90, 166) -> #1f5aa6
# For each non-transparent pixel, convert luminance to the blue shade
r, g, b, a = arr_esc[:,:,0], arr_esc[:,:,1], arr_esc[:,:,2], arr_esc[:,:,3]
# Luminance: standard formula
lum = 0.299 * r + 0.587 * g + 0.114 * b

# Invert luminance so dark features become strong blue, light features become light blue / white
# A pixel with lum=0 (black line) -> full blue (31, 90, 166)
# A pixel with lum=255 (white) -> white (255, 255, 255)
# Formula: C = lum + (target_C - 0) * (1 - lum/255) ... or simpler:
target_r, target_g, target_b = 31, 90, 166

blue_r = (lum / 255.0 * 255 + (1 - lum / 255.0) * target_r).astype(np.uint8)
blue_g = (lum / 255.0 * 255 + (1 - lum / 255.0) * target_g).astype(np.uint8)
blue_b = (lum / 255.0 * 255 + (1 - lum / 255.0) * target_b).astype(np.uint8)

blue_esc = np.dstack([blue_r, blue_g, blue_b, a])
Image.fromarray(blue_esc).save(r"public\img\escudo_recibo_azul.png")
print("Saved public/img/escudo_recibo_azul.png")

# Now minedu_barras.png
minedu = Image.open(r"public\img\minedu_barras.png").convert("RGBA")
arr_min = np.array(minedu)
mr, mg, mb, ma = arr_min[:,:,0], arr_min[:,:,1], arr_min[:,:,2], arr_min[:,:,3]
mlum = 0.299 * mr + 0.587 * mg + 0.114 * mb

m_blue_r = (mlum / 255.0 * 255 + (1 - mlum / 255.0) * target_r).astype(np.uint8)
m_blue_g = (mlum / 255.0 * 255 + (1 - mlum / 255.0) * target_g).astype(np.uint8)
m_blue_b = (mlum / 255.0 * 255 + (1 - mlum / 255.0) * target_b).astype(np.uint8)

blue_min = np.dstack([m_blue_r, m_blue_g, m_blue_b, ma])
Image.fromarray(blue_min).save(r"public\img\minedu_barras_azul.png")
print("Saved public/img/minedu_barras_azul.png")
