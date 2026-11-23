from PIL import Image
import numpy as np

# Load escudo
escudo_path = r"public\img\escudo_recibo_ingreso.png"
escudo = Image.open(escudo_path).convert("RGBA")
arr_esc = np.array(escudo)

# Load minedu
minedu_path = r"public\img\minedu_barras.png"
minedu = Image.open(minedu_path).convert("RGBA")
arr_min = np.array(minedu)

print("Escudo shape:", arr_esc.shape)
print("Minedu shape:", arr_min.shape)
