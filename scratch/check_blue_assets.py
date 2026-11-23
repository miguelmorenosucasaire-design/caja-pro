from PIL import Image

im1 = Image.open(r"public\img\escudo_recibo_azul.png")
im2 = Image.open(r"public\img\minedu_barras_azul.png")
print("Escudo azul size:", im1.size, "mode:", im1.mode)
print("Minedu azul size:", im2.size, "mode:", im2.mode)
